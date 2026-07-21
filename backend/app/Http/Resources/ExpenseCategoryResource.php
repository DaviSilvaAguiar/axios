<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ExpenseCategory
 */
class ExpenseCategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'erp_code' => $this->erp_code,
            'active' => $this->active,
        ];
    }
}
