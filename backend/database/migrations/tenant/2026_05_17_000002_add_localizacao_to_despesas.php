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
            $table->decimal('latitude', 10, 7)->nullable()->after('id_categoria_despesa');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('endereco')->nullable()->after('longitude');
        });

        Schema::table('caixa_despesa', function (Blueprint $table): void {
            $table->decimal('latitude', 10, 7)->nullable()->after('chave_de_acesso');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('endereco')->nullable()->after('longitude');
        });
    }

    public function down(): void
    {
        Schema::table('despesa_rcm', function (Blueprint $table): void {
            $table->dropColumn(['latitude', 'longitude', 'endereco']);
        });

        Schema::table('caixa_despesa', function (Blueprint $table): void {
            $table->dropColumn(['latitude', 'longitude', 'endereco']);
        });
    }
};
