<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ControlleApiService
{
    private string $transactionUrl;

    public function __construct()
    {
        $this->transactionUrl = env('CONTROLLE_API_URL');
    }

    public function createTransaction(string $key, array $payload): array
    {
        Log::info('[Controlle] REQUEST', [
            'url'           => $this->transactionUrl,
            'key_prefix'  => substr($key, 0, 8) . '...',
            'key_length'  => strlen($key),
            'payload'       => $payload,
        ]);

        $response = Http::withHeaders([
                'Authorization' => "Bearer {$key}",
                'Accept'        => 'application/json',
            ])
            ->acceptJson()
            ->asJson()
            ->timeout(20)
            ->withOptions(['allow_redirects' => false])
            ->post($this->transactionUrl, $payload);

        Log::info('[Controlle] RESPONSE', [
            'status'   => $response->status(),
            'headers'  => $response->headers(),
            'body_raw' => $response->body(),
        ]);

        if ($response->status() >= 300 && $response->status() < 400) {
            $target = $response->header('Location') ?: '(no Location header)';
            throw new RuntimeException(
                "Controlle redirected ({$response->status()}) to [{$target}]. POSTs were being turned into GET — that was the reason for '200 OK' creating nothing."
            );
        }

        if ($response->failed()) {
            throw new RuntimeException($this->errorMessage($response));
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
