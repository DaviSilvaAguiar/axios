<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegracaoChave extends Model
{
    protected $table = 'integracao_chave';

    protected $fillable = [
        'id_integracao',
        'chave',
    ];

    protected $casts = [
        'id_integracao' => 'integer',
        'chave'         => 'encrypted',
    ];
}
