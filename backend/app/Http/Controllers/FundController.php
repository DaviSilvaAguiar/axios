<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreFundRequest;
use App\Http\Requests\UpdateFundRequest;
use App\Http\Resources\FundResource;
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

        return response()->json([
            'data' => FundResource::collection($this->service->list($status))->resolve(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        return FundResource::make($this->service->find($id))->response();
    }

    public function store(StoreFundRequest $request): JsonResponse
    {
        $fund = $this->service->create($request->validated());

        return FundResource::make($fund)
            ->additional(['message' => 'Fund created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateFundRequest $request, int $id): JsonResponse
    {
        $fund = $this->service->update($id, $request->validated());

        return FundResource::make($fund)
            ->additional(['message' => 'Fund updated successfully.'])
            ->response();
    }

    public function close(int $id): JsonResponse
    {
        $fund = $this->service->close($id);

        return FundResource::make($fund)
            ->additional(['message' => 'Fund closed successfully.'])
            ->response();
    }

    public function statement(int $id): JsonResponse
    {
        $fund = $this->service->find($id);

        return response()->json([
            'data' => [
                'fund' => FundResource::make($fund)->resolve(),
                'transactions' => $this->transactionService->statement($id),
            ],
        ]);
    }
}
