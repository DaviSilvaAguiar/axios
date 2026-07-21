<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ApproveExpenseReportRequest;
use App\Http\Requests\StoreExpenseReportRequest;
use App\Http\Requests\UpdateExpenseReportRequest;
use App\Http\Resources\ExpenseReportResource;
use App\Services\ExpenseReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ExpenseReportController extends Controller
{
    public function __construct(
        private readonly ExpenseReportService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => ExpenseReportResource::collection($this->service->list())->resolve(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        return ExpenseReportResource::make($this->service->find($id))->response();
    }

    public function store(StoreExpenseReportRequest $request): JsonResponse
    {
        $expenseReport = $this->service->create($request->validated());

        return ExpenseReportResource::make($expenseReport)
            ->additional(['message' => 'Expense report created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateExpenseReportRequest $request, int $id): JsonResponse
    {
        $expenseReport = $this->service->update($id, $request->validated());

        return ExpenseReportResource::make($expenseReport)
            ->additional(['message' => 'Expense report updated successfully.'])
            ->response();
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->remove($id);

        return response()->json(null, 204);
    }

    public function approve(ApproveExpenseReportRequest $request, int $id): JsonResponse
    {
        $expenseReport = $this->service->approve($id, (int) $request->validated()['fund_id']);

        return ExpenseReportResource::make($expenseReport)
            ->additional(['message' => 'Expense report approved successfully.'])
            ->response();
    }

    public function generatePdf(int $id): Response
    {
        return $this->service->generatePdf($id);
    }
}
