<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExpenseReport;
use App\Models\ExpenseReportItem;
use App\Models\BankAccount;
use App\Models\ReimbursementItem;
use App\Models\Integration;
use App\Models\IntegrationKey;
use App\Models\ExportBatch;
use App\Models\Reimbursement;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;
use UnexpectedValueException;

class IntegrationDispatchService
{
    private const TIMEZONE_LOCAL = 'America/Sao_Paulo';

    public function __construct(
        private readonly ControlleApiService $controlleApi,
    ) {}

    private function localDate(?DateTimeInterface $date): string
    {
        $carbon = $date
            ? Carbon::instance($date)->setTimezone(self::TIMEZONE_LOCAL)
            : Carbon::now(self::TIMEZONE_LOCAL);

        return $carbon->format('Y-m-d');
    }

    private function resolveBankAccountErp(int $idBankAccount): int
    {
        $account = BankAccount::find($idBankAccount);

        if ($account === null) {
            throw new UnexpectedValueException('Bank account not found.');
        }

        if (! $account->active) {
            throw new UnexpectedValueException('Selected bank account is inactive.');
        }

        if ($account->erp_code === null || $account->erp_code === '') {
            throw new UnexpectedValueException('Selected bank account has no ERP code registered.');
        }

        return (int) $account->erp_code;
    }

    public function send(int $idUser, string $batchType, int $idIntegration, int $idBankAccount, array $documentIds): array
    {
        $accountErpCode = $this->resolveBankAccountErp($idBankAccount);

        $integration = Integration::on('central')->find($idIntegration);

        if ($integration === null) {
            throw new UnexpectedValueException('Integration not found.');
        }

        $keyRecord = IntegrationKey::where('integration_id', $idIntegration)->first();

        if ($keyRecord === null) {
            throw new UnexpectedValueException('Integration token not configured. Configure it in the integration selector before sending.');
        }

        $documents = $this->loadDocuments($batchType, $documentIds);

        if ($documents->isEmpty()) {
            throw new UnexpectedValueException('No pending and valid document was found for sending.');
        }

        $key    = $keyRecord->key;
        $successes = [];
        $failures   = [];

        foreach ($documents as $doc) {
            try {
                $payload = $this->buildPayload($batchType, $doc, $accountErpCode);
                $this->dispatch($integration->name, $key, $payload);
                $successes[] = $doc;
            } catch (Throwable $e) {
                $failures[] = ['id' => $doc->id, 'error' => $e->getMessage()];
            }
        }

        if ($successes === []) {
            return ['batch' => null, 'successes' => 0, 'failures' => $failures];
        }

        $batch = DB::transaction(function () use ($idUser, $batchType, $integration, $successes): ExportBatch {
            $totalAmount = $this->calculateTotalAmount($batchType, $successes);

            $batch = ExportBatch::create([
                'user_id'         => $idUser,
                'batch_type'          => $batchType,
                'template_used' => $integration->name,
                'total_amount'        => $totalAmount,
                'item_count'   => count($successes),
            ]);

            $model = $this->modelForType($batchType);
            $model::query()
                ->whereIn('id', array_map(fn ($d) => $d->id, $successes))
                ->update(['export_batch_id' => $batch->id]);

            return $batch;
        });

        return ['batch' => $batch, 'successes' => count($successes), 'failures' => $failures];
    }

    private function dispatch(string $integration, string $key, array $payload): void
    {
        match ($integration) {
            'Controlle' => $this->controlleApi->createTransaction($key, $payload),
            default     => throw new RuntimeException("Integration [{$integration}] has no dispatcher implemented."),
        };
    }

    private function buildPayload(string $batchType, Model $doc, int $idAccountsMain): array
    {
        return $batchType === ExportBatch::TYPE_EXPENSE_REPORT
            ? $this->payloadExpenseReport($doc, $idAccountsMain)
            : $this->payloadReimbursement($doc, $idAccountsMain);
    }

