<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Reimbursement;
use App\Models\User;
use App\Policies\ReimbursementPolicy;
use PHPUnit\Framework\TestCase;

class ReimbursementPolicyTest extends TestCase
{
    private function user(int $id, int $role): User
    {
        $user = new User;
        $user->id = $id;
        $user->role = $role;

        return $user;
    }

    private function reimbursementOwnedBy(int $userId): Reimbursement
    {
        $reimbursement = new Reimbursement;
        $reimbursement->user_id = $userId;

        return $reimbursement;
    }

    public function test_owner_provider_can_view_update_and_delete(): void
    {
        $policy = new ReimbursementPolicy;
        $owner = $this->user(10, User::ROLE_PROVIDER);
        $reimbursement = $this->reimbursementOwnedBy(10);

        $this->assertTrue($policy->view($owner, $reimbursement));
        $this->assertTrue($policy->update($owner, $reimbursement));
        $this->assertTrue($policy->delete($owner, $reimbursement));
    }

    public function test_other_provider_cannot_view_update_or_delete(): void
    {
        $policy = new ReimbursementPolicy;
        $intruder = $this->user(99, User::ROLE_PROVIDER);
        $reimbursement = $this->reimbursementOwnedBy(10);

        $this->assertFalse($policy->view($intruder, $reimbursement));
        $this->assertFalse($policy->update($intruder, $reimbursement));
        $this->assertFalse($policy->delete($intruder, $reimbursement));
    }

    public function test_auditor_can_view_and_update_status_but_not_edit_others_content(): void
    {
        $policy = new ReimbursementPolicy;
        $auditor = $this->user(2, User::ROLE_AUDITOR);
        $reimbursement = $this->reimbursementOwnedBy(10);

        $this->assertTrue($policy->view($auditor, $reimbursement));
        $this->assertTrue($policy->updateStatus($auditor, $reimbursement));
        $this->assertFalse($policy->update($auditor, $reimbursement));
        $this->assertFalse($policy->delete($auditor, $reimbursement));
    }

    public function test_provider_cannot_change_status(): void
    {
        $policy = new ReimbursementPolicy;
        $owner = $this->user(10, User::ROLE_PROVIDER);
        $reimbursement = $this->reimbursementOwnedBy(10);

        $this->assertFalse($policy->updateStatus($owner, $reimbursement));
    }

    public function test_admin_is_allowed_by_before_hook(): void
    {
        $policy = new ReimbursementPolicy;
        $admin = $this->user(1, User::ROLE_ADMIN);

        $this->assertTrue($policy->before($admin));
        $this->assertNull($policy->before($this->user(3, User::ROLE_PROVIDER)));
    }
}
