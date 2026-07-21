<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeadRequest;
use App\Http\Resources\LeadResource;
use App\Services\LeadService;
use Illuminate\Http\JsonResponse;

class LeadController extends Controller
{
    public function __construct(
        private readonly LeadService $service,
    ) {}

    public function store(StoreLeadRequest $request): JsonResponse
    {
        $lead = $this->service->register($request->validated());

        return LeadResource::make($lead)
            ->additional(['message' => 'Demo requested successfully.'])
            ->response()
            ->setStatusCode(201);
    }
}
