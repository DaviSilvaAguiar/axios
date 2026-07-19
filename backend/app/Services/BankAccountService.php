<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\BankAccount;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BankAccountService
{
    public function list(int $perPage): LengthAwarePaginator
    {
        return BankAccount::orderBy('description')->paginate($perPage);
    }

    public function find(int $id): BankAccount
    {
        return BankAccount::findOrFail($id);
    }

    public function create(array $data): BankAccount
    {
        $data['active'] = $data['active'] ?? true;

        return BankAccount::create($data);
    }

    public function update(int $id, array $data): BankAccount
    {
        $account = BankAccount::findOrFail($id);
        $account->update($data);

        return $account->fresh();
    }

    public function delete(int $id): void
    {
        BankAccount::findOrFail($id);

        BankAccount::destroy($id);
    }
}
