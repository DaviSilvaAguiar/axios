<?php

declare(strict_types=1);

namespace App\Support;

use InvalidArgumentException;
use JsonSerializable;
use Stringable;

final class Money implements JsonSerializable, Stringable
{
    private const SCALE = 2;

    private function __construct(private readonly string $amount)
    {
    }

    public static function zero(): self
    {
        return new self('0.00');
    }

    public static function fromCents(int $cents): self
    {
        return new self(bcdiv((string) $cents, '100', self::SCALE));
    }

    public static function fromDecimalString(string|int|float $value): self
    {
        if (is_int($value) || is_float($value)) {
            return new self(number_format((float) $value, self::SCALE, '.', ''));
        }

        $cleaned = str_replace([' ', "\u{00A0}"], '', $value);

        if ($cleaned === '') {
            throw new InvalidArgumentException('Invalid monetary amount.');
        }

        if (str_contains($cleaned, ',')) {
            $cleaned = str_replace('.', '', $cleaned);
            $cleaned = str_replace(',', '.', $cleaned);
        }

        if (!is_numeric($cleaned)) {
            throw new InvalidArgumentException('Invalid monetary amount.');
        }

        return new self(number_format((float) $cleaned, self::SCALE, '.', ''));
    }

    public function add(self $other): self
    {
        return new self(bcadd($this->amount, $other->amount, self::SCALE));
    }

    public function subtract(self $other): self
    {
        return new self(bcsub($this->amount, $other->amount, self::SCALE));
    }

    public function multiply(string|int|float $factor): self
    {
        $result = bcmul($this->amount, self::factorToString($factor), self::SCALE + 4);

        return new self(number_format((float) $result, self::SCALE, '.', ''));
    }

    public function compareTo(self $other): int
    {
        return bccomp($this->amount, $other->amount, self::SCALE);
    }

    public function isZero(): bool
    {
        return $this->compareTo(self::zero()) === 0;
    }

    public function isNegative(): bool
    {
        return $this->compareTo(self::zero()) === -1;
    }

    public function toDecimalString(): string
    {
        return $this->amount;
    }

    public function cents(): int
    {
        return (int) bcmul($this->amount, '100', 0);
    }

    public function format(): string
    {
        return 'R$ ' . number_format((float) $this->amount, self::SCALE, ',', '.');
    }

    public function jsonSerialize(): string
    {
        return $this->amount;
    }

    public function __toString(): string
    {
        return $this->amount;
    }

    private static function factorToString(string|int|float $factor): string
    {
        if (is_string($factor)) {
            return is_numeric($factor) ? $factor : '0';
        }

        return (string) $factor;
    }
}
