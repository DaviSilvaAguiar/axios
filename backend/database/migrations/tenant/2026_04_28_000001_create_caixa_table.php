<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('caixa', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuarios');
            $table->foreignId('id_centro_custo')->constrained('centro_custo');
            $table->string('descricao');
            $table->tinyInteger('status')->unsigned()->default(1);
            $table->timestamp('data_necessidade');
            $table->text('obs')->nullable();
            $table->string('descricao_requisitante');
            $table->string('setor_requisitante');
            $table->string('cpf_cnpj_requisitante');
            $table->timestamp('data_exportacao')->nullable();
            $table->timestamp('data_pagamento')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caixa');
    }
};
