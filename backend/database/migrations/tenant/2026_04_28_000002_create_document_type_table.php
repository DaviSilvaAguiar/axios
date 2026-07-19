<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_type', function (Blueprint $table): void {
            $table->id();
            $table->string('description');
            $table->string('code', 4);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_type');
    }
};
