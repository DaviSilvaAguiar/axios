<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateConfigRequest;
use App\Services\ConfigService;
use Illuminate\Http\JsonResponse;

class ConfigController extends Controller
{
    /**
     * @param ConfigService $service
     */
    public function __construct(
        private readonly ConfigService $service,
    ) {}

    /**
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        return response()->json($this->service->listar());
    }

    /**
     * @param UpdateConfigRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateConfigRequest $request, int $id): JsonResponse
    {
        return response()->json($this->service->atualizar($id, $request->validated()));
    }
}
