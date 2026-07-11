<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario_modulo', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_modulo');
            $table->unique(['id_usuario', 'id_modulo']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario_modulo');
    }
};
