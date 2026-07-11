<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rcm', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuarios');
            $table->string('titulo');
            $table->date('data_inicio_periodo');
            $table->date('data_fim_periodo');
            $table->tinyInteger('status')->unsigned()->default(1);
            $table->date('data_pagamento_programado')->nullable();
            $table->text('motivo_rejeicao')->nullable();
            $table->timestamp('data_exportacao')->nullable();
            $table->string('banco')->nullable();
            $table->string('agencia')->nullable();
            $table->string('numero_banco')->nullable();
            $table->string('chave_pix')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rcm');
    }
};
