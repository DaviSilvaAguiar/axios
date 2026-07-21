<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Fund;
use App\Models\FundTransaction;
use App\Support\Money;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FundTransactionService
{
    public function postCredit(int $fundId, array $data): FundTransaction
    {
        return DB::transaction(function () use ($fundId, $data): FundTransaction {
            $fund = Fund::where('status', Fund::STATUS_ACTIVE)
                ->lockForUpdate()
                ->findOrFail($fundId);

            $amount = Money::fromDecimalString($data['amount']);

            $transaction = FundTransaction::create([
                'user_id' => Auth::id(),
                'fund_id' => $fund->id,
                'expense_report_id' => null,
                'transaction_type' => FundTransaction::TYPE_CREDITO,
                'subtype' => FundTransaction::SUBTYPE_ADIANTAMENTO,
                'amount' => $amount,
                'notes' => $data['notes'] ?? null,
                'transaction_date' => $data['transaction_date'],
            ]);

            $fund->balance = $fund->balance->add($amount);
            $fund->save();

            return $transaction;
        });
    }

    public function postAdjustment(int $fundId, array $data): FundTransaction
    {
        return DB::transaction(function () use ($fundId, $data): FundTransaction {
            $fund = Fund::where('status', Fund::STATUS_ACTIVE)
                ->lockForUpdate()
                ->findOrFail($fundId);

            $subtype = (int) $data['subtype'];
            $amount = Money::fromDecimalString($data['amount']);

            $isDebit = in_array($subtype, [
                FundTransaction::SUBTYPE_DEVOLUCAO,
                FundTransaction::SUBTYPE_AJUSTE_NEGATIVO,
            ], true);

            $type = $isDebit ? FundTransaction::TYPE_DEBITO : FundTransaction::TYPE_CREDITO;

            $newBalance = $isDebit
                ? $fund->balance->subtract($amount)
                : $fund->balance->add($amount);

            if ($newBalance->isNegative()) {
                throw ValidationException::withMessages([
                    'amount' => ['The fund balance would become negative with this adjustment.'],
                ]);
            }

            $transaction = FundTransaction::create([
                'user_id' => Auth::id(),
                'fund_id' => $fund->id,
                'expense_report_id' => null,
                'transaction_type' => $type,
                'subtype' => $subtype,
                'amount' => $amount,
                'reason' => $data['reason'],
                'transaction_date' => $data['transaction_date'],
            ]);

            $fund->balance = $newBalance;
            $fund->save();

            return $transaction;
        });
    }

    public function postDebitFromExpenseReport(int $fundId, int $expenseReportId, Money $amount): FundTransaction
    {
        return DB::transaction(function () use ($fundId, $expenseReportId, $amount): FundTransaction {
            $fund = Fund::where('status', Fund::STATUS_ACTIVE)
                ->lockForUpdate()
                ->findOrFail($fundId);

            $newBalance = $fund->balance->subtract($amount);

            if ($newBalance->isNegative()) {
                throw ValidationException::withMessages([
                    'balance' => ['Insufficient fund balance to charge the expense report.'],
                ]);
            }

            $transaction = FundTransaction::create([
                'user_id' => Auth::id(),
                'fund_id' => $fund->id,
                'expense_report_id' => $expenseReportId,
                'transaction_type' => FundTransaction::TYPE_DEBITO,
                'subtype' => FundTransaction::SUBTYPE_ABATIMENTO_RDC,
                'amount' => $amount,
                'transaction_date' => now(),
            ]);

            $fund->balance = $newBalance;
            $fund->save();

            return $transaction;
        });
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function statement(int $fundId): Collection
    {
        $transactions = FundTransaction::with('expenseReport:id,description')
            ->where('fund_id', $fundId)
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $accumulatedBalance = Money::zero();

        return $transactions->map(function (FundTransaction $t) use (&$accumulatedBalance) {
            $accumulatedBalance = $t->transaction_type === FundTransaction::TYPE_CREDITO
                ? $accumulatedBalance->add($t->amount)
                : $accumulatedBalance->subtract($t->amount);

            return [
                'id' => $t->id,
                'transaction_date' => $t->transaction_date,
                'transaction_type' => $t->transaction_type,
                'subtype' => $t->subtype,
                'amount' => $t->amount,
                'notes' => $t->notes,
                'reason' => $t->reason,
                'expense_report_id' => $t->expense_report_id,
                'caixa' => $t->expenseReport,
                'accumulated_balance' => $accumulatedBalance,
            ];
        });
    }
}
