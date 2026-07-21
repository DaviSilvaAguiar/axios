<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Reimbursement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Reimbursement
 */
class ReimbursementResource extends JsonResource
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
            'cost_center' => $this->whenLoaded('costCenter', fn (): CostCenterResource => new CostCenterResource($this->costCenter)),
            'title' => $this->title,
            'requester_name' => $this->requester_name,
            'requester_tax_id' => $this->requester_tax_id,
            'requester_department' => $this->requester_department,
            'requester_user_id' => $this->requester_user_id,
            'notes' => $this->notes,
            'requester_user' => $this->whenLoaded('requesterUser', fn (): array => [
                'id' => $this->requesterUser->id,
                'name' => $this->requesterUser->name,
                'role' => $this->requesterUser->role,
                'erp_code' => $this->requesterUser->erp_code,
            ]),
            'period_start_date' => $this->period_start_date,
            'period_end_date' => $this->period_end_date,
            'status' => $this->status,
            'scheduled_payment_date' => $this->scheduled_payment_date,
            'rejection_reason' => $this->rejection_reason,
            'exported_at' => $this->data_export,
            'export_batch_id' => $this->export_batch_id,
            'bank' => $this->bank,
            'branch' => $this->branch,
            'account_number' => $this->account_number,
            'pix_key' => $this->pix_key,
            'user' => $this->whenLoaded('user', fn (): array => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'role' => $this->user->role,
                'erp_code' => $this->user->erp_code,
            ]),
            'items' => ReimbursementItemResource::collection($this->whenLoaded('items')),
            'lote_exportacao' => $this->whenLoaded('exportBatch', fn (): array => [
                'id' => $this->exportBatch->id,
                'created_at' => $this->exportBatch->created_at,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
