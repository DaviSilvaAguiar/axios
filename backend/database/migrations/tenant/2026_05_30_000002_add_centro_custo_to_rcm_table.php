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
            $table->foreignId('id_centro_custo')->nullable()->after('id_usuario')
                ->constrained('centro_custo')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('rcm', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('id_centro_custo');
        });
    }
};
