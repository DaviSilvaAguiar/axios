<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('caixa_despesa', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('id_caixa')->constrained('caixa')->cascadeOnDelete();
            $table->foreignId('id_tipo_documento')->constrained('tipo_documento');
$table->string('descricao');
            $table->string('cpf_cnpj_fornecedor')->nullable();
            $table->decimal('quantidade', 10, 2);
            $table->char('unidade', 4);
            $table->timestamp('data_despesa');
            $table->decimal('valor_unitario', 15, 2);
            $table->integer('numero_documento')->nullable();
            $table->integer('serie_documento')->nullable();
            $table->char('chave_de_acesso', 44)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caixa_despesa');
    }
};
