<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreFundRequest;
use App\Http\Requests\UpdateFundRequest;
use App\Models\Fund;
use App\Services\FundService;
use App\Services\FundTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FundController extends Controller
{
    public function __construct(
        private readonly FundService $service,
        private readonly FundTransactionService $transactionService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status') === 'fechados'
            ? Fund::STATUS_CLOSED
            : Fund::STATUS_ACTIVE;

        return response()->json($this->service->list($status));
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->service->find($id));
    }

    public function store(StoreFundRequest $request): JsonResponse
    {
        return response()->json($this->service->create($request->validated()), 201);
    }

    public function update(UpdateFundRequest $request, int $id): JsonResponse
    {
        return response()->json($this->service->update($id, $request->validated()));
    }

    public function close(int $id): JsonResponse
    {
        return response()->json($this->service->close($id));
    }

    public function statement(int $id): JsonResponse
    {
        $fund = $this->service->find($id);

        return response()->json([
            'fund' => $fund,
            'transactions'  => $this->transactionService->statement($id),
        ]);
    }
}
