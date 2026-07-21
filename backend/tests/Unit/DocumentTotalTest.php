<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\ExpenseReport;
use App\Models\ExpenseReportItem;
use App\Models\Reimbursement;
use App\Models\ReimbursementItem;
use Illuminate\Support\Collection;
use PHPUnit\Framework\TestCase;

class DocumentTotalTest extends TestCase
{
    public function test_expense_report_item_value_prefers_amount(): void
    {
        $item = new ExpenseReportItem(['amount' => '50.00', 'unit_amount' => '10.00', 'quantity' => '3']);
        $this->assertSame('50.00', $item->value()->toDecimalString());
    }

    public function test_expense_report_item_value_falls_back_to_unit_times_quantity(): void
    {
        $item = new ExpenseReportItem(['unit_amount' => '10.00', 'quantity' => '3']);
        $this->assertSame('30.00', $item->value()->toDecimalString());
    }

    public function test_reimbursement_item_value_uses_amount(): void
    {
        $item = new ReimbursementItem(['amount' => '25.50']);
        $this->assertSame('25.50', $item->value()->toDecimalString());
    }

    public function test_expense_report_total_sums_item_values_consistently(): void
    {
        $withAmount = new ExpenseReportItem(['amount' => '50.00', 'unit_amount' => '10.00', 'quantity' => '3']);
        $withUnit = new ExpenseReportItem(['unit_amount' => '10.00', 'quantity' => '3']);

        $report = new ExpenseReport;
        $report->setRelation('items', new Collection([$withAmount, $withUnit]));

        $this->assertSame('80.00', $report->total()->toDecimalString());
    }

    public function test_reimbursement_total_sums_item_values(): void
    {
        $reimbursement = new Reimbursement;
        $reimbursement->setRelation('items', new Collection([
            new ReimbursementItem(['amount' => '10.00']),
            new ReimbursementItem(['amount' => '5.50']),
        ]));

        $this->assertSame('15.50', $reimbursement->total()->toDecimalString());
    }

    public function test_empty_document_total_is_zero(): void
    {
        $report = new ExpenseReport;
        $report->setRelation('items', new Collection);
        $this->assertTrue($report->total()->isZero());
    }
}
