<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreRcmRequest;
use App\Http\Requests\UpdateRcmRequest;
use App\Http\Requests\UpdateRcmStatusRequest;
use App\Services\RcmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Http\Request;

class RcmController extends Controller
{
    use Paginates;
    public function __construct(
        private readonly RcmService $service,
    ) {}

    /**
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->paginated(
                $this->service->listar(
                    auth()->user(), 
                    $this->perPage(), 
                    $request->only(['colaborador', 'status', 'dataInicio', 'dataFim'])
                )
            )
        );
    }

    /**
     * @param StoreRcmRequest $request
     * @return JsonResponse
     */
    public function store(StoreRcmRequest $request): JsonResponse
    {
        $rcm = $this->service->criar($request->validated(), auth()->id());

        return response()->json([
            'mensagem' => 'Reembolso criado com sucesso.',
            'rcm'      => $rcm,
        ], 201);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'mensagem' => 'Reembolso encontrado.',
            'rcm'      => $this->service->buscar($id),
        ]);
    }

    /**
     * @param UpdateRcmRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateRcmRequest $request, int $id): JsonResponse
    {
        $rcm = $this->service->atualizar($id, $request->validated());

        return response()->json([
            'mensagem' => 'Reembolso atualizado com sucesso.',
            'rcm'      => $rcm,
        ]);
    }

    /**
     * @param UpdateRcmStatusRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function atualizarStatus(UpdateRcmStatusRequest $request, int $id): JsonResponse
    {
        $rcm = $this->service->atualizarStatus($id, $request->validated());

        return response()->json([
            'mensagem' => 'Status do reembolso atualizado com sucesso.',
            'rcm'      => $rcm,
        ]);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $this->service->deletar($id);

        return response()->json([
            'mensagem' => 'Reembolso removido com sucesso.',
        ]);
    }

    /**
     * @param int $id
     * @return Response
     */
    public function gerarPdf(int $id): Response
    {
        return $this->service->gerarPdf($id);
    }
}
