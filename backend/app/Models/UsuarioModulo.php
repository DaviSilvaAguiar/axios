<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsuarioModulo extends Model
{
    protected $table = 'usuario_modulo';

    protected $fillable = [
        'id_usuario',
        'id_modulo',
    ];
}
