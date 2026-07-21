<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\SumsItemValues;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reimbursement extends Model
{
    use SumsItemValues;

    protected $table = 'reimbursement';

    public const STATUS_REQUESTED = 1;

    public const STATUS_PENDING = 2;

    public const STATUS_UNDER_REVIEW = 3;

    public const STATUS_APPROVED = 4;

    public const STATUS_PAYMENT_SCHEDULED = 5;

    public const STATUS_PAID = 6;

    public const STATUS_REJECTED = 7;

    protected $fillable = [
        'user_id',
        'cost_center_id',
        'title',
        'requester_name',
        'requester_tax_id',
        'requester_department',
        'requester_user_id',
        'notes',
        'period_start_date',
        'period_end_date',
        'status',
        'scheduled_payment_date',
        'rejection_reason',
        'data_export',
        'bank',
        'branch',
        'account_number',
        'pix_key',
        'export_batch_id',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'cost_center_id' => 'integer',
        'requester_user_id' => 'integer',
        'status' => 'integer',
        'period_start_date' => 'datetime',
        'period_end_date' => 'datetime',
        'scheduled_payment_date' => 'datetime',
        'data_export' => 'datetime',
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
        return $this->hasMany(ReimbursementItem::class, 'reimbursement_id');
    }

    public function exportBatch(): BelongsTo
    {
        return $this->belongsTo(ExportBatch::class, 'export_batch_id');
    }
}
