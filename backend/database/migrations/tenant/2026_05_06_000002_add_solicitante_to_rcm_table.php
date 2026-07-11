<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rcm', function (Blueprint $table): void {
            $table->string('nome_solicitante')->nullable()->after('titulo');
            $table->string('cpf_cnpj_solicitante', 20)->nullable()->after('nome_solicitante');
        });
    }

    public function down(): void
    {
        Schema::table('rcm', function (Blueprint $table): void {
            $table->dropColumn(['nome_solicitante', 'cpf_cnpj_solicitante']);
        });
    }
};
