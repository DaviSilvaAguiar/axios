<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExpenseReport;
use App\Models\Fund;
use App\Models\CostCenter;
use App\Models\ReimbursementItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CostCenterService
{
    public function list(int $perPage): LengthAwarePaginator
    {
        return CostCenter::orderBy('description')->paginate($perPage);
    }

    public function find(int $id): CostCenter
    {
        return CostCenter::findOrFail($id);
    }

    public function create(array $data): CostCenter
    {
        $data['active'] = $data['active'] ?? true;

        return CostCenter::create($data);
    }

    public function update(int $id, array $data): CostCenter
    {
        $costCenter = CostCenter::findOrFail($id);
        $costCenter->update($data);

        return $costCenter->fresh();
    }

    public function delete(int $id): void
    {
        CostCenter::findOrFail($id);

        $linked =
            ReimbursementItem::where('cost_center_id', $id)->exists() ||
            ExpenseReport::where('cost_center_id', $id)->exists() ||
            Fund::where('cost_center_id', $id)->exists();

        if ($linked) {
            abort(409, 'This cost center is linked to existing records and cannot be removed.');
        }

        CostCenter::destroy($id);
    }
}
