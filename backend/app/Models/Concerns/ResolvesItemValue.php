<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Support\Money;

trait ResolvesItemValue
{
    public function value(): Money
    {
        if ($this->amount !== null) {
            return $this->amount;
        }

        $unitAmount = $this->unit_amount ?? null;

        if ($unitAmount instanceof Money) {
            return $unitAmount->multiply((string) ($this->quantity ?? '1'));
        }

        return Money::zero();
    }
}
