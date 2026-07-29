<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('module')->where('id', 2)->where('slug', 'expense-reports')->update(['slug' => 'funds']);
        DB::table('module')->where('id', 1)->where('slug', 'rdc')->update(['slug' => 'expense-reports']);
    }

    public function down(): void
    {
        DB::table('module')->where('id', 1)->where('slug', 'expense-reports')->update(['slug' => 'rdc']);
        DB::table('module')->where('id', 2)->where('slug', 'funds')->update(['slug' => 'expense-reports']);
    }
};
