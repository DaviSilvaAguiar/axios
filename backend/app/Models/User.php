<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'user';

    public const ROLE_ADMIN = 1;

    public const ROLE_AUDITOR = 2;

    public const ROLE_PROVIDER = 3;

    protected $fillable = [
        'role',
        'name',
        'email',
        'password',
        'active',
        'erp_code',
        'tax_id',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'role' => 'integer',
        'password' => 'hashed',
        'active' => 'boolean',
    ];

    public function getAuthPasswordName(): string
    {
        return 'password';
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isAuditor(): bool
    {
        return $this->role === self::ROLE_AUDITOR;
    }

    public function hasModule(string $slug): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $module = Module::where('slug', $slug)->where('active', true)->first();

        if (! $module) {
            return false;
        }

        return UserModule::where('user_id', $this->id)
            ->where('module_id', $module->id)
            ->exists();
    }

    public function enabledModuleSlugs(): array
    {
        if ($this->isAdmin()) {
            return Module::where('active', true)->pluck('slug')->all();
        }

        $idModules = UserModule::where('user_id', $this->id)->pluck('module_id');

        return Module::whereIn('id', $idModules)->where('active', true)->pluck('slug')->all();
    }
}
