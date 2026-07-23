<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CostCenter;
use App\Models\ExpenseReport;
use App\Models\ExpenseReportItem;
use App\Models\ExportBatch;
use App\Models\Fund;
use App\Models\FundTransaction;
use App\Models\Reimbursement;
use App\Models\User;
use App\Services\ExpenseReportService;
use App\Services\ExportBatchService;
use App\Services\FundService;
use App\Services\FundTransactionService;
use App\Services\ReimbursementService;
use App\Support\Money;
use Illuminate\Validation\ValidationException;
use Tests\TenantTestCase;
use UnexpectedValueException;

class FinancialRulesTest extends TenantTestCase
{
    private function user(int $role): User
    {
        $suffix = User::count() + 1;

        return User::create([
            'role' => $role,
            'name' => "User {$suffix}",
            'email' => "user{$suffix}@test.com",
            'password' => 'secret123',
            'active' => true,
        ]);
    }

    private function costCenter(): CostCenter
    {
        return CostCenter::create([
            'description' => 'General',
            'erp_code' => 'CC1',
            'active' => true,
        ]);
    }

    private function fund(User $owner, CostCenter $costCenter, string $balance): Fund
    {
        return Fund::create([
            'user_id' => $owner->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Site fund',
            'balance' => $balance,
            'type' => Fund::TYPE_DINHEIRO_PIX,
            'status' => Fund::STATUS_ACTIVE,
        ]);
    }

    private function pendingReport(User $owner, CostCenter $costCenter, array $amounts): ExpenseReport
    {
        $report = ExpenseReport::create([
            'user_id' => $owner->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Field report',
            'status' => ExpenseReport::STATUS_PENDING,
            'needed_at' => now(),
            'requester_description' => $owner->name,
            'requester_department' => 'Operations',
            'requester_tax_id' => '00000000000',
        ]);

        foreach ($amounts as $amount) {
            ExpenseReportItem::create([
                'expense_report_id' => $report->id,
                'cost_center_id' => $costCenter->id,
                'description' => 'Item',
                'amount' => $amount,
                'expense_date' => now()->toDateString(),
            ]);
        }

        return $report;
    }

    public function test_approving_expense_report_debits_the_fund_with_the_report_total(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);
        $auditor = $this->user(User::ROLE_AUDITOR);
        $costCenter = $this->costCenter();
        $fund = $this->fund($provider, $costCenter, '500.00');
        $report = $this->pendingReport($provider, $costCenter, ['150.00', '100.00']);

        $this->actingAs($auditor);
        app(ExpenseReportService::class)->approve($report->id, $fund->id);

        $this->assertSame(ExpenseReport::STATUS_APPROVED, $report->fresh()->status);
        $this->assertSame('250.00', $fund->fresh()->balance->toDecimalString());

        $debit = FundTransaction::where('fund_id', $fund->id)
            ->where('expense_report_id', $report->id)
            ->where('transaction_type', FundTransaction::TYPE_DEBITO)
            ->first();

        $this->assertNotNull($debit);
        $this->assertSame('250.00', $debit->amount->toDecimalString());
    }

    public function test_insufficient_balance_blocks_the_debit(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);
        $auditor = $this->user(User::ROLE_AUDITOR);
        $costCenter = $this->costCenter();
        $fund = $this->fund($provider, $costCenter, '100.00');
        $report = $this->pendingReport($provider, $costCenter, ['150.00']);

        $this->actingAs($auditor);

        try {
            app(FundTransactionService::class)
                ->postDebitFromExpenseReport($fund->id, $report->id, Money::fromDecimalString('150.00'));
            $this->fail('Expected a ValidationException for insufficient balance.');
        } catch (ValidationException) {
        }

        $this->assertSame('100.00', $fund->fresh()->balance->toDecimalString());
        $this->assertSame(0, FundTransaction::count());
    }

    public function test_fund_closes_only_with_zero_balance(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);
        $auditor = $this->user(User::ROLE_AUDITOR);
        $costCenter = $this->costCenter();
        $this->actingAs($auditor);

        $funded = $this->fund($provider, $costCenter, '50.00');
        try {
            app(FundService::class)->close($funded->id);
            $this->fail('Expected a ValidationException closing a fund with balance.');
        } catch (ValidationException) {
        }
        $this->assertSame(Fund::STATUS_ACTIVE, $funded->fresh()->status);

        $empty = $this->fund($provider, $costCenter, '0.00');
        app(FundService::class)->close($empty->id);
        $this->assertSame(Fund::STATUS_CLOSED, $empty->fresh()->status);
    }

    public function test_exported_documents_are_not_reexported(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);
        $costCenter = $this->costCenter();

        $batch = ExportBatch::create([
            'user_id' => $provider->id,
            'batch_type' => ExportBatch::TYPE_EXPENSE_REPORT,
            'template_used' => 'sienge-expense-report',
            'total_amount' => '100.00',
            'item_count' => 1,
        ]);

        $report = $this->pendingReport($provider, $costCenter, ['100.00']);
        $report->update([
            'status' => ExpenseReport::STATUS_APPROVED,
            'export_batch_id' => $batch->id,
        ]);

        $this->expectException(UnexpectedValueException::class);

        app(ExportBatchService::class)->generateBatch(
            $provider->id,
            ExportBatch::TYPE_EXPENSE_REPORT,
            'sienge-expense-report',
            [$report->id],
        );
    }

    public function test_reimbursement_flow_never_touches_the_fund(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);
        $auditor = $this->user(User::ROLE_AUDITOR);

        $reimbursement = Reimbursement::create([
            'user_id' => $provider->id,
            'title' => 'Trip reimbursement',
            'status' => Reimbursement::STATUS_PENDING,
            'period_start_date' => now()->toDateString(),
            'period_end_date' => now()->toDateString(),
        ]);

        $this->actingAs($auditor);
        app(ReimbursementService::class)->updateStatus($reimbursement->id, [
            'status' => Reimbursement::STATUS_APPROVED,
        ]);

        $this->assertSame(0, FundTransaction::count());
    }
}
