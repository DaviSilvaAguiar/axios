<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reimbursement', function (Blueprint $table): void {
            $table->timestamp('period_start_date')->change();
            $table->timestamp('period_end_date')->change();
            $table->timestamp('scheduled_payment_date')->nullable()->change();
        });

        Schema::table('reimbursement_item', function (Blueprint $table): void {
            $table->timestamp('expense_date')->change();
        });
    }

    public function down(): void
    {
        Schema::table('reimbursement', function (Blueprint $table): void {
            $table->date('period_start_date')->change();
            $table->date('period_end_date')->change();
            $table->date('scheduled_payment_date')->nullable()->change();
        });

        Schema::table('reimbursement_item', function (Blueprint $table): void {
            $table->date('expense_date')->change();
        });
    }
};
