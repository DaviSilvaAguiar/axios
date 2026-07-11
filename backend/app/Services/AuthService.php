<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Modulo;
use App\Models\Usuario;
use App\Models\UsuarioModulo;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Autentica o usuário e retorna o token de acesso junto com os dados do tenant.
     *
     * @throws AuthenticationException
     */
    public function login(array $dados): array
    {
        $usuario = Usuario::where('email', $dados['email'])->first();

        if (! $usuario || ! Hash::check($dados['senha'], $usuario->senha)) {
            throw new AuthenticationException('Credenciais inválidas.');
        }

        if (! $usuario->ativo) {
            throw new AuthenticationException('Usuário inativo.');
        }

        $usuario->tokens()->delete();
        $dias      = ($dados['remember_me'] ?? false) ? 365 : 30;
        $expiresAt = now()->addDays($dias);
        $token     = $usuario->createToken('api', ['*'], $expiresAt)->plainTextToken;

        return [
            'token'      => $token,
            'expires_at' => $expiresAt->toISOString(),
            'usuario'    => $usuario,
            'tenant'     => tenancy()->tenant,
        ];
    }

    /**
     * Revoga o token atual do usuário autenticado.
     */
    public function logout(Usuario $usuario): void
    {
        $usuario->currentAccessToken()->delete();
    }

    /**
     * Retorna o usuário autenticado, dados do tenant e slugs de módulos habilitados.
     */
    public function me(Usuario $usuario): array
    {
        return [
            'usuario' => $usuario,
            'tenant'  => tenancy()->tenant,
            'modulos' => $usuario->slugsModulosHabilitados(),
        ];
    }
}
