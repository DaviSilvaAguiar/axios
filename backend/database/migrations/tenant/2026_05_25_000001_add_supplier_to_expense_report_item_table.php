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
            $table->string('supplier_description')
                ->nullable()
                ->after('supplier_tax_id');

            $table->foreignId('supplier_id')
                ->nullable()
                ->after('supplier_description')
                ->constrained('supplier')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('expense_report_item', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('supplier_id');
            $table->dropColumn('supplier_description');
        });
    }
};
