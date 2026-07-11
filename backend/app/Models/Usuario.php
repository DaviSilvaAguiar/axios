<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'perfil',
        'nome',
        'email',
        'senha',
        'ativo',
        'codigo_credor_erp',
        'cpf_cnpj',
    ];

    protected $hidden = [
        'senha',
    ];

    protected $casts = [
        'perfil' => 'integer',
        'senha'  => 'hashed',
        'ativo'  => 'boolean',
    ];

    public function getAuthPasswordName(): string
    {
        return 'senha';
    }

    public function ehAdmin(): bool
    {
        return $this->perfil === 1;
    }

    public function temModulo(string $slug): bool
    {
        if ($this->ehAdmin()) {
            return true;
        }

        $modulo = Modulo::where('slug', $slug)->where('ativo', true)->first();

        if (! $modulo) {
            return false;
        }

        return UsuarioModulo::where('id_usuario', $this->id)
            ->where('id_modulo', $modulo->id)
            ->exists();
    }

    /**
     * Slugs dos módulos habilitados. Admin recebe todos os ativos.
     *
     * @return array<int, string>
     */
    public function slugsModulosHabilitados(): array
    {
        if ($this->ehAdmin()) {
            return Modulo::where('ativo', true)->pluck('slug')->all();
        }

        $idModulos = UsuarioModulo::where('id_usuario', $this->id)->pluck('id_modulo');

        return Modulo::whereIn('id', $idModulos)->where('ativo', true)->pluck('slug')->all();
    }
}
