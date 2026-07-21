<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ReimbursementItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ReimbursementItem
 */
class ReimbursementItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reimbursement_id' => $this->reimbursement_id,
            'cost_center_id' => $this->cost_center_id,
            'description' => $this->description,
            'amount' => $this->amount,
            'expense_date' => $this->expense_date,
            'expense_category_id' => $this->expense_category_id,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'address' => $this->address,
            'description_supplier' => $this->supplier_description,
            'supplier_tax_id' => $this->supplier_tax_id,
            'supplier_id' => $this->supplier_id,
            'supplier' => $this->whenLoaded('supplier', fn (): SupplierResource => new SupplierResource($this->supplier)),
            'expense_category' => $this->whenLoaded('expenseCategory', fn (): ExpenseCategoryResource => new ExpenseCategoryResource($this->expenseCategory)),
            'cost_center' => $this->whenLoaded('costCenter', fn (): CostCenterResource => new CostCenterResource($this->costCenter)),
            'attachments' => ReimbursementAttachmentResource::collection($this->whenLoaded('attachments')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
