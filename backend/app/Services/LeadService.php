<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Lead;

class LeadService
{
    public function register(array $data): Lead
    {
        return Lead::create($data);
    }
}
