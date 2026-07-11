<?php

declare(strict_types=1);

use App\Models\Modulo;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const SLUGS = ['centro-custo', 'categoria', 'usuarios'];

    public function up(): void
    {
        $idsModulos = Modulo::whereIn('slug', self::SLUGS)->pluck('id')->all();

        if (empty($idsModulos)) {
            return;
        }

        $usuariosNaoAdmin = DB::table('usuarios')->where('perfil', '!=', 1)->pluck('id');
        $agora            = now();

        foreach ($usuariosNaoAdmin as $idUsuario) {
            foreach ($idsModulos as $idModulo) {
                $jaTem = DB::table('usuario_modulo')
                    ->where('id_usuario', $idUsuario)
                    ->where('id_modulo', $idModulo)
                    ->exists();

                if (! $jaTem) {
                    DB::table('usuario_modulo')->insert([
                        'id_usuario' => $idUsuario,
                        'id_modulo'  => $idModulo,
                        'created_at' => $agora,
                        'updated_at' => $agora,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        $idsModulos = Modulo::whereIn('slug', self::SLUGS)->pluck('id')->all();

        if (empty($idsModulos)) {
            return;
        }

        DB::table('usuario_modulo')->whereIn('id_modulo', $idsModulos)->delete();
    }
};
