<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Caixa;
use App\Models\CaixaConta;
use App\Models\CentroDeCusto;
use App\Models\DespesaRcm;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CentroDeCustoService
{

    /**
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function listar(int $perPage): LengthAwarePaginator
    {
        return CentroDeCusto::orderBy('descricao')->paginate($perPage);
    }

    /**
     * @param int $id
     * @return CentroDeCusto
     */
    public function buscar(int $id): CentroDeCusto
    {
        return CentroDeCusto::findOrFail($id);
    }

    /**
     * @param array $dados
     * @return CentroDeCusto
     */
    public function criar(array $dados): CentroDeCusto
    {
        $dados['ativo'] = $dados['ativo'] ?? true;

        return CentroDeCusto::create($dados);
    }

    /**
     * @param int $id
     * @param array $dados
     * @return CentroDeCusto
     */
    public function atualizar(int $id, array $dados): CentroDeCusto
    {
        $centro = CentroDeCusto::findOrFail($id);
        $centro->update($dados);

        return $centro->fresh();
    }

    /**
     * @param int $id
     * @return void
     */
    public function deletar(int $id): void
    {
        CentroDeCusto::findOrFail($id);

        $vinculado =
            DespesaRcm::where('id_centro_custo', $id)->exists() ||
            Caixa::where('id_centro_custo', $id)->exists() ||
            CaixaConta::where('id_centro_custo', $id)->exists();

        if ($vinculado) {
            abort(409, 'Este centro de custo está vinculado a registros existentes e não pode ser removido.');
        }

        CentroDeCusto::destroy($id);
    }
}
