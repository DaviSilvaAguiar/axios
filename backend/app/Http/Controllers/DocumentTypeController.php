<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentTypeRequest;
use App\Http\Requests\UpdateDocumentTypeRequest;
use App\Services\DocumentTypeService;
use Illuminate\Http\JsonResponse;

class DocumentTypeController extends Controller
{
    public function __construct(
        private readonly DocumentTypeService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json($this->service->list());
    }

    public function show(int $id): JsonResponse
    {
        return response()->json($this->service->find($id));
    }

    public function store(StoreDocumentTypeRequest $request): JsonResponse
    {
        return response()->json($this->service->create($request->validated()), 201);
    }

    public function update(UpdateDocumentTypeRequest $request, int $id): JsonResponse
    {
        return response()->json($this->service->update($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->remove($id);

        return response()->json(null, 204);
    }
}
