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
            $table->string('setor_requisitante')->nullable()->after('cpf_cnpj_solicitante');
            $table->foreignId('id_usuario_requisitante')->nullable()->after('setor_requisitante')
                ->constrained('usuarios')->nullOnDelete();
            $table->text('obs')->nullable()->after('id_usuario_requisitante');
        });
    }

    public function down(): void
    {
        Schema::table('rcm', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('id_usuario_requisitante');
            $table->dropColumn(['setor_requisitante', 'obs']);
        });
    }
};
