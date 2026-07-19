<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreCostCenterRequest;
use App\Http\Requests\UpdateCostCenterRequest;
use App\Services\CostCenterService;
use Illuminate\Http\JsonResponse;

class CostCenterController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly CostCenterService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(
            $this->paginated($this->service->list($this->perPage()))
        );
    }

    public function store(StoreCostCenterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $costCenter = $this->service->create($data);

        return response()->json([
            'message'      => 'Cost center created successfully.',
            'cost_center'  => $costCenter,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json([
            'cost_center' => $this->service->find($id),
        ]);
    }

    public function update(UpdateCostCenterRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();

        $costCenter = $this->service->update($id, $data);

        return response()->json([
            'message'      => 'Cost center updated successfully.',
            'cost_center'  => $costCenter,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Cost center deleted successfully.',
        ]);
    }
}
