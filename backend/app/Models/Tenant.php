<?php

declare(strict_types=1);

namespace App\Models;

use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase;

    protected $keyType = 'int';

    public $incrementing = true;

    public static function getCustomColumns(): array
    {
        return ['id', 'slug', 'legal_name', 'trade_name', 'cnpj', 'ie', 'address', 'postal_code', 'number', 'ibge_code', 'uf', 'mrr', 'max_users'];
    }
}
