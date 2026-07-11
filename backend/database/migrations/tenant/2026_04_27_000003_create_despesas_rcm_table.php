<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('despesa_rcm', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('id_rcm')->constrained('rcm')->cascadeOnDelete();
            $table->foreignId('id_centro_custo')->constrained('centro_custo');
            $table->string('descricao');
            $table->decimal('valor', 10, 2);
            $table->date('data_despesa');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('despesa_rcm');
    }
};
