<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const MODULES = [
        ['slug' => 'cost-center', 'name' => 'Cost Centers', 'description' => 'Manage the company cost centers'],
        ['slug' => 'expense-category', 'name' => 'Expense Categories', 'description' => 'Categorize expense types'],
        ['slug' => 'users', 'name' => 'Users', 'description' => 'Manage team roles and access'],
    ];

    public function up(): void
    {
        $now = now();

        foreach (self::MODULES as $module) {
            DB::table('module')->updateOrInsert(
                ['slug' => $module['slug']],
                [
                    'name' => $module['name'],
                    'description' => $module['description'],
                    'active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            );
        }
    }

    public function down(): void
    {
        DB::table('module')
            ->whereIn('slug', array_column(self::MODULES, 'slug'))
            ->delete();
    }
};
