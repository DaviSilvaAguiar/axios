<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('export_batch', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->enum('batch_type', ['EXPENSE_REPORT', 'REIMBURSEMENT']);
            $table->string('template_used');
            $table->decimal('total_amount', 15, 2);
            $table->integer('item_count');
            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('export_batch');
    }
};
