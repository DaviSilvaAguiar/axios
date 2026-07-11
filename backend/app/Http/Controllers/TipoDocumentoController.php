<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreTipoDocumentoRequest;
use App\Http\Requests\UpdateTipoDocumentoRequest;
use App\Services\TipoDocumentoService;
use Illuminate\Http\JsonResponse;

class TipoDocumentoController extends Controller
{
    public function __construct(
        private readonly TipoDocumentoService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json($this->service->listar());
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->service->buscar($id));
    }

    public function store(StoreTipoDocumentoRequest $request): JsonResponse
    {
        return response()->json($this->service->criar($request->validated()), 201);
    }

    public function update(UpdateTipoDocumentoRequest $request, int $id): JsonResponse
    {
        return response()->json($this->service->atualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->remover($id);

        return response()->json(null, 204);
    }
}
