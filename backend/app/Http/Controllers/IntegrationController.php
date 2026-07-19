<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\SendIntegrationRequest;
use App\Http\Requests\StoreIntegrationKeyRequest;
use App\Services\IntegrationDispatchService;
use App\Services\IntegrationService;
use Illuminate\Http\JsonResponse;

class IntegrationController extends Controller
{
    public function __construct(
        private readonly IntegrationService $service,
        private readonly IntegrationDispatchService $dispatch,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->service->list(),
        ]);
    }

    public function saveKey(StoreIntegrationKeyRequest $request, int $id): JsonResponse
    {
        $this->service->saveKey($id, $request->validated('key'));

        return response()->json([
            'message' => 'Integration key saved successfully.',
        ]);
    }

    public function send(SendIntegrationRequest $request): JsonResponse
    {
        $result = $this->dispatch->send(
            (int) auth()->id(),
            $request->validated('batch_type'),
            (int) $request->validated('integration_id'),
            (int) $request->validated('bank_account_id'),
            $request->validated('ids'),
        );

        return response()->json([
            'message' => $result['batch'] !== null
                ? "{$result['successes']} entry(ies) sent successfully."
                : 'No entries were sent successfully.',
            'data' => [
                'batch_id'  => $result['batch']?->id,
                'successes' => $result['successes'],
                'failures'  => $result['failures'],
            ],
        ], $result['batch'] !== null ? 201 : 422);
    }
}
