<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExpenseReport;
use App\Models\Fund;
use App\Models\FundTransaction;
use App\Models\ExportBatch;
use App\Models\Reimbursement;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function overview(int $year, int $month): array
    {
        return [
            'kpis'                    => $this->kpis($year, $month),
            'monthly_movement'        => $this->monthlyMovement($year, $month),
            'upcoming_payments'       => $this->upcomingPayments(),
            'top_cost_centers_month'  => $this->topCostCentersMonth($year, $month),
        ];
    }

    private function kpis(int $year, int $month): array
    {
        return [
            'active_funds'             => (int) Fund::where('status', Fund::STATUS_ACTIVE)->count(),
            'total_balance'            => (string) Fund::where('status', Fund::STATUS_ACTIVE)->sum('balance'),
            'pending_expense_reports'  => (int) ExpenseReport::where('status', ExpenseReport::STATUS_PENDING)->count(),
            'exported_batches_month'   => (int) ExportBatch::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count(),
        ];
    }

    private function monthlyMovement(int $year, int $month): array
    {
        $startOfMonth = Carbon::create($year, $month, 1);
        $end          = $startOfMonth->copy()->endOfMonth();

        $start        = $startOfMonth->copy()->subMonths(11);

        $rows = FundTransaction::selectRaw(
            'YEAR(transaction_date) as year, MONTH(transaction_date) as month, transaction_type, SUM(amount) as total'
        )
            ->whereBetween('transaction_date', [$start, $end])
            ->groupByRaw('YEAR(transaction_date), MONTH(transaction_date), transaction_type')
            ->get();

        $byMonth = [];
        foreach ($rows as $row) {
            $key = sprintf('%04d-%02d', (int) $row->year, (int) $row->month);
            if (!isset($byMonth[$key])) {
                $byMonth[$key] = ['credits' => '0', 'debits' => '0'];
            }
            if ((int) $row->transaction_type === FundTransaction::TYPE_CREDITO) {
                $byMonth[$key]['credits'] = (string) $row->total;
            } else {
                $byMonth[$key]['debits'] = (string) $row->total;
            }
        }

        $result = [];
        $cursor = $start->copy();
        for ($i = 0; $i < 12; $i++) {
            $key      = sprintf('%04d-%02d', $cursor->year, $cursor->month);
            $data     = $byMonth[$key] ?? ['credits' => '0', 'debits' => '0'];
            $result[] = [
                'year'        => $cursor->year,
                'month'       => $cursor->month,
                'credits'     => bcadd($data['credits'], '0', 2),
                'debits'      => bcadd($data['debits'], '0', 2),
                'net_balance' => bcsub($data['credits'], $data['debits'], 2),
            ];
            $cursor->addMonth();
        }

        return $result;
    }

    private function upcomingPayments(): array
    {
        $reimbursements = Reimbursement::where('status', Reimbursement::STATUS_PAYMENT_SCHEDULED)
            ->with(['items:id,reimbursement_id,amount', 'user:id,name'])
            ->whereNotNull('scheduled_payment_date')
            ->orderBy('scheduled_payment_date')
            ->limit(10)
            ->get(['id', 'title', 'requester_name', 'user_id', 'status', 'scheduled_payment_date']);

        return $reimbursements->map(function (Reimbursement $r) {
            $totalAmount = $r->items->reduce(
                fn ($acc, $d) => bcadd((string) $acc, (string) ($d->amount ?? '0'), 2),
                '0'
            );

            return [
                'id'                     => $r->id,
                'description'            => $r->title,
                'requester'              => $r->requester_name ?: ($r->user->name ?? null),
                'amount'                 => $totalAmount,
                'scheduled_payment_date' => $r->scheduled_payment_date?->toIso8601String(),
            ];
        })->all();
    }

    public function pendingApproval(int $limit = 10): array
    {
        $expenseReports = ExpenseReport::where('status', ExpenseReport::STATUS_PENDING)
            ->with(['items:id,expense_report_id,amount', 'requesterUser:id,name'])
            ->orderBy('created_at')
            ->limit($limit)
            ->get(['id', 'description', 'requester_description', 'requester_user_id', 'status', 'created_at'])
            ->map(function (ExpenseReport $c) {
                $totalAmount = $c->items->reduce(
                    fn ($acc, $d) => bcadd((string) $acc, (string) ($d->amount ?? '0'), 2),
                    '0'
                );

                return [
                    'type'        => 'expense_report',
                    'id'          => $c->id,
                    'description' => $c->description,
                    'requester'   => $c->requester_description ?: ($c->requesterUser->name ?? null),
                    'amount'      => $totalAmount,
                    'created_at'  => $c->created_at?->toIso8601String(),
                ];
            });

        $reimbursements = Reimbursement::where('status', Reimbursement::STATUS_PENDING)
            ->with(['items:id,reimbursement_id,amount', 'user:id,name'])
            ->orderBy('created_at')
            ->limit($limit)
            ->get(['id', 'title', 'requester_name', 'user_id', 'status', 'created_at'])
            ->map(function (Reimbursement $r) {
                $totalAmount = $r->items->reduce(
                    fn ($acc, $d) => bcadd((string) $acc, (string) ($d->amount ?? '0'), 2),
                    '0'
                );

                return [
                    'type'        => 'reimbursement',
                    'id'          => $r->id,
                    'description' => $r->title,
                    'requester'   => $r->requester_name ?: ($r->user->name ?? null),
                    'amount'      => $totalAmount,
                    'created_at'  => $r->created_at?->toIso8601String(),
                ];
            });

        return $expenseReports->concat($reimbursements)
            ->sortBy('created_at')
            ->take($limit)
            ->values()
            ->all();
    }

    private function topCostCentersMonth(int $year, int $month): array
    {
        $rows = DB::table('expense_report_item')
            ->join('cost_center', 'expense_report_item.cost_center_id', '=', 'cost_center.id')
            ->whereYear('expense_report_item.expense_date', $year)
            ->whereMonth('expense_report_item.expense_date', $month)
            ->groupBy('cost_center.id', 'cost_center.description')
            ->orderByRaw('SUM(expense_report_item.amount) DESC')
            ->limit(10)
            ->get([
                'cost_center.id',
                'cost_center.description',
                DB::raw('SUM(expense_report_item.amount) as amount_spent'),
            ]);

        return $rows->map(fn ($r) => [
            'id'           => (int) $r->id,
            'description'  => $r->description,
            'amount_spent' => (string) $r->amount_spent,
        ])->all();
    }
}
