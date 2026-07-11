<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ReceitaWsService;
use Illuminate\Http\JsonResponse;

class ConsultaCnpjController extends Controller
{
    public function __construct(
        private readonly ReceitaWsService $service,
    ) {}

    /**
     * @param string $cnpj
     * @return JsonResponse
     */
    public function show(string $cnpj): JsonResponse
    {
        return response()->json([
            'data' => $this->service->consultarCnpj($cnpj),
        ]);
    }
}
