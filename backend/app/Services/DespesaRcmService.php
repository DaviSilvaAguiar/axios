<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AnexoRcm;
use App\Models\DespesaRcm;
use App\Models\Rcm;
use Illuminate\Support\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DespesaRcmService
{
    /**
     * Garante que o reembolso ainda está em Rascunho (editável) e o retorna.
     */
    private function garantirRcmEditavel(int $idRcm): Rcm
    {
        $rcm = Rcm::findOrFail($idRcm);

        if ($rcm->status !== Rcm::STATUS_SOLICITADO) {
            abort(409, 'Apenas reembolsos com status "Rascunho" podem ter despesas alteradas.');
        }

        return $rcm;
    }

    /**
     * Garante que a data da despesa está dentro do período do reembolso.
     */
    private function garantirDataNoPeriodo(Rcm $rcm, string $data): void
    {
        $dataDespesa = Carbon::parse($data)->startOfDay();
        $inicio      = $rcm->data_inicio_periodo->copy()->startOfDay();
        $fim         = $rcm->data_fim_periodo->copy()->startOfDay();

        if ($dataDespesa->lt($inicio) || $dataDespesa->gt($fim)) {
            abort(422, 'A data da despesa deve estar dentro do período do reembolso.');
        }
    }

    public function criar(int $idRcm, array $dados, array $anexos = []): DespesaRcm
    {
        $rcm = $this->garantirRcmEditavel($idRcm);
        $this->garantirDataNoPeriodo($rcm, $dados['data_despesa']);

        $despesa = DespesaRcm::create([
            'id_rcm'               => $idRcm,
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

        foreach ($anexos as $arquivo) {
            $caminho = $arquivo->store("rcm-anexos/{$idRcm}", 'public');
            AnexoRcm::create([
                'id_despesa_rcm' => $despesa->id,
                'caminho'        => $caminho,
            ]);
        }

        return $despesa->load(['centroDeCusto', 'categoriaDespesa', 'anexos']);
    }

    public function servirAnexo(int $idRcm, int $idDespesa): StreamedResponse
    {
        $despesa = DespesaRcm::where('id_rcm', $idRcm)->findOrFail($idDespesa);
        $anexo = $despesa->anexos()->firstOrFail();

        return Storage::disk('public')->response($anexo->caminho);
    }

    public function adicionarAnexo(int $idRcm, int $idDespesa, UploadedFile $arquivo): AnexoRcm
    {
        $this->garantirRcmEditavel($idRcm);
        $despesa = DespesaRcm::where('id_rcm', $idRcm)->findOrFail($idDespesa);

        $caminho = $arquivo->store("rcm-anexos/{$idRcm}", 'public');

        return AnexoRcm::create([
            'id_despesa_rcm' => $despesa->id,
            'caminho'        => $caminho,
        ]);
    }

    public function deletarAnexoEspecifico(int $idRcm, int $idDespesa, int $idAnexo): void
    {
        $this->garantirRcmEditavel($idRcm);
        $despesa = DespesaRcm::where('id_rcm', $idRcm)->findOrFail($idDespesa);
        $anexo = $despesa->anexos()->findOrFail($idAnexo);

        Storage::disk('public')->delete($anexo->caminho);
        $anexo->delete();
    }

    public function servirAnexoEspecifico(int $idRcm, int $idDespesa, int $idAnexo): StreamedResponse
    {
        $despesa = DespesaRcm::where('id_rcm', $idRcm)->findOrFail($idDespesa);
        $anexo = $despesa->anexos()->findOrFail($idAnexo);

        return Storage::disk('public')->response($anexo->caminho);
    }

    public function deletar(int $idRcm, int $id): void
    {
        $this->garantirRcmEditavel($idRcm);
        $despesa = DespesaRcm::where('id_rcm', $idRcm)->findOrFail($id);

        foreach ($despesa->anexos as $anexo) {
            Storage::disk('public')->delete($anexo->caminho);
        }

        $despesa->delete();
    }

    public function atualizar(int $idRcm, int $idDespesa, array $dados): DespesaRcm
    {
        $rcm = $this->garantirRcmEditavel($idRcm);
        $this->garantirDataNoPeriodo($rcm, $dados['data_despesa']);
        $despesa = DespesaRcm::where('id_rcm', $idRcm)->findOrFail($idDespesa);

        $despesa->update([
            'data_despesa'         => $dados['data_despesa'],
            'valor'                => $dados['valor'],
            'id_centro_custo'      => $dados['id_centro_custo'],
            'descricao'            => $dados['descricao'],
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

    public function deletarAnexo(int $idRcm, int $idDespesa): void
    {
        $this->garantirRcmEditavel($idRcm);
        $despesa = DespesaRcm::where('id_rcm', $idRcm)->findOrFail($idDespesa);

        foreach ($despesa->anexos as $anexo) {
            Storage::disk('public')->delete($anexo->caminho);
            $anexo->delete();
        }
    }

    public function substituirAnexo(int $idRcm, int $idDespesa, UploadedFile $arquivo): AnexoRcm
    {
        $this->garantirRcmEditavel($idRcm);
        $despesa = DespesaRcm::where('id_rcm', $idRcm)->findOrFail($idDespesa);

        foreach ($despesa->anexos as $anexoExistente) {
            Storage::disk('public')->delete($anexoExistente->caminho);
            $anexoExistente->delete();
        }

        $caminho = $arquivo->store("rcm-anexos/{$idRcm}", 'public');

        return AnexoRcm::create([
            'id_despesa_rcm' => $despesa->id,
            'caminho'        => $caminho,
        ]);
    }
}
