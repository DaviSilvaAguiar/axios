<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\FundTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin FundTransaction
 */
class FundTransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'fund_id' => $this->fund_id,
            'expense_report_id' => $this->expense_report_id,
            'transaction_type' => $this->transaction_type,
            'subtype' => $this->subtype,
            'amount' => $this->amount,
            'notes' => $this->notes,
            'reason' => $this->reason,
            'transaction_date' => $this->transaction_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
