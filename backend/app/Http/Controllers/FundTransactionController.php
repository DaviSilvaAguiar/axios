<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\PostAdjustmentRequest;
use App\Http\Requests\PostCreditRequest;
use App\Services\FundTransactionService;
use Illuminate\Http\JsonResponse;

class FundTransactionController extends Controller
{
    public function __construct(
        private readonly FundTransactionService $service,
    ) {}

    public function postCredit(PostCreditRequest $request, int $id): JsonResponse
    {
        return response()->json(
            $this->service->postCredit($id, $request->validated()),
            201,
        );
    }

    public function postAdjustment(PostAdjustmentRequest $request, int $id): JsonResponse
    {
        return response()->json(
            $this->service->postAdjustment($id, $request->validated()),
            201,
        );
    }
}
