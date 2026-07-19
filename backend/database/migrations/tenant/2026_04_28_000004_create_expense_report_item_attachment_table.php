<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_report_item_attachment', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('expense_report_item_id')->constrained('expense_report_item')->cascadeOnDelete();
            $table->string('path', 255);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_report_item_attachment');
    }
};
