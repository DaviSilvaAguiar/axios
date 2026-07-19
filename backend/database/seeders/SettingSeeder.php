<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    private const SETTINGS = [
        [
            'parameter' => 'enable_geolocation_expense_report_item',
            'description' => 'Enables the geolocation field when adding an expense report item.',
            'value' => 0,
        ],
        [
            'parameter' => 'enable_geolocation_reimbursement_item',
            'description' => 'Enables the geolocation field when adding a reimbursement item.',
            'value' => 0,
        ],
        [
            'parameter' => 'require_erp_code',
            'description' => 'Makes the ERP code required on Expense Category, Cost Center, Bank Account and Supplier records.',
            'value' => 0,
        ],
    ];

    public function run(): void
    {
        foreach (self::SETTINGS as $setting) {
            $record = Setting::firstOrCreate(
                ['parameter' => $setting['parameter']],
                [
                    'description' => $setting['description'],
                    'value' => $setting['value'],
                ],
            );

            if ($record->description !== $setting['description']) {
                $record->update(['description' => $setting['description']]);
            }
        }
    }
}
