<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Fund;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class FundService
{
    public function list(int $status = Fund::STATUS_ACTIVE): Collection
    {
        return Fund::with(['user', 'costCenter'])
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function find(int $id): Fund
    {
        $fund = Fund::with(['user', 'costCenter'])->findOrFail($id);

        Gate::authorize('view', $fund);

        return $fund;
    }

    public function create(array $data): Fund
    {
        $fund = Fund::create([
            ...$data,
            'balance' => 0,
            'status' => Fund::STATUS_ACTIVE,
        ]);

        return $fund->load(['user', 'costCenter']);
    }

    public function update(int $id, array $data): Fund
    {
        $fund = Fund::findOrFail($id);
        Gate::authorize('manage', $fund);
        $fund->update($data);

        return $fund->load(['user', 'costCenter']);
    }

    public function close(int $id): Fund
    {
        $fund = Fund::findOrFail($id);
        Gate::authorize('manage', $fund);

        if (! $fund->balance->isZero()) {
            throw ValidationException::withMessages([
                'balance' => ['The fund can only be closed with a balance of R$ 0.00.'],
            ]);
        }

        $fund->update(['status' => Fund::STATUS_CLOSED]);

        return $fund->load(['user', 'costCenter']);
    }
}
