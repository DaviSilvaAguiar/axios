<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CostCenter;
use App\Models\Tenant;
use App\Models\User;
use Tests\ApiTestCase;

class TenantIsolationTest extends ApiTestCase
{
    public function test_request_without_the_tenant_header_is_rejected(): void
    {
        $user = $this->user(User::ROLE_ADMIN);
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeaders([
            'Accept' => 'application/json',
            'Authorization' => "Bearer {$token}",
        ])->json('GET', '/api/v1/cost-center')
            ->assertStatus(400)
            ->assertJson(['message' => 'Company not found']);
    }

    public function test_request_with_an_unknown_tenant_is_rejected(): void
    {
        $user = $this->user(User::ROLE_ADMIN);

        $this->callApi($user, 'GET', '/cost-center', [], 'does-not-exist')
            ->assertNotFound()
            ->assertJson(['message' => 'Company not found.']);
    }

    public function test_tenant_resolution_is_driven_by_the_header_not_by_the_token(): void
    {
        Tenant::withoutEvents(fn (): Tenant => Tenant::create([
            'slug' => 'othertenant',
            'legal_name' => 'Other Co',
            'cnpj' => '00000000000272',
            'max_users' => 5,
        ]));

        $user = $this->user(User::ROLE_ADMIN);
        $this->costCenter('Only in test co', 'ISO1');

        $this->callApi($user, 'GET', '/cost-center')->assertOk();

        $this->assertDatabaseHas('cost_center', ['description' => 'Only in test co']);
    }

    public function test_record_from_another_tenant_is_not_reachable_by_id(): void
    {
        $user = $this->user(User::ROLE_ADMIN);

        $this->callApi($user, 'GET', '/cost-center/999999')->assertNotFound();
    }

    public function test_listing_only_returns_records_of_the_active_tenant(): void
    {
        $user = $this->user(User::ROLE_ADMIN);
        $this->costCenter('Alpha', 'A1');
        $this->costCenter('Beta', 'B1');

        $response = $this->callApi($user, 'GET', '/cost-center')->assertOk();

        $descriptions = array_column($response->json('data'), 'description');

        $this->assertEqualsCanonicalizing(['Alpha', 'Beta'], $descriptions);
        $this->assertSame(2, CostCenter::count());
    }
}
