<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CaixaConta;
use App\Models\CaixaTransacoes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CaixaTransacaoService
{
    private const SCALE = 2;

    public function lancarCredito(int $idConta, array $dados): CaixaTransacoes
    {
        return DB::transaction(function () use ($idConta, $dados): CaixaTransacoes {
            $conta = CaixaConta::where('status', CaixaConta::STATUS_ATIVO)
                ->lockForUpdate()
                ->findOrFail($idConta);

            $valor = $this->normalizarValor($dados['valor']);

            $transacao = CaixaTransacoes::create([
                'id_usuario'     => Auth::id(),
                'id_caixa_conta' => $conta->id,
                'id_caixa'       => null,
                'tipo_transacao' => CaixaTransacoes::TIPO_CREDITO,
                'subtipo'        => CaixaTransacoes::SUBTIPO_ADIANTAMENTO,
                'valor'          => $valor,
                'observacao'     => $dados['observacao'] ?? null,
                'data_transacao' => $dados['data_transacao'],
            ]);

            $conta->saldo = bcadd((string) $conta->saldo, $valor, self::SCALE);
            $conta->save();

            return $transacao;
        });
    }

    public function lancarAjuste(int $idConta, array $dados): CaixaTransacoes
    {
        return DB::transaction(function () use ($idConta, $dados): CaixaTransacoes {
            $conta = CaixaConta::where('status', CaixaConta::STATUS_ATIVO)
                ->lockForUpdate()
                ->findOrFail($idConta);

            $subtipo = (int) $dados['subtipo'];
            $valor   = $this->normalizarValor($dados['valor']);

            // Devolução e AjusteNegativo subtraem; AjustePositivo soma.
            $eDebito = in_array($subtipo, [
                CaixaTransacoes::SUBTIPO_DEVOLUCAO,
                CaixaTransacoes::SUBTIPO_AJUSTE_NEGATIVO,
            ], true);

            $tipo = $eDebito ? CaixaTransacoes::TIPO_DEBITO : CaixaTransacoes::TIPO_CREDITO;

            $novoSaldo = $eDebito
                ? bcsub((string) $conta->saldo, $valor, self::SCALE)
                : bcadd((string) $conta->saldo, $valor, self::SCALE);

            if (bccomp($novoSaldo, '0', self::SCALE) === -1) {
                throw ValidationException::withMessages([
                    'valor' => ['O saldo do caixa ficaria negativo com este ajuste.'],
                ]);
            }

            $transacao = CaixaTransacoes::create([
                'id_usuario'     => Auth::id(),
                'id_caixa_conta' => $conta->id,
                'id_caixa'       => null,
                'tipo_transacao' => $tipo,
                'subtipo'        => $subtipo,
                'valor'          => $valor,
                'motivo'         => $dados['motivo'],
                'data_transacao' => $dados['data_transacao'],
            ]);

            $conta->saldo = $novoSaldo;
            $conta->save();

            return $transacao;
        });
    }

    public function lancarDebitoPorRdc(int $idConta, int $idRdc, string $valor): CaixaTransacoes
    {
        return DB::transaction(function () use ($idConta, $idRdc, $valor): CaixaTransacoes {
            $conta = CaixaConta::where('status', CaixaConta::STATUS_ATIVO)
                ->lockForUpdate()
                ->findOrFail($idConta);

            $valor = $this->normalizarValor($valor);
            $novoSaldo = bcsub((string) $conta->saldo, $valor, self::SCALE);

            if (bccomp($novoSaldo, '0', self::SCALE) === -1) {
                throw ValidationException::withMessages([
                    'saldo' => ['Saldo insuficiente no caixa para abater o RDC.'],
                ]);
            }

            $transacao = CaixaTransacoes::create([
                'id_usuario'     => Auth::id(),
                'id_caixa_conta' => $conta->id,
                'id_caixa'       => $idRdc,
                'tipo_transacao' => CaixaTransacoes::TIPO_DEBITO,
                'subtipo'        => CaixaTransacoes::SUBTIPO_ABATIMENTO_RDC,
                'valor'          => $valor,
                'data_transacao' => now(),
            ]);

            $conta->saldo = $novoSaldo;
            $conta->save();

            return $transacao;
        });
    }

    public function extrato(int $idConta): Collection
    {
        $transacoes = CaixaTransacoes::with('caixa:id,descricao')
            ->where('id_caixa_conta', $idConta)
            ->orderBy('data_transacao', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $saldoAcumulado = '0';

        return $transacoes->map(function (CaixaTransacoes $t) use (&$saldoAcumulado) {
            $valor = (string) $t->valor;
            $saldoAcumulado = $t->tipo_transacao === CaixaTransacoes::TIPO_CREDITO
                ? bcadd($saldoAcumulado, $valor, self::SCALE)
                : bcsub($saldoAcumulado, $valor, self::SCALE);

            return [
                'id'              => $t->id,
                'data_transacao'  => $t->data_transacao,
                'tipo_transacao'  => $t->tipo_transacao,
                'subtipo'         => $t->subtipo,
                'valor'           => $valor,
                'observacao'      => $t->observacao,
                'motivo'          => $t->motivo,
                'id_caixa'        => $t->id_caixa,
                'caixa'           => $t->caixa,
                'saldo_acumulado' => $saldoAcumulado,
            ];
        });
    }

    /**
     * Normaliza valor monetário recebido (int/float/string com vírgula ou ponto)
     * para uma string decimal segura para BCMath.
     */
    private function normalizarValor(mixed $valor): string
    {
        if (is_numeric($valor)) {
            return number_format((float) $valor, self::SCALE, '.', '');
        }

        $limpo = str_replace([' ', "\u{00A0}"], '', (string) $valor);
        // Formato BR "1.234,56" → "1234.56"
        if (str_contains($limpo, ',')) {
            $limpo = str_replace('.', '', $limpo);
            $limpo = str_replace(',', '.', $limpo);
        }

        if (!is_numeric($limpo)) {
            throw ValidationException::withMessages([
                'valor' => ['Valor monetário inválido.'],
            ]);
        }

        return number_format((float) $limpo, self::SCALE, '.', '');
    }
}
