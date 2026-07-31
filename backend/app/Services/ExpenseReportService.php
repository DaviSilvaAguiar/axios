<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExpenseReport;
use App\Models\ExpenseReportItem;
use App\Models\Fund;
use App\Services\Concerns\ResolvesRequester;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ExpenseReportService
{
    use ResolvesRequester;

    public function __construct(
        private readonly FundTransactionService $transactionService,
    ) {}

    public function list(): Collection
    {
        $query = ExpenseReport::with([
            'costCenter',
            'requesterUser',
            'items.costCenter',
            'items.expenseCategory',
            'items.attachments',
        ]);

        if (Auth::user()?->isProvider()) {
            $query->where('user_id', Auth::id());
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function find(int $id): ExpenseReport
    {
        $expenseReport = ExpenseReport::with(['costCenter', 'requesterUser'])->findOrFail($id);

        Gate::authorize('view', $expenseReport);

        $items = ExpenseReportItem::with(['costCenter', 'expenseCategory', 'attachments'])
            ->where('expense_report_id', $expenseReport->id)
            ->get();

        $expenseReport->setRelation('items', $items);

        return $expenseReport;
    }

    public function create(array $data): ExpenseReport
    {
        $data = $this->resolveRequester($data, 'requester_description');

        $expenseReport = ExpenseReport::create([
            ...$data,
            'user_id' => Auth::id(),
            'status' => ExpenseReport::STATUS_DRAFT,
        ]);

        return $expenseReport->load(['costCenter', 'requesterUser']);
    }

    private const CONTENT_FIELDS = [
        'cost_center_id', 'description', 'period_start_date', 'period_end_date',
        'notes', 'bank', 'branch', 'account_number', 'pix_key',
        'requester_description', 'requester_department', 'requester_tax_id', 'requester_user_id',
    ];

    private const SUBMITTABLE_BY_OWNER = [ExpenseReport::STATUS_PENDING];

    private const AUDIT_STATUSES = [
        ExpenseReport::STATUS_UNDER_REVIEW,
        ExpenseReport::STATUS_APPROVED,
        ExpenseReport::STATUS_PAYMENT_SCHEDULED,
        ExpenseReport::STATUS_PAID,
        ExpenseReport::STATUS_REJECTED,
    ];

    public function update(int $id, array $data): ExpenseReport
    {
        $expenseReport = ExpenseReport::findOrFail($id);

        $editingContent = ! empty(array_intersect(array_keys($data), self::CONTENT_FIELDS));
        $newStatus = isset($data['status']) ? (int) $data['status'] : null;

        if ($editingContent) {
            Gate::authorize('update', $expenseReport);

            if ($expenseReport->status !== ExpenseReport::STATUS_DRAFT) {
                throw ValidationException::withMessages([
                    'status' => ['Only an expense report in "Draft" can be edited.'],
                ]);
            }
        }

        if ($newStatus !== null && $newStatus !== $expenseReport->status) {
            $this->authorizeStatusChange($expenseReport, $newStatus);
        }

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

        $data = $this->resolveRequester($data, 'requester_description');
        $expenseReport->update($data);

        return $expenseReport->load([
            'costCenter',
            'requesterUser',
            'items.costCenter',
            'items.expenseCategory',
            'items.attachments',
        ]);
    }

    private function authorizeStatusChange(ExpenseReport $expenseReport, int $newStatus): void
    {
        $user = Auth::user();

        if ($user->isAdmin() || $user->isAuditor()) {
            if (! in_array($newStatus, self::AUDIT_STATUSES, true)) {
                throw ValidationException::withMessages([
                    'status' => ['An auditor cannot move an expense report back to "Draft" or "Pending".'],
                ]);
            }

            return;
        }

        if ($expenseReport->user_id !== $user->id) {
            throw new AuthorizationException('This action is unauthorized.');
        }

        if (! in_array($newStatus, self::SUBMITTABLE_BY_OWNER, true)) {
            throw ValidationException::withMessages([
                'status' => ['The provider can only submit an expense report for review.'],
            ]);
        }

        if ($expenseReport->status !== ExpenseReport::STATUS_DRAFT) {
            throw ValidationException::withMessages([
                'status' => ['Only an expense report in "Draft" can be submitted.'],
            ]);
        }
    }

    public function remove(int $id): void
    {
        $expenseReport = ExpenseReport::findOrFail($id);
        Gate::authorize('delete', $expenseReport);

        if ($expenseReport->status !== ExpenseReport::STATUS_DRAFT) {
            throw ValidationException::withMessages([
                'status' => ['Only an expense report in Draft can be deleted.'],
            ]);
        }

        foreach ($expenseReport->items()->with('attachments')->get() as $item) {
            foreach ($item->attachments as $attachment) {
                Storage::disk('public')->delete($attachment->path);
            }
        }

        $expenseReport->delete();
    }

    public function approve(int $expenseReportId, int $fundId): ExpenseReport
    {
        return DB::transaction(function () use ($expenseReportId, $fundId): ExpenseReport {
            $expenseReport = ExpenseReport::with('items')->lockForUpdate()->findOrFail($expenseReportId);
            Gate::authorize('approve', $expenseReport);

            $approvableStatuses = [ExpenseReport::STATUS_PENDING, ExpenseReport::STATUS_UNDER_REVIEW];
            if (! in_array($expenseReport->status, $approvableStatuses, true)) {
                throw ValidationException::withMessages([
                    'status' => ['Only an expense report in "Pending" or "Under Review" can be approved.'],
                ]);
            }

            $amountTotal = $expenseReport->total();

            if ($amountTotal->isZero()) {
                throw ValidationException::withMessages([
                    'items' => ['Cannot approve an expense report without items.'],
                ]);
            }

            $fund = Fund::findOrFail($fundId);

            if ($fund->status !== Fund::STATUS_ACTIVE) {
                throw ValidationException::withMessages([
                    'fund_id' => ['The selected fund is closed and cannot be charged.'],
                ]);
            }

            if ($fund->user_id !== $expenseReport->user_id) {
                throw ValidationException::withMessages([
                    'fund_id' => ['The selected fund does not belong to the provider of this expense report.'],
                ]);
            }

            if ($fund->cost_center_id !== $expenseReport->cost_center_id) {
                throw ValidationException::withMessages([
                    'fund_id' => ['The selected fund belongs to a different cost center than this expense report.'],
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
                'Content-Type' => 'application/pdf',
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

        Gate::authorize('view', $expenseReport);

        return Pdf::loadView('pdf.expense-report', ['expenseReport' => $expenseReport])->output();
    }
}
