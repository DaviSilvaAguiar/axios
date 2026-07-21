<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseReportItemAttachmentRequest;
use App\Http\Requests\StoreExpenseReportItemRequest;
use App\Http\Requests\UpdateExpenseReportItemRequest;
use App\Http\Resources\ExpenseReportItemAttachmentResource;
use App\Http\Resources\ExpenseReportItemResource;
use App\Services\ExpenseReportItemService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExpenseReportItemController extends Controller
{
    public function __construct(
        private readonly ExpenseReportItemService $service,
    ) {}

    public function store(StoreExpenseReportItemRequest $request, int $id): JsonResponse
    {
        $item = $this->service->create(
            $id,
            $request->validated(),
            $request->file('attachments') ?? [],
        );

        return ExpenseReportItemResource::make($item)
            ->additional(['message' => 'Expense added successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateExpenseReportItemRequest $request, int $id, int $itemId): JsonResponse
    {
        $item = $this->service->update($id, $itemId, $request->validated());

        return ExpenseReportItemResource::make($item)
            ->additional(['message' => 'Expense updated successfully.'])
            ->response();
    }

    public function destroy(int $id, int $itemId): JsonResponse
    {
        $this->service->delete($id, $itemId);

        return response()->json(null, 204);
    }

    public function storeAttachment(StoreExpenseReportItemAttachmentRequest $request, int $id, int $itemId): JsonResponse
    {
        $attachment = $this->service->addAttachment($id, $itemId, $request->file('attachment'));

        return ExpenseReportItemAttachmentResource::make($attachment)
            ->additional(['message' => 'Attachment added successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function serveAttachment(int $id, int $itemId, int $attachmentId): StreamedResponse
    {
        return $this->service->serveAttachment($id, $itemId, $attachmentId);
    }
}
