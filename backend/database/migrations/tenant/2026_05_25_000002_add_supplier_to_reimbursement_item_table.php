<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reimbursement_item', function (Blueprint $table): void {
            $table->string('supplier_description')->nullable()->after('description');
            $table->string('supplier_tax_id', 14)->nullable()->after('supplier_description');

            $table->foreignId('supplier_id')
                ->nullable()
                ->after('supplier_tax_id')
                ->constrained('supplier')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reimbursement_item', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('supplier_id');
            $table->dropColumn(['supplier_tax_id', 'supplier_description']);
        });
    }
};
