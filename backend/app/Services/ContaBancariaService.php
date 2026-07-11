<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ContaBancaria;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ContaBancariaService
{
    /**
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function listar(int $perPage): LengthAwarePaginator
    {
        return ContaBancaria::orderBy('descricao')->paginate($perPage);
    }

    /**
     * @param int $id
     * @return ContaBancaria
     */
    public function buscar(int $id): ContaBancaria
    {
        return ContaBancaria::findOrFail($id);
    }

    /**
     * @param array $dados
     * @return ContaBancaria
     */
    public function criar(array $dados): ContaBancaria
    {
        $dados['ativo'] = $dados['ativo'] ?? true;

        return ContaBancaria::create($dados);
    }

    /**
     * @param int $id
     * @param array $dados
     * @return ContaBancaria
     */
    public function atualizar(int $id, array $dados): ContaBancaria
    {
        $conta = ContaBancaria::findOrFail($id);
        $conta->update($dados);

        return $conta->fresh();
    }

    /**
     * @param int $id
     * @return void
     */
    public function deletar(int $id): void
    {
        ContaBancaria::findOrFail($id);

        ContaBancaria::destroy($id);
    }
}
