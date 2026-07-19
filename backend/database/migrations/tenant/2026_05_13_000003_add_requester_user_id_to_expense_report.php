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
            $table->foreignId('requester_user_id')
                ->nullable()
                ->after('requester_tax_id')
                ->constrained('user')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('expense_report', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('requester_user_id');
        });
    }
};
