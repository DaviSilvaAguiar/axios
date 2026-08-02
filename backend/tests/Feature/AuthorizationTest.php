<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ExpenseReport;
use App\Models\ExpenseReportItem;
use App\Models\User;
use Tests\ApiTestCase;

class AuthorizationTest extends ApiTestCase
{
    private function draftReportFor(User $owner): ExpenseReport
    {
        return ExpenseReport::create([
            'user_id' => $owner->id,
            'cost_center_id' => $this->costCenter()->id,
            'description' => 'Report',
            'status' => ExpenseReport::STATUS_DRAFT,
            'requester_description' => 'Requester',
            'requester_department' => 'Ops',
            'requester_tax_id' => '11111111111',
            'period_start_date' => '2026-07-01',
            'period_end_date' => '2026-07-31',
        ]);
    }

    public function test_provider_cannot_read_expense_report_owned_by_another_provider(): void
    {
        $owner = $this->user(User::ROLE_PROVIDER);
        $intruder = $this->user(User::ROLE_PROVIDER);
        $report = $this->draftReportFor($owner);

        $this->callApi($intruder, 'GET', "/expense-reports/{$report->id}")
            ->assertForbidden();
    }

    public function test_provider_cannot_write_items_into_another_providers_report(): void
    {
        $owner = $this->user(User::ROLE_PROVIDER);
        $intruder = $this->user(User::ROLE_PROVIDER);
        $report = $this->draftReportFor($owner);

        $this->callApi($intruder, 'POST', "/expense-reports/{$report->id}/items", [
            'expense_date' => '2026-07-15',
            'amount' => '10.00',
            'cost_center_id' => $report->cost_center_id,
            'description' => 'Injected item',
        ])->assertForbidden();

        $this->assertSame(0, ExpenseReportItem::where('expense_report_id', $report->id)->count());
    }

    public function test_provider_cannot_download_attachment_from_another_providers_report(): void
    {
        $owner = $this->user(User::ROLE_PROVIDER);
        $intruder = $this->user(User::ROLE_PROVIDER);
        $report = $this->draftReportFor($owner);

        $item = ExpenseReportItem::create([
            'expense_report_id' => $report->id,
            'cost_center_id' => $report->cost_center_id,
            'description' => 'Item',
            'amount' => '10.00',
            'expense_date' => '2026-07-15',
        ]);

        $this->callApi($intruder, 'GET', "/expense-reports/{$report->id}/items/{$item->id}/attachments/1")
            ->assertForbidden();
    }

    public function test_provider_is_blocked_from_auditor_only_routes(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);

        $this->callApi($provider, 'GET', '/dashboard/overview')->assertForbidden();
        $this->callApi($provider, 'GET', '/dashboard/pending-approval')->assertForbidden();
        $this->callApi($provider, 'GET', '/funds')->assertForbidden();
        $this->callApi($provider, 'GET', '/export/history')->assertForbidden();
    }

    public function test_provider_cannot_overwrite_the_integration_credential(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);

        $this->callApi($provider, 'GET', '/integration')->assertForbidden();
        $this->callApi($provider, 'POST', '/integration/1/key', ['key' => 'stolen'])->assertForbidden();
        $this->callApi($provider, 'POST', '/integration/send', [])->assertForbidden();
    }

    public function test_non_admin_cannot_create_update_or_delete_users(): void
    {
        $auditor = $this->user(User::ROLE_AUDITOR);
        $target = $this->user(User::ROLE_PROVIDER);

        $this->callApi($auditor, 'POST', '/users', [
            'name' => 'New',
            'email' => 'new@test.com',
            'password' => 'secret123',
            'role' => User::ROLE_PROVIDER,
        ])->assertForbidden();

        $this->callApi($auditor, 'PUT', "/users/{$target->id}", ['name' => 'Renamed'])->assertForbidden();
        $this->callApi($auditor, 'DELETE', "/users/{$target->id}")->assertForbidden();
    }

    public function test_user_without_the_module_receives_403(): void
    {
        $auditor = $this->user(User::ROLE_AUDITOR);
        $this->withoutModule($auditor, 'cost-center');

        $this->callApi($auditor, 'GET', '/cost-center')->assertForbidden();
        $this->callApi($auditor, 'GET', '/expense-reports')->assertOk();
    }

    public function test_inactive_user_token_is_rejected(): void
    {
        $user = $this->user(User::ROLE_AUDITOR);
        $this->callApi($user, 'GET', '/expense-reports')->assertOk();

        $user->active = false;
        $user->save();

        $this->callApi($user->fresh(), 'GET', '/expense-reports')->assertUnauthorized();
    }

    public function test_admin_passes_the_policy_before_hook(): void
    {
        $provider = $this->user(User::ROLE_PROVIDER);
        $admin = $this->user(User::ROLE_ADMIN);
        $report = $this->draftReportFor($provider);

        $this->callApi($admin, 'GET', "/expense-reports/{$report->id}")->assertOk();
    }

    public function test_unauthenticated_request_returns_401_not_a_redirect(): void
    {
        $this->guestApi('GET', '/expense-reports')
            ->assertUnauthorized()
            ->assertHeader('content-type', 'application/json');
    }
}
