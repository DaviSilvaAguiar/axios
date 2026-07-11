<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Usuario;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModulo
{
    public function handle(Request $request, Closure $next, string $slug): Response
    {
        /** @var Usuario|null $usuario */
        $usuario = $request->user();

        if (! $usuario || ! $usuario->temModulo($slug)) {
            return response()->json([
                'message' => 'Acesso negado a este módulo.',
            ], 403);
        }

        return $next($request);
    }
}
