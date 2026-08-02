<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ExpenseReport;
use App\Models\ExpenseReportItem;
use App\Models\Reimbursement;
use App\Models\ReimbursementItem;
use App\Models\User;
use Tests\ApiTestCase;

class CriticalFlowTest extends ApiTestCase
{
    public function test_creating_an_expense_report_starts_it_in_draft(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);
        $costCenter = $this->costCenter();

        $response = $this->callApi($provider, 'POST', '/expense-reports', [
            'description' => 'July field expenses',
            'cost_center_id' => $costCenter->id,
            'period_start_date' => '2026-07-01',
            'period_end_date' => '2026-07-31',
            'requester_description' => 'Requester',
            'requester_department' => 'Ops',
            'requester_tax_id' => '11111111111',
        ])->assertCreated();

        $this->assertSame(ExpenseReport::STATUS_DRAFT, $response->json('data.status'));
        $this->assertSame($provider->id, ExpenseReport::find($response->json('data.id'))->user_id);
    }

    public function test_period_end_date_must_not_precede_the_start_date(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);

        $this->callApi($provider, 'POST', '/expense-reports', [
            'description' => 'Invalid period',
            'cost_center_id' => $this->costCenter()->id,
            'period_start_date' => '2026-07-31',
            'period_end_date' => '2026-07-01',
            'requester_description' => 'Requester',
            'requester_department' => 'Ops',
            'requester_tax_id' => '11111111111',
        ])->assertStatus(422)->assertJsonValidationErrors('period_end_date');
    }

    public function test_items_cannot_be_added_once_the_report_leaves_draft(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);
        $costCenter = $this->costCenter();

        $report = ExpenseReport::create([
            'user_id' => $provider->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Locked report',
            'status' => ExpenseReport::STATUS_PENDING,
            'requester_description' => 'Requester',
            'requester_department' => 'Ops',
            'requester_tax_id' => '11111111111',
            'period_start_date' => '2026-07-01',
            'period_end_date' => '2026-07-31',
        ]);

        $this->callApi($provider, 'POST', "/expense-reports/{$report->id}/items", [
            'expense_date' => '2026-07-15',
            'amount' => '10.00',
            'cost_center_id' => $costCenter->id,
            'description' => 'Too late',
        ])->assertStatus(422);

        $this->assertSame(0, ExpenseReportItem::where('expense_report_id', $report->id)->count());
    }

    public function test_approving_a_report_debits_the_fund_and_moves_the_status(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $provider = $this->user(User::ROLE_PROVIDER);
        $costCenter = $this->costCenter();
        $fund = $this->fund($provider, $costCenter, '2000.00');

        $report = ExpenseReport::create([
            'user_id' => $provider->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Approvable',
            'status' => ExpenseReport::STATUS_PENDING,
            'requester_description' => 'Requester',
            'requester_department' => 'Ops',
            'requester_tax_id' => '11111111111',
            'period_start_date' => '2026-07-01',
            'period_end_date' => '2026-07-31',
        ]);

        foreach (['0.01', '33.33', '1234.56'] as $amount) {
            ExpenseReportItem::create([
                'expense_report_id' => $report->id,
                'cost_center_id' => $costCenter->id,
                'description' => "Item {$amount}",
                'amount' => $amount,
                'expense_date' => '2026-07-15',
            ]);
        }

        $this->callApi($admin, 'POST', "/expense-reports/{$report->id}/approve", ['fund_id' => $fund->id])
            ->assertOk();

        $this->assertSame('1267.90', (string) $report->fresh()->total());
        $this->assertSame('732.10', (string) $fund->fresh()->balance);
        $this->assertSame(ExpenseReport::STATUS_APPROVED, $report->fresh()->status);
    }

    public function test_scheduling_a_reimbursement_payment_requires_a_date(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $costCenter = $this->costCenter();

        $reimbursement = Reimbursement::create([
            'user_id' => $admin->id,
            'cost_center_id' => $costCenter->id,
            'title' => 'To schedule',
            'status' => Reimbursement::STATUS_APPROVED,
            'requester_name' => 'Requester',
            'requester_department' => 'Ops',
            'requester_tax_id' => '11111111111',
            'period_start_date' => '2026-07-01',
            'period_end_date' => '2026-07-31',
        ]);

        ReimbursementItem::create([
            'reimbursement_id' => $reimbursement->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Item',
            'amount' => '25.00',
            'expense_date' => '2026-07-15',
        ]);

        $this->callApi($admin, 'PATCH', "/reimbursements/{$reimbursement->id}/status", [
            'status' => Reimbursement::STATUS_PAYMENT_SCHEDULED,
        ])->assertStatus(422);

        $this->callApi($admin, 'PATCH', "/reimbursements/{$reimbursement->id}/status", [
            'status' => Reimbursement::STATUS_PAYMENT_SCHEDULED,
            'scheduled_payment_date' => '2026-08-20',
        ])->assertOk();

        $this->assertSame(
            '2026-08-20',
            $reimbursement->fresh()->scheduled_payment_date->format('Y-m-d')
        );
    }

    public function test_export_refuses_a_document_that_is_not_approved(): void
    {
        $admin = $this->user(User::ROLE_ADMIN);
        $costCenter = $this->costCenter();

        $report = ExpenseReport::create([
            'user_id' => $admin->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Still a draft',
            'status' => ExpenseReport::STATUS_DRAFT,
            'requester_description' => 'Requester',
            'requester_department' => 'Ops',
            'requester_tax_id' => '11111111111',
            'period_start_date' => '2026-07-01',
            'period_end_date' => '2026-07-31',
        ]);

        $this->callApi($admin, 'POST', '/export/generate', [
            'batch_type' => 'EXPENSE_REPORT',
            'template' => 'sienge-expense-report',
            'ids' => [$report->id],
        ])->assertStatus(422);

        $this->assertNull($report->fresh()->export_batch_id);
    }
}
