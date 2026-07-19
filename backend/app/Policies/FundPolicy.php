<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Fund;
use App\Models\User;

class FundPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function view(User $user, Fund $fund): bool
    {
        return $user->isAuditor();
    }

    public function manage(User $user, Fund $fund): bool
    {
        return $user->isAuditor();
    }
}
