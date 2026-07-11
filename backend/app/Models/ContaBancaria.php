<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContaBancaria extends Model
{
    protected $table = 'conta_bancaria';

    protected $fillable = [
        'descricao',
        'codigo_erp',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];
}
