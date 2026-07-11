<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('caixa', function (Blueprint $table): void {
            $table->string('motivo_rejeicao', 1000)->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('caixa', function (Blueprint $table): void {
            $table->dropColumn('motivo_rejeicao');
        });
    }
};
