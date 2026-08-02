<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FundTransaction extends Model
{
    protected $table = 'fund_transaction';

    public const TYPE_CREDIT = 1;

    public const TYPE_DEBIT = 2;

    public const SUBTYPE_ADVANCE = 1;

    public const SUBTYPE_EXPENSE_REPORT_CHARGE = 2;

    public const SUBTYPE_REFUND = 3;

    public const SUBTYPE_POSITIVE_ADJUSTMENT = 4;

    public const SUBTYPE_NEGATIVE_ADJUSTMENT = 5;

    protected $fillable = [
        'user_id',
        'fund_id',
        'expense_report_id',
        'transaction_type',
        'subtype',
        'amount',
        'notes',
        'reason',
        'transaction_date',
    ];

    protected $casts = [
        'transaction_type' => 'integer',
        'subtype' => 'integer',
        'amount' => MoneyCast::class,
        'transaction_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class, 'fund_id');
    }

    public function expenseReport(): BelongsTo
    {
        return $this->belongsTo(ExpenseReport::class, 'expense_report_id');
    }
}
