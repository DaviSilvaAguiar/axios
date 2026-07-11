<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePerfilAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->perfil !== 1) {
            return response()->json([
                'message' => 'Acesso restrito ao perfil administrador.',
            ], 403);
        }

        return $next($request);
    }
}
