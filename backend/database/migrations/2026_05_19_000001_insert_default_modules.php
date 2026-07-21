<?php

declare(strict_types=1);

use Database\Seeders\ModuleSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        (new ModuleSeeder())->run();
    }

    public function down(): void
    {
        DB::table('module')
            ->whereIn('slug', array_column(ModuleSeeder::MODULES, 'slug'))
            ->delete();
    }
};
