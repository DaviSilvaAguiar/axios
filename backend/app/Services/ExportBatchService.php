<?php

declare(strict_types=1);

namespace App\Services;

use App\Factories\ExportHandlerFactory;
use App\Models\ExpenseReport;
use App\Models\ExportBatch;
use App\Models\Reimbursement;
use App\Support\Money;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;
use UnexpectedValueException;

class ExportBatchService
{
    private const STATUS_EXPENSE_REPORT_LABEL = [
        ExpenseReport::STATUS_DRAFT => 'Draft',
        ExpenseReport::STATUS_PENDING => 'Pending',
        ExpenseReport::STATUS_UNDER_REVIEW => 'Under Review',
        ExpenseReport::STATUS_APPROVED => 'Approved',
        ExpenseReport::STATUS_PAYMENT_SCHEDULED => 'Payment Scheduled',
        ExpenseReport::STATUS_PAID => 'Paid',
        ExpenseReport::STATUS_REJECTED => 'Rejected',
    ];

    private const STATUS_REIMBURSEMENT_LABEL = [
        Reimbursement::STATUS_REQUESTED => 'Draft',
        Reimbursement::STATUS_PENDING => 'Pending',
        Reimbursement::STATUS_UNDER_REVIEW => 'Under Review',
        Reimbursement::STATUS_APPROVED => 'Approved',
        Reimbursement::STATUS_PAYMENT_SCHEDULED => 'Payment Scheduled',
        Reimbursement::STATUS_PAID => 'Paid',
        Reimbursement::STATUS_REJECTED => 'Rejected',
    ];

    public function generateBatch(
        int $idUser,
        string $batchType,
        string $templateUsed,
        array $documentIds
    ): ExportBatch {
        [$batch, $documents] = DB::transaction(function () use ($idUser, $batchType, $templateUsed, $documentIds) {
            $documents = $this->loadDocuments($batchType, $documentIds, true);

            if ($documents->isEmpty()) {
                throw new UnexpectedValueException('No pending and valid report was found for export.');
            }

            $batch = ExportBatch::create([
                'user_id' => $idUser,
                'batch_type' => $batchType,
                'template_used' => $templateUsed,
                'total_amount' => $this->calculateTotalAmount($batchType, $documents),
                'item_count' => $documents->count(),
            ]);

            $this->modelForType($batchType)::query()
                ->whereIn('id', $documents->pluck('id')->all())
                ->update(['export_batch_id' => $batch->id]);

            return [$batch, $documents];
        });

        try {
            $handler = ExportHandlerFactory::make($templateUsed);
            $filePath = $handler->generate($documents, $batch->id);

            $batch->update([
                'file_name' => basename($filePath),
                'file_path' => $filePath,
            ]);
        } catch (Throwable $e) {
            DB::transaction(function () use ($batchType, $batch): void {
                $this->modelForType($batchType)::query()
                    ->where('export_batch_id', $batch->id)
                    ->update(['export_batch_id' => null]);
                $batch->delete();
            });
            throw $e;
        }

        return $batch;
    }

    public function getPendingExpenseReports(int $perPage): array
    {
        $paginator = ExpenseReport::with(['user:id,name', 'costCenter:id,description', 'items:id,expense_report_id,amount,quantity,unit_amount'])
            ->where('status', ExpenseReport::STATUS_APPROVED)
            ->whereNull('export_batch_id')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $items = collect($paginator->items())
            ->map(fn (ExpenseReport $expenseReport) => [
                'id' => $expenseReport->id,
                'identifier' => 'RDC-'.str_pad((string) $expenseReport->id, 4, '0', STR_PAD_LEFT),
                'description' => $expenseReport->description,
                'provider' => $expenseReport->user?->name ?? '—',
                'cost_center' => $expenseReport->costCenter?->description,
                'amount' => $expenseReport->total(),
                'date' => optional($expenseReport->created_at)->toIso8601String(),
                'status' => self::STATUS_EXPENSE_REPORT_LABEL[$expenseReport->status] ?? 'Unknown',
                'type' => ExportBatch::TYPE_EXPENSE_REPORT,
            ])
            ->values()
            ->all();

        return ['paginator' => $paginator, 'items' => $items];
    }

