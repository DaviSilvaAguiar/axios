<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Integracao;
use App\Models\IntegracaoChave;
use UnexpectedValueException;

class IntegracaoService
{
    /**
     * @return array<int, array{id:int, nome:string, configurada:bool}>
     */
    public function listar(): array
    {
        $integracoes = Integracao::on('central')->orderBy('nome')->get();

        $configuradas = IntegracaoChave::query()->pluck('id_integracao')->all();

        return $integracoes
            ->map(fn (Integracao $i): array => [
                'id'          => $i->id,
                'nome'        => $i->nome,
                'configurada' => in_array($i->id, $configuradas, true),
            ])
            ->all();
    }

    /**
     * @param int $idIntegracao
     * @param string $chave
     * @return IntegracaoChave
     * @throws UnexpectedValueException
     */
    public function salvarChave(int $idIntegracao, string $chave): IntegracaoChave
    {
        $integracao = Integracao::on('central')->find($idIntegracao);

        if ($integracao === null) {
            throw new UnexpectedValueException('Integração não encontrada.');
        }

        return IntegracaoChave::updateOrCreate(
            ['id_integracao' => $idIntegracao],
            ['chave' => $chave],
        );
    }
}
