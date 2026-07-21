<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\GenerateExportBatchRequest;
use App\Http\Resources\BatchHistoryResource;
use App\Services\ExportBatchService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportBatchController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly ExportBatchService $exportService
    ) {}

    public function export(GenerateExportBatchRequest $request): JsonResponse
    {
        $batch = $this->exportService->generateBatch(
            (int) auth()->id(),
            $request->validated('batch_type'),
            $request->validated('template'),
            $request->validated('ids')
        );

        return response()->json([
            'message' => 'Export file generated successfully!',
            'data' => [
                'batch_id' => $batch->id,
                'total_amount' => $batch->total_amount,
                'file_name' => $batch->file_name,
                'download_url' => "/v1/export/lotes/{$batch->id}/download",
            ],
        ], 201);
    }

    public function pendingExpenseReports(): JsonResponse
    {
        $result = $this->exportService->getPendingExpenseReports($this->perPage());

        return response()->json(
            $this->paginated($result['paginator'], $result['items'])
        );
    }

    public function pendingReimbursements(): JsonResponse
    {
        $result = $this->exportService->getPendingReimbursements($this->perPage());

        return response()->json(
            $this->paginated($result['paginator'], $result['items'])
        );
    }

    public function pendingStats(): JsonResponse
    {
        return response()->json([
            'data' => $this->exportService->getPendingStats(),
        ]);
    }

    public function history(): JsonResponse
    {
        $paginator = $this->exportService->getHistory($this->perPage());

        return response()->json(
            $this->paginated($paginator, BatchHistoryResource::collection($paginator->items())->resolve())
        );
    }

    public function templates(): JsonResponse
    {
        return response()->json([
            'data' => $this->exportService->getTemplates(),
        ]);
    }

    public function download(int $id): StreamedResponse
    {
        return $this->exportService->downloadBatchFile($id);
    }
}
