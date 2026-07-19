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
        $year = (int) ($request->validated('year') ?? $now->year);
        $month = (int) ($request->validated('month') ?? $now->month);

        return response()->json([
            'data' => $this->service->overview($year, $month),
        ]);
    }

    public function pendingApproval(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->pendingApproval(10),
        ]);
    }
}
