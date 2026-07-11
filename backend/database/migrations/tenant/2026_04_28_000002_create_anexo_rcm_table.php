<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anexo_rcm', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('id_despesa_rcm')->constrained('despesa_rcm')->cascadeOnDelete();
            $table->string('caminho');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anexo_rcm');
    }
};
