<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreExpenseCategoryRequest;
use App\Http\Requests\UpdateExpenseCategoryRequest;
use App\Services\ExpenseCategoryService;
use Illuminate\Http\JsonResponse;

class ExpenseCategoryController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly ExpenseCategoryService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(
            $this->paginated($this->service->list($this->perPage()))
        );
    }

    public function store(StoreExpenseCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        $category = $this->service->create($data);

        return response()->json([
            'message'           => 'Expense category created successfully.',
            'expense_category'  => $category,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json([
            'expense_category' => $this->service->find($id),
        ]);
    }

    public function update(UpdateExpenseCategoryRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();

        $category = $this->service->update($id, $data);

        return response()->json([
            'message'           => 'Expense category updated successfully.',
            'expense_category'  => $category,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Expense category deleted successfully.',
        ]);
    }
}
