<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Caixa;
use App\Models\CaixaDespesa;
use App\Models\ContaBancaria;
use App\Models\DespesaRcm;
use App\Models\Integracao;
use App\Models\IntegracaoChave;
use App\Models\LoteExportacao;
use App\Models\Rcm;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;
use UnexpectedValueException;

class IntegracaoDispatchService
{
    private const TIMEZONE_LOCAL = 'America/Sao_Paulo';

    public function __construct(
        private readonly ControlleApiService $controlleApi,
    ) {}

    /**
     * Formata uma data no fuso de Brasília no padrão YYYY-MM-DD exigido pelo Controlle.
     */
    private function dataLocal(?DateTimeInterface $data): string
    {
        $carbon = $data
            ? Carbon::instance($data)->setTimezone(self::TIMEZONE_LOCAL)
            : Carbon::now(self::TIMEZONE_LOCAL);

        return $carbon->format('Y-m-d');
    }

    /**
     * Valida a conta bancária selecionada e retorna seu código ERP.
     *
     * @param int $idContaBancaria
     * @return int
     * @throws UnexpectedValueException
     */
    private function resolverContaBancariaErp(int $idContaBancaria): int
    {
        $conta = ContaBancaria::find($idContaBancaria);

        if ($conta === null) {
            throw new UnexpectedValueException('Conta bancária não encontrada.');
        }

        if (! $conta->ativo) {
            throw new UnexpectedValueException('Conta bancária selecionada está inativa.');
        }

        if ($conta->codigo_erp === null || $conta->codigo_erp === '') {
            throw new UnexpectedValueException('Conta bancária selecionada não tem código ERP cadastrado.');
        }

        return (int) $conta->codigo_erp;
    }

    /**
     * @return array{lote: LoteExportacao|null, sucessos: int, falhas: array<int, array{id:int, erro:string}>}
     */
    public function enviar(int $idUsuario, string $tipoLote, int $idIntegracao, int $idContaBancaria, array $idsDocumentos): array
    {
        $codigoErpConta = $this->resolverContaBancariaErp($idContaBancaria);

        $integracao = Integracao::on('central')->find($idIntegracao);

        if ($integracao === null) {
            throw new UnexpectedValueException('Integração não encontrada.');
        }

        $chaveRegistro = IntegracaoChave::where('id_integracao', $idIntegracao)->first();

        if ($chaveRegistro === null) {
            throw new UnexpectedValueException('Token da integração não configurado. Configure no seletor de integração antes de enviar.');
        }

        $documentos = $this->carregarDocumentos($tipoLote, $idsDocumentos);

        if ($documentos->isEmpty()) {
            throw new UnexpectedValueException('Nenhum documento pendente e válido foi encontrado para envio.');
        }

        $chave    = $chaveRegistro->chave;
        $sucessos = [];
        $falhas   = [];

        foreach ($documentos as $doc) {
            try {
                $payload = $this->montarPayload($tipoLote, $doc, $codigoErpConta);
                $this->despachar($integracao->nome, $chave, $payload);
                $sucessos[] = $doc;
            } catch (Throwable $e) {
                $falhas[] = ['id' => $doc->id, 'erro' => $e->getMessage()];
            }
        }

        if ($sucessos === []) {
            return ['lote' => null, 'sucessos' => 0, 'falhas' => $falhas];
        }

        $lote = DB::transaction(function () use ($idUsuario, $tipoLote, $integracao, $sucessos): LoteExportacao {
            $valorTotal = $this->calcularValorTotal($tipoLote, $sucessos);

            $lote = LoteExportacao::create([
                'id_usuario'         => $idUsuario,
                'tipo_lote'          => $tipoLote,
                'template_utilizado' => $integracao->nome,
                'valor_total'        => $valorTotal,
                'quantidade_itens'   => count($sucessos),
            ]);

            $modelo = $this->modeloDoTipo($tipoLote);
            $modelo::query()
                ->whereIn('id', array_map(fn ($d) => $d->id, $sucessos))
                ->update(['id_lote_exportacao' => $lote->id]);

            return $lote;
        });

        return ['lote' => $lote, 'sucessos' => count($sucessos), 'falhas' => $falhas];
    }

