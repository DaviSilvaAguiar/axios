<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeadRequest;
use App\Services\LeadService;
use Illuminate\Http\JsonResponse;

class LeadController extends Controller
{
    public function __construct(
        private readonly LeadService $service,
    ) {}

    public function store(StoreLeadRequest $request): JsonResponse
    {
        $data = $request->validated();

        $lead = $this->service->register($data);

        return response()->json([
            'message' => 'Demo requested successfully.',
            'lead'     => $lead,
        ], 201);
    }
}
