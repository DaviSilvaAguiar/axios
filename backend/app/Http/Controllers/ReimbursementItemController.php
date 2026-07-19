<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreReimbursementAttachmentRequest;
use App\Http\Requests\StoreReimbursementItemRequest;
use App\Http\Requests\UpdateReimbursementItemRequest;
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

        return response()->json([
            'message' => 'Expense added successfully.',
            'item'    => $item,
        ], 201);
    }

    public function update(UpdateReimbursementItemRequest $request, int $id, int $itemId): JsonResponse
    {
        $item = $this->service->update($id, $itemId, $request->validated());

        return response()->json([
            'message' => 'Expense updated successfully.',
            'item'    => $item,
        ]);
    }

    public function destroy(int $id, int $itemId): JsonResponse
    {
        $this->service->delete($id, $itemId);

        return response()->json([
            'message' => 'Expense deleted successfully.',
        ]);
    }

    public function serveAttachment(int $id, int $itemId): StreamedResponse
    {
        return $this->service->serveAttachment($id, $itemId);
    }

    public function destroyAttachment(int $id, int $itemId): JsonResponse
    {
        $this->service->deleteAttachment($id, $itemId);

        return response()->json([
            'message' => 'Attachment deleted successfully.',
        ]);
    }

    public function storeAttachment(StoreReimbursementAttachmentRequest $request, int $id, int $itemId): JsonResponse
    {
        $this->service->replaceAttachment($id, $itemId, $request->file('attachment'));

        return response()->json([
            'message' => 'Attachment updated successfully.',
        ]);
    }

    public function addAttachment(StoreReimbursementAttachmentRequest $request, int $id, int $itemId): JsonResponse
    {
        $attachment = $this->service->addAttachment($id, $itemId, $request->file('attachment'));

        return response()->json([
            'message' => 'Attachment added successfully.',
            'attachment' => $attachment,
        ], 201);
    }

    public function destroySpecificAttachment(int $id, int $itemId, int $attachmentId): JsonResponse
    {
        $this->service->deleteSpecificAttachment($id, $itemId, $attachmentId);

        return response()->json([
            'message' => 'Attachment deleted successfully.',
        ]);
    }

    public function serveSpecificAttachment(int $id, int $itemId, int $attachmentId): StreamedResponse
    {
        return $this->service->serveSpecificAttachment($id, $itemId, $attachmentId);
    }
}
