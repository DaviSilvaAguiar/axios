<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreReimbursementAttachmentRequest;
use App\Http\Requests\StoreReimbursementItemRequest;
use App\Http\Requests\UpdateReimbursementItemRequest;
use App\Http\Resources\ReimbursementAttachmentResource;
use App\Http\Resources\ReimbursementItemResource;
use App\Services\ReimbursementItemService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReimbursementItemController extends Controller
{
    public function __construct(
        private readonly ReimbursementItemService $service,
    ) {}

    public function store(StoreReimbursementItemRequest $request, int $id): JsonResponse
    {
        $item = $this->service->create(
            $id,
            $request->validated(),
            $request->file('attachments') ?? [],
        );

        return ReimbursementItemResource::make($item)
            ->additional(['message' => 'Expense added successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateReimbursementItemRequest $request, int $id, int $itemId): JsonResponse
    {
        $item = $this->service->update($id, $itemId, $request->validated());

        return ReimbursementItemResource::make($item)
            ->additional(['message' => 'Expense updated successfully.'])
            ->response();
    }

    public function destroy(int $id, int $itemId): JsonResponse
    {
        $this->service->delete($id, $itemId);

        return response()->json(null, 204);
    }

    public function serveAttachment(int $id, int $itemId): StreamedResponse
    {
        return $this->service->serveAttachment($id, $itemId);
    }

    public function destroyAttachment(int $id, int $itemId): JsonResponse
    {
        $this->service->deleteAttachment($id, $itemId);

        return response()->json(null, 204);
    }

    public function storeAttachment(StoreReimbursementAttachmentRequest $request, int $id, int $itemId): JsonResponse
    {
        $attachment = $this->service->replaceAttachment($id, $itemId, $request->file('attachment'));

        return ReimbursementAttachmentResource::make($attachment)
            ->additional(['message' => 'Attachment updated successfully.'])
            ->response();
    }

    public function addAttachment(StoreReimbursementAttachmentRequest $request, int $id, int $itemId): JsonResponse
    {
        $attachment = $this->service->addAttachment($id, $itemId, $request->file('attachment'));

        return ReimbursementAttachmentResource::make($attachment)
            ->additional(['message' => 'Attachment added successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function destroySpecificAttachment(int $id, int $itemId, int $attachmentId): JsonResponse
    {
        $this->service->deleteSpecificAttachment($id, $itemId, $attachmentId);

        return response()->json(null, 204);
    }

    public function serveSpecificAttachment(int $id, int $itemId, int $attachmentId): StreamedResponse
    {
        return $this->service->serveSpecificAttachment($id, $itemId, $attachmentId);
    }
}
