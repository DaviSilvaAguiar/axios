<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpenseReportItemAttachment extends Model
{
    protected $table = 'expense_report_item_attachment';

    protected $fillable = [
        'expense_report_item_id',
        'path',
    ];

    public function expenseReportItem(): BelongsTo
    {
        return $this->belongsTo(ExpenseReportItem::class, 'expense_report_item_id');
    }
}
