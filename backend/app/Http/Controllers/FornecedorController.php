<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\FornecedorRequest;
use App\Services\FornecedorService;
use Illuminate\Http\JsonResponse;

class FornecedorController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly FornecedorService $service,
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
     * @param FornecedorRequest $request
     * @return JsonResponse
     */
    public function store(FornecedorRequest $request): JsonResponse
    {
        $fornecedor = $this->service->criar($request->validated());

        return response()->json([
            'mensagem'   => 'Fornecedor criado com sucesso.',
            'fornecedor' => $fornecedor,
        ], 201);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'fornecedor' => $this->service->buscar($id),
        ]);
    }

    /**
     * @param FornecedorRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(FornecedorRequest $request, int $id): JsonResponse
    {
        $fornecedor = $this->service->atualizar($id, $request->validated());

        return response()->json([
            'mensagem'   => 'Fornecedor atualizado com sucesso.',
            'fornecedor' => $fornecedor,
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
            'mensagem' => 'Fornecedor removido com sucesso.',
        ]);
    }
}
