<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CategoriaDespesa;
use App\Models\DespesaRcm;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CategoriaDespesaService
{
    
    /**
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function listar(int $perPage): LengthAwarePaginator
    {
        return CategoriaDespesa::orderBy('descricao')->paginate($perPage);
    }

    /**
     * @param int $id
     * @return CategoriaDespesa
     */
    public function buscar(int $id): CategoriaDespesa
    {
        return CategoriaDespesa::findOrFail($id);
    }

    /**
     * @param array $dados
     * @return CategoriaDespesa
     */
    public function criar(array $dados): CategoriaDespesa
    {
        $dados['ativo'] = $dados['ativo'] ?? true;

        return CategoriaDespesa::create($dados);
    }

    /**
     * @param int $id
     * @param array $dados
     * @return CategoriaDespesa
     */
    public function atualizar(int $id, array $dados): CategoriaDespesa
    {
        $categoria = CategoriaDespesa::findOrFail($id);
        $categoria->update($dados);

        return $categoria->fresh();
    }

    /**
     * @param int $id
     * @return void
     */
    public function deletar(int $id): void
    {
        CategoriaDespesa::findOrFail($id);

        if (DespesaRcm::where('id_categoria_despesa', $id)->exists()) {
            abort(409, 'Esta categoria está vinculada a registros existentes e não pode ser removida.');
        }

        CategoriaDespesa::destroy($id);
    }
}
