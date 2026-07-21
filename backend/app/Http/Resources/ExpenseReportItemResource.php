<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ExpenseReportItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ExpenseReportItem
 */
class ExpenseReportItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'expense_report_id' => $this->expense_report_id,
            'cost_center_id' => $this->cost_center_id,
            'expense_category_id' => $this->expense_category_id,
            'description' => $this->description,
            'amount' => $this->amount,
            'expense_date' => $this->expense_date,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'address' => $this->address,
            'description_supplier' => $this->supplier_description,
            'supplier_tax_id' => $this->supplier_tax_id,
            'supplier_id' => $this->supplier_id,
            'supplier' => $this->whenLoaded('supplier'),
            'cost_center' => $this->whenLoaded('costCenter'),
            'expense_category' => $this->whenLoaded('expenseCategory'),
            'attachments' => ExpenseReportItemAttachmentResource::collection($this->whenLoaded('attachments')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
