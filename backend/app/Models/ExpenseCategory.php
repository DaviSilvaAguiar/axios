<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseCategory extends Model
{
    protected $table = 'expense_category';

    protected $fillable = [
        'description',
        'erp_code',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
