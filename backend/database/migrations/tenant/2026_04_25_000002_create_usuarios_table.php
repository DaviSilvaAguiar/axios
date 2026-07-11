<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table): void {
            $table->id();
            $table->tinyInteger('perfil')->unsigned();
            $table->string('nome');
            $table->string('email')->unique();
            $table->string('senha');
            $table->boolean('ativo')->default(true);
            $table->string('codigo_credor_erp')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
