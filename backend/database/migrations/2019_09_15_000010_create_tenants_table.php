<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table): void {
            $table->id();
            $table->string('slug')->unique();
            $table->string('razao_social');
            $table->string('fantasia')->nullable();
            $table->string('cnpj', 14)->unique();
            $table->string('ie', 20)->nullable();
            $table->string('endereco')->nullable();
            $table->string('cep', 8)->nullable();
            $table->string('numero', 20)->nullable();
            $table->string('codigo_ibge', 7)->nullable();
            $table->char('uf', 2)->nullable();
            $table->json('data')->nullable();
            $table->decimal('mrr', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
