<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreReimbursementRequest;
use App\Http\Requests\UpdateReimbursementRequest;
use App\Http\Requests\UpdateReimbursementStatusRequest;
use App\Http\Resources\ReimbursementResource;
use App\Services\ReimbursementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReimbursementController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly ReimbursementService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->service->list(
            auth()->user(),
            $this->perPage(),
            $request->only(['employee', 'status', 'startDate', 'endDate'])
        );

        return response()->json(
            $this->paginated($paginator, ReimbursementResource::collection($paginator->items())->resolve())
        );
    }

    public function store(StoreReimbursementRequest $request): JsonResponse
    {
        $reimbursement = $this->service->create($request->validated(), auth()->id());

        return ReimbursementResource::make($reimbursement)
            ->additional(['message' => 'Reimbursement created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): JsonResponse
    {
        return ReimbursementResource::make($this->service->find($id))->response();
    }

    public function update(UpdateReimbursementRequest $request, int $id): JsonResponse
    {
        $reimbursement = $this->service->update($id, $request->validated());

        return ReimbursementResource::make($reimbursement)
            ->additional(['message' => 'Reimbursement updated successfully.'])
            ->response();
    }

    public function updateStatus(UpdateReimbursementStatusRequest $request, int $id): JsonResponse
    {
        $reimbursement = $this->service->updateStatus($id, $request->validated());

        return ReimbursementResource::make($reimbursement)
            ->additional(['message' => 'Reimbursement status updated successfully.'])
            ->response();
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json(null, 204);
    }

    public function generatePdf(int $id): Response
    {
        return $this->service->generatePdf($id);
    }
}
