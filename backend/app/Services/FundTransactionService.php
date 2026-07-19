<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Fund;
use App\Models\FundTransaction;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FundTransactionService
{
    private const SCALE = 2;

    public function postCredit(int $fundId, array $data): FundTransaction
    {
        return DB::transaction(function () use ($fundId, $data): FundTransaction {
            $fund = Fund::where('status', Fund::STATUS_ACTIVE)
                ->lockForUpdate()
                ->findOrFail($fundId);

            $amount = $this->normalizeAmount($data['amount']);

            $transaction = FundTransaction::create([
                'user_id'     => Auth::id(),
                'fund_id' => $fund->id,
                'expense_report_id'       => null,
                'transaction_type' => FundTransaction::TYPE_CREDITO,
                'subtype'        => FundTransaction::SUBTYPE_ADIANTAMENTO,
                'amount'          => $amount,
                'notes'     => $data['notes'] ?? null,
                'transaction_date' => $data['transaction_date'],
            ]);

            $fund->balance = bcadd((string) $fund->balance, $amount, self::SCALE);
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
            $amount   = $this->normalizeAmount($data['amount']);

            $isDebit = in_array($subtype, [
                FundTransaction::SUBTYPE_DEVOLUCAO,
                FundTransaction::SUBTYPE_AJUSTE_NEGATIVO,
            ], true);

            $type = $isDebit ? FundTransaction::TYPE_DEBITO : FundTransaction::TYPE_CREDITO;

            $newBalance = $isDebit
                ? bcsub((string) $fund->balance, $amount, self::SCALE)
                : bcadd((string) $fund->balance, $amount, self::SCALE);

            if (bccomp($newBalance, '0', self::SCALE) === -1) {
                throw ValidationException::withMessages([
                    'amount' => ['The fund balance would become negative with this adjustment.'],
                ]);
            }

            $transaction = FundTransaction::create([
                'user_id'     => Auth::id(),
                'fund_id' => $fund->id,
                'expense_report_id'       => null,
                'transaction_type' => $type,
                'subtype'        => $subtype,
                'amount'          => $amount,
                'reason'         => $data['reason'],
                'transaction_date' => $data['transaction_date'],
            ]);

            $fund->balance = $newBalance;
            $fund->save();

            return $transaction;
        });
    }

    public function postDebitFromExpenseReport(int $fundId, int $expenseReportId, string $amount): FundTransaction
    {
        return DB::transaction(function () use ($fundId, $expenseReportId, $amount): FundTransaction {
            $fund = Fund::where('status', Fund::STATUS_ACTIVE)
                ->lockForUpdate()
                ->findOrFail($fundId);

            $amount = $this->normalizeAmount($amount);
            $newBalance = bcsub((string) $fund->balance, $amount, self::SCALE);

            if (bccomp($newBalance, '0', self::SCALE) === -1) {
                throw ValidationException::withMessages([
                    'balance' => ['Insufficient fund balance to charge the expense report.'],
                ]);
            }

            $transaction = FundTransaction::create([
                'user_id'     => Auth::id(),
                'fund_id' => $fund->id,
                'expense_report_id'       => $expenseReportId,
                'transaction_type' => FundTransaction::TYPE_DEBITO,
                'subtype'        => FundTransaction::SUBTYPE_ABATIMENTO_RDC,
                'amount'          => $amount,
                'transaction_date' => now(),
            ]);

            $fund->balance = $newBalance;
            $fund->save();

            return $transaction;
        });
    }

    public function statement(int $fundId): Collection
    {
        $transactions = FundTransaction::with('expenseReport:id,description')
            ->where('fund_id', $fundId)
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $accumulatedBalance = '0';

        return $transactions->map(function (FundTransaction $t) use (&$accumulatedBalance) {
            $amount = (string) $t->amount;
            $accumulatedBalance = $t->transaction_type === FundTransaction::TYPE_CREDITO
                ? bcadd($accumulatedBalance, $amount, self::SCALE)
                : bcsub($accumulatedBalance, $amount, self::SCALE);

            return [
                'id'              => $t->id,
                'transaction_date'  => $t->transaction_date,
                'transaction_type'  => $t->transaction_type,
                'subtype'         => $t->subtype,
                'amount'           => $amount,
                'notes'      => $t->notes,
                'reason'          => $t->reason,
                'expense_report_id'        => $t->expense_report_id,
                'expense_report'           => $t->caixa,
                'accumulated_balance' => $accumulatedBalance,
            ];
        });
    }

    private function normalizeAmount(mixed $amount): string
    {
        if (is_numeric($amount)) {
            return number_format((float) $amount, self::SCALE, '.', '');
        }

        $cleaned = str_replace([' ', "\u{00A0}"], '', (string) $amount);

        if (str_contains($cleaned, ',')) {
            $cleaned = str_replace('.', '', $cleaned);
            $cleaned = str_replace(',', '.', $cleaned);
        }

        if (!is_numeric($cleaned)) {
            throw ValidationException::withMessages([
                'amount' => ['Invalid monetary amount.'],
            ]);
        }

        return number_format((float) $cleaned, self::SCALE, '.', '');
    }
}