    /**
     * @param string $integracao
     * @param string $chave
     * @param array $payload
     * @return void
     */
    private function despachar(string $integracao, string $chave, array $payload): void
    {
        match ($integracao) {
            'Controlle' => $this->controlleApi->criarLancamento($chave, $payload),
            default     => throw new RuntimeException("Integração [{$integracao}] não possui dispatcher implementado."),
        };
    }

    /**
     * @param string $tipoLote
     * @param Caixa|Rcm $doc
     * @param int $idAccountsMain
     * @return array
     * @throws UnexpectedValueException
     */
    private function montarPayload(string $tipoLote, Model $doc, int $idAccountsMain): array
    {
        return $tipoLote === LoteExportacao::TIPO_CAIXA
            ? $this->payloadCaixa($doc, $idAccountsMain)
            : $this->payloadRcm($doc, $idAccountsMain);
    }

    /**
     * @param Caixa $caixa
     * @param int $idAccountsMain
     * @return array
     * @throws UnexpectedValueException
     */
    private function payloadCaixa(Caixa $caixa, int $idAccountsMain): array
    {
        $itens = $caixa->despesas->map(function (CaixaDespesa $d) use ($caixa): array {
            return [
                'id_plan_accounts_entities' => $this->codigoCategoria($d),
                'id_cost_centers'           => $this->codigoCentroCusto($d, $caixa->centroDeCusto?->codigo_cc_erp),
                'value_in_cent'             => $this->emCentavos($this->valorCaixaDespesa($d)),
            ];
        })->all();

        $total      = $caixa->despesas->sum(fn (CaixaDespesa $d): float => $this->valorCaixaDespesa($d));
        $competence = $caixa->data_necessidade ?? $caixa->created_at;
        $vencimento = $caixa->data_pagamento;

        return [
            'ds_transaction'   => $this->limparTexto($caixa->descricao) ?: "RDC-{$caixa->id}",
            'type'             => 0,
            'dt_competence'    => $this->dataLocal($competence),
            'repeat_type'      => 1,
            'activity_type'    => 0,
            'id_accounts_main' => $idAccountsMain,
            'obs_transaction'  => $this->limparTexto($caixa->obs),
            'itens'            => $itens,
            'payments'         => [
                [
                    'situation'     => 0,
                    'value_in_cent' => $this->emCentavos($total),
                    'dt_due'        => $this->dataLocal($vencimento),
                ],
            ],
        ];
    }

    /**
     * @param Rcm $rcm
     * @param int $idAccountsMain
     * @return array
     * @throws UnexpectedValueException
     */
    private function payloadRcm(Rcm $rcm, int $idAccountsMain): array
    {
        $itens = $rcm->despesas->map(function (DespesaRcm $d): array {
            return [
                'id_plan_accounts_entities' => $this->codigoCategoria($d),
                'id_cost_centers'           => $this->codigoCentroCusto($d),
                'value_in_cent'             => $this->emCentavos((float) ($d->valor ?? 0)),
            ];
        })->all();

        $total      = (float) $rcm->despesas->sum(fn (DespesaRcm $d): float => (float) ($d->valor ?? 0));
        $competence = $rcm->data_inicio_periodo ?? $rcm->created_at;
        $vencimento = $rcm->data_pagamento_programado ?? Carbon::now(self::TIMEZONE_LOCAL)->addDays(7);

        return [
            'ds_transaction'   => $this->limparTexto($rcm->titulo) ?: "RCM-{$rcm->id}",
            'type'             => 0,
            'dt_competence'    => $this->dataLocal($competence),
            'repeat_type'      => 1,
            'activity_type'    => 0,
            'id_accounts_main' => $idAccountsMain,
            'obs_transaction'  => null,
            'itens'            => $itens,
            'payments'         => [
                [
                    'situation'     => 0,
                    'value_in_cent' => $this->emCentavos($total),
                    'dt_due'        => $this->dataLocal($vencimento),
                ],
            ],
        ];
    }

