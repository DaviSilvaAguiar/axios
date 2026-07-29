<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'setting';

    protected $fillable = [
        'parameter',
        'value',
        'description',
    ];

    protected $casts = [
        'value' => 'integer',
    ];

    public const REQUIRE_ERP_CODE = 'require_erp_code';

    public static function enabled(string $parameter): bool
    {
        return (bool) static::where('parameter', $parameter)->value('value');
    }
}
