<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Export\SiengeExportHandler;
use App\Models\ExpenseReport;
use App\Models\ExpenseReportItem;
use Illuminate\Support\Collection;
use PHPUnit\Framework\TestCase;

class SiengeExportHandlerTest extends TestCase
{
    public function test_builds_csv_with_header_and_document_rows(): void
    {
        $report = new ExpenseReport(['description' => 'Field trip', 'requester_description' => 'John Doe']);
        $report->id = 7;
        $report->setRelation('items', new Collection([
            new ExpenseReportItem(['amount' => '50.00']),
            new ExpenseReportItem(['unit_amount' => '10.00', 'quantity' => '3']),
        ]));

        $csv = (new SiengeExportHandler())->buildCsv(new Collection([$report]));

        $this->assertStringContainsString('ID,Description,Requester,Total,Items,"Created At"', $csv);
        $this->assertStringContainsString('7,"Field trip","John Doe",80.00,2', $csv);
    }

    public function test_empty_document_collection_produces_header_only(): void
    {
        $csv = (new SiengeExportHandler())->buildCsv(new Collection());
        $lines = array_filter(explode("\n", trim($csv)));
        $this->assertCount(1, $lines);
    }
}
