<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Integracao;
use Illuminate\Database\Seeder;

class IntegracaoSeeder extends Seeder
{
    private const INTEGRACOES = [
        ['nome' => 'Controlle'],
    ];

    public function run(): void
    {
        foreach (self::INTEGRACOES as $integracao) {
            Integracao::firstOrCreate(
                ['nome' => $integracao['nome']],
            );
        }
    }
}
