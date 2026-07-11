<?php

declare(strict_types=1);

namespace App\Contracts;

use Illuminate\Support\Collection;

interface ExportHandlerInterface
{
    /**
     * @param Collection $documentos Coleção de Caixa ou Rcm com despesas e relações eager-loaded
     * @param int $loteId
     * @return string Caminho do arquivo gerado
     */
    public function generate(Collection $documentos, int $loteId): string;
}
