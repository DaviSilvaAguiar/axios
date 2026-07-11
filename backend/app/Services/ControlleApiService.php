<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ControlleApiService
{
    private string $urlLancamento;

    public function __construct()
    {
        $this->urlLancamento = env('CONTROLLE_API_URL');
    }

    /**
     * @param string $chave Token Bearer (já decifrado).
     * @param array $payload Body conforme contrato OpenAPI do Controlle.
     * @return array Resposta decodificada da API.
     * @throws RuntimeException
     */
    public function criarLancamento(string $chave, array $payload): array
    {
        Log::info('[Controlle] REQUEST', [
            'url'           => $this->urlLancamento,
            'chave_prefix'  => substr($chave, 0, 8) . '...',
            'chave_length'  => strlen($chave),
            'payload'       => $payload,
        ]);

        $response = Http::withHeaders([
                'Authorization' => "Bearer {$chave}",
                'Accept'        => 'application/json',
            ])
            ->acceptJson()
            ->asJson()
            ->timeout(20)
            ->withOptions(['allow_redirects' => false])
            ->post($this->urlLancamento, $payload);

        Log::info('[Controlle] RESPONSE', [
            'status'   => $response->status(),
            'headers'  => $response->headers(),
            'body_raw' => $response->body(),
        ]);

        if ($response->status() >= 300 && $response->status() < 400) {
            $destino = $response->header('Location') ?: '(sem header Location)';
            throw new RuntimeException(
                "Controlle redirecionou ({$response->status()}) para [{$destino}]. POSTs estavam virando GET — esse era o motivo de '200 OK' sem criar nada."
            );
        }

        if ($response->failed()) {
            throw new RuntimeException($this->mensagemErro($response));
        }

        return $response->json() ?? [];
    }

    /**
     * @param Response $response
     * @return string
     */
    private function mensagemErro(Response $response): string
    {
        $body = $response->json();
        $detalhe = is_array($body)
            ? (json_encode($body, JSON_UNESCAPED_UNICODE) ?: $response->body())
            : $response->body();

        return "Controlle respondeu HTTP {$response->status()}: {$detalhe}";
    }
}
