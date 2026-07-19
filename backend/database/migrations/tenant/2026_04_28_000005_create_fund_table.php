<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fund', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('user');
            $table->foreignId('cost_center_id')->constrained('cost_center');
            $table->string('description');
            $table->decimal('balance', 15, 2)->default(0);
            $table->tinyInteger('status')->unsigned()->default(1);
            $table->string('bank')->nullable();
            $table->string('branch')->nullable();
            $table->string('account_number')->nullable();
            $table->string('pix_key')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fund');
    }
};
