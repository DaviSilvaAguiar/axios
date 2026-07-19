<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    protected $table = 'bank_account';

    protected $fillable = [
        'description',
        'erp_code',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
