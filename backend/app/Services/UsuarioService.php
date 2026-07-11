<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Caixa;
use App\Models\CaixaConta;
use App\Models\CaixaTransacoes;
use App\Models\Modulo;
use App\Models\Rcm;
use App\Models\Usuario;
use App\Models\UsuarioModulo;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UsuarioService
{
    public function listar(int $perPage): LengthAwarePaginator
    {
        return Usuario::orderBy('nome')->paginate($perPage);
    }

    public function buscar(int $id): Usuario
    {
        return Usuario::findOrFail($id);
    }

    public function criar(array $dados): Usuario
    {
        $tenant    = tenancy()->tenant;
        $totalAtual = Usuario::count();

        if ($totalAtual >= $tenant->max_usuarios) {
            abort(422, "Limite de {$tenant->max_usuarios} usuários atingido para esta empresa.");
        }

        $usuario = Usuario::create($dados)->fresh();

        $idsModulos = Modulo::where('ativo', true)->pluck('id');
        foreach ($idsModulos as $idModulo) {
            UsuarioModulo::create(['id_usuario' => $usuario->id, 'id_modulo' => $idModulo]);
        }

        return $usuario;
    }

    public function atualizar(int $id, array $dados): Usuario
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->update($dados);

        return $usuario->fresh();
    }

    public function deletar(int $id): void
    {
        Usuario::findOrFail($id);

        $vinculado = Rcm::where('id_usuario', $id)->exists()
            || Caixa::where('id_usuario', $id)->exists()
            || CaixaConta::where('id_usuario', $id)->exists()
            || CaixaTransacoes::where('id_usuario', $id)->exists();

        if ($vinculado) {
            abort(409, 'Este usuário está vinculado a registros existentes e não pode ser removido.');
        }

        UsuarioModulo::where('id_usuario', $id)->delete();
        Usuario::destroy($id);
    }

    public function listarModulos(int $id): array
    {
        $todos     = Modulo::where('ativo', true)->get();
        $habilitados = UsuarioModulo::where('id_usuario', $id)->pluck('id_modulo')->all();

        return [
            'modulos'    => $todos,
            'habilitados' => $habilitados,
        ];
    }

    public function sincronizarModulos(int $id, array $idModulos): void
    {
        $usuario = Usuario::findOrFail($id);

        if ($usuario->ehAdmin()) {
            abort(422, 'Usuários administradores têm acesso a todos os módulos automaticamente.');
        }

        UsuarioModulo::where('id_usuario', $id)->delete();
        foreach ($idModulos as $idModulo) {
            UsuarioModulo::create(['id_usuario' => $id, 'id_modulo' => $idModulo]);
        }
    }

    public function slugsModulos(int $id): array
    {
        $idModulos = UsuarioModulo::where('id_usuario', $id)->pluck('id_modulo');

        return Modulo::whereIn('id', $idModulos)->pluck('slug')->all();
    }
}
