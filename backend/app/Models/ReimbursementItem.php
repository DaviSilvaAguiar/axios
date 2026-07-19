<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReimbursementItem extends Model
{
    protected $table = 'reimbursement_item';

    protected $fillable = [
        'reimbursement_id',
        'cost_center_id',
        'description',
        'supplier_description',
        'supplier_tax_id',
        'supplier_id',
        'amount',
        'expense_date',
        'expense_category_id',
        'latitude',
        'longitude',
        'address',
    ];

    protected $casts = [
        'amount'                => 'decimal:2',
        'reimbursement_id'               => 'integer',
        'cost_center_id'      => 'integer',
        'expense_category_id' => 'integer',
        'supplier_id'        => 'integer',
        'expense_date'         => 'date',
        'latitude'             => 'decimal:7',
        'longitude'            => 'decimal:7',
    ];

    public function reimbursement(): BelongsTo
    {
        return $this->belongsTo(Reimbursement::class, 'reimbursement_id');
    }

    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id');
    }

    public function expenseCategory(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ReimbursementAttachment::class, 'reimbursement_item_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }
}
