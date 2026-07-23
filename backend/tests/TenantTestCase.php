<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Support\Facades\DB;

abstract class TenantTestCase extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $database = storage_path('framework/testing/tenant-test.sqlite');

        if (! is_dir(dirname($database))) {
            mkdir(dirname($database), 0777, true);
        }

        if (! file_exists($database)) {
            touch($database);
        }

        $sqlite = array_merge(config('database.connections.sqlite'), ['database' => $database]);

        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite' => $sqlite,
            'database.connections.central' => $sqlite,
            'database.connections.tenant' => $sqlite,
        ]);

        DB::purge('sqlite');
        DB::purge('central');
        DB::purge('tenant');

        $this->artisan('migrate:fresh', [
            '--database' => 'sqlite',
            '--path' => [
                'database/migrations',
                'database/migrations/tenant',
            ],
            '--realpath' => false,
        ]);
    }
}
