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
            $table->decimal('latitude', 10, 7)->nullable()->after('expense_category_id');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('address')->nullable()->after('longitude');
        });

        Schema::table('expense_report_item', function (Blueprint $table): void {
            $table->decimal('latitude', 10, 7)->nullable()->after('access_key');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('address')->nullable()->after('longitude');
        });
    }

    public function down(): void
    {
        Schema::table('reimbursement_item', function (Blueprint $table): void {
            $table->dropColumn(['latitude', 'longitude', 'address']);
        });

        Schema::table('expense_report_item', function (Blueprint $table): void {
            $table->dropColumn(['latitude', 'longitude', 'address']);
        });
    }
};
