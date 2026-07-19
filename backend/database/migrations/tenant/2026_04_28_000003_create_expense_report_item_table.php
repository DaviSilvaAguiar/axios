<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_report_item', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('expense_report_id')->constrained('expense_report')->cascadeOnDelete();
            $table->foreignId('document_type_id')->constrained('document_type');
            $table->string('description');
            $table->string('supplier_tax_id')->nullable();
            $table->decimal('quantity', 10, 2);
            $table->char('unit', 4);
            $table->timestamp('expense_date');
            $table->decimal('unit_amount', 15, 2);
            $table->integer('document_number')->nullable();
            $table->integer('document_series')->nullable();
            $table->char('access_key', 44)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_report_item');
    }
};
