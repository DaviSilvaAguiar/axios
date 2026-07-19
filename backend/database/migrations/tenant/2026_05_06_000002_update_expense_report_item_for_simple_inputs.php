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
            $table->dropForeign(['document_type_id']);
            $table->unsignedBigInteger('document_type_id')->nullable()->change();
            $table->foreign('document_type_id')->references('id')->on('document_type')->nullOnDelete();

            $table->foreignId('cost_center_id')->nullable()->after('expense_report_id')->constrained('cost_center');
            $table->foreignId('expense_category_id')->nullable()->after('cost_center_id')->constrained('expense_category');
            $table->decimal('amount', 15, 2)->nullable()->after('expense_category_id');
        });
    }

    public function down(): void
    {
        Schema::table('expense_report_item', function (Blueprint $table): void {
            $table->dropForeign(['cost_center_id']);
            $table->dropForeign(['expense_category_id']);
            $table->dropColumn(['cost_center_id', 'expense_category_id', 'amount']);

            $table->dropForeign(['document_type_id']);
            $table->unsignedBigInteger('document_type_id')->nullable(false)->change();
            $table->foreign('document_type_id')->references('id')->on('document_type');
        });
    }
};
