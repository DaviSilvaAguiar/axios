<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('caixa_despesa', function (Blueprint $table): void {
            $table->string('descricao_fornecedor')
                ->nullable()
                ->after('cpf_cnpj_fornecedor');

            $table->foreignId('id_fornecedor')
                ->nullable()
                ->after('descricao_fornecedor')
                ->constrained('fornecedor')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('caixa_despesa', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('id_fornecedor');
            $table->dropColumn('descricao_fornecedor');
        });
    }
};
