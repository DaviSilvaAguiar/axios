<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Caixa;
use App\Models\CaixaDespesa;
use App\Models\CaixaDespesaAnexo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CaixaDespesaService
{
    /**
     * Garante que o RDC ainda está em Rascunho (editável) e o retorna.
     */
    private function garantirRdcEditavel(int $idCaixa): Caixa
    {
        $caixa = Caixa::findOrFail($idCaixa);

        if ($caixa->status !== Caixa::STATUS_RASCUNHO) {
            throw ValidationException::withMessages([
                'status' => ['Apenas RDC em "Rascunho" pode ter despesas alteradas.'],
            ]);
        }

        return $caixa;
    }

    /**
     * Garante que a data da despesa está dentro do período do RDC.
     */
    private function garantirDataNoPeriodo(Caixa $caixa, string $data): void
    {
        if (empty($caixa->data_inicio_periodo) || empty($caixa->data_fim_periodo)) {
            return;
        }

        $dataDespesa = Carbon::parse($data)->startOfDay();
        $inicio      = $caixa->data_inicio_periodo->copy()->startOfDay();
        $fim         = $caixa->data_fim_periodo->copy()->startOfDay();

        if ($dataDespesa->lt($inicio) || $dataDespesa->gt($fim)) {
            throw ValidationException::withMessages([
                'data_despesa' => ['A data da despesa deve estar dentro do período do RDC.'],
            ]);
        }
    }

    public function criar(int $idCaixa, array $dados, array $arquivos): CaixaDespesa
    {
        $caixa = $this->garantirRdcEditavel($idCaixa);
        $this->garantirDataNoPeriodo($caixa, $dados['data_despesa']);

        $despesa = CaixaDespesa::create([
            'id_caixa'             => $idCaixa,
            'id_centro_custo'      => $dados['id_centro_custo'],
            'descricao'            => $dados['descricao'],
            'valor'                => $dados['valor'],
            'data_despesa'         => $dados['data_despesa'],
            'id_categoria_despesa' => $dados['id_categoria_despesa'] ?? null,
            'latitude'             => $dados['latitude']  ?? null,
            'longitude'            => $dados['longitude'] ?? null,
            'endereco'             => $dados['endereco']  ?? null,
            'descricao_fornecedor' => $dados['descricao_fornecedor'] ?? null,
            'cpf_cnpj_fornecedor'  => $dados['cpf_cnpj_fornecedor']  ?? null,
            'id_fornecedor'        => $dados['id_fornecedor']        ?? null,
        ]);

        foreach ($arquivos as $arquivo) {
            if ($arquivo instanceof UploadedFile) {
                $caminho = $arquivo->store("caixa-anexos/{$idCaixa}", 'public');
                CaixaDespesaAnexo::create([
                    'id_caixa_despesa' => $despesa->id,
                    'caminho'          => $caminho,
                ]);
            }
        }

        return $despesa->load(['centroDeCusto', 'categoriaDespesa', 'anexos']);
    }

    public function atualizar(int $idCaixa, int $idDespesa, array $dados): CaixaDespesa
    {
        $caixa = $this->garantirRdcEditavel($idCaixa);
        $this->garantirDataNoPeriodo($caixa, $dados['data_despesa']);
        $despesa = CaixaDespesa::where('id_caixa', $idCaixa)->findOrFail($idDespesa);

        $despesa->update([
            'id_centro_custo'      => $dados['id_centro_custo'],
            'descricao'            => $dados['descricao'],
            'valor'                => $dados['valor'],
            'data_despesa'         => $dados['data_despesa'],
            'id_categoria_despesa' => $dados['id_categoria_despesa'] ?? null,
            'latitude'             => $dados['latitude']  ?? null,
            'longitude'            => $dados['longitude'] ?? null,
            'endereco'             => $dados['endereco']  ?? null,
            'descricao_fornecedor' => $dados['descricao_fornecedor'] ?? null,
            'cpf_cnpj_fornecedor'  => $dados['cpf_cnpj_fornecedor']  ?? null,
            'id_fornecedor'        => $dados['id_fornecedor']        ?? null,
        ]);

        return $despesa->load(['centroDeCusto', 'categoriaDespesa', 'anexos']);
    }

    public function adicionarAnexo(int $idCaixa, int $idDespesa, UploadedFile $arquivo): CaixaDespesaAnexo
    {
        $this->garantirRdcEditavel($idCaixa);
        $despesa = CaixaDespesa::where('id_caixa', $idCaixa)->findOrFail($idDespesa);

        $caminho = $arquivo->store("caixa-anexos/{$idCaixa}", 'public');

        return CaixaDespesaAnexo::create([
            'id_caixa_despesa' => $despesa->id,
            'caminho'          => $caminho,
        ]);
    }

    /**
     * @param int $idCaixa
     * @param int $idDespesa
     * @param int $idAnexo
     * @return StreamedResponse
     */
    public function servirAnexo(int $idCaixa, int $idDespesa, int $idAnexo): StreamedResponse
    {
        $despesa = CaixaDespesa::where('id_caixa', $idCaixa)->findOrFail($idDespesa);
        $anexo   = $despesa->anexos()->findOrFail($idAnexo);

        return Storage::disk('public')->response($anexo->caminho);
    }

    public function deletar(int $idCaixa, int $idDespesa): void
    {
        $this->garantirRdcEditavel($idCaixa);
        $despesa = CaixaDespesa::where('id_caixa', $idCaixa)->findOrFail($idDespesa);

        foreach ($despesa->anexos as $anexo) {
            Storage::disk('public')->delete($anexo->caminho);
        }

        $despesa->delete();
    }
}
