<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('caixa', function (Blueprint $table): void {
            $table->foreignId('id_usuario_requisitante')
                ->nullable()
                ->after('cpf_cnpj_requisitante')
                ->constrained('usuarios')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('caixa', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('id_usuario_requisitante');
        });
    }
};
