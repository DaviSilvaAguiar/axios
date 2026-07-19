<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CostCenter extends Model
{
    protected $table = 'cost_center';

    protected $fillable = [
        'description',
        'erp_code',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
