<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\DocumentType;
use Illuminate\Database\Eloquent\Collection;

class DocumentTypeService
{
    public function list(): Collection
    {
        return DocumentType::orderBy('description')->get();
    }

    public function find(int $id): DocumentType
    {
        return DocumentType::findOrFail($id);
    }

    public function create(array $data): DocumentType
    {
        return DocumentType::create($data);
    }

    public function update(int $id, array $data): DocumentType
    {
        $documentType = DocumentType::findOrFail($id);
        $documentType->update($data);

        return $documentType;
    }

    public function remove(int $id): void
    {
        DocumentType::findOrFail($id)->delete();
    }
}
