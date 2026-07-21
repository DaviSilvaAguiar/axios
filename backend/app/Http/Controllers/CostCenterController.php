<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreCostCenterRequest;
use App\Http\Requests\UpdateCostCenterRequest;
use App\Http\Resources\CostCenterResource;
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
        $paginator = $this->service->list($this->perPage());

        return response()->json(
            $this->paginated($paginator, CostCenterResource::collection($paginator->items())->resolve())
        );
    }

    public function store(StoreCostCenterRequest $request): JsonResponse
    {
        $costCenter = $this->service->create($request->validated());

        return CostCenterResource::make($costCenter)
            ->additional(['message' => 'Cost center created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): JsonResponse
    {
        return CostCenterResource::make($this->service->find($id))->response();
    }

    public function update(UpdateCostCenterRequest $request, int $id): JsonResponse
    {
        $costCenter = $this->service->update($id, $request->validated());

        return CostCenterResource::make($costCenter)
            ->additional(['message' => 'Cost center updated successfully.'])
            ->response();
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json(null, 204);
    }
}
