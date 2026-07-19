<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserModule extends Model
{
    protected $table = 'user_module';

    protected $fillable = [
        'user_id',
        'module_id',
    ];
}
