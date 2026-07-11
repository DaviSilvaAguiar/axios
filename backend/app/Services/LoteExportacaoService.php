<?php

declare(strict_types=1);

namespace App\Services;

use App\Factories\ExportHandlerFactory;
use App\Models\Caixa;
use App\Models\LoteExportacao;
use App\Models\Rcm;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;
use UnexpectedValueException;

class LoteExportacaoService
{
    private const STATUS_CAIXA_LABEL = [
        Caixa::STATUS_RASCUNHO           => 'Rascunho',
        Caixa::STATUS_PENDENTE           => 'Pendente',
        Caixa::STATUS_EM_ANALISE         => 'Em Análise',
        Caixa::STATUS_APROVADO           => 'Aprovado',
        Caixa::STATUS_PAGAMENTO_AGENDADO => 'Pagamento Agendado',
        Caixa::STATUS_PAGO               => 'Pago',
        Caixa::STATUS_REJEITADO          => 'Rejeitado',
    ];

    private const STATUS_RCM_LABEL = [
        Rcm::STATUS_SOLICITADO         => 'Rascunho',
        Rcm::STATUS_PENDENTE           => 'Pendente',
        Rcm::STATUS_EM_ANALISE         => 'Em Análise',
        Rcm::STATUS_APROVADO           => 'Aprovado',
        Rcm::STATUS_PAGAMENTO_AGENDADO => 'Pagamento Agendado',
        Rcm::STATUS_PAGO               => 'Pago',
        Rcm::STATUS_REJEITADO          => 'Rejeitado',
    ];

    /**
     * @param int $idUsuario
     * @param string $tipoLote
     * @param string $templateUtilizado
     * @param array $idsDocumentos
     * @return LoteExportacao
     * @throws UnexpectedValueException|Throwable
     */
    public function gerarLote(
        int $idUsuario,
        string $tipoLote,
        string $templateUtilizado,
        array $idsDocumentos
    ): LoteExportacao {
        [$lote, $documentos] = DB::transaction(function () use ($idUsuario, $tipoLote, $templateUtilizado, $idsDocumentos) {
            $documentos = $this->carregarDocumentos($tipoLote, $idsDocumentos, true);

            if ($documentos->isEmpty()) {
                throw new UnexpectedValueException('Nenhum relatório pendente e válido foi encontrado para exportação.');
            }

            $lote = LoteExportacao::create([
                'id_usuario'         => $idUsuario,
                'tipo_lote'          => $tipoLote,
                'template_utilizado' => $templateUtilizado,
                'valor_total'        => $this->calcularValorTotal($tipoLote, $documentos),
                'quantidade_itens'   => $documentos->count(),
            ]);

            $this->modeloDoTipo($tipoLote)::query()
                ->whereIn('id', $documentos->pluck('id')->all())
                ->update(['id_lote_exportacao' => $lote->id]);

            return [$lote, $documentos];
        });

        try {
            $handler = ExportHandlerFactory::make($templateUtilizado);
            $caminhoArquivo = $handler->generate($documentos, $lote->id);

            $lote->update([
                'nome_arquivo'    => basename($caminhoArquivo),
                'caminho_arquivo' => $caminhoArquivo,
            ]);
        } catch (Throwable $e) {
            DB::transaction(function () use ($tipoLote, $lote): void {
                $this->modeloDoTipo($tipoLote)::query()
                    ->where('id_lote_exportacao', $lote->id)
                    ->update(['id_lote_exportacao' => null]);
                $lote->delete();
            });
            throw $e;
        }

        return $lote;
    }

    /**
     * @return array
     */
    public function obterCaixasPendentes(int $perPage): array
    {
        $paginator = Caixa::with(['usuario:id,nome', 'centroDeCusto:id,descricao', 'despesas:id,id_caixa,quantidade,valor_unitario'])
            ->where('status', Caixa::STATUS_APROVADO)
            ->whereNull('id_lote_exportacao')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $items = collect($paginator->items())
            ->map(fn (Caixa $caixa) => [
                'id'            => $caixa->id,
                'identificador' => 'RDC-' . str_pad((string) $caixa->id, 4, '0', STR_PAD_LEFT),
                'descricao'     => $caixa->descricao,
                'prestador'     => $caixa->usuario?->nome ?? '—',
                'centro_custo'  => $caixa->centroDeCusto?->descricao,
                'valor'         => (float) $caixa->despesas->sum(
                    fn ($d) => (float) ($d->valor_unitario ?? 0) * (float) ($d->quantidade ?? 1)
                ),
                'data'          => optional($caixa->created_at)->toIso8601String(),
                'status'        => self::STATUS_CAIXA_LABEL[$caixa->status] ?? 'Desconhecido',
                'tipo'          => LoteExportacao::TIPO_CAIXA,
            ])
            ->values()
            ->all();

        return ['paginator' => $paginator, 'items' => $items];
    }

