<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreContaBancariaRequest;
use App\Http\Requests\UpdateContaBancariaRequest;
use App\Services\ContaBancariaService;
use Illuminate\Http\JsonResponse;

class ContaBancariaController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly ContaBancariaService $service,
    ) {}

    /**
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return response()->json(
            $this->paginated($this->service->listar($this->perPage()))
        );
    }

    /**
     * @param StoreContaBancariaRequest $request
     * @return JsonResponse
     */
    public function store(StoreContaBancariaRequest $request): JsonResponse
    {
        $dados = $request->validated();

        $conta = $this->service->criar($dados);

        return response()->json([
            'mensagem'        => 'Conta bancária criada com sucesso.',
            'conta_bancaria'  => $conta,
        ], 201);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'conta_bancaria' => $this->service->buscar($id),
        ]);
    }

    /**
     * @param UpdateContaBancariaRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateContaBancariaRequest $request, int $id): JsonResponse
    {
        $dados = $request->validated();

        $conta = $this->service->atualizar($id, $dados);

        return response()->json([
            'mensagem'        => 'Conta bancária atualizada com sucesso.',
            'conta_bancaria'  => $conta,
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
            'mensagem' => 'Conta bancária removida com sucesso.',
        ]);
    }
}
