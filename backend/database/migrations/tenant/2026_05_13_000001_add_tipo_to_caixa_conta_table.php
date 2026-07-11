<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('caixa_conta', function (Blueprint $table): void {
            $table->tinyInteger('tipo')->unsigned()->default(1)->after('saldo');
        });
    }

    public function down(): void
    {
        Schema::table('caixa_conta', function (Blueprint $table): void {
            $table->dropColumn('tipo');
        });
    }
};
