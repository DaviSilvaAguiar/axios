<?php

declare(strict_types=1);

namespace App\Factories;

use App\Contracts\ExportHandlerInterface;
use Illuminate\Support\Facades\Config;
use InvalidArgumentException;

class ExportHandlerFactory
{
    public static function make(string $template): ExportHandlerInterface
    {
        $templates = Config::get('export.templates', []);

        foreach ($templates as $entry) {
            if (($entry['code'] ?? null) === $template) {
                return app($entry['handler']);
            }
        }

        throw new InvalidArgumentException("Export template [{$template}] not supported.");
    }
}
