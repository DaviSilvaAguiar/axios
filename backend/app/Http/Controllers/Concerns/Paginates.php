<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

trait Paginates
{
    /**
     * @param int $default
     * @param int $max
     * @return int
     */
    protected function perPage(int $default = 50, int $max = 200): int
    {
        $value = (int) request()->query('per_page', (string) $default);

        return max(1, min($max, $value));
    }

    /**
     * @return int
     */
    protected function currentPage(): int
    {
        $value = (int) request()->query('page', '1');

        return max(1, $value);
    }

    /**
     * @param LengthAwarePaginator $paginator
     * @param array|null $items
     * @return array
     */
    protected function paginated(LengthAwarePaginator $paginator, ?array $items = null): array
    {
        return [
            'data' => $items ?? $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ];
    }
}
