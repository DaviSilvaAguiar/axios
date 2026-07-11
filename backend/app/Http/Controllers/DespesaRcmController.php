<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreAnexoRcmRequest;
use App\Http\Requests\StoreDespesaRcmRequest;
use App\Http\Requests\UpdateDespesaRcmRequest;
use App\Services\DespesaRcmService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DespesaRcmController extends Controller
{
    public function __construct(
        private readonly DespesaRcmService $service,
    ) {}

    public function store(StoreDespesaRcmRequest $request, int $id): JsonResponse
    {
        $despesa = $this->service->criar(
            $id,
            $request->validated(),
            $request->file('anexos') ?? [],
        );

        return response()->json([
            'mensagem' => 'Despesa adicionada com sucesso.',
            'despesa'  => $despesa,
        ], 201);
    }

    public function update(UpdateDespesaRcmRequest $request, int $id, int $idDespesa): JsonResponse
    {
        $despesa = $this->service->atualizar($id, $idDespesa, $request->validated());

        return response()->json([
            'mensagem' => 'Despesa atualizada com sucesso.',
            'despesa'  => $despesa,
        ]);
    }

    public function destroy(int $id, int $idDespesa): JsonResponse
    {
        $this->service->deletar($id, $idDespesa);

        return response()->json([
            'mensagem' => 'Despesa removida com sucesso.',
        ]);
    }

    public function servirAnexo(int $id, int $idDespesa): StreamedResponse
    {
        return $this->service->servirAnexo($id, $idDespesa);
    }

    public function destroyAnexo(int $id, int $idDespesa): JsonResponse
    {
        $this->service->deletarAnexo($id, $idDespesa);

        return response()->json([
            'mensagem' => 'Anexo removido com sucesso.',
        ]);
    }

    public function storeAnexo(StoreAnexoRcmRequest $request, int $id, int $idDespesa): JsonResponse
    {
        $this->service->substituirAnexo($id, $idDespesa, $request->file('anexo'));

        return response()->json([
            'mensagem' => 'Anexo atualizado com sucesso.',
        ]);
    }

    public function adicionarAnexo(StoreAnexoRcmRequest $request, int $id, int $idDespesa): JsonResponse
    {
        $anexo = $this->service->adicionarAnexo($id, $idDespesa, $request->file('anexo'));

        return response()->json([
            'mensagem' => 'Anexo adicionado com sucesso.',
            'anexo'    => $anexo,
        ], 201);
    }

    public function destroyAnexoEspecifico(int $id, int $idDespesa, int $idAnexo): JsonResponse
    {
        $this->service->deletarAnexoEspecifico($id, $idDespesa, $idAnexo);

        return response()->json([
            'mensagem' => 'Anexo removido com sucesso.',
        ]);
    }

    public function servirAnexoEspecifico(int $id, int $idDespesa, int $idAnexo): StreamedResponse
    {
        return $this->service->servirAnexoEspecifico($id, $idDespesa, $idAnexo);
    }
}
