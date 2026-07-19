<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\MoneyCast;
use App\Models\Concerns\ResolvesItemValue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseReportItem extends Model
{
    use ResolvesItemValue;

    protected $table = 'expense_report_item';

    protected $fillable = [
        'expense_report_id',
        'document_type_id',
        'cost_center_id',
        'expense_category_id',
        'amount',
        'description',
        'expense_date',
        'supplier_tax_id',
        'supplier_description',
        'supplier_id',
        'quantity',
        'unit',
        'unit_amount',
        'document_number',
        'document_series',
        'access_key',
        'latitude',
        'longitude',
        'address',
    ];

    protected $casts = [
        'expense_report_id'             => 'integer',
        'document_type_id'    => 'integer',
        'cost_center_id'      => 'integer',
        'expense_category_id' => 'integer',
        'supplier_id'        => 'integer',
        'expense_date'         => 'datetime',
        'amount'                => MoneyCast::class,
        'quantity'           => 'decimal:2',
        'unit_amount'       => MoneyCast::class,
        'document_number'     => 'integer',
        'document_series'      => 'integer',
        'latitude'             => 'decimal:7',
        'longitude'            => 'decimal:7',
    ];

    public function attachments(): HasMany
    {
        return $this->hasMany(ExpenseReportItemAttachment::class, 'expense_report_item_id');
    }

    public function expenseReport(): BelongsTo
    {
        return $this->belongsTo(ExpenseReport::class, 'expense_report_id');
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }

    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id');
    }

    public function expenseCategory(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }
}
