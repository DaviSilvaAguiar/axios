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
            $table->foreignId('cost_center_id')->nullable()->after('user_id')
                ->constrained('cost_center')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reimbursement', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('cost_center_id');
        });
    }
};
