<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ReimbursementAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ReimbursementAttachment
 */
class ReimbursementAttachmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reimbursement_item_id' => $this->reimbursement_item_id,
            'path' => $this->path,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
