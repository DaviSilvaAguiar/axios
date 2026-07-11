<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreCentroDeCustoRequest;
use App\Http\Requests\UpdateCentroDeCustoRequest;
use App\Services\CentroDeCustoService;
use Illuminate\Http\JsonResponse;

class CentroCustoController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly CentroDeCustoService $service,
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
     * @param StoreCentroDeCustoRequest $request
     * @return JsonResponse
     */
    public function store(StoreCentroDeCustoRequest $request): JsonResponse
    {
        $dados = $request->validated();

        $centro = $this->service->criar($dados);

        return response()->json([
            'mensagem'      => 'Centro de custo criado com sucesso.',
            'centro_custo'  => $centro,
        ], 201);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        return response()->json([
            'centro_custo' => $this->service->buscar($id),
        ]);
    }

    /**
     * @param UpdateCentroDeCustoRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateCentroDeCustoRequest $request, int $id): JsonResponse
    {
        $dados = $request->validated();

        $centro = $this->service->atualizar($id, $dados);

        return response()->json([
            'mensagem'      => 'Centro de custo atualizado com sucesso.',
            'centro_custo'  => $centro,
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
            'mensagem' => 'Centro de custo removido com sucesso.',
        ]);
    }
}
