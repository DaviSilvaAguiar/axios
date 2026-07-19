<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\SupplierRequest;
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
        return response()->json(
            $this->paginated($this->service->list($this->perPage()))
        );
    }

    public function store(SupplierRequest $request): JsonResponse
    {
        $supplier = $this->service->create($request->validated());

        return response()->json([
            'message'   => 'Supplier created successfully.',
            'supplier' => $supplier,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json([
            'supplier' => $this->service->find($id),
        ]);
    }

    public function update(SupplierRequest $request, int $id): JsonResponse
    {
        $supplier = $this->service->update($id, $request->validated());

        return response()->json([
            'message'   => 'Supplier updated successfully.',
            'supplier' => $supplier,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Supplier deleted successfully.',
        ]);
    }
}
