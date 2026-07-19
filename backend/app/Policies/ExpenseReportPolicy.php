<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ExpenseReport;
use App\Models\User;

class ExpenseReportPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function view(User $user, ExpenseReport $expenseReport): bool
    {
        return $user->isAuditor() || $expenseReport->user_id === $user->id;
    }

    public function update(User $user, ExpenseReport $expenseReport): bool
    {
        return $expenseReport->user_id === $user->id;
    }

    public function delete(User $user, ExpenseReport $expenseReport): bool
    {
        return $expenseReport->user_id === $user->id;
    }

    public function approve(User $user, ExpenseReport $expenseReport): bool
    {
        return $user->isAuditor();
    }
}
