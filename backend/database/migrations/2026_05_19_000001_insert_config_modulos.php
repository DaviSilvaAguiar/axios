<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const MODULOS = [
        ['slug' => 'centro-custo', 'nome' => 'Centros de Custo', 'descricao' => 'Gerenciar centros de custo da empresa'],
        ['slug' => 'categoria',    'nome' => 'Categorias de Despesa', 'descricao' => 'Categorizar tipos de despesa'],
        ['slug' => 'usuarios',     'nome' => 'Usuários', 'descricao' => 'Gerenciar perfis e acessos da equipe'],
    ];

    public function up(): void
    {
        $agora = now();

        foreach (self::MODULOS as $modulo) {
            DB::table('modulo')->updateOrInsert(
                ['slug' => $modulo['slug']],
                [
                    'nome'       => $modulo['nome'],
                    'descricao'  => $modulo['descricao'],
                    'ativo'      => true,
                    'created_at' => $agora,
                    'updated_at' => $agora,
                ],
            );
        }
    }

    public function down(): void
    {
        DB::table('modulo')
            ->whereIn('slug', array_column(self::MODULOS, 'slug'))
            ->delete();
    }
};
