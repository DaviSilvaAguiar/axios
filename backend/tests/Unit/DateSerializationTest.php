<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Reimbursement;
use Tests\TestCase;

class DateSerializationTest extends TestCase
{
    public function test_date_only_fields_serialize_at_utc_midnight(): void
    {
        $reimbursement = new Reimbursement(['scheduled_payment_date' => '2026-08-20']);

        $serialized = $reimbursement->scheduled_payment_date->toIso8601String();

        $this->assertSame('2026-08-20T00:00:00+00:00', $serialized);
    }

    public function test_the_calendar_day_survives_the_round_trip(): void
    {
        $reimbursement = new Reimbursement(['scheduled_payment_date' => '2026-08-20']);

        $this->assertSame('2026-08-20', $reimbursement->scheduled_payment_date->format('Y-m-d'));
    }
}
