<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Caixa;
use App\Models\Rcm;
use Illuminate\Support\Facades\Auth;

class PrestadorService
{
    /**
     * Lista os lançamentos (Caixas/RDCs + RCMs) do usuário autenticado,
     * mesclados e ordenados por created_at desc, paginados manualmente.
     *
     * @return array{data: array<int, array<string, mixed>>, meta: array<string, int>}
     */
    public function listarLancamentos(?string $tipo, int $page, int $perPage): array
    {
        $userId = (int) Auth::id();
        $items = collect();

        if ($tipo === null || $tipo === 'rdc') {
            $caixas = Caixa::query()
                ->where('id_usuario', $userId)
                ->withSum('despesas as valor_total', 'valor')
                ->get(['id', 'descricao', 'status', 'created_at'])
                ->map(fn (Caixa $c): array => [
                    'id'          => $c->id,
                    'tipo'        => 'rdc',
                    'titulo'      => $c->descricao ?? 'Caixa de Obra',
                    'valor_total' => (string) ($c->valor_total ?? '0.00'),
                    'status'      => (int) $c->status,
                    'created_at'  => $c->created_at?->toIso8601String() ?? '',
                ]);
            $items = $items->concat($caixas);
        }

        if ($tipo === null || $tipo === 'rcm') {
            $rcms = Rcm::query()
                ->where('id_usuario', $userId)
                ->withSum('despesas as valor_total', 'valor')
                ->get(['id', 'titulo', 'status', 'created_at'])
                ->map(fn (Rcm $r): array => [
                    'id'          => $r->id,
                    'tipo'        => 'rcm',
                    'titulo'      => $r->titulo,
                    'valor_total' => (string) ($r->valor_total ?? '0.00'),
                    'status'      => (int) $r->status,
                    'created_at'  => $r->created_at?->toIso8601String() ?? '',
                ]);
            $items = $items->concat($rcms);
        }

        $sorted = $items->sortByDesc('created_at')->values();
        $total = $sorted->count();
        $paginated = $sorted->slice(($page - 1) * $perPage, $perPage)->values()->all();

        return [
            'data' => $paginated,
            'meta' => [
                'current_page' => $page,
                'last_page'    => max(1, (int) ceil($total / $perPage)),
                'per_page'     => $perPage,
                'total'        => $total,
            ],
        ];
    }
}
