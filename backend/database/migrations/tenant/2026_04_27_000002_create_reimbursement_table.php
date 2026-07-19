<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reimbursement', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->string('title');
            $table->date('period_start_date');
            $table->date('period_end_date');
            $table->tinyInteger('status')->unsigned()->default(1);
            $table->date('scheduled_payment_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('exported_at')->nullable();
            $table->string('bank')->nullable();
            $table->string('branch')->nullable();
            $table->string('account_number')->nullable();
            $table->string('pix_key')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reimbursement');
    }
};
