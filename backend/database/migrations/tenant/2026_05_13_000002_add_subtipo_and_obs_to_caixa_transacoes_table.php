<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('caixa_transacoes', function (Blueprint $table): void {
            $table->tinyInteger('subtipo')->unsigned()->default(1)->after('tipo_transacao');
            $table->string('observacao', 500)->nullable()->after('valor');
            $table->string('motivo', 500)->nullable()->after('observacao');
        });
    }

    public function down(): void
    {
        Schema::table('caixa_transacoes', function (Blueprint $table): void {
            $table->dropColumn(['subtipo', 'observacao', 'motivo']);
        });
    }
};
