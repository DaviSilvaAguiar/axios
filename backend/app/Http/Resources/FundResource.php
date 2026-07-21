<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Fund;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Fund
 */
class FundResource extends JsonResource
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
            'balance' => $this->balance,
            'type' => $this->type,
            'status' => $this->status,
            'bank' => $this->bank,
            'branch' => $this->branch,
            'account_number' => $this->account_number,
            'pix_key' => $this->pix_key,
            'paid_at' => $this->paid_at,
            'user' => $this->whenLoaded('user'),
            'cost_center' => $this->whenLoaded('costCenter'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
