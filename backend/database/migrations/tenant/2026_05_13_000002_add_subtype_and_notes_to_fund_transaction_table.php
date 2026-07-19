<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fund_transaction', function (Blueprint $table): void {
            $table->tinyInteger('subtype')->unsigned()->default(1)->after('transaction_type');
            $table->string('notes', 500)->nullable()->after('amount');
            $table->string('reason', 500)->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('fund_transaction', function (Blueprint $table): void {
            $table->dropColumn(['subtype', 'notes', 'reason']);
        });
    }
};
