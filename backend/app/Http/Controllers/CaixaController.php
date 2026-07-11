<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\AprovarCaixaRequest;
use App\Http\Requests\StoreCaixaRequest;
use App\Http\Requests\UpdateCaixaRequest;
use App\Services\CaixaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CaixaController extends Controller
{
    public function __construct(
        private readonly CaixaService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json($this->service->listar());
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->service->buscar($id));
    }

    public function store(StoreCaixaRequest $request): JsonResponse
    {
        return response()->json($this->service->criar($request->validated()), 201);
    }

    public function update(UpdateCaixaRequest $request, int $id): JsonResponse
    {
        return response()->json($this->service->atualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->remover($id);

        return response()->json(null, 204);
    }

    public function aprovar(AprovarCaixaRequest $request, int $id): JsonResponse
    {
        $caixa = $this->service->aprovar($id, (int) $request->validated()['id_caixa_conta']);

        return response()->json($caixa);
    }

    public function gerarPdf(int $id): Response
    {
        return $this->service->gerarPdf($id);
    }
}
