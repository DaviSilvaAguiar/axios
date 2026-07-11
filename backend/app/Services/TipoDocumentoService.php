<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TipoDocumento;
use Illuminate\Database\Eloquent\Collection;

class TipoDocumentoService
{
    public function listar(): Collection
    {
        return TipoDocumento::orderBy('descricao')->get();
    }

    public function buscar(int $id): TipoDocumento
    {
        return TipoDocumento::findOrFail($id);
    }

    public function criar(array $dados): TipoDocumento
    {
        return TipoDocumento::create($dados);
    }

    public function atualizar(int $id, array $dados): TipoDocumento
    {
        $tipoDocumento = TipoDocumento::findOrFail($id);
        $tipoDocumento->update($dados);

        return $tipoDocumento;
    }

    public function remover(int $id): void
    {
        TipoDocumento::findOrFail($id)->delete();
    }
}
