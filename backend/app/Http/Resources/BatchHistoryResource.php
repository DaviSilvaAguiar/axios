<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ExportBatch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ExportBatch
 */
class BatchHistoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'batch_type' => $this->batch_type,
            'template_used' => $this->template_used,
            'total_amount' => $this->total_amount,
            'item_count' => $this->item_count,
            'file_name' => $this->file_name,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'role' => $this->user->role,
            ] : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
