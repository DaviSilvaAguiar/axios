<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integracao_chave', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('id_integracao')->index();
            $table->text('chave');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integracao_chave');
    }
};
