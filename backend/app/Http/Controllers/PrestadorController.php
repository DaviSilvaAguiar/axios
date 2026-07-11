<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ListarLancamentosRequest;
use App\Services\PrestadorService;
use Illuminate\Http\JsonResponse;

class PrestadorController extends Controller
{
    public function __construct(private readonly PrestadorService $service)
    {
    }

    public function lancamentos(ListarLancamentosRequest $request): JsonResponse
    {
        $result = $this->service->listarLancamentos(
            tipo: $request->input('tipo'),
            page: (int) $request->input('page', 1),
            perPage: (int) $request->input('per_page', 10),
        );

        return response()->json($result);
    }
}
