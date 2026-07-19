<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Reimbursement;
use App\Models\User;

class ReimbursementPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function view(User $user, Reimbursement $reimbursement): bool
    {
        return $user->isAuditor() || $reimbursement->user_id === $user->id;
    }

    public function update(User $user, Reimbursement $reimbursement): bool
    {
        return $reimbursement->user_id === $user->id;
    }

    public function delete(User $user, Reimbursement $reimbursement): bool
    {
        return $reimbursement->user_id === $user->id;
    }

    public function updateStatus(User $user, Reimbursement $reimbursement): bool
    {
        return $user->isAuditor();
    }
}
