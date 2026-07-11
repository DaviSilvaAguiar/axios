<?php

declare(strict_types=1);

use App\Models\Caixa;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * O RDC passou a espelhar os 6 status do RCM. O antigo "Rejeitado" (4)
     * deu lugar a "Pagamento Agendado", então registros já rejeitados
     * precisam ser movidos para o novo número de "Rejeitado" (6).
     */
    public function up(): void
    {
        DB::table('caixa')
            ->where('status', 4)
            ->update(['status' => Caixa::STATUS_REJEITADO]);
    }

    public function down(): void
    {
        DB::table('caixa')
            ->where('status', Caixa::STATUS_REJEITADO)
            ->update(['status' => 4]);
    }
};
