<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRoleAuditor
{
    public function handle(Request $request, Closure $next): Response
    {
        $role = $request->user()?->role;

        if (! in_array($role, [1, 2], true)) {
            return response()->json([
                'message' => 'Access restricted to auditors and administrators.',
            ], 403);
        }

        return $next($request);
    }
}
