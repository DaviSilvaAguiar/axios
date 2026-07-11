<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Rcm;
use App\Models\Usuario;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Response;

class RcmService
{

    /**
     * @param Usuario $usuario
     * @param int $perPage
     * @param array $filtros
     * @return LengthAwarePaginator
     */
    public function listar(Usuario $usuario, int $perPage = 10, array $filtros = [])
    {
        $query = Rcm::with(['usuario', 'centroDeCusto', 'despesas.centroDeCusto', 'despesas.categoriaDespesa', 'despesas.anexos', 'loteExportacao:id,created_at']);

        if ($usuario->perfil === 3) {
            $query->where('id_usuario', $usuario->id);
        }

        if (!empty($filtros['colaborador'])) {
            $query->whereHas('usuario', function ($q) use ($filtros) {
                $q->where('nome', 'like', '%' . $filtros['colaborador'] . '%');
            });
        }

        if (!empty($filtros['status'])) {
            $query->where('status', $filtros['status']);
        }

        if (!empty($filtros['dataInicio'])) {
            $query->whereDate('created_at', '>=', $filtros['dataInicio']);
        }

        if (!empty($filtros['dataFim'])) {
            $query->whereDate('created_at', '<=', $filtros['dataFim']);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function criar(array $dados, int $idUsuario): Rcm
    {
        $dados = $this->resolverRequisitante($dados);

        $rcm = Rcm::create([
            ...$dados,
            'id_usuario' => $idUsuario,
            'status'     => Rcm::STATUS_SOLICITADO,
        ]);

        return $rcm->fresh();
    }

    private function resolverRequisitante(array $dados): array
    {
        if (empty($dados['id_usuario_requisitante'])) {
            return $dados;
        }

        $usuario = Usuario::find($dados['id_usuario_requisitante']);
        if (!$usuario) {
            return $dados;
        }

        if (empty($dados['nome_solicitante'])) {
            $dados['nome_solicitante'] = $usuario->nome;
        }
        if (empty($dados['cpf_cnpj_solicitante'])) {
            $dados['cpf_cnpj_solicitante'] = $usuario->cpf_cnpj ?? '';
        }

        return $dados;
    }

    public function buscar(int $id): Rcm
    {
        return Rcm::with(['usuario', 'centroDeCusto', 'despesas.centroDeCusto', 'despesas.categoriaDespesa', 'despesas.anexos', 'loteExportacao:id,created_at'])->findOrFail($id);
    }

    public function atualizar(int $id, array $dados): Rcm
    {
        $rcm = Rcm::findOrFail($id);

        if ($rcm->status !== Rcm::STATUS_SOLICITADO) {
            abort(409, 'Apenas reembolsos com status "Rascunho" podem ser editados.');
        }

        $dados = $this->resolverRequisitante($dados);
        $rcm->update($dados);

        return $rcm->fresh(['usuario', 'centroDeCusto', 'despesas.centroDeCusto', 'despesas.categoriaDespesa', 'despesas.anexos', 'loteExportacao:id,created_at']);
    }

    public function atualizarStatus(int $id, array $dados): Rcm
    {
        $rcm    = Rcm::findOrFail($id);
        $status = (int) $dados['status'];

        if ($status === Rcm::STATUS_PAGAMENTO_AGENDADO && empty($dados['data_pagamento_programado'])) {
            abort(422, 'A data programada de pagamento é obrigatória ao agendar o pagamento.');
        }

        if ($status === Rcm::STATUS_REJEITADO && empty($dados['motivo_rejeicao'])) {
            abort(422, 'O motivo da rejeição é obrigatório ao rejeitar um reembolso.');
        }

        $rcm->update([
            'status'                    => $status,
            'data_pagamento_programado' => $dados['data_pagamento_programado'] ?? $rcm->data_pagamento_programado,
            'motivo_rejeicao'           => $dados['motivo_rejeicao'] ?? $rcm->motivo_rejeicao,
        ]);

        return $rcm->fresh(['usuario', 'centroDeCusto', 'despesas.centroDeCusto', 'despesas.categoriaDespesa', 'despesas.anexos', 'loteExportacao:id,created_at']);
    }

    public function deletar(int $id): void
    {
        $rcm = Rcm::findOrFail($id);

        if ($rcm->status !== Rcm::STATUS_SOLICITADO) {
            abort(409, 'Apenas reembolsos com status "Rascunho" podem ser excluídos.');
        }

        $rcm->delete();
    }

    public function gerarPdf(int $id): Response
    {
        $pdfBytes = $this->gerarPdfBytes($id);

        return new Response(
            $pdfBytes,
            200,
            [
                'Content-Type'        => 'application/pdf',
                'Content-Disposition' => "inline; filename=\"rcm-{$id}.pdf\"",
            ]
        );
    }

    /**
     * @param int $id
     * @return string Conteúdo binário do PDF
     */
    public function gerarPdfBytes(int $id): string
    {
        $rcm = $this->buscar($id);

        return Pdf::loadView('pdf.rcm', compact('rcm'))->output();
    }
}
