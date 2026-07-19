<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_report', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->foreignId('cost_center_id')->constrained('cost_center');
            $table->string('description');
            $table->tinyInteger('status')->unsigned()->default(1);
            $table->timestamp('needed_at');
            $table->text('notes')->nullable();
            $table->string('requester_description');
            $table->string('requester_department');
            $table->string('requester_tax_id');
            $table->timestamp('exported_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expense_report');
    }
};
