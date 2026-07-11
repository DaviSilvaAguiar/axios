<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Caixa;
use App\Models\CaixaDespesa;
use App\Models\Usuario;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CaixaService
{
    public function __construct(
        private readonly CaixaTransacaoService $transacaoService,
    ) {}

    public function listar(): Collection
    {
        return Caixa::with([
            'centroDeCusto',
            'usuarioRequisitante',
            'despesas.centroDeCusto',
            'despesas.categoriaDespesa',
            'despesas.anexos',
        ])
            ->where('id_usuario', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function buscar(int $id): Caixa
    {
        $caixa = Caixa::with(['centroDeCusto', 'usuarioRequisitante'])
            ->where('id_usuario', Auth::id())
            ->findOrFail($id);

        $despesas = CaixaDespesa::with(['centroDeCusto', 'categoriaDespesa', 'anexos'])
            ->where('id_caixa', $caixa->id)
            ->get();

        $caixa->setRelation('despesas', $despesas);

        return $caixa;
    }

    public function criar(array $dados): Caixa
    {
        $dados = $this->resolverRequisitante($dados);

        $caixa = Caixa::create([
            ...$dados,
            'id_usuario' => Auth::id(),
            'status'     => Caixa::STATUS_RASCUNHO,
        ]);

        return $caixa->load(['centroDeCusto', 'usuarioRequisitante']);
    }

    /**
     * Campos de conteúdo do RDC — só podem ser alterados enquanto Rascunho.
     * Mudanças de status (e seus metadados) seguem permitidas em qualquer estado.
     */
    private const CAMPOS_CONTEUDO = [
        'id_centro_custo', 'descricao', 'data_inicio_periodo', 'data_fim_periodo',
        'obs', 'banco', 'agencia', 'numero_banco', 'chave_pix',
        'descricao_requisitante', 'setor_requisitante', 'cpf_cnpj_requisitante', 'id_usuario_requisitante',
    ];

    public function atualizar(int $id, array $dados): Caixa
    {
        $caixa = Caixa::where('id_usuario', Auth::id())->findOrFail($id);

        // Trava de edição após submissão: conteúdo só muda em Rascunho.
        $editandoConteudo = !empty(array_intersect(array_keys($dados), self::CAMPOS_CONTEUDO));
        if ($editandoConteudo && $caixa->status !== Caixa::STATUS_RASCUNHO) {
            throw ValidationException::withMessages([
                'status' => ['Apenas RDC em "Rascunho" pode ser editado.'],
            ]);
        }

        // Exigências por transição de status.
        $novoStatus = isset($dados['status']) ? (int) $dados['status'] : null;
        if ($novoStatus === Caixa::STATUS_REJEITADO && empty($dados['motivo_rejeicao'])) {
            throw ValidationException::withMessages([
                'motivo_rejeicao' => ['O motivo da rejeição é obrigatório ao rejeitar um RDC.'],
            ]);
        }
        if ($novoStatus === Caixa::STATUS_PAGAMENTO_AGENDADO && empty($dados['data_pagamento'])) {
            throw ValidationException::withMessages([
                'data_pagamento' => ['A data de pagamento é obrigatória ao agendar o pagamento.'],
            ]);
        }

        $dados = $this->resolverRequisitante($dados);
        $caixa->update($dados);

        return $caixa->load([
            'centroDeCusto',
            'usuarioRequisitante',
            'despesas.centroDeCusto',
            'despesas.categoriaDespesa',
            'despesas.anexos',
        ]);
    }

    private function resolverRequisitante(array $dados): array
    {
        if (empty($dados['id_usuario_requisitante'])) {
            return $dados;
        }

        $usuario = Usuario::find($dados['id_usuario_requisitante']);
        if (!$usuario) {
            throw ValidationException::withMessages([
                'id_usuario_requisitante' => ['Colaborador não encontrado.'],
            ]);
        }

        if (empty($dados['descricao_requisitante'])) {
            $dados['descricao_requisitante'] = $usuario->nome;
        }
        if (empty($dados['cpf_cnpj_requisitante'])) {
            $dados['cpf_cnpj_requisitante'] = $usuario->cpf_cnpj ?? '';
        }

        return $dados;
    }

    public function remover(int $id): void
    {
        $caixa = Caixa::findOrFail($id);

        if ($caixa->status !== Caixa::STATUS_RASCUNHO) {
            throw ValidationException::withMessages([
                'status' => ['Apenas RDC em Rascunho pode ser excluído.'],
            ]);
        }

        $caixa->delete();
    }

    public function aprovar(int $idRdc, int $idCaixaConta): Caixa
    {
        return DB::transaction(function () use ($idRdc, $idCaixaConta): Caixa {
            $caixa = Caixa::with('despesas')->lockForUpdate()->findOrFail($idRdc);

            $statusAprovaveis = [Caixa::STATUS_PENDENTE, Caixa::STATUS_EM_ANALISE];
            if (!in_array($caixa->status, $statusAprovaveis, true)) {
                throw ValidationException::withMessages([
                    'status' => ['Apenas RDC em "Pendente" ou "Em Análise" pode ser aprovado.'],
                ]);
            }

            $valorTotal = '0';
            foreach ($caixa->despesas as $despesa) {
                $valorTotal = bcadd($valorTotal, (string) $despesa->valor, 2);
            }

            if (bccomp($valorTotal, '0', 2) === 0) {
                throw ValidationException::withMessages([
                    'despesas' => ['Não é possível aprovar um RDC sem despesas.'],
                ]);
            }

            $caixa->update(['status' => Caixa::STATUS_APROVADO]);

            $this->transacaoService->lancarDebitoPorRdc($idCaixaConta, $caixa->id, $valorTotal);

            return $caixa->load([
                'centroDeCusto',
                'usuarioRequisitante',
                'despesas.centroDeCusto',
                'despesas.categoriaDespesa',
                'despesas.anexos',
            ]);
        });
    }

    public function gerarPdf(int $id): Response
    {
        $pdfBytes = $this->gerarPdfBytes($id);

        return new Response(
            $pdfBytes,
            200,
            [
                'Content-Type'        => 'application/pdf',
                'Content-Disposition' => "inline; filename=\"rdc-{$id}.pdf\"",
            ]
        );
    }

    /**
     * @param int $id
     * @return string Conteúdo binário do PDF
     */
    public function gerarPdfBytes(int $id): string
    {
        $caixa = Caixa::with([
            'centroDeCusto',
            'usuarioRequisitante',
            'despesas.centroDeCusto',
            'despesas.categoriaDespesa',
            'despesas.anexos',
        ])->findOrFail($id);

        return Pdf::loadView('pdf.caixa', compact('caixa'))->output();
    }
}
