<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ListTransactionsRequest;
use App\Services\ProviderService;
use Illuminate\Http\JsonResponse;

class ProviderController extends Controller
{
    public function __construct(private readonly ProviderService $service)
    {
    }

    public function transactions(ListTransactionsRequest $request): JsonResponse
    {
        $result = $this->service->listTransactions(
            type: $request->input('type'),
            page: (int) $request->input('page', 1),
            perPage: (int) $request->input('per_page', 10),
        );

        return response()->json($result);
    }
}
