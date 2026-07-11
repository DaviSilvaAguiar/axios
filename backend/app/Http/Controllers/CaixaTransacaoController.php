<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\LancarAjusteRequest;
use App\Http\Requests\LancarCreditoRequest;
use App\Services\CaixaTransacaoService;
use Illuminate\Http\JsonResponse;

class CaixaTransacaoController extends Controller
{
    public function __construct(
        private readonly CaixaTransacaoService $service,
    ) {}

    public function lancarCredito(LancarCreditoRequest $request, int $id): JsonResponse
    {
        return response()->json(
            $this->service->lancarCredito($id, $request->validated()),
            201,
        );
    }

    public function lancarAjuste(LancarAjusteRequest $request, int $id): JsonResponse
    {
        return response()->json(
            $this->service->lancarAjuste($id, $request->validated()),
            201,
        );
    }
}
