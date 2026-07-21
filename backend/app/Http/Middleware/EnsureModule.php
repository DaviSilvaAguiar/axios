<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModule
{
    public function handle(Request $request, Closure $next, string $slug): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasModule($slug)) {
            return response()->json([
                'message' => 'Access denied to this module.',
            ], 403);
        }

        return $next($request);
    }
}
