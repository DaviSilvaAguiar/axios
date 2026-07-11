<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('caixa_conta', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuarios');
            $table->foreignId('id_centro_custo')->constrained('centro_custo');
            $table->string('descricao');
            $table->decimal('saldo', 15, 2)->default(0);
            $table->tinyInteger('status')->unsigned()->default(1);
            $table->string('banco')->nullable();
            $table->string('agencia')->nullable();
            $table->string('numero_banco')->nullable();
            $table->string('chave_pix')->nullable();
            $table->timestamp('data_pagamento')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caixa_conta');
    }
};
