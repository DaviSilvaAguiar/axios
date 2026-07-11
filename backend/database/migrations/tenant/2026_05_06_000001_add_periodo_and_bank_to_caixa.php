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
            $table->timestamp('data_necessidade')->nullable()->change();
            $table->timestamp('data_inicio_periodo')->nullable()->after('data_necessidade');
            $table->timestamp('data_fim_periodo')->nullable()->after('data_inicio_periodo');
            $table->string('banco')->nullable()->after('obs');
            $table->string('agencia')->nullable()->after('banco');
            $table->string('numero_banco')->nullable()->after('agencia');
            $table->string('chave_pix')->nullable()->after('numero_banco');
        });
    }

    public function down(): void
    {
        Schema::table('caixa', function (Blueprint $table): void {
            $table->dropColumn([
                'data_inicio_periodo',
                'data_fim_periodo',
                'banco',
                'agencia',
                'numero_banco',
                'chave_pix',
            ]);
            $table->timestamp('data_necessidade')->nullable(false)->change();
        });
    }
};
