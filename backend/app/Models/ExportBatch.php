<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\MoneyCast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExportBatch extends Model
{
    public const TYPE_EXPENSE_REPORT = 'EXPENSE_REPORT';

    public const TYPE_REIMBURSEMENT = 'REIMBURSEMENT';

    protected $table = 'export_batch';

    protected $fillable = [
        'user_id',
        'batch_type',
        'template_used',
        'total_amount',
        'item_count',
        'file_name',
        'file_path',
    ];

    protected $casts = [
        'total_amount' => MoneyCast::class,
        'item_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function expenseReports(): HasMany
    {
        return $this->hasMany(ExpenseReport::class, 'export_batch_id');
    }

    public function reimbursements(): HasMany
    {
        return $this->hasMany(Reimbursement::class, 'export_batch_id');
    }
}
