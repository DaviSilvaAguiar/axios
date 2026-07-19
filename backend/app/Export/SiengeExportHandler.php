<?php

declare(strict_types=1);

namespace App\Export;

use App\Contracts\ExportHandlerInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class SiengeExportHandler implements ExportHandlerInterface
{
    public function generate(Collection $documents, int $batchId): string
    {
        $path = "exports/batch-{$batchId}.csv";

        Storage::disk('public')->put($path, $this->buildCsv($documents));

        return $path;
    }

    public function buildCsv(Collection $documents): string
    {
        $rows = [['ID', 'Description', 'Requester', 'Total', 'Items', 'Created At']];

        foreach ($documents as $document) {
            $rows[] = [
                (string) $document->id,
                (string) ($document->description ?? $document->title ?? ''),
                (string) ($document->requester_description ?? $document->requester_name ?? $document->user?->name ?? ''),
                $document->total()->toDecimalString(),
                (string) $document->items->count(),
                optional($document->created_at)?->toDateString() ?? '',
            ];
        }

        $handle = fopen('php://temp', 'r+');

        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return $csv;
    }
}
