<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ReceitaWsService
{
    private string $urlBase;

    public function __construct()
    {
        $this->urlBase = env('RECEITAWS_URL');
    }

    /**
     * @param string $cnpj Apenas dígitos.
     * @return array{descricao:string|null,email:string|null,telefone:string|null,cep:string|null,logradouro:string|null,numero:string|null,complemento:string|null,bairro:string|null,cidade:string|null,uf:string|null}|null
     */
    public function consultarCnpj(string $cnpj): ?array
    {
        $cnpj = preg_replace('/\D/', '', $cnpj) ?? '';

        if (strlen($cnpj) !== 14) {
            return null;
        }

        try {
            $response = Http::acceptJson()->timeout(10)->get($this->urlBase . $cnpj);
        } catch (Throwable $e) {
            Log::warning('[ReceitaWS] erro de transporte', ['cnpj' => $cnpj, 'erro' => $e->getMessage()]);
            return null;
        }

        if ($response->failed()) {
            Log::warning('[ReceitaWS] HTTP ' . $response->status(), ['cnpj' => $cnpj]);
            return null;
        }

        $dados = $response->json();

        if (!is_array($dados) || ($dados['status'] ?? null) === 'ERROR') {
            return null;
        }

        return [
            'descricao'   => $this->primeiroPreenchido($dados['nome'] ?? null, $dados['fantasia'] ?? null),
            'email'       => $this->normalizarString($dados['email'] ?? null),
            'telefone'    => $this->normalizarString($dados['telefone'] ?? null),
            'cep'         => $this->somenteDigitos($dados['cep'] ?? null),
            'logradouro'  => $this->normalizarString($dados['logradouro'] ?? null),
            'numero'      => $this->normalizarString($dados['numero'] ?? null),
            'complemento' => $this->normalizarString($dados['complemento'] ?? null),
            'bairro'      => $this->normalizarString($dados['bairro'] ?? null),
            'cidade'      => $this->normalizarString($dados['municipio'] ?? null),
            'uf'          => $this->normalizarString($dados['uf'] ?? null),
        ];
    }

    private function primeiroPreenchido(?string $a, ?string $b): ?string
    {
        $a = $this->normalizarString($a);
        if ($a !== null) {
            return $a;
        }
        return $this->normalizarString($b);
    }

    private function normalizarString(?string $valor): ?string
    {
        if ($valor === null) {
            return null;
        }
        $trim = trim($valor);
        return $trim === '' ? null : $trim;
    }

    private function somenteDigitos(?string $valor): ?string
    {
        if ($valor === null) {
            return null;
        }
        $digitos = preg_replace('/\D/', '', $valor) ?? '';
        return $digitos === '' ? null : $digitos;
    }
}
