<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ExpenseReport;
use App\Models\ExpenseReportItem;
use App\Models\Fund;
use App\Models\Reimbursement;
use App\Models\ReimbursementItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\ApiTestCase;

class QaRegressionTest extends ApiTestCase
{
    private function draftReport(User $owner, ?int $costCenterId = null): ExpenseReport
    {
        return ExpenseReport::create([
            'user_id' => $owner->id,
            'cost_center_id' => $costCenterId ?? $this->costCenter()->id,
            'description' => 'Report',
            'status' => ExpenseReport::STATUS_DRAFT,
            'requester_description' => 'Requester',
            'requester_department' => 'Ops',
            'requester_tax_id' => '11111111111',
            'period_start_date' => '2026-07-01',
            'period_end_date' => '2026-07-31',
        ]);
    }

    private function draftReimbursement(User $owner, int $costCenterId): Reimbursement
    {
        return Reimbursement::create([
            'user_id' => $owner->id,
            'cost_center_id' => $costCenterId,
            'title' => 'Reimbursement',
            'status' => Reimbursement::STATUS_REQUESTED,
            'requester_name' => 'Requester',
            'requester_department' => 'Ops',
            'requester_tax_id' => '11111111111',
            'period_start_date' => '2026-07-01',
            'period_end_date' => '2026-07-31',
        ]);
    }

    public function test_amount_above_the_column_capacity_is_rejected_with_422(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $report = $this->draftReport($admin);

        $this->callApi($admin, 'POST', "/expense-reports/{$report->id}/items", [
            'expense_date' => '2026-07-15',
            'amount' => '99999999999999.99',
            'cost_center_id' => $report->cost_center_id,
            'description' => 'Overflow',
        ])->assertStatus(422)->assertJsonValidationErrors('amount');

        $this->callApi($admin, 'POST', "/expense-reports/{$report->id}/items", [
            'expense_date' => '2026-07-15',
            'amount' => '9999999999999.99',
            'cost_center_id' => $report->cost_center_id,
            'description' => 'At the limit',
        ])->assertCreated();
    }

    public function test_reimbursement_amount_respects_its_narrower_column(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $costCenter = $this->costCenter();
        $reimbursement = $this->draftReimbursement($admin, $costCenter->id);

        $this->callApi($admin, 'POST', "/reimbursements/{$reimbursement->id}/items", [
            'expense_date' => '2026-07-15',
            'amount' => '999999999.99',
            'cost_center_id' => $costCenter->id,
            'description' => 'Overflow',
        ])->assertStatus(422)->assertJsonValidationErrors('amount');
    }

    public function test_fund_credit_route_is_reachable_under_its_english_path(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $fund = $this->fund($admin, $this->costCenter(), '100.00');

        $this->callApi($admin, 'POST', "/funds/{$fund->id}/transactions/credit", [
            'amount' => '50.00',
            'transaction_date' => '2026-07-15',
            'notes' => 'Advance',
        ])->assertCreated();

        $this->assertSame('150.00', (string) $fund->fresh()->balance);
    }

    public function test_fund_adjustment_route_is_reachable_under_its_english_path(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $fund = $this->fund($admin, $this->costCenter(), '100.00');

        $this->callApi($admin, 'POST', "/funds/{$fund->id}/transactions/adjustment", [
            'subtype' => 4,
            'amount' => '10.00',
            'transaction_date' => '2026-07-15',
            'reason' => 'Correction',
        ])->assertCreated();

        $this->assertSame('110.00', (string) $fund->fresh()->balance);
    }

    public function test_deleting_an_expense_report_also_removes_its_attachment_files(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $report = $this->draftReport($admin);

        $item = ExpenseReportItem::create([
            'expense_report_id' => $report->id,
            'cost_center_id' => $report->cost_center_id,
            'description' => 'Item',
            'amount' => '10.00',
            'expense_date' => '2026-07-15',
        ]);

        $this->callApi($admin, 'POST', "/expense-reports/{$report->id}/items/{$item->id}/attachments", [
            'attachment' => UploadedFile::fake()->create('invoice.pdf', 10, 'application/pdf'),
        ])->assertCreated();

        $path = $item->attachments()->first()->path;
        $this->assertTrue(Storage::disk('public')->exists($path));

        $this->callApi($admin, 'DELETE', "/expense-reports/{$report->id}")->assertNoContent();

        $this->assertFalse(Storage::disk('public')->exists($path));
    }

    public function test_deleting_a_reimbursement_also_removes_its_attachment_files(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $costCenter = $this->costCenter();
        $reimbursement = $this->draftReimbursement($admin, $costCenter->id);

        $item = ReimbursementItem::create([
            'reimbursement_id' => $reimbursement->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Item',
            'amount' => '10.00',
            'expense_date' => '2026-07-15',
        ]);

        $this->callApi($admin, 'POST', "/reimbursements/{$reimbursement->id}/items/{$item->id}/attachments", [
            'attachment' => UploadedFile::fake()->create('receipt.pdf', 10, 'application/pdf'),
        ])->assertCreated();

        $path = $item->attachments()->first()->path;
        $this->assertTrue(Storage::disk('public')->exists($path));

        $this->callApi($admin, 'DELETE', "/reimbursements/{$reimbursement->id}")->assertNoContent();

        $this->assertFalse(Storage::disk('public')->exists($path));
    }

