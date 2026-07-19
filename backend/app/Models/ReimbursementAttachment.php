<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReimbursementAttachment extends Model
{
    protected $table = 'reimbursement_attachment';

    protected $fillable = [
        'reimbursement_item_id',
        'path',
    ];

    public function reimbursementItem(): BelongsTo
    {
        return $this->belongsTo(ReimbursementItem::class, 'reimbursement_item_id');
    }
}
