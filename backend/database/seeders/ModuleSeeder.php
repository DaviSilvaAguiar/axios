<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $modules = [
            ['id' => 1, 'name' => 'Expense Reports', 'slug' => 'rdc', 'description' => 'Cash expense reports and advances.'],
            ['id' => 2, 'name' => 'Fund Management', 'slug' => 'expense-reports', 'description' => 'Control of prepaid balances and advances.'],
            ['id' => 3, 'name' => 'Reimbursement', 'slug' => 'reimbursement', 'description' => 'Personal expense reimbursement requests.'],
            ['id' => 4, 'name' => 'ERP Export', 'slug' => 'export', 'description' => 'File generation for external ERP integration.'],
            ['id' => 5, 'name' => 'Cost Centers', 'slug' => 'cost-center', 'description' => 'Company cost center registry.'],
            ['id' => 6, 'name' => 'Expense Categories', 'slug' => 'expense-category', 'description' => 'Categories for classifying expenses.'],
            ['id' => 7, 'name' => 'Bank Accounts', 'slug' => 'bank-account', 'description' => 'Bank accounts used in ERP integrations.'],
            ['id' => 8, 'name' => 'Suppliers', 'slug' => 'supplier', 'description' => 'Supplier registry for ERP integration.'],
            ['id' => 9, 'name' => 'Users', 'slug' => 'users', 'description' => 'Team roles and access management.'],
        ];

        foreach ($modules as $module) {
            DB::table('module')->updateOrInsert(
                ['id' => $module['id']],
                array_merge($module, [
                    'active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
