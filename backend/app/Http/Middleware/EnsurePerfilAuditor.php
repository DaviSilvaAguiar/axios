<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Permite acesso apenas a usuários com perfil Administrador (1) ou Gestor/Auditor (2).
 * Bloqueia Prestadores (3).
 */
class EnsurePerfilAuditor
{
    public function handle(Request $request, Closure $next): Response
    {
        $perfil = $request->user()?->perfil;

        if (!in_array($perfil, [1, 2], true)) {
            return response()->json([
                'message' => 'Acesso restrito a auditores e administradores.',
            ], 403);
        }

        return $next($request);
    }
}
