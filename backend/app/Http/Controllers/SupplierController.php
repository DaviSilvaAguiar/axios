<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\SupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Services\SupplierService;
use Illuminate\Http\JsonResponse;

class SupplierController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly SupplierService $service,
    ) {}

    public function index(): JsonResponse
    {
        $paginator = $this->service->list($this->perPage());

        return response()->json(
            $this->paginated($paginator, SupplierResource::collection($paginator->items())->resolve())
        );
    }

    public function store(SupplierRequest $request): JsonResponse
    {
        $supplier = $this->service->create($request->validated());

        return SupplierResource::make($supplier)
            ->additional(['message' => 'Supplier created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): JsonResponse
    {
        return SupplierResource::make($this->service->find($id))->response();
    }

    public function update(SupplierRequest $request, int $id): JsonResponse
    {
        $supplier = $this->service->update($id, $request->validated());

        return SupplierResource::make($supplier)
            ->additional(['message' => 'Supplier updated successfully.'])
            ->response();
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json(null, 204);
    }
}
