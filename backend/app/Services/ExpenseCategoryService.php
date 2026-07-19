<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExpenseCategory;
use App\Models\ReimbursementItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExpenseCategoryService
{
    public function list(int $perPage): LengthAwarePaginator
    {
        return ExpenseCategory::orderBy('description')->paginate($perPage);
    }

    public function find(int $id): ExpenseCategory
    {
        return ExpenseCategory::findOrFail($id);
    }

    public function create(array $data): ExpenseCategory
    {
        $data['active'] = $data['active'] ?? true;

        return ExpenseCategory::create($data);
    }

    public function update(int $id, array $data): ExpenseCategory
    {
        $category = ExpenseCategory::findOrFail($id);
        $category->update($data);

        return $category->fresh();
    }

    public function delete(int $id): void
    {
        ExpenseCategory::findOrFail($id);

        if (ReimbursementItem::where('expense_category_id', $id)->exists()) {
            abort(409, 'This category is linked to existing records and cannot be removed.');
        }

        ExpenseCategory::destroy($id);
    }
}
