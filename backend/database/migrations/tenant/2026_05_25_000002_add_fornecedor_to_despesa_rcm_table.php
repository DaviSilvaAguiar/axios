<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('despesa_rcm', function (Blueprint $table): void {
            $table->string('descricao_fornecedor')->nullable()->after('descricao');
            $table->string('cpf_cnpj_fornecedor', 14)->nullable()->after('descricao_fornecedor');

            $table->foreignId('id_fornecedor')
                ->nullable()
                ->after('cpf_cnpj_fornecedor')
                ->constrained('fornecedor')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('despesa_rcm', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('id_fornecedor');
            $table->dropColumn(['cpf_cnpj_fornecedor', 'descricao_fornecedor']);
        });
    }
};
