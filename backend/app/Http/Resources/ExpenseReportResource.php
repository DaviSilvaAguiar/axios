<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ExpenseReport;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ExpenseReport
 */
class ExpenseReportResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'cost_center_id' => $this->cost_center_id,
            'description' => $this->description,
            'status' => $this->status,
            'needed_at' => $this->needed_at,
            'period_start_date' => $this->period_start_date,
            'period_end_date' => $this->period_end_date,
            'notes' => $this->notes,
            'bank' => $this->bank,
            'branch' => $this->branch,
            'account_number' => $this->account_number,
            'pix_key' => $this->pix_key,
            'requester_description' => $this->requester_description,
            'requester_department' => $this->requester_department,
            'requester_tax_id' => $this->requester_tax_id,
            'requester_user_id' => $this->requester_user_id,
            'requester_user' => $this->whenLoaded('requesterUser'),
            'exported_at' => $this->data_export,
            'paid_at' => $this->paid_at,
            'rejection_reason' => $this->rejection_reason,
            'cost_center' => $this->whenLoaded('costCenter'),
            'items' => ExpenseReportItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
