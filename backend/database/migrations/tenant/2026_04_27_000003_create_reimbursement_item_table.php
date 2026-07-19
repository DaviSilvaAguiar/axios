<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reimbursement_item', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reimbursement_id')->constrained('reimbursement')->cascadeOnDelete();
            $table->foreignId('cost_center_id')->constrained('cost_center');
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->date('expense_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reimbursement_item');
    }
};