    public function getPendingReimbursements(int $perPage): array
    {
        $paginator = Reimbursement::with(['user:id,name', 'items:id,reimbursement_id,amount'])
            ->whereIn('status', [Reimbursement::STATUS_APPROVED, Reimbursement::STATUS_PAYMENT_SCHEDULED])
            ->whereNull('export_batch_id')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $items = collect($paginator->items())
            ->map(fn (Reimbursement $reimbursement) => [
                'id' => $reimbursement->id,
                'identifier' => 'RCM-'.str_pad((string) $reimbursement->id, 4, '0', STR_PAD_LEFT),
                'description' => $reimbursement->title,
                'provider' => $reimbursement->user?->name ?? '—',
                'cost_center' => null,
                'amount' => $reimbursement->total(),
                'date' => optional($reimbursement->created_at)->toIso8601String(),
                'status' => self::STATUS_REIMBURSEMENT_LABEL[$reimbursement->status] ?? 'Unknown',
                'type' => ExportBatch::TYPE_REIMBURSEMENT,
            ])
            ->values()
            ->all();

        return ['paginator' => $paginator, 'items' => $items];
    }

    public function getPendingStats(): array
    {
        $expenseReportQuery = ExpenseReport::where('status', ExpenseReport::STATUS_APPROVED)
            ->whereNull('export_batch_id');

        $expenseReportCount = (int) (clone $expenseReportQuery)->count();
        $expenseReportAmount = Money::fromDecimalString((string) (clone $expenseReportQuery)
            ->join('expense_report_item', 'expense_report.id', '=', 'expense_report_item.expense_report_id')
            ->sum(DB::raw('COALESCE(expense_report_item.amount, COALESCE(expense_report_item.unit_amount, 0) * COALESCE(expense_report_item.quantity, 1))')));

        $reimbursementQuery = Reimbursement::whereIn('status', [Reimbursement::STATUS_APPROVED, Reimbursement::STATUS_PAYMENT_SCHEDULED])
            ->whereNull('export_batch_id');

        $reimbursementCount = (int) (clone $reimbursementQuery)->count();
        $reimbursementAmount = Money::fromDecimalString((string) (clone $reimbursementQuery)
            ->join('reimbursement_item', 'reimbursement.id', '=', 'reimbursement_item.reimbursement_id')
            ->sum(DB::raw('COALESCE(reimbursement_item.amount, 0)')));

        return [
            'expense_report' => ['quantity' => $expenseReportCount, 'amount' => $expenseReportAmount],
            'reimbursement' => ['quantity' => $reimbursementCount, 'amount' => $reimbursementAmount],
        ];
    }

    public function getHistory(int $perPage): LengthAwarePaginator
    {
        return ExportBatch::with(['user:id,name,email,role'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function downloadBatchFile(int $batchId): StreamedResponse
    {
        $batch = ExportBatch::findOrFail($batchId);

        if (! $batch->file_path || ! Storage::disk('public')->exists($batch->file_path)) {
            throw new UnexpectedValueException('Export file not found.');
        }

        return Storage::disk('public')->download(
            $batch->file_path,
            $batch->file_name ?? basename($batch->file_path)
        );
    }

    public function getTemplates(): array
    {
        $templates = Config::get('export.templates', []);

        return array_map(static fn (array $t): array => [
            'code' => $t['code'],
            'name' => $t['name'],
            'description' => $t['description'],
            'type' => $t['type'],
        ], $templates);
    }

    private function loadDocuments(string $batchType, array $ids, bool $lock): EloquentCollection
    {
        $query = $this->modelForType($batchType)::query()
            ->whereIn('id', $ids)
            ->whereNull('export_batch_id');

        if ($batchType === ExportBatch::TYPE_EXPENSE_REPORT) {
            $query->with(['user', 'costCenter', 'items']);
        } else {
            $query->with(['user', 'items.costCenter']);
        }

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->get();
    }

    private function calculateTotalAmount(string $batchType, Collection $documents): Money
    {
        return $documents->reduce(
            fn (Money $carry, $document): Money => $carry->add($document->total()),
            Money::zero(),
        );
    }

    private function modelForType(string $batchType): string
    {
        return match ($batchType) {
            ExportBatch::TYPE_EXPENSE_REPORT => ExpenseReport::class,
            ExportBatch::TYPE_REIMBURSEMENT => Reimbursement::class,
            default => throw new UnexpectedValueException("Invalid batch type: {$batchType}"),
        };
    }
}
