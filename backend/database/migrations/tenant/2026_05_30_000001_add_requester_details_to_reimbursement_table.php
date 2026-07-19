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
            $table->string('requester_department')->nullable()->after('requester_tax_id');
            $table->foreignId('requester_user_id')->nullable()->after('requester_department')
                ->constrained('user')->nullOnDelete();
            $table->text('notes')->nullable()->after('requester_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('reimbursement', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('requester_user_id');
            $table->dropColumn(['requester_department', 'notes']);
        });
    }
};
