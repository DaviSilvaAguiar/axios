<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreCaixaDespesaAnexoRequest;
use App\Http\Requests\StoreCaixaDespesaRequest;
use App\Http\Requests\UpdateCaixaDespesaRequest;
use App\Services\CaixaDespesaService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CaixaDespesaController extends Controller
{
    public function __construct(
        private readonly CaixaDespesaService $service,
    ) {}

    public function store(StoreCaixaDespesaRequest $request, int $id): JsonResponse
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

    public function update(UpdateCaixaDespesaRequest $request, int $id, int $idDespesa): JsonResponse
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

    // TODO: upload_max_filesize do PHP é 2M por padrão e causa 422 em arquivos maiores.
    // Para subir o limite em dev, trocar "php artisan serve" no composer.json por:
    // "php -d upload_max_filesize=50M -d post_max_size=50M artisan serve"
    public function storeAnexo(StoreCaixaDespesaAnexoRequest $request, int $id, int $idDespesa): JsonResponse
    {
        $anexo = $this->service->adicionarAnexo($id, $idDespesa, $request->file('anexo'));

        return response()->json([
            'mensagem' => 'Anexo adicionado com sucesso.',
            'anexo'    => $anexo,
        ], 201);
    }

    /**
     * @param int $id
     * @param int $idDespesa
     * @param int $idAnexo
     * @return StreamedResponse
     */
    public function servirAnexo(int $id, int $idDespesa, int $idAnexo): StreamedResponse
    {
        return $this->service->servirAnexo($id, $idDespesa, $idAnexo);
    }
}
