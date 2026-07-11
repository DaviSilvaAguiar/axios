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
            $table->foreignId('id_lote_exportacao')->nullable()->constrained('lote_exportacao');
        });
    }

    public function down(): void
    {
        Schema::table('rcm', function (Blueprint $table): void {
            $table->dropForeign(['id_lote_exportacao']);
            $table->dropColumn('id_lote_exportacao');
        });
    }
};
