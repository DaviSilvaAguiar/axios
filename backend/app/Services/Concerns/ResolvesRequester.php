<?php

declare(strict_types=1);

namespace App\Services\Concerns;

use App\Models\User;
use Illuminate\Validation\ValidationException;

trait ResolvesRequester
{
    protected function resolveRequester(array $data, string $nameField): array
    {
        if (empty($data['requester_user_id'])) {
            return $data;
        }

        $user = User::find($data['requester_user_id']);

        if (!$user) {
            throw ValidationException::withMessages([
                'requester_user_id' => ['Employee not found.'],
            ]);
        }

        if (empty($data[$nameField])) {
            $data[$nameField] = $user->name;
        }

        if (empty($data['requester_tax_id'])) {
            $data['requester_tax_id'] = $user->tax_id ?? '';
        }

        return $data;
    }
}
