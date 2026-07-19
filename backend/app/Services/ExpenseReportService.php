<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExpenseReport;
use App\Models\ExpenseReportItem;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ExpenseReportService
{
    public function __construct(
        private readonly FundTransactionService $transactionService,
    ) {}

    public function list(): Collection
    {
        return ExpenseReport::with([
            'costCenter',
            'requesterUser',
            'items.costCenter',
            'items.expenseCategory',
            'items.attachments',
        ])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function find(int $id): ExpenseReport
    {
        $expenseReport = ExpenseReport::with(['costCenter', 'requesterUser'])
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        $items = ExpenseReportItem::with(['costCenter', 'expenseCategory', 'attachments'])
            ->where('expense_report_id', $expenseReport->id)
            ->get();

        $expenseReport->setRelation('items', $items);

        return $expenseReport;
    }

    public function create(array $data): ExpenseReport
    {
        $data = $this->resolveRequester($data);

        $expenseReport = ExpenseReport::create([
            ...$data,
            'user_id' => Auth::id(),
            'status'     => ExpenseReport::STATUS_DRAFT,
        ]);

        return $expenseReport->load(['costCenter', 'requesterUser']);
    }

    private const CONTENT_FIELDS = [
        'cost_center_id', 'description', 'period_start_date', 'period_end_date',
        'notes', 'bank', 'branch', 'account_number', 'pix_key',
        'requester_description', 'requester_department', 'requester_tax_id', 'requester_user_id',
    ];

    public function update(int $id, array $data): ExpenseReport
    {
        $expenseReport = ExpenseReport::where('user_id', Auth::id())->findOrFail($id);

        $editingContent = !empty(array_intersect(array_keys($data), self::CONTENT_FIELDS));
        if ($editingContent && $expenseReport->status !== ExpenseReport::STATUS_DRAFT) {
            throw ValidationException::withMessages([
                'status' => ['Only an expense report in "Draft" can be edited.'],
            ]);
        }

        $newStatus = isset($data['status']) ? (int) $data['status'] : null;
        if ($newStatus === ExpenseReport::STATUS_REJECTED && empty($data['rejection_reason'])) {
            throw ValidationException::withMessages([
                'rejection_reason' => ['The rejection reason is required when rejecting an expense report.'],
            ]);
        }
        if ($newStatus === ExpenseReport::STATUS_PAYMENT_SCHEDULED && empty($data['paid_at'])) {
            throw ValidationException::withMessages([
                'paid_at' => ['The payment date is required when scheduling the payment.'],
            ]);
        }

        $data = $this->resolveRequester($data);
        $expenseReport->update($data);

        return $expenseReport->load([
            'costCenter',
            'requesterUser',
            'items.costCenter',
            'items.expenseCategory',
            'items.attachments',
        ]);
    }

    private function resolveRequester(array $data): array
    {
        if (empty($data['requester_user_id'])) {
            return $data;
        }

        $user = User::find($data['requester_user_id']);
        if (!$user) {
            throw ValidationException::withMessages([
                'requester_user_id' => ['Employee not found.'],
            ]);
        }

        if (empty($data['requester_description'])) {
            $data['requester_description'] = $user->name;
        }
        if (empty($data['requester_tax_id'])) {
            $data['requester_tax_id'] = $user->tax_id ?? '';
        }

        return $data;
    }

    public function remove(int $id): void
    {
        $expenseReport = ExpenseReport::findOrFail($id);

        if ($expenseReport->status !== ExpenseReport::STATUS_DRAFT) {
            throw ValidationException::withMessages([
                'status' => ['Only an expense report in Draft can be deleted.'],
            ]);
        }

        $expenseReport->delete();
    }

    public function approve(int $expenseReportId, int $fundId): ExpenseReport
    {
        return DB::transaction(function () use ($expenseReportId, $fundId): ExpenseReport {
            $expenseReport = ExpenseReport::with('items')->lockForUpdate()->findOrFail($expenseReportId);

            $approvableStatuses = [ExpenseReport::STATUS_PENDING, ExpenseReport::STATUS_UNDER_REVIEW];
            if (!in_array($expenseReport->status, $approvableStatuses, true)) {
                throw ValidationException::withMessages([
                    'status' => ['Only an expense report in "Pending" or "Under Review" can be approved.'],
                ]);
            }

            $amountTotal = '0';
            foreach ($expenseReport->items as $item) {
                $amountTotal = bcadd($amountTotal, (string) $item->amount, 2);
            }

            if (bccomp($amountTotal, '0', 2) === 0) {
                throw ValidationException::withMessages([
                    'items' => ['Cannot approve an expense report without items.'],
                ]);
            }

            $expenseReport->update(['status' => ExpenseReport::STATUS_APPROVED]);

            $this->transactionService->postDebitFromExpenseReport($fundId, $expenseReport->id, $amountTotal);

            return $expenseReport->load([
                'costCenter',
                'requesterUser',
                'items.costCenter',
                'items.expenseCategory',
                'items.attachments',
            ]);
        });
    }

    public function generatePdf(int $id): Response
    {
        $pdfBytes = $this->generatePdfBytes($id);

        return new Response(
            $pdfBytes,
            200,
            [
                'Content-Type'        => 'application/pdf',
                'Content-Disposition' => "inline; filename=\"rdc-{$id}.pdf\"",
            ]
        );
    }

    public function generatePdfBytes(int $id): string
    {
        $expenseReport = ExpenseReport::with([
            'costCenter',
            'requesterUser',
            'items.costCenter',
            'items.expenseCategory',
            'items.attachments',
        ])->findOrFail($id);

        return Pdf::loadView('pdf.expense-report', ['expenseReport' => $expenseReport])->output();
    }
}
