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
            $table->foreignId('export_batch_id')->nullable()->constrained('export_batch');
        });
    }

    public function down(): void
    {
        Schema::table('reimbursement', function (Blueprint $table): void {
            $table->dropForeign(['export_batch_id']);
            $table->dropColumn('export_batch_id');
        });
    }
};
