<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CategoriaDespesa extends Model
{
    protected $table = 'categoria_despesa';

    protected $fillable = [
        'descricao',
        'codigo_erp',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];
}
