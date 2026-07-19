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

    public function lookupCnpj(string $cnpj): ?array
    {
        $cnpj = preg_replace('/\D/', '', $cnpj) ?? '';

        if (strlen($cnpj) !== 14) {
            return null;
        }

        try {
            $response = Http::acceptJson()->timeout(10)->get($this->urlBase . $cnpj);
        } catch (Throwable $e) {
            Log::warning('[ReceitaWS] transport error', ['cnpj' => $cnpj, 'error' => $e->getMessage()]);
            return null;
        }

        if ($response->failed()) {
            Log::warning('[ReceitaWS] HTTP ' . $response->status(), ['cnpj' => $cnpj]);
            return null;
        }

        $data = $response->json();

        if (!is_array($data) || ($data['status'] ?? null) === 'ERROR') {
            return null;
        }

        return [
            'description'   => $this->firstFilled($data['name'] ?? null, $data['trade_name'] ?? null),
            'email'       => $this->normalizeString($data['email'] ?? null),
            'phone'    => $this->normalizeString($data['phone'] ?? null),
            'postal_code'         => $this->onlyDigits($data['postal_code'] ?? null),
            'street'  => $this->normalizeString($data['street'] ?? null),
            'number'      => $this->normalizeString($data['number'] ?? null),
            'complement' => $this->normalizeString($data['complement'] ?? null),
            'district'      => $this->normalizeString($data['district'] ?? null),
            'city'      => $this->normalizeString($data['city'] ?? null),
            'uf'          => $this->normalizeString($data['uf'] ?? null),
        ];
    }

    private function firstFilled(?string $a, ?string $b): ?string
    {
        $a = $this->normalizeString($a);
        if ($a !== null) {
            return $a;
        }
        return $this->normalizeString($b);
    }

    private function normalizeString(?string $amount): ?string
    {
        if ($amount === null) {
            return null;
        }
        $trim = trim($amount);
        return $trim === '' ? null : $trim;
    }

    private function onlyDigits(?string $amount): ?string
    {
        if ($amount === null) {
            return null;
        }
        $digits = preg_replace('/\D/', '', $amount) ?? '';
        return $digits === '' ? null : $digits;
    }
}
