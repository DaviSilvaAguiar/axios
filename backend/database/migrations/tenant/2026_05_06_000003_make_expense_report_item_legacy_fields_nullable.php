<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expense_report_item', function (Blueprint $table): void {
            $table->decimal('quantity', 10, 2)->nullable()->change();
            $table->char('unit', 4)->nullable()->change();
            $table->decimal('unit_amount', 15, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('expense_report_item', function (Blueprint $table): void {
            $table->decimal('quantity', 10, 2)->nullable(false)->change();
            $table->char('unit', 4)->nullable(false)->change();
            $table->decimal('unit_amount', 15, 2)->nullable(false)->change();
        });
    }
};
