<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ExpenseReportItemAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ExpenseReportItemAttachment
 */
class ExpenseReportItemAttachmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'expense_report_id_item' => $this->expense_report_item_id,
            'path' => $this->path,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
