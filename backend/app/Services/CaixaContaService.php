<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CaixaConta;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class CaixaContaService
{
    public function listar(int $status = CaixaConta::STATUS_ATIVO): Collection
    {
        return CaixaConta::with(['usuario', 'centroDeCusto'])
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function buscar(int $id): CaixaConta
    {
        return CaixaConta::with(['usuario', 'centroDeCusto'])
            ->findOrFail($id);
    }

    public function criar(array $dados): CaixaConta
    {
        $conta = CaixaConta::create([
            ...$dados,
            'saldo'  => 0,
            'status' => CaixaConta::STATUS_ATIVO,
        ]);

        return $conta->load(['usuario', 'centroDeCusto']);
    }

    public function atualizar(int $id, array $dados): CaixaConta
    {
        $conta = CaixaConta::findOrFail($id);
        $conta->update($dados);

        return $conta->load(['usuario', 'centroDeCusto']);
    }

    public function fechar(int $id): CaixaConta
    {
        $conta = CaixaConta::findOrFail($id);

        if ((float) $conta->saldo !== 0.0) {
            throw ValidationException::withMessages([
                'saldo' => ['O caixa só pode ser fechado com saldo R$ 0,00.'],
            ]);
        }

        $conta->update(['status' => CaixaConta::STATUS_FECHADO]);

        return $conta->load(['usuario', 'centroDeCusto']);
    }
}
