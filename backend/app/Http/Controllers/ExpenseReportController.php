<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ApproveExpenseReportRequest;
use App\Http\Requests\StoreExpenseReportRequest;
use App\Http\Requests\UpdateExpenseReportRequest;
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
        return response()->json($this->service->list());
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->service->find($id));
    }

    public function store(StoreExpenseReportRequest $request): JsonResponse
    {
        return response()->json($this->service->create($request->validated()), 201);
    }

    public function update(UpdateExpenseReportRequest $request, int $id): JsonResponse
    {
        return response()->json($this->service->update($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->remove($id);

        return response()->json(null, 204);
    }

    public function approve(ApproveExpenseReportRequest $request, int $id): JsonResponse
    {
        $expenseReport = $this->service->approve($id, (int) $request->validated()['fund_id']);

        return response()->json($expenseReport);
    }

    public function generatePdf(int $id): Response
    {
        return $this->service->generatePdf($id);
    }
}
