<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('despesa_rcm', function (Blueprint $table): void {
            $table->string('categoria')->nullable()->after('data_despesa');
        });
    }

    public function down(): void
    {
        Schema::table('despesa_rcm', function (Blueprint $table): void {
            $table->dropColumn('categoria');
        });
    }
};
