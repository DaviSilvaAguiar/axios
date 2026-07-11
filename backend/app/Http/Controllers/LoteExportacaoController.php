<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\GenerateLoteExportacaoRequest;
use App\Models\LoteExportacao;
use App\Services\LoteExportacaoService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LoteExportacaoController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly LoteExportacaoService $exportacaoService
    ) {}

    /**
     * @param GenerateLoteExportacaoRequest $request
     * @return JsonResponse
     */
    public function exportar(GenerateLoteExportacaoRequest $request): JsonResponse
    {
        $lote = $this->exportacaoService->gerarLote(
            (int) auth()->id(),
            $request->validated('tipo_lote'),
            $request->validated('template'),
            $request->validated('ids')
        );

        return response()->json([
            'message' => 'Arquivo de exportação gerado com sucesso!',
            'data'    => [
                'lote_id'      => $lote->id,
                'valor_total'  => $lote->valor_total,
                'nome_arquivo' => $lote->nome_arquivo,
                'download_url' => "/v1/exportacao/lotes/{$lote->id}/download",
            ],
        ], 201);
    }

    /**
     * @return JsonResponse
     */
    public function pendentesCaixas(): JsonResponse
    {
        $resultado = $this->exportacaoService->obterCaixasPendentes($this->perPage());

        return response()->json(
            $this->paginated($resultado['paginator'], $resultado['items'])
        );
    }

    /**
     * @return JsonResponse
     */
    public function pendentesRcms(): JsonResponse
    {
        $resultado = $this->exportacaoService->obterRcmsPendentes($this->perPage());

        return response()->json(
            $this->paginated($resultado['paginator'], $resultado['items'])
        );
    }

    /**
     * @return JsonResponse
     */
    public function statsPendentes(): JsonResponse
    {
        return response()->json([
            'data' => $this->exportacaoService->obterStatsPendentes(),
        ]);
    }

    /**
     * @return JsonResponse
     */
    public function historico(): JsonResponse
    {
        $paginator = $this->exportacaoService->obterHistorico($this->perPage());

        $items = collect($paginator->items())
            ->map(function (LoteExportacao $lote) {
                $lote->download_url = $lote->caminho_arquivo
                    ? "/v1/exportacao/lotes/{$lote->id}/download"
                    : null;
                return $lote;
            })
            ->values()
            ->all();

        return response()->json($this->paginated($paginator, $items));
    }

    /**
     * @return JsonResponse
     */
    public function templates(): JsonResponse
    {
        return response()->json([
            'data' => $this->exportacaoService->obterTemplates(),
        ]);
    }

    /**
     * @param int $id
     * @return StreamedResponse
     */
    public function download(int $id): StreamedResponse
    {
        return $this->exportacaoService->baixarArquivoLote($id);
    }
}
