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
            $table->decimal('quantidade', 10, 2)->nullable()->change();
            $table->char('unidade', 4)->nullable()->change();
            $table->decimal('valor_unitario', 15, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('caixa_despesa', function (Blueprint $table): void {
            $table->decimal('quantidade', 10, 2)->nullable(false)->change();
            $table->char('unidade', 4)->nullable(false)->change();
            $table->decimal('valor_unitario', 15, 2)->nullable(false)->change();
        });
    }
};
