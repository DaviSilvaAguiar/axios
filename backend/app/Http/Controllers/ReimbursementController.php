<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreReimbursementRequest;
use App\Http\Requests\UpdateReimbursementRequest;
use App\Http\Requests\UpdateReimbursementStatusRequest;
use App\Services\ReimbursementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Http\Request;

class ReimbursementController extends Controller
{
    use Paginates;
    public function __construct(
        private readonly ReimbursementService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->paginated(
                $this->service->list(
                    auth()->user(),
                    $this->perPage(),
                    $request->only(['employee', 'status', 'startDate', 'endDate'])
                )
            )
        );
    }

    public function store(StoreReimbursementRequest $request): JsonResponse
    {
        $reimbursement = $this->service->create($request->validated(), auth()->id());

        return response()->json([
            'message' => 'Reimbursement created successfully.',
            'reimbursement' => $reimbursement,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json([
            'message' => 'Reimbursement found.',
            'reimbursement' => $this->service->find($id),
        ]);
    }

    public function update(UpdateReimbursementRequest $request, int $id): JsonResponse
    {
        $reimbursement = $this->service->update($id, $request->validated());

        return response()->json([
            'message' => 'Reimbursement updated successfully.',
            'reimbursement' => $reimbursement,
        ]);
    }

    public function updateStatus(UpdateReimbursementStatusRequest $request, int $id): JsonResponse
    {
        $reimbursement = $this->service->updateStatus($id, $request->validated());

        return response()->json([
            'message' => 'Reimbursement status updated successfully.',
            'reimbursement' => $reimbursement,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Reimbursement deleted successfully.',
        ]);
    }

    public function generatePdf(int $id): Response
    {
        return $this->service->generatePdf($id);
    }
}
