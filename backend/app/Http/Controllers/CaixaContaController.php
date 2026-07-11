<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreCaixaContaRequest;
use App\Http\Requests\UpdateCaixaContaRequest;
use App\Models\CaixaConta;
use App\Services\CaixaContaService;
use App\Services\CaixaTransacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaixaContaController extends Controller
{
    public function __construct(
        private readonly CaixaContaService $service,
        private readonly CaixaTransacaoService $transacaoService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status') === 'fechados'
            ? CaixaConta::STATUS_FECHADO
            : CaixaConta::STATUS_ATIVO;

        return response()->json($this->service->listar($status));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->service->buscar($id));
    }

    public function store(StoreCaixaContaRequest $request): JsonResponse
    {
        return response()->json($this->service->criar($request->validated()), 201);
    }

    public function update(UpdateCaixaContaRequest $request, int $id): JsonResponse
    {
        return response()->json($this->service->atualizar($id, $request->validated()));
    }

    public function fechar(int $id): JsonResponse
    {
        return response()->json($this->service->fechar($id));
    }

    public function extrato(int $id): JsonResponse
    {
        $conta = $this->service->buscar($id);

        return response()->json([
            'caixa_conta' => $conta,
            'transacoes'  => $this->transacaoService->extrato($id),
        ]);
    }
}