    private function payloadExpenseReport(ExpenseReport $expenseReport, int $idAccountsMain): array
    {
        $items = $expenseReport->items->map(function (ExpenseReportItem $d) use ($expenseReport): array {
            return [
                'id_plan_accounts_entities' => $this->categoryCode($d),
                'id_cost_centers'           => $this->costCenterCode($d, $expenseReport->costCenter?->erp_code),
                'value_in_cent'             => $this->toCents($this->amountExpenseReportItem($d)),
            ];
        })->all();

        $total      = $expenseReport->items->sum(fn (ExpenseReportItem $d): float => $this->amountExpenseReportItem($d));
        $competence = $expenseReport->needed_at ?? $expenseReport->created_at;
        $dueDate    = $expenseReport->paid_at;

        return [
            'ds_transaction'   => $this->cleanText($expenseReport->description) ?: "RDC-{$expenseReport->id}",
            'type'             => 0,
            'dt_competence'    => $this->localDate($competence),
            'repeat_type'      => 1,
            'activity_type'    => 0,
            'id_accounts_main' => $idAccountsMain,
            'obs_transaction'  => $this->cleanText($expenseReport->notes),
            'itens'            => $items,
            'payments'         => [
                [
                    'situation'     => 0,
                    'value_in_cent' => $this->toCents($total),
                    'dt_due'        => $this->localDate($dueDate),
                ],
            ],
        ];
    }

    private function payloadReimbursement(Reimbursement $reimbursement, int $idAccountsMain): array
    {
        $items = $reimbursement->items->map(function (ReimbursementItem $d): array {
            return [
                'id_plan_accounts_entities' => $this->categoryCode($d),
                'id_cost_centers'           => $this->costCenterCode($d),
                'value_in_cent'             => $this->toCents((float) ($d->amount ?? 0)),
            ];
        })->all();

        $total      = (float) $reimbursement->items->sum(fn (ReimbursementItem $d): float => (float) ($d->amount ?? 0));
        $competence = $reimbursement->period_start_date ?? $reimbursement->created_at;
        $dueDate    = $reimbursement->scheduled_payment_date ?? Carbon::now(self::TIMEZONE_LOCAL)->addDays(7);

        return [
            'ds_transaction'   => $this->cleanText($reimbursement->title) ?: "RCM-{$reimbursement->id}",
            'type'             => 0,
            'dt_competence'    => $this->localDate($competence),
            'repeat_type'      => 1,
            'activity_type'    => 0,
            'id_accounts_main' => $idAccountsMain,
            'obs_transaction'  => null,
            'itens'            => $items,
            'payments'         => [
                [
                    'situation'     => 0,
                    'value_in_cent' => $this->toCents($total),
                    'dt_due'        => $this->localDate($dueDate),
                ],
            ],
        ];
    }

    private function categoryCode(Model $expense): int
    {
        $code = $expense->expenseCategory?->erp_code;

        if ($code === null || $code === '') {
            throw new UnexpectedValueException(
                "Category for expense #{$expense->id} has no ERP code registered."
            );
        }

        return (int) $code;
    }

    private function costCenterCode(Model $expense, ?string $fallback = null): int
    {
        $code = $expense->costCenter?->erp_code ?? $fallback;

        if ($code === null || $code === '') {
            throw new UnexpectedValueException(
                "Cost center for expense #{$expense->id} has no ERP code registered."
            );
        }

        return (int) $code;
    }

    private function amountExpenseReportItem(ExpenseReportItem $d): float
    {
        if ($d->amount !== null) {
            return (float) $d->amount;
        }
        return (float) ($d->unit_amount ?? 0) * (float) ($d->quantity ?? 1);
    }

    private function toCents(float $amount): int
    {
        return (int) round($amount * 100);
    }

    private function cleanText(?string $text): ?string
    {
        $trim = trim((string) $text);
        return $trim === '' ? null : $trim;
    }

    private function loadDocuments(string $batchType, array $ids): EloquentCollection
    {
        $query = $this->modelForType($batchType)::query()
            ->whereIn('id', $ids)
            ->whereNull('export_batch_id');

        if ($batchType === ExportBatch::TYPE_EXPENSE_REPORT) {
            $query->with(['costCenter', 'items.costCenter', 'items.expenseCategory']);
        } else {
            $query->with(['items.costCenter', 'items.expenseCategory']);
        }

        return $query->get();
    }

    private function calculateTotalAmount(string $batchType, array $documents): float
    {
        $total = 0.0;

        foreach ($documents as $doc) {
            if ($batchType === ExportBatch::TYPE_EXPENSE_REPORT) {
                $total += (float) $doc->items->sum(fn (ExpenseReportItem $d): float => $this->amountExpenseReportItem($d));
            } else {
                $total += (float) $doc->items->sum(fn (ReimbursementItem $d): float => (float) ($d->amount ?? 0));
            }
        }

        return $total;
    }

    private function modelForType(string $batchType): string
    {
        return match ($batchType) {
            ExportBatch::TYPE_EXPENSE_REPORT     => ExpenseReport::class,
            ExportBatch::TYPE_REIMBURSEMENT => Reimbursement::class,
            default                        => throw new UnexpectedValueException("Invalid batch type: {$batchType}"),
        };
    }
}
