<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lote_exportacao', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuarios');
            $table->enum('tipo_lote', ['CAIXA', 'REEMBOLSO']);
            $table->string('template_utilizado');
            $table->decimal('valor_total', 15, 2);
            $table->integer('quantidade_itens');
            $table->string('nome_arquivo')->nullable();
            $table->string('caminho_arquivo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lote_exportacao');
    }
};
