<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\DomainException;
use App\Models\Integration;
use App\Models\IntegrationKey;

class IntegrationService
{
    public function list(): array
    {
        $integrations = Integration::on('central')->orderBy('name')->get();

        $configured = IntegrationKey::query()->pluck('integration_id')->all();

        return $integrations
            ->map(fn (Integration $i): array => [
                'id' => $i->id,
                'name' => $i->name,
                'configured' => in_array($i->id, $configured, true),
            ])
            ->all();
    }

    public function saveKey(int $idIntegration, string $key): IntegrationKey
    {
        $integration = Integration::on('central')->find($idIntegration);

        if ($integration === null) {
            throw new DomainException('Integration not found.', 404);
        }

        return IntegrationKey::updateOrCreate(
            ['integration_id' => $idIntegration],
            ['key' => $key],
        );
    }
}
