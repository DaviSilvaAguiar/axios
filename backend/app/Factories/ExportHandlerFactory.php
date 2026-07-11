<?php

declare(strict_types=1);

namespace App\Factories;

use App\Contracts\ExportHandlerInterface;
use Illuminate\Support\Facades\Config;
use InvalidArgumentException;

class ExportHandlerFactory
{
    /**
     * @param string $template
     * @return ExportHandlerInterface
     */
    public static function make(string $template): ExportHandlerInterface
    {
        $templates = Config::get('exportacao.templates', []);

        foreach ($templates as $entry) {
            if (($entry['codigo'] ?? null) === $template) {
                return app($entry['handler']);
            }
        }

        throw new InvalidArgumentException("Template de exportação [{$template}] não suportado.");
    }
}
