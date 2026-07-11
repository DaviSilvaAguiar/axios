<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CentroDeCusto;
use App\Models\Tenant;
use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::firstOrCreate(['slug' => 'admin'], [
            'razao_social' => 'Axios Admin',
            'cnpj'         => '00000000000000',
        ]);

        Artisan::call('tenants:migrate', ['--tenants' => [$tenant->id]]);

        $tenant->run(function (): void {
            Usuario::firstOrCreate(['email' => 'carlosdaniel.mc@hotmail.com'], [
                'perfil' => 1,
                'nome'   => 'Carlos Machado',
                'email'  => 'carlosdaniel.mc@hotmail.com',
                'senha'  => 'Axios@2026',
                'ativo'  => true,
            ]);

            Usuario::firstOrCreate(['email' => 'daviaguiardev@gmail.com'], [
                'perfil' => 1,
                'nome'   => 'Davi Aguiar',
                'email'  => 'daviaguiardev@gmail.com',
                'senha'  => 'Axios@2026',
                'ativo'  => true,
            ]);

            Usuario::firstOrCreate(['email' => 'andrew.contatotb@gmail.com'], [
                'perfil' => 1,
                'nome'   => 'Andre Santos',
                'email'  => 'andrew.contatotb@gmail.com',
                'senha'  => 'Axios@2026',
                'ativo'  => true,
            ]);


            Usuario::firstOrCreate(['email' => 'alvaro_s.g@hotmail.com'], [
                'perfil' => 1,
                'nome'   => 'Alvaro Garcia',
                'email'  => 'alvaro_s.g@hotmail.com',
                'senha'  => 'Axios@2026',
                'ativo'  => true,
            ]);
            
            Usuario::firstOrCreate(['email' => 'prestador@teste.com'], [
                'perfil' => 3,
                'nome'   => 'Tonhão Prestador',
                'email'  => 'prestador@teste.com',
                'senha'  => '123',
                'ativo'  => true,
            ]);

            CentroDeCusto::firstOrCreate(['descricao' => 'Geral'], [
                'descricao'     => 'Geral',
                'codigo_cc_erp' => 'GERAL',
                'ativo'         => true,
            ]);

            $this->call(ConfigSeeder::class);
        });
    }
}