    public function test_attachment_upload_uses_the_attachment_field_on_both_modules(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $costCenter = $this->costCenter();

        $report = $this->draftReport($admin, $costCenter->id);
        $reportItem = ExpenseReportItem::create([
            'expense_report_id' => $report->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Item',
            'amount' => '10.00',
            'expense_date' => '2026-07-15',
        ]);

        $this->callApi($admin, 'POST', "/expense-reports/{$report->id}/items/{$reportItem->id}/attachments", [
            'attachment' => UploadedFile::fake()->create('invoice.pdf', 10, 'application/pdf'),
        ])->assertCreated();

        $reimbursement = $this->draftReimbursement($admin, $costCenter->id);
        $reimbursementItem = ReimbursementItem::create([
            'reimbursement_id' => $reimbursement->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Item',
            'amount' => '10.00',
            'expense_date' => '2026-07-15',
        ]);

        $this->callApi($admin, 'POST', "/reimbursements/{$reimbursement->id}/items/{$reimbursementItem->id}/attachments", [
            'attachment' => UploadedFile::fake()->create('receipt.pdf', 10, 'application/pdf'),
        ])->assertCreated();
    }

    public function test_a_single_attachment_can_be_deleted_on_both_modules(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $costCenter = $this->costCenter();

        $report = $this->draftReport($admin, $costCenter->id);
        $reportItem = ExpenseReportItem::create([
            'expense_report_id' => $report->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Item',
            'amount' => '10.00',
            'expense_date' => '2026-07-15',
        ]);

        foreach (['a.pdf', 'b.pdf'] as $name) {
            $this->callApi($admin, 'POST', "/expense-reports/{$report->id}/items/{$reportItem->id}/attachments", [
                'attachment' => UploadedFile::fake()->create($name, 10, 'application/pdf'),
            ])->assertCreated();
        }

        $first = $reportItem->attachments()->first();

        $this->callApi($admin, 'DELETE', "/expense-reports/{$report->id}/items/{$reportItem->id}/attachments/{$first->id}")
            ->assertNoContent();

        $this->assertSame(1, $reportItem->attachments()->count());
        $this->assertFalse(Storage::disk('public')->exists($first->path));
    }

    public function test_validation_error_is_json_even_without_an_accept_header(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'X-Account' => self::TENANT_SLUG,
            'Authorization' => "Bearer {$token}",
            'Content-Type' => 'application/json',
        ])->post('/api/v1/cost-center', []);

        $response->assertStatus(422);
        $this->assertStringContainsString('application/json', (string) $response->headers->get('content-type'));
    }

    public function test_approval_rejects_a_closed_fund(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $provider = $this->user(User::ROLE_PROVIDER);
        $costCenter = $this->costCenter();

        $fund = $this->fund($provider, $costCenter, '0.00');
        $fund->status = Fund::STATUS_CLOSED;
        $fund->save();

        $report = $this->draftReport($provider, $costCenter->id);
        ExpenseReportItem::create([
            'expense_report_id' => $report->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Item',
            'amount' => '10.00',
            'expense_date' => '2026-07-15',
        ]);
        $report->status = ExpenseReport::STATUS_PENDING;
        $report->save();

        $this->callApi($admin, 'POST', "/expense-reports/{$report->id}/approve", ['fund_id' => $fund->id])
            ->assertStatus(422);
    }

    public function test_approval_rejects_a_fund_owned_by_a_different_user(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $provider = $this->user(User::ROLE_PROVIDER);
        $otherProvider = $this->user(User::ROLE_PROVIDER);
        $costCenter = $this->costCenter();

        $foreignFund = $this->fund($otherProvider, $costCenter, '500.00');

        $report = $this->draftReport($provider, $costCenter->id);
        ExpenseReportItem::create([
            'expense_report_id' => $report->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Item',
            'amount' => '10.00',
            'expense_date' => '2026-07-15',
        ]);
        $report->status = ExpenseReport::STATUS_PENDING;
        $report->save();

        $this->callApi($admin, 'POST', "/expense-reports/{$report->id}/approve", ['fund_id' => $foreignFund->id])
            ->assertStatus(422);

        $this->assertSame('500.00', (string) $foreignFund->fresh()->balance);
    }

    public function test_auditor_cannot_push_a_report_back_to_draft_or_pending(): void
    {
        $auditor = $this->user(User::ROLE_AUDITOR);
        $provider = $this->user(User::ROLE_PROVIDER);
        $report = $this->draftReport($provider);
        $report->status = ExpenseReport::STATUS_UNDER_REVIEW;
        $report->save();

        $this->callApi($auditor, 'PUT', "/expense-reports/{$report->id}", ['status' => ExpenseReport::STATUS_DRAFT])
            ->assertStatus(422);

        $this->callApi($auditor, 'PUT', "/expense-reports/{$report->id}", ['status' => ExpenseReport::STATUS_PENDING])
            ->assertStatus(422);
    }
}
