<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Caixa;
use App\Models\CaixaConta;
use App\Models\CaixaTransacoes;
use App\Models\LoteExportacao;
use App\Models\Rcm;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Visão geral do dashboard administrativo/auditor.
     *
     * @return array{kpis: array, movimentacao_mensal: array, proximos_pagamentos: array, top_centros_custo_mes: array}
     */
    public function overview(int $ano, int $mes): array
    {
        return [
            'kpis'                  => $this->kpis($ano, $mes),
            'movimentacao_mensal'   => $this->movimentacaoMensal($ano, $mes),
            'proximos_pagamentos'   => $this->proximosPagamentos(),
            'top_centros_custo_mes' => $this->topCentrosCustoMes($ano, $mes),
        ];
    }

    private function kpis(int $ano, int $mes): array
    {
        return [
            'caixas_ativos'        => (int) CaixaConta::where('status', CaixaConta::STATUS_ATIVO)->count(),
            'saldo_total'          => (string) CaixaConta::where('status', CaixaConta::STATUS_ATIVO)->sum('saldo'),
            'rdcs_pendentes'       => (int) Caixa::where('status', Caixa::STATUS_PENDENTE)->count(),
            'lotes_exportados_mes' => (int) LoteExportacao::whereYear('created_at', $ano)
                ->whereMonth('created_at', $mes)
                ->count(),
        ];
    }

    /**
     * 12 meses terminando no mês selecionado (inclusive), com meses vazios preenchidos com zero.
     */
    private function movimentacaoMensal(int $ano, int $mes): array
    {
        $inicioMes = Carbon::create($ano, $mes, 1);
        $fim       = $inicioMes->copy()->endOfMonth();
        // Subtrai 11 meses a partir do dia 1 (evita overflow de end-of-month do Carbon).
        $inicio    = $inicioMes->copy()->subMonths(11);

        $rows = CaixaTransacoes::selectRaw(
            'YEAR(data_transacao) as ano, MONTH(data_transacao) as mes, tipo_transacao, SUM(valor) as total'
        )
            ->whereBetween('data_transacao', [$inicio, $fim])
            ->groupByRaw('YEAR(data_transacao), MONTH(data_transacao), tipo_transacao')
            ->get();

        $byMonth = [];
        foreach ($rows as $row) {
            $key = sprintf('%04d-%02d', (int) $row->ano, (int) $row->mes);
            if (!isset($byMonth[$key])) {
                $byMonth[$key] = ['creditos' => '0', 'debitos' => '0'];
            }
            if ((int) $row->tipo_transacao === CaixaTransacoes::TIPO_CREDITO) {
                $byMonth[$key]['creditos'] = (string) $row->total;
            } else {
                $byMonth[$key]['debitos'] = (string) $row->total;
            }
        }

        $result = [];
        $cursor = $inicio->copy();
        for ($i = 0; $i < 12; $i++) {
            $key      = sprintf('%04d-%02d', $cursor->year, $cursor->month);
            $data     = $byMonth[$key] ?? ['creditos' => '0', 'debitos' => '0'];
            $result[] = [
                'ano'           => $cursor->year,
                'mes'           => $cursor->month,
                'creditos'      => bcadd($data['creditos'], '0', 2),
                'debitos'       => bcadd($data['debitos'], '0', 2),
                'saldo_liquido' => bcsub($data['creditos'], $data['debitos'], 2),
            ];
            $cursor->addMonth();
        }

        return $result;
    }

    /**
     * Top 3 RCMs em "Pagamento Agendado", pela data programada mais próxima.
     */
    private function proximosPagamentos(): array
    {
        $rcms = Rcm::where('status', Rcm::STATUS_PAGAMENTO_AGENDADO)
            ->with(['despesas:id,id_rcm,valor', 'usuario:id,nome'])
            ->whereNotNull('data_pagamento_programado')
            ->orderBy('data_pagamento_programado')
            ->limit(10)
            ->get(['id', 'titulo', 'nome_solicitante', 'id_usuario', 'status', 'data_pagamento_programado']);

        return $rcms->map(function (Rcm $r) {
            $valorTotal = $r->despesas->reduce(
                fn ($acc, $d) => bcadd((string) $acc, (string) ($d->valor ?? '0'), 2),
                '0'
            );

            return [
                'id'                        => $r->id,
                'descricao'                 => $r->titulo,
                'requisitante'              => $r->nome_solicitante ?: ($r->usuario->nome ?? null),
                'valor'                     => $valorTotal,
                'data_pagamento_programado' => $r->data_pagamento_programado?->toIso8601String(),
            ];
        })->all();
    }

    /**
     * Lista combinada de RDC + RCM em status Pendente (aguardando auditoria),
     * ordenada por created_at asc (mais antigo primeiro).
     *
     * @param int $limite Número máximo de itens (default 10).
     */
    public function pendentesAprovacao(int $limite = 10): array
    {
        $caixas = Caixa::where('status', Caixa::STATUS_PENDENTE)
            ->with(['despesas:id,id_caixa,valor', 'usuarioRequisitante:id,nome'])
            ->orderBy('created_at')
            ->limit($limite)
            ->get(['id', 'descricao', 'descricao_requisitante', 'id_usuario_requisitante', 'status', 'created_at'])
            ->map(function (Caixa $c) {
                $valorTotal = $c->despesas->reduce(
                    fn ($acc, $d) => bcadd((string) $acc, (string) ($d->valor ?? '0'), 2),
                    '0'
                );

                return [
                    'tipo'       => 'rdc',
                    'id'         => $c->id,
                    'descricao'  => $c->descricao,
                    'requisitante' => $c->descricao_requisitante ?: ($c->usuarioRequisitante->nome ?? null),
                    'valor'      => $valorTotal,
                    'created_at' => $c->created_at?->toIso8601String(),
                ];
            });

        $rcms = Rcm::where('status', Rcm::STATUS_PENDENTE)
            ->with(['despesas:id,id_rcm,valor', 'usuario:id,nome'])
            ->orderBy('created_at')
            ->limit($limite)
            ->get(['id', 'titulo', 'nome_solicitante', 'id_usuario', 'status', 'created_at'])
            ->map(function (Rcm $r) {
                $valorTotal = $r->despesas->reduce(
                    fn ($acc, $d) => bcadd((string) $acc, (string) ($d->valor ?? '0'), 2),
                    '0'
                );

                return [
                    'tipo'       => 'rcm',
                    'id'         => $r->id,
                    'descricao'  => $r->titulo,
                    'requisitante' => $r->nome_solicitante ?: ($r->usuario->nome ?? null),
                    'valor'      => $valorTotal,
                    'created_at' => $r->created_at?->toIso8601String(),
                ];
            });

        return $caixas->concat($rcms)
            ->sortBy('created_at')
            ->take($limite)
            ->values()
            ->all();
    }

    /**
     * Top 3 centros de custo por valor gasto no mês (via despesas de RDC).
     */
    private function topCentrosCustoMes(int $ano, int $mes): array
    {
        $rows = DB::table('caixa_despesa')
            ->join('centro_custo', 'caixa_despesa.id_centro_custo', '=', 'centro_custo.id')
            ->whereYear('caixa_despesa.data_despesa', $ano)
            ->whereMonth('caixa_despesa.data_despesa', $mes)
            ->groupBy('centro_custo.id', 'centro_custo.descricao')
            ->orderByRaw('SUM(caixa_despesa.valor) DESC')
            ->limit(10)
            ->get([
                'centro_custo.id',
                'centro_custo.descricao',
                DB::raw('SUM(caixa_despesa.valor) as valor_gasto'),
            ]);

        return $rows->map(fn ($r) => [
            'id'          => (int) $r->id,
            'descricao'   => $r->descricao,
            'valor_gasto' => (string) $r->valor_gasto,
        ])->all();
    }
}
