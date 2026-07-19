<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reimbursement_item', function (Blueprint $table): void {
            $table->dropColumn('category');
            $table->foreignId('expense_category_id')->nullable()->constrained('expense_category')->after('expense_date');
        });
    }

    public function down(): void
    {
        Schema::table('reimbursement_item', function (Blueprint $table): void {
            $table->dropForeign(['expense_category_id']);
            $table->dropColumn('expense_category_id');
            $table->string('category')->nullable()->after('expense_date');
        });
    }
};
