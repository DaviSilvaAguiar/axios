<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;

class SettingService
{
    public function list(): Collection
    {
        return Setting::orderBy('parameter')->get();
    }

    public function update(int $id, array $data): Setting
    {
        $setting = Setting::findOrFail($id);
        $setting->update(['value' => (int) $data['value']]);

        return $setting;
    }
}
