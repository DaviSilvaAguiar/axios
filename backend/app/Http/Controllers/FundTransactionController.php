<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\PostAdjustmentRequest;
use App\Http\Requests\PostCreditRequest;
use App\Http\Resources\FundTransactionResource;
use App\Services\FundTransactionService;
use Illuminate\Http\JsonResponse;

class FundTransactionController extends Controller
{
    public function __construct(
        private readonly FundTransactionService $service,
    ) {}

    public function postCredit(PostCreditRequest $request, int $id): JsonResponse
    {
        $transaction = $this->service->postCredit($id, $request->validated());

        return FundTransactionResource::make($transaction)
            ->additional(['message' => 'Credit posted successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function postAdjustment(PostAdjustmentRequest $request, int $id): JsonResponse
    {
        $transaction = $this->service->postAdjustment($id, $request->validated());

        return FundTransactionResource::make($transaction)
            ->additional(['message' => 'Adjustment posted successfully.'])
            ->response()
            ->setStatusCode(201);
    }
}
