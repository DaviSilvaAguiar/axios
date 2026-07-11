<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreCategoriaDespesaRequest;
use App\Http\Requests\UpdateCategoriaDespesaRequest;
use App\Services\CategoriaDespesaService;
use Illuminate\Http\JsonResponse;

class CategoriaDespesaController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly CategoriaDespesaService $service,
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
     * @param StoreCategoriaDespesaRequest $request
     * @return JsonResponse
     */
    public function store(StoreCategoriaDespesaRequest $request): JsonResponse
    {
        $dados = $request->validated();

        $categoria = $this->service->criar($dados);

        return response()->json([
            'mensagem'           => 'Categoria de despesa criada com sucesso.',
            'categoria_despesa'  => $categoria,
        ], 201);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'categoria_despesa' => $this->service->buscar($id),
        ]);
    }

    /**
     * @param UpdateCategoriaDespesaRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateCategoriaDespesaRequest $request, int $id): JsonResponse
    {
        $dados = $request->validated();

        $categoria = $this->service->atualizar($id, $dados);

        return response()->json([
            'mensagem'           => 'Categoria de despesa atualizada com sucesso.',
            'categoria_despesa'  => $categoria,
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
            'mensagem' => 'Categoria de despesa removida com sucesso.',
        ]);
    }
}