    /**
     * @param CaixaDespesa|DespesaRcm $despesa
     * @return int
     * @throws UnexpectedValueException
     */
    private function codigoCategoria(Model $despesa): int
    {
        $codigo = $despesa->categoriaDespesa?->codigo_erp;

        if ($codigo === null || $codigo === '') {
            throw new UnexpectedValueException(
                "Categoria da despesa #{$despesa->id} não tem código ERP cadastrado."
            );
        }

        return (int) $codigo;
    }

    /**
     * @param CaixaDespesa|DespesaRcm $despesa
     * @param string|null $fallback
     * @return int
     * @throws UnexpectedValueException
     */
    private function codigoCentroCusto(Model $despesa, ?string $fallback = null): int
    {
        $codigo = $despesa->centroDeCusto?->codigo_cc_erp ?? $fallback;

        if ($codigo === null || $codigo === '') {
            throw new UnexpectedValueException(
                "Centro de custo da despesa #{$despesa->id} não tem código ERP cadastrado."
            );
        }

        return (int) $codigo;
    }

    /**
     * @param CaixaDespesa $d
     * @return float
     */
    private function valorCaixaDespesa(CaixaDespesa $d): float
    {
        if ($d->valor !== null) {
            return (float) $d->valor;
        }
        return (float) ($d->valor_unitario ?? 0) * (float) ($d->quantidade ?? 1);
    }

    /**
     * @param float $valor
     * @return int
     */
    private function emCentavos(float $valor): int
    {
        return (int) round($valor * 100);
    }

    /**
     * @param string|null $texto
     * @return string|null
     */
    private function limparTexto(?string $texto): ?string
    {
        $trim = trim((string) $texto);
        return $trim === '' ? null : $trim;
    }

    /**
     * @param string $tipoLote
     * @param array $ids
     * @return EloquentCollection
     */
    private function carregarDocumentos(string $tipoLote, array $ids): EloquentCollection
    {
        $query = $this->modeloDoTipo($tipoLote)::query()
            ->whereIn('id', $ids)
            ->whereNull('id_lote_exportacao');

        if ($tipoLote === LoteExportacao::TIPO_CAIXA) {
            $query->with(['centroDeCusto', 'despesas.centroDeCusto', 'despesas.categoriaDespesa']);
        } else {
            $query->with(['despesas.centroDeCusto', 'despesas.categoriaDespesa']);
        }

        return $query->get();
    }

    /**
     * @param string $tipoLote
     * @param array<int, Caixa|Rcm> $documentos
     * @return float
     */
    private function calcularValorTotal(string $tipoLote, array $documentos): float
    {
        $total = 0.0;

        foreach ($documentos as $doc) {
            if ($tipoLote === LoteExportacao::TIPO_CAIXA) {
                $total += (float) $doc->despesas->sum(fn (CaixaDespesa $d): float => $this->valorCaixaDespesa($d));
            } else {
                $total += (float) $doc->despesas->sum(fn (DespesaRcm $d): float => (float) ($d->valor ?? 0));
            }
        }

        return $total;
    }

    /**
     * @param string $tipoLote
     * @return class-string<Caixa|Rcm>
     * @throws UnexpectedValueException
     */
    private function modeloDoTipo(string $tipoLote): string
    {
        return match ($tipoLote) {
            LoteExportacao::TIPO_CAIXA     => Caixa::class,
            LoteExportacao::TIPO_REEMBOLSO => Rcm::class,
            default                        => throw new UnexpectedValueException("Tipo de lote inválido: {$tipoLote}"),
        };
    }
}
