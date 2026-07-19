<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $table = 'supplier';

    protected $fillable = [
        'description',
        'tax_id',
        'person_type',
        'email',
        'phone',
        'postal_code',
        'street',
        'number',
        'complement',
        'district',
        'city',
        'uf',
        'erp_code',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
