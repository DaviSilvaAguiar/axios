<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Config extends Model
{
    protected $table = 'config';

    protected $fillable = [
        'parametro',
        'valor',
        'descricao',
    ];

    protected $casts = [
        'valor' => 'integer',
    ];
}
