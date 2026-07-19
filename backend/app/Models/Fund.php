<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fund extends Model
{
    protected $table = 'fund';

    public const STATUS_ACTIVE   = 1;
    public const STATUS_CLOSED = 2;

    public const TYPE_DINHEIRO_PIX = 1;
    public const TYPE_CARTAO_PRE   = 2;
    public const TYPE_OUTRO        = 3;

    protected $fillable = [
        'user_id',
        'cost_center_id',
        'description',
        'balance',
        'type',
        'status',
        'bank',
        'branch',
        'account_number',
        'pix_key',
        'paid_at',
    ];

    protected $casts = [
        'balance'          => 'decimal:2',
        'type'           => 'integer',
        'status'         => 'integer',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function costCenter(): BelongsTo
    {
        return $this->belongsTo(CostCenter::class, 'cost_center_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(FundTransaction::class, 'fund_id');
    }
}
