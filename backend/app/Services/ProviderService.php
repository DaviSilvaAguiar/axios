<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExpenseReport;
use App\Models\Reimbursement;
use Illuminate\Support\Facades\Auth;

class ProviderService
{
    public function listTransactions(?string $type, int $page, int $perPage): array
    {
        $userId = (int) Auth::id();
        $items = collect();

        if ($type === null || $type === 'expense_report') {
            $expenseReports = ExpenseReport::query()
                ->where('user_id', $userId)
                ->withSum('items as total_amount', 'amount')
                ->get(['id', 'description', 'status', 'created_at'])
                ->map(fn (ExpenseReport $c): array => [
                    'id' => $c->id,
                    'type' => 'expense_report',
                    'title' => $c->description ?? 'Expense Report',
                    'total_amount' => (string) ($c->total_amount ?? '0.00'),
                    'status' => (int) $c->status,
                    'created_at' => $c->created_at?->toIso8601String() ?? '',
                ]);
            $items = $items->concat($expenseReports);
        }

        if ($type === null || $type === 'reimbursement') {
            $reimbursements = Reimbursement::query()
                ->where('user_id', $userId)
                ->withSum('items as total_amount', 'amount')
                ->get(['id', 'title', 'status', 'created_at'])
                ->map(fn (Reimbursement $r): array => [
                    'id' => $r->id,
                    'type' => 'reimbursement',
                    'title' => $r->title,
                    'total_amount' => (string) ($r->total_amount ?? '0.00'),
                    'status' => (int) $r->status,
                    'created_at' => $r->created_at?->toIso8601String() ?? '',
                ]);
            $items = $items->concat($reimbursements);
        }

        $sorted = $items->sortByDesc('created_at')->values();
        $total = $sorted->count();
        $paginated = $sorted->slice(($page - 1) * $perPage, $perPage)->values()->all();

        return [
            'data' => $paginated,
            'meta' => [
                'current_page' => $page,
                'last_page' => max(1, (int) ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
            ],
        ];
    }
}
