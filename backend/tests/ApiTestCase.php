<?php

declare(strict_types=1);

namespace Tests;

use App\Models\CostCenter;
use App\Models\Fund;
use App\Models\Module;
use App\Models\Tenant;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Testing\TestResponse;

abstract class ApiTestCase extends TenantTestCase
{
    protected const TENANT_SLUG = 'testco';

    protected Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        config(['tenancy.bootstrappers' => []]);

        $this->tenant = Tenant::withoutEvents(fn (): Tenant => Tenant::create([
            'slug' => self::TENANT_SLUG,
            'legal_name' => 'Test Co',
            'cnpj' => '00000000000191',
            'max_users' => 50,
        ]));
    }

    protected function user(int $role, bool $active = true, ?string $email = null): User
    {
        $suffix = User::count() + 1;

        $user = User::create([
            'role' => $role,
            'name' => "User {$suffix}",
            'email' => $email ?? "user{$suffix}@test.com",
            'password' => 'secret123',
            'active' => $active,
        ]);

        foreach (Module::on('central')->pluck('id') as $moduleId) {
            UserModule::create(['user_id' => $user->id, 'module_id' => $moduleId]);
        }

        return $user->fresh();
    }

    protected function withoutModule(User $user, string $slug): User
    {
        $moduleId = Module::on('central')->where('slug', $slug)->value('id');
        UserModule::where('user_id', $user->id)->where('module_id', $moduleId)->delete();

        return $user->fresh();
    }

    protected function costCenter(string $description = 'General', string $erpCode = 'CC1'): CostCenter
    {
        return CostCenter::create([
            'description' => $description,
            'erp_code' => $erpCode,
            'active' => true,
        ]);
    }

    protected function fund(User $owner, CostCenter $costCenter, string $balance = '1000.00'): Fund
    {
        return Fund::create([
            'user_id' => $owner->id,
            'cost_center_id' => $costCenter->id,
            'description' => 'Site fund',
            'balance' => $balance,
            'type' => Fund::TYPE_CASH_PIX,
            'status' => Fund::STATUS_ACTIVE,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function callApi(User $actor, string $method, string $uri, array $data = [], ?string $tenantSlug = null): TestResponse
    {
        $this->app['auth']->forgetGuards();

        $token = $actor->createToken('test')->plainTextToken;

        return $this->withHeaders([
            'X-Account' => $tenantSlug ?? self::TENANT_SLUG,
            'Accept' => 'application/json',
            'Authorization' => "Bearer {$token}",
        ])->json($method, "/api/v1{$uri}", $data);
    }

    protected function guestApi(string $method, string $uri, array $data = []): TestResponse
    {
        return $this->withHeaders([
            'X-Account' => self::TENANT_SLUG,
            'Accept' => 'application/json',
        ])->json($method, "/api/v1{$uri}", $data);
    }
}
