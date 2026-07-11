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
            $table->timestamp('data_inicio_periodo')->change();
            $table->timestamp('data_fim_periodo')->change();
            $table->timestamp('data_pagamento_programado')->nullable()->change();
        });

        Schema::table('despesa_rcm', function (Blueprint $table): void {
            $table->timestamp('data_despesa')->change();
        });
    }

    public function down(): void
    {
        Schema::table('rcm', function (Blueprint $table): void {
            $table->date('data_inicio_periodo')->change();
            $table->date('data_fim_periodo')->change();
            $table->date('data_pagamento_programado')->nullable()->change();
        });

        Schema::table('despesa_rcm', function (Blueprint $table): void {
            $table->date('data_despesa')->change();
        });
    }
};
