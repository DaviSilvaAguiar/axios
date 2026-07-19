<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integration_key', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('integration_id')->index();
            $table->text('key');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_key');
    }
};
