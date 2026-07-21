<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntegrationKey extends Model
{
    protected $table = 'integration_key';

    protected $fillable = [
        'integration_id',
        'key',
    ];

    protected $casts = [
        'integration_id' => 'integer',
        'key' => 'encrypted',
    ];
}
