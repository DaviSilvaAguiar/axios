<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Config;
use Illuminate\Database\Eloquent\Collection;

class ConfigService
{
    /**
     * @return Collection<int, Config>
     */
    public function listar(): Collection
    {
        return Config::orderBy('parametro')->get();
    }

    /**
     * @param int                  $id
     * @param array<string, mixed> $dados
     * @return Config
     */
    public function atualizar(int $id, array $dados): Config
    {
        $config = Config::findOrFail($id);
        $config->update(['valor' => (int) $dados['valor']]);

        return $config;
    }
}
