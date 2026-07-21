<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentTypeRequest;
use App\Http\Requests\UpdateDocumentTypeRequest;
use App\Http\Resources\DocumentTypeResource;
use App\Services\DocumentTypeService;
use Illuminate\Http\JsonResponse;

class DocumentTypeController extends Controller
{
    public function __construct(
        private readonly DocumentTypeService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => DocumentTypeResource::collection($this->service->list())->resolve(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        return DocumentTypeResource::make($this->service->find($id))->response();
    }

    public function store(StoreDocumentTypeRequest $request): JsonResponse
    {
        $documentType = $this->service->create($request->validated());

        return DocumentTypeResource::make($documentType)
            ->additional(['message' => 'Document type created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateDocumentTypeRequest $request, int $id): JsonResponse
    {
        $documentType = $this->service->update($id, $request->validated());

        return DocumentTypeResource::make($documentType)
            ->additional(['message' => 'Document type updated successfully.'])
            ->response();
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->remove($id);

        return response()->json(null, 204);
    }
}
