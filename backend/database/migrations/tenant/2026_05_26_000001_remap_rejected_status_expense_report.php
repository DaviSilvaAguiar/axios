<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('expense_report')
            ->where('status', 4)
            ->update(['status' => 6]);
    }

    public function down(): void
    {
        DB::table('expense_report')
            ->where('status', 6)
            ->update(['status' => 4]);
    }
};
