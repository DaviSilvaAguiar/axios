<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ReceitaWsService;
use Illuminate\Http\JsonResponse;

class CnpjLookupController extends Controller
{
    public function __construct(
        private readonly ReceitaWsService $service,
    ) {}

    public function show(string $cnpj): JsonResponse
    {
        return response()->json([
            'data' => $this->service->lookupCnpj($cnpj),
        ]);
    }
}
