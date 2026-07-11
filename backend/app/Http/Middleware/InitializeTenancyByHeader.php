<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InitializeTenancyByHeader
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->header('X-Account');

        if (!$tenantId) {
            return response()->json([
                'message' => 'Empresa não encontrada',
            ], 400);
        }

        $tenant = Tenant::where('slug', $tenantId)->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Empresa não encontrada.',
            ], 404);
        }

        tenancy()->initialize($tenant);

        return $next($request);
    }
}
