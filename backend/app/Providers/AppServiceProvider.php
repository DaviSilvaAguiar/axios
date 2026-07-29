<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;
use Stancl\Tenancy\DatabaseConfig;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        DatabaseConfig::generateDatabaseNamesUsing(function (Tenant $tenant): string {
            return config('tenancy.database.prefix').$tenant->slug.config('tenancy.database.suffix');
        });

        Sanctum::authenticateAccessTokensUsing(function ($accessToken, bool $isValid): bool {
            $tokenable = $accessToken->tokenable;

            if ($tokenable instanceof User && ! $tokenable->active) {
                return false;
            }

            return $isValid;
        });
    }
}
