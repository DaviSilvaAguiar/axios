<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expense_report', function (Blueprint $table): void {
            $table->timestamp('needed_at')->nullable()->change();
            $table->timestamp('period_start_date')->nullable()->after('needed_at');
            $table->timestamp('period_end_date')->nullable()->after('period_start_date');
            $table->string('bank')->nullable()->after('notes');
            $table->string('branch')->nullable()->after('bank');
            $table->string('account_number')->nullable()->after('branch');
            $table->string('pix_key')->nullable()->after('account_number');
        });
    }

    public function down(): void
    {
        Schema::table('expense_report', function (Blueprint $table): void {
            $table->dropColumn([
                'period_start_date',
                'period_end_date',
                'bank',
                'branch',
                'account_number',
                'pix_key',
            ]);
            $table->timestamp('needed_at')->nullable(false)->change();
        });
    }
};
