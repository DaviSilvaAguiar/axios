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
            $table->dropForeign(['id_tipo_documento']);
            $table->unsignedBigInteger('id_tipo_documento')->nullable()->change();
            $table->foreign('id_tipo_documento')->references('id')->on('tipo_documento')->nullOnDelete();

            $table->foreignId('id_centro_custo')->nullable()->after('id_caixa')->constrained('centro_custo');
            $table->foreignId('id_categoria_despesa')->nullable()->after('id_centro_custo')->constrained('categoria_despesa');
            $table->decimal('valor', 15, 2)->nullable()->after('id_categoria_despesa');
        });
    }

    public function down(): void
    {
        Schema::table('caixa_despesa', function (Blueprint $table): void {
            $table->dropForeign(['id_centro_custo']);
            $table->dropForeign(['id_categoria_despesa']);
            $table->dropColumn(['id_centro_custo', 'id_categoria_despesa', 'valor']);

            $table->dropForeign(['id_tipo_documento']);
            $table->unsignedBigInteger('id_tipo_documento')->nullable(false)->change();
            $table->foreign('id_tipo_documento')->references('id')->on('tipo_documento');
        });
    }
};
