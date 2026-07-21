<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreExpenseCategoryRequest;
use App\Http\Requests\UpdateExpenseCategoryRequest;
use App\Http\Resources\ExpenseCategoryResource;
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
        $paginator = $this->service->list($this->perPage());

        return response()->json(
            $this->paginated($paginator, ExpenseCategoryResource::collection($paginator->items())->resolve())
        );
    }

    public function store(StoreExpenseCategoryRequest $request): JsonResponse
    {
        $category = $this->service->create($request->validated());

        return ExpenseCategoryResource::make($category)
            ->additional(['message' => 'Expense category created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): JsonResponse
    {
        return ExpenseCategoryResource::make($this->service->find($id))->response();
    }

    public function update(UpdateExpenseCategoryRequest $request, int $id): JsonResponse
    {
        $category = $this->service->update($id, $request->validated());

        return ExpenseCategoryResource::make($category)
            ->additional(['message' => 'Expense category updated successfully.'])
            ->response();
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json(null, 204);
    }
}
