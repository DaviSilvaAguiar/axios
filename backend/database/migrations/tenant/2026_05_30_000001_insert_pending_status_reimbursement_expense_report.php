<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['reimbursement', 'expense_report'] as $table) {
            for ($current = 6; $current >= 2; $current--) {
                DB::table($table)
                    ->where('status', $current)
                    ->update(['status' => $current + 1]);
            }
        }
    }

    public function down(): void
    {
        foreach (['reimbursement', 'expense_report'] as $table) {
            DB::table($table)
                ->where('status', 2)
                ->update(['status' => 2]);

            for ($current = 3; $current <= 7; $current++) {
                DB::table($table)
                    ->where('status', $current)
                    ->update(['status' => $current - 1]);
            }
        }
    }
};
