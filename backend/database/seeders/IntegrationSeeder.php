<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Integration;
use Illuminate\Database\Seeder;

class IntegrationSeeder extends Seeder
{
    private const INTEGRATIONS = [
        ['name' => 'Controlle'],
    ];

    public function run(): void
    {
        foreach (self::INTEGRATIONS as $integration) {
            Integration::firstOrCreate(
                ['name' => $integration['name']],
            );
        }
    }
}
