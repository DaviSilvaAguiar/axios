<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\EnviarIntegracaoRequest;
use App\Http\Requests\StoreIntegracaoChaveRequest;
use App\Services\IntegracaoDispatchService;
use App\Services\IntegracaoService;
use Illuminate\Http\JsonResponse;

class IntegracaoController extends Controller
{
    public function __construct(
        private readonly IntegracaoService $service,
        private readonly IntegracaoDispatchService $dispatch,
    ) {}

    /**
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->listar(),
        ]);
    }

    /**
     * @param StoreIntegracaoChaveRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function salvarChave(StoreIntegracaoChaveRequest $request, int $id): JsonResponse
    {
        $this->service->salvarChave($id, $request->validated('chave'));

        return response()->json([
            'message' => 'Chave da integração salva com sucesso.',
        ]);
    }

    /**
     * @param EnviarIntegracaoRequest $request
     * @return JsonResponse
     */
    public function enviar(EnviarIntegracaoRequest $request): JsonResponse
    {
        $resultado = $this->dispatch->enviar(
            (int) auth()->id(),
            $request->validated('tipo_lote'),
            (int) $request->validated('id_integracao'),
            (int) $request->validated('id_conta_bancaria'),
            $request->validated('ids'),
        );

        return response()->json([
            'message' => $resultado['lote'] !== null
                ? "{$resultado['sucessos']} lançamento(s) enviado(s) com sucesso."
                : 'Nenhum lançamento foi enviado com sucesso.',
            'data' => [
                'lote_id'  => $resultado['lote']?->id,
                'sucessos' => $resultado['sucessos'],
                'falhas'   => $resultado['falhas'],
            ],
        ], $resultado['lote'] !== null ? 201 : 422);
    }
}
