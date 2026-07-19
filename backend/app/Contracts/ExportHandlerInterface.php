<?php

declare(strict_types=1);

namespace App\Contracts;

use Illuminate\Support\Collection;

interface ExportHandlerInterface
{
    public function generate(Collection $documents, int $batchId): string;
}
