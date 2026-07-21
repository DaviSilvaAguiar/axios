<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\IntegrationException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ControlleApiService
{
    private string $transactionUrl;

    public function __construct()
    {
        $this->transactionUrl = (string) config('services.controlle.url');
    }

    public function createTransaction(string $key, array $payload): array
    {
        Log::info('[Controlle] REQUEST', [
            'url' => $this->transactionUrl,
            'key_prefix' => substr($key, 0, 8).'...',
            'key_length' => strlen($key),
            'payload' => $payload,
        ]);

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$key}",
            'Accept' => 'application/json',
        ])
            ->acceptJson()
            ->asJson()
            ->timeout(20)
            ->withOptions(['allow_redirects' => false])
            ->post($this->transactionUrl, $payload);

        Log::info('[Controlle] RESPONSE', [
            'status' => $response->status(),
            'headers' => $response->headers(),
            'body_raw' => $response->body(),
        ]);

        if ($response->status() >= 300 && $response->status() < 400) {
            throw new IntegrationException("Controlle returned an unexpected redirect (HTTP {$response->status()}).");
        }

        if ($response->failed()) {
            throw new IntegrationException($this->errorMessage($response));
        }

        return $response->json() ?? [];
    }

    private function errorMessage(Response $response): string
    {
        $body = $response->json();
        $detail = is_array($body)
            ? (json_encode($body, JSON_UNESCAPED_UNICODE) ?: $response->body())
            : $response->body();

        return "Controlle responded HTTP {$response->status()}: {$detail}";
    }
}
