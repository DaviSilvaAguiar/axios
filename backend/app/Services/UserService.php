<?php

declare(strict_types=1);

namespace App\Services;

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

    public function create(array $data): User
    {
        $tenant       = tenancy()->tenant;
        $currentTotal = User::count();

        if ($currentTotal >= $tenant->max_users) {
            abort(422, "Limit of {$tenant->max_users} users reached for this company.");
        }

        $user = User::create($data)->fresh();

        $moduleIds = Module::where('active', true)->pluck('id');
        foreach ($moduleIds as $moduleId) {
            UserModule::create(['user_id' => $user->id, 'module_id' => $moduleId]);
        }

        return $user;
    }

    public function update(int $id, array $data): User
    {
        $user = User::findOrFail($id);
        $user->update($data);

        return $user->fresh();
    }

    public function delete(int $id): void
    {
        User::findOrFail($id);

        $linked = Reimbursement::where('user_id', $id)->exists()
            || ExpenseReport::where('user_id', $id)->exists()
            || Fund::where('user_id', $id)->exists()
            || FundTransaction::where('user_id', $id)->exists();

        if ($linked) {
            abort(409, 'This user is linked to existing records and cannot be removed.');
        }

        UserModule::where('user_id', $id)->delete();
        User::destroy($id);
    }

    public function listModules(int $id): array
    {
        $all     = Module::where('active', true)->get();
        $enabled = UserModule::where('user_id', $id)->pluck('module_id')->all();

        return [
            'modules' => $all,
            'enabled' => $enabled,
        ];
    }

    public function syncModules(int $id, array $moduleIds): void
    {
        $user = User::findOrFail($id);

        if ($user->isAdmin()) {
            abort(422, 'Administrator users automatically have access to all modules.');
        }

        UserModule::where('user_id', $id)->delete();
        foreach ($moduleIds as $moduleId) {
            UserModule::create(['user_id' => $id, 'module_id' => $moduleId]);
        }
    }

    public function moduleSlugs(int $id): array
    {
        $moduleIds = UserModule::where('user_id', $id)->pluck('module_id');

        return Module::whereIn('id', $moduleIds)->pluck('slug')->all();
    }
}
