<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Module;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw new AuthenticationException('Invalid credentials.');
        }

        if (! $user->active) {
            throw new AuthenticationException('Inactive user.');
        }

        $user->tokens()->delete();
        $days      = ($data['remember_me'] ?? false) ? 365 : 30;
        $expiresAt = now()->addDays($days);
        $token     = $user->createToken('api', ['*'], $expiresAt)->plainTextToken;

        return [
            'token'      => $token,
            'expires_at' => $expiresAt->toISOString(),
            'user'       => $user,
            'tenant'     => tenancy()->tenant,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function me(User $user): array
    {
        return [
            'user'    => $user,
            'tenant'  => tenancy()->tenant,
            'modules' => $user->enabledModuleSlugs(),
        ];
    }
}
