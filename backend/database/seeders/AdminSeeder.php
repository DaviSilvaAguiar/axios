<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CostCenter;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::firstOrCreate(['slug' => 'admin'], [
            'legal_name' => 'Axios Admin',
            'cnpj' => '00000000000000',
        ]);

        Artisan::call('tenants:migrate', ['--tenants' => [$tenant->id]]);

        $tenant->run(function (): void {
            User::firstOrCreate(['email' => 'daviaguiardev@gmail.com'], [
                'role' => 1,
                'name' => 'Davi Aguiar',
                'email' => 'daviaguiardev@gmail.com',
                'password' => 'Axios@2026',
                'active' => true,
            ]);

            CostCenter::firstOrCreate(['description' => 'General'], [
                'description' => 'General',
                'erp_code' => 'GENERAL',
                'active' => true,
            ]);

            $this->call(SettingSeeder::class);
        });
    }
}
