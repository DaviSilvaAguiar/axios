<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRoleAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== 1) {
            return response()->json([
                'message' => 'Access restricted to the administrator role.',
            ], 403);
        }

        return $next($request);
    }
}
