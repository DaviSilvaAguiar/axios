<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CentroDeCusto extends Model
{
    protected $table = 'centro_custo';

    protected $fillable = [
        'descricao',
        'codigo_cc_erp',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];
}
