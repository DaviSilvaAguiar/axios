<?php

declare(strict_types=1);

namespace App\Exceptions;

class IntegrationException extends DomainException
{
    public function __construct(string $message, int $status = 502)
    {
        parent::__construct($message, $status);
    }
}
