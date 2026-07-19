<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Support\Money;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class MoneyTest extends TestCase
{
    public function test_parses_iso_decimal_string(): void
    {
        $this->assertSame('1234.56', Money::fromDecimalString('1234.56')->toDecimalString());
    }

    public function test_parses_brazilian_formatted_string(): void
    {
        $this->assertSame('1234.56', Money::fromDecimalString('1.234,56')->toDecimalString());
    }

    public function test_parses_int_and_float(): void
    {
        $this->assertSame('10.00', Money::fromDecimalString(10)->toDecimalString());
        $this->assertSame('10.50', Money::fromDecimalString(10.5)->toDecimalString());
    }

    public function test_rounds_to_two_decimals(): void
    {
        $this->assertSame('1.24', Money::fromDecimalString('1.235')->toDecimalString());
    }

    public function test_rejects_invalid_amount(): void
    {
        $this->expectException(InvalidArgumentException::class);
        Money::fromDecimalString('abc');
    }

    public function test_add_and_subtract(): void
    {
        $a = Money::fromDecimalString('100.50');
        $b = Money::fromDecimalString('0.50');
        $this->assertSame('101.00', $a->add($b)->toDecimalString());
        $this->assertSame('100.00', $a->subtract($b)->toDecimalString());
    }

    public function test_multiply(): void
    {
        $unit = Money::fromDecimalString('10.00');
        $this->assertSame('25.00', $unit->multiply('2.5')->toDecimalString());
        $this->assertSame('30.00', $unit->multiply(3)->toDecimalString());
    }

    public function test_compare_zero_and_negative(): void
    {
        $this->assertTrue(Money::zero()->isZero());
        $this->assertTrue(Money::fromDecimalString('-1.00')->isNegative());
        $this->assertFalse(Money::fromDecimalString('1.00')->isNegative());
        $this->assertSame(1, Money::fromDecimalString('2.00')->compareTo(Money::fromDecimalString('1.00')));
        $this->assertSame(-1, Money::fromDecimalString('1.00')->compareTo(Money::fromDecimalString('2.00')));
        $this->assertSame(0, Money::fromDecimalString('1.00')->compareTo(Money::fromDecimalString('1.00')));
    }

    public function test_cents_roundtrip(): void
    {
        $this->assertSame(123456, Money::fromDecimalString('1234.56')->cents());
        $this->assertSame('1234.56', Money::fromCents(123456)->toDecimalString());
    }

    public function test_format_brazilian(): void
    {
        $this->assertSame('R$ 1.234,56', Money::fromDecimalString('1234.56')->format());
    }

    public function test_json_serializes_to_decimal_string(): void
    {
        $this->assertSame('"1234.56"', json_encode(Money::fromDecimalString('1234.56')));
    }
}
