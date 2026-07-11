<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Fornecedor;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FornecedorService
{
    /**
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function listar(int $perPage): LengthAwarePaginator
    {
        return Fornecedor::orderBy('descricao')->paginate($perPage);
    }

    /**
     * @param int $id
     * @return Fornecedor
     */
    public function buscar(int $id): Fornecedor
    {
        return Fornecedor::findOrFail($id);
    }

    /**
     * @param array $dados
     * @return Fornecedor
     */
    public function criar(array $dados): Fornecedor
    {
        $dados['cpf_cnpj'] = preg_replace('/\D/', '', (string) ($dados['cpf_cnpj'] ?? '')) ?? '';
        $dados['ativo']    = $dados['ativo'] ?? true;

        return Fornecedor::create($dados);
    }

    /**
     * @param int $id
     * @param array $dados
     * @return Fornecedor
     */
    public function atualizar(int $id, array $dados): Fornecedor
    {
        if (array_key_exists('cpf_cnpj', $dados)) {
            $dados['cpf_cnpj'] = preg_replace('/\D/', '', (string) $dados['cpf_cnpj']) ?? '';
        }

        $fornecedor = Fornecedor::findOrFail($id);
        $fornecedor->update($dados);

        return $fornecedor->fresh();
    }

    /**
     * @param int $id
     * @return void
     */
    public function deletar(int $id): void
    {
        Fornecedor::findOrFail($id);

        Fornecedor::destroy($id);
    }
}
