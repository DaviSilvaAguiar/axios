<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Config;
use Illuminate\Database\Seeder;

class ConfigSeeder extends Seeder
{

    private const CONFIGS = [
        [
            'parametro' => 'habilitar_geolocalizacao_despesa_rdc',
            'descricao' => 'Habilita campo de geolocalização ao lançar despesa em RDC (Caixa de Obra).',
            'valor'     => 0,
        ],
        [
            'parametro' => 'habilitar_geolocalizacao_despesa_rcm',
            'descricao' => 'Habilita campo de geolocalização ao lançar despesa em RCM (Reembolso).',
            'valor'     => 0,
        ],
        [
            'parametro' => 'obrigatorio_codigo_erp',
            'descricao' => 'Torna o Código no ERP obrigatório nos cadastros de Categoria, Centro de Custo, Conta Bancária e Fornecedor.',
            'valor'     => 0,
        ],
    ];

    public function run(): void
    {
        foreach (self::CONFIGS as $config) {
            $registro = Config::firstOrCreate(
                ['parametro' => $config['parametro']],
                [
                    'descricao' => $config['descricao'],
                    'valor'     => $config['valor'],
                ],
            );

            if ($registro->descricao !== $config['descricao']) {
                $registro->update(['descricao' => $config['descricao']]);
            }
        }
    }
}
