<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingRequest;
use App\Http\Resources\SettingResource;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct(
        private readonly SettingService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => SettingResource::collection($this->service->list())->resolve()]);
    }

    public function update(UpdateSettingRequest $request, int $id): JsonResponse
    {
        $setting = $this->service->update($id, $request->validated());

        return SettingResource::make($setting)
            ->additional(['message' => 'Setting updated successfully.'])
            ->response();
    }
}
