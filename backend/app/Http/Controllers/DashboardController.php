<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\OverviewDashboardRequest;
use App\Services\DashboardService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $service,
    ) {}

    public function overview(OverviewDashboardRequest $request): JsonResponse
    {
        $now = Carbon::now();
        $ano = (int) ($request->validated('ano') ?? $now->year);
        $mes = (int) ($request->validated('mes') ?? $now->month);

        return response()->json([
            'data' => $this->service->overview($ano, $mes),
        ]);
    }

    public function pendentesAprovacao(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->pendentesAprovacao(10),
        ]);
    }
}
