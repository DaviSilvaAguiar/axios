<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fund_transaction', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->foreignId('fund_id')->constrained('fund');
            $table->foreignId('expense_report_id')->nullable()->constrained('expense_report');
            $table->tinyInteger('transaction_type')->unsigned();
            $table->decimal('amount', 15, 2);
            $table->timestamp('transaction_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fund_transaction');
    }
};
