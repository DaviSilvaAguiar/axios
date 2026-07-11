<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Inserção do status "Pendente" (=2) entre "Rascunho" (=1) e "Em Análise"
     * tanto em RCM quanto em RDC (caixa). Os status existentes 2..6 são
     * deslocados para 3..7. Atualizações em ordem decrescente para evitar
     * colisões intermediárias.
     */
    public function up(): void
    {
        foreach (['rcm', 'caixa'] as $tabela) {
            for ($atual = 6; $atual >= 2; $atual--) {
                DB::table($tabela)
                    ->where('status', $atual)
                    ->update(['status' => $atual + 1]);
            }
        }
    }

    public function down(): void
    {
        foreach (['rcm', 'caixa'] as $tabela) {
            // Registros que estavam em "Pendente" (2) precisam ir pra algum lugar.
            // Convenção: voltam para "Em Análise" no esquema antigo (também 2).
            DB::table($tabela)
                ->where('status', 2)
                ->update(['status' => 2]);

            for ($atual = 3; $atual <= 7; $atual++) {
                DB::table($tabela)
                    ->where('status', $atual)
                    ->update(['status' => $atual - 1]);
            }
        }
    }
};
