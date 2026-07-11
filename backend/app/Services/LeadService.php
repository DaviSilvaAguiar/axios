<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Lead;

class LeadService
{
    public function registrar(array $dados): Lead
    {
        return Lead::create($dados);
    }
}
