<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('caixa_transacoes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuarios');
            $table->foreignId('id_caixa_conta')->constrained('caixa_conta');
            $table->foreignId('id_caixa')->nullable()->constrained('caixa');
            $table->tinyInteger('tipo_transacao')->unsigned();
            $table->decimal('valor', 15, 2);
            $table->timestamp('data_transacao');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caixa_transacoes');
    }
};