    /**
     * @return array
     */
    public function obterRcmsPendentes(int $perPage): array
    {
        $paginator = Rcm::with(['usuario:id,nome', 'despesas:id,id_rcm,valor'])
            ->whereIn('status', [Rcm::STATUS_APROVADO, Rcm::STATUS_PAGAMENTO_AGENDADO])
            ->whereNull('id_lote_exportacao')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $items = collect($paginator->items())
            ->map(fn (Rcm $rcm) => [
                'id'            => $rcm->id,
                'identificador' => 'RCM-' . str_pad((string) $rcm->id, 4, '0', STR_PAD_LEFT),
                'descricao'     => $rcm->titulo,
                'prestador'     => $rcm->usuario?->nome ?? '—',
                'centro_custo'  => null,
                'valor'         => (float) $rcm->despesas->sum(fn ($d) => (float) ($d->valor ?? 0)),
                'data'          => optional($rcm->created_at)->toIso8601String(),
                'status'        => self::STATUS_RCM_LABEL[$rcm->status] ?? 'Desconhecido',
                'tipo'          => LoteExportacao::TIPO_REEMBOLSO,
            ])
            ->values()
            ->all();

        return ['paginator' => $paginator, 'items' => $items];
    }

    /**
     * @return array
     */
    public function obterStatsPendentes(): array
    {
        $caixaQuery = Caixa::where('status', Caixa::STATUS_APROVADO)
            ->whereNull('id_lote_exportacao');

        $caixaQtd   = (int) (clone $caixaQuery)->count();
        $caixaValor = (float) (clone $caixaQuery)
            ->join('caixa_despesa', 'caixa.id', '=', 'caixa_despesa.id_caixa')
            ->sum(DB::raw('COALESCE(caixa_despesa.valor_unitario, 0) * COALESCE(caixa_despesa.quantidade, 1)'));

        $rcmQuery = Rcm::whereIn('status', [Rcm::STATUS_APROVADO, Rcm::STATUS_PAGAMENTO_AGENDADO])
            ->whereNull('id_lote_exportacao');

        $rcmQtd   = (int) (clone $rcmQuery)->count();
        $rcmValor = (float) (clone $rcmQuery)
            ->join('despesa_rcm', 'rcm.id', '=', 'despesa_rcm.id_rcm')
            ->sum(DB::raw('COALESCE(despesa_rcm.valor, 0)'));

        return [
            'caixa'     => ['quantidade' => $caixaQtd, 'valor' => $caixaValor],
            'reembolso' => ['quantidade' => $rcmQtd,   'valor' => $rcmValor],
        ];
    }

    /**
     * @return LengthAwarePaginator
     */
    public function obterHistorico(int $perPage): LengthAwarePaginator
    {
        return LoteExportacao::with(['usuario:id,nome,email,perfil'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * @param int $idLote
     * @return StreamedResponse
     */
    public function baixarArquivoLote(int $idLote): StreamedResponse
    {
        $lote = LoteExportacao::findOrFail($idLote);

        if (!$lote->caminho_arquivo || !Storage::disk('public')->exists($lote->caminho_arquivo)) {
            throw new UnexpectedValueException('Arquivo de exportação não encontrado.');
        }

        return Storage::disk('public')->download(
            $lote->caminho_arquivo,
            $lote->nome_arquivo ?? basename($lote->caminho_arquivo)
        );
    }

    /**
     * @return array
     */
    public function obterTemplates(): array
    {
        $templates = Config::get('exportacao.templates', []);

        return array_map(static fn (array $t): array => [
            'codigo'    => $t['codigo'],
            'nome'      => $t['nome'],
            'descricao' => $t['descricao'],
            'tipo'      => $t['tipo'],
        ], $templates);
    }

    /**
     * @param string $tipoLote
     * @param array $ids
     * @param bool $lock
     * @return EloquentCollection
     */
    private function carregarDocumentos(string $tipoLote, array $ids, bool $lock): EloquentCollection
    {
        $query = $this->modeloDoTipo($tipoLote)::query()
            ->whereIn('id', $ids)
            ->whereNull('id_lote_exportacao');

        if ($tipoLote === LoteExportacao::TIPO_CAIXA) {
            $query->with(['usuario', 'centroDeCusto', 'despesas']);
        } else {
            $query->with(['usuario', 'despesas.centroDeCusto']);
        }

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->get();
    }

    /**
     * @param string $tipoLote
     * @param Collection $documentos
     * @return float
     */
    private function calcularValorTotal(string $tipoLote, Collection $documentos): float
    {
        if ($tipoLote === LoteExportacao::TIPO_CAIXA) {
            return (float) $documentos->flatMap->despesas->sum(
                fn ($despesa): float => (float) ($despesa->valor_unitario ?? 0) * (float) ($despesa->quantidade ?? 1)
            );
        }

        return (float) $documentos->flatMap->despesas->sum(
            fn ($despesa): float => (float) ($despesa->valor ?? 0)
        );
    }

    /**
     * @param string $tipoLote
     * @return string
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
