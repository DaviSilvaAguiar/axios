<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExpenseReport;
use App\Models\ExpenseReportItem;
use App\Models\ExpenseReportItemAttachment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExpenseReportItemService
{
    private function ensureExpenseReportEditable(int $idExpenseReport): ExpenseReport
    {
        $expenseReport = ExpenseReport::findOrFail($idExpenseReport);

        if ($expenseReport->status !== ExpenseReport::STATUS_DRAFT) {
            throw ValidationException::withMessages([
                'status' => ['Only an expense report in "Draft" can have its items changed.'],
            ]);
        }

        return $expenseReport;
    }

    private function ensureDateWithinPeriod(ExpenseReport $expenseReport, string $date): void
    {
        if (empty($expenseReport->period_start_date) || empty($expenseReport->period_end_date)) {
            return;
        }

        $itemDate = Carbon::parse($date)->startOfDay();
        $start = $expenseReport->period_start_date->copy()->startOfDay();
        $end = $expenseReport->period_end_date->copy()->startOfDay();

        if ($itemDate->lt($start) || $itemDate->gt($end)) {
            throw ValidationException::withMessages([
                'expense_date' => ['The expense date must be within the expense report period.'],
            ]);
        }
    }

    public function create(int $idExpenseReport, array $data, array $files): ExpenseReportItem
    {
        $expenseReport = $this->ensureExpenseReportEditable($idExpenseReport);
        $this->ensureDateWithinPeriod($expenseReport, $data['expense_date']);

        $item = ExpenseReportItem::create([
            'expense_report_id' => $idExpenseReport,
            'cost_center_id' => $data['cost_center_id'],
            'description' => $data['description'],
            'amount' => $data['amount'],
            'expense_date' => $data['expense_date'],
            'expense_category_id' => $data['expense_category_id'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'address' => $data['address'] ?? null,
            'supplier_description' => $data['supplier_description'] ?? null,
            'supplier_tax_id' => $data['supplier_tax_id'] ?? null,
            'supplier_id' => $data['supplier_id'] ?? null,
        ]);

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $path = $file->store("expense-report-attachments/{$idExpenseReport}", 'public');
                ExpenseReportItemAttachment::create([
                    'expense_report_item_id' => $item->id,
                    'path' => $path,
                ]);
            }
        }

        return $item->load(['costCenter', 'expenseCategory', 'attachments']);
    }

    public function update(int $idExpenseReport, int $itemId, array $data): ExpenseReportItem
    {
        $expenseReport = $this->ensureExpenseReportEditable($idExpenseReport);
        $this->ensureDateWithinPeriod($expenseReport, $data['expense_date']);
        $item = ExpenseReportItem::where('expense_report_id', $idExpenseReport)->findOrFail($itemId);

        $item->update([
            'cost_center_id' => $data['cost_center_id'],
            'description' => $data['description'],
            'amount' => $data['amount'],
            'expense_date' => $data['expense_date'],
            'expense_category_id' => $data['expense_category_id'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'address' => $data['address'] ?? null,
            'supplier_description' => $data['supplier_description'] ?? null,
            'supplier_tax_id' => $data['supplier_tax_id'] ?? null,
            'supplier_id' => $data['supplier_id'] ?? null,
        ]);

        return $item->load(['costCenter', 'expenseCategory', 'attachments']);
    }

    public function addAttachment(int $idExpenseReport, int $itemId, UploadedFile $file): ExpenseReportItemAttachment
    {
        $this->ensureExpenseReportEditable($idExpenseReport);
        $item = ExpenseReportItem::where('expense_report_id', $idExpenseReport)->findOrFail($itemId);

        $path = $file->store("expense-report-attachments/{$idExpenseReport}", 'public');

        return ExpenseReportItemAttachment::create([
            'expense_report_item_id' => $item->id,
            'path' => $path,
        ]);
    }

    public function serveAttachment(int $idExpenseReport, int $itemId, int $attachmentId): StreamedResponse
    {
        $item = ExpenseReportItem::where('expense_report_id', $idExpenseReport)->findOrFail($itemId);
        $attachment = $item->attachments()->findOrFail($attachmentId);

        return Storage::disk('public')->response($attachment->path);
    }

    public function delete(int $idExpenseReport, int $itemId): void
    {
        $this->ensureExpenseReportEditable($idExpenseReport);
        $item = ExpenseReportItem::where('expense_report_id', $idExpenseReport)->findOrFail($itemId);

        foreach ($item->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->path);
        }

        $item->delete();
    }
}
