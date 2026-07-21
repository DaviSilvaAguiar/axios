<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\DomainException;
use App\Models\ExpenseReport;
use App\Models\Fund;
use App\Models\FundTransaction;
use App\Models\Module;
use App\Models\Reimbursement;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserService
{
    public function list(int $perPage): LengthAwarePaginator
    {
        return User::orderBy('name')->paginate($perPage);
    }

    public function find(int $id): User
    {
        return User::findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     *
     * @throws DomainException
     */
    public function create(array $data): User
    {
        $tenant = tenancy()->tenant;
        $currentTotal = User::count();

        if ($currentTotal >= $tenant->max_users) {
            throw new DomainException("Limit of {$tenant->max_users} users reached for this company.", 422);
        }

        $user = User::create($data)->fresh();

        $moduleIds = Module::where('active', true)->pluck('id');
        foreach ($moduleIds as $moduleId) {
            UserModule::create(['user_id' => $user->id, 'module_id' => $moduleId]);
        }

        return $user;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): User
    {
        $user = User::findOrFail($id);
        $user->update($data);

        return $user->fresh();
    }

    /**
     * @throws DomainException
     */
    public function delete(int $id): void
    {
        User::findOrFail($id);

        $linked = Reimbursement::where('user_id', $id)->exists()
            || ExpenseReport::where('user_id', $id)->exists()
            || Fund::where('user_id', $id)->exists()
            || FundTransaction::where('user_id', $id)->exists();

        if ($linked) {
            throw new DomainException('This user is linked to existing records and cannot be removed.', 409);
        }

        UserModule::where('user_id', $id)->delete();
        User::destroy($id);
    }

    /**
     * @return array<string, mixed>
     */
    public function listModules(int $id): array
    {
        $all = Module::where('active', true)->get();
        $enabled = UserModule::where('user_id', $id)->pluck('module_id')->all();

        return [
            'modules' => $all,
            'habilitados' => $enabled,
        ];
    }

    /**
     * @param  array<int, int>  $moduleIds
     *
     * @throws DomainException
     */
    public function syncModules(int $id, array $moduleIds): void
    {
        $user = User::findOrFail($id);

        if ($user->isAdmin()) {
            throw new DomainException('Administrator users automatically have access to all modules.', 422);
        }

        UserModule::where('user_id', $id)->delete();
        foreach ($moduleIds as $moduleId) {
            UserModule::create(['user_id' => $id, 'module_id' => $moduleId]);
        }
    }

    /**
     * @return array<int, string>
     */
    public function moduleSlugs(int $id): array
    {
        $moduleIds = UserModule::where('user_id', $id)->pluck('module_id');

        return Module::whereIn('id', $moduleIds)->pluck('slug')->all();
    }
}
