<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SupplierService
{
    public function list(int $perPage): LengthAwarePaginator
    {
        return Supplier::orderBy('description')->paginate($perPage);
    }

    public function find(int $id): Supplier
    {
        return Supplier::findOrFail($id);
    }

    public function create(array $data): Supplier
    {
        $data['tax_id'] = preg_replace('/\D/', '', (string) ($data['tax_id'] ?? '')) ?? '';
        $data['active']    = $data['active'] ?? true;

        return Supplier::create($data);
    }

    public function update(int $id, array $data): Supplier
    {
        if (array_key_exists('tax_id', $data)) {
            $data['tax_id'] = preg_replace('/\D/', '', (string) $data['tax_id']) ?? '';
        }

        $supplier = Supplier::findOrFail($id);
        $supplier->update($data);

        return $supplier->fresh();
    }

    public function delete(int $id): void
    {
        Supplier::findOrFail($id);

        Supplier::destroy($id);
    }
}
