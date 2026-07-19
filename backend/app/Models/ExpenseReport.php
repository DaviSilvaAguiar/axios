<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseReport extends Model
{
    protected $table = 'expense_report';

    public const STATUS_DRAFT           = 1;
    public const STATUS_PENDING           = 2;
    public const STATUS_UNDER_REVIEW         = 3;
    public const STATUS_APPROVED           = 4;
    public const STATUS_PAYMENT_SCHEDULED = 5;
    public const STATUS_PAID               = 6;
    public const STATUS_REJECTED          = 7;

    protected $fillable = [
        'user_id',
        'cost_center_id',
        'description',
        'status',
        'rejection_reason',
        'needed_at',
        'period_start_date',
        'period_end_date',
        'notes',
        'bank',
        'branch',
        'account_number',
        'pix_key',
        'requester_description',
        'requester_department',
        'requester_tax_id',
        'requester_user_id',
        'data_export',
        'paid_at',
        'export_batch_id',
    ];

    protected $casts = [
        'user_id'              => 'integer',
        'cost_center_id'         => 'integer',
        'requester_user_id' => 'integer',
        'export_batch_id'      => 'integer',
        'status'                  => 'integer',
        'needed_at'        => 'datetime',
        'period_start_date'     => 'datetime',
        'period_end_date'        => 'datetime',
        'data_export'         => 'datetime',
        'paid_at'          => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function requesterUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_user_id');
    }

    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ExpenseReportItem::class, 'expense_report_id');
    }

    public function exportBatch(): BelongsTo
    {
        return $this->belongsTo(ExportBatch::class, 'export_batch_id');
    }
}
