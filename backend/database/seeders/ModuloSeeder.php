<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModuloSeeder extends Seeder
{
    public function run(): void
    {
        $modulos = [
            ['id' => 1, 'nome' => 'Prestação de Contas (RDC)', 'slug' => 'rdc',             'descricao' => 'Relatórios de despesas de caixa e adiantamentos.'],
            ['id' => 2, 'nome' => 'Gestão de Caixas',          'slug' => 'caixas',          'descricao' => 'Controle de saldos pré-pagos e adiantamentos.'],
            ['id' => 3, 'nome' => 'Reembolso (RCM)',           'slug' => 'rcm',             'descricao' => 'Solicitações de reembolso de despesas pessoais.'],
            ['id' => 4, 'nome' => 'Exportação ERP',            'slug' => 'exportacao',      'descricao' => 'Geração de arquivos para integração com ERP externo.'],
            ['id' => 5, 'nome' => 'Centros de Custo',          'slug' => 'centro-custo',    'descricao' => 'Cadastro de centros de custo da empresa.'],
            ['id' => 6, 'nome' => 'Categorias de Despesa',     'slug' => 'categoria',       'descricao' => 'Cadastro de categorias para classificação de despesas.'],
            ['id' => 7, 'nome' => 'Contas Bancárias',          'slug' => 'conta-bancaria',  'descricao' => 'Cadastro de contas bancárias usadas nas integrações com ERP.'],
            ['id' => 8, 'nome' => 'Fornecedores',               'slug' => 'fornecedor',      'descricao' => 'Cadastro de fornecedores para integração com ERP.'],
            ['id' => 9, 'nome' => 'Usuários',                   'slug' => 'usuarios',        'descricao' => 'Gerenciamento de perfis e acessos da equipe.'],
        ];

        foreach ($modulos as $modulo) {
            DB::table('modulo')->updateOrInsert(
                ['id' => $modulo['id']],
                array_merge($modulo, [
                    'ativo'      => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
