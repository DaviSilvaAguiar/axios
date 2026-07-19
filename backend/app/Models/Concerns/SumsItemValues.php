<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Support\Money;

trait SumsItemValues
{
    public function total(): Money
    {
        return $this->items->reduce(
            fn (Money $carry, $item): Money => $carry->add($item->value()),
            Money::zero(),
        );
    }
}
