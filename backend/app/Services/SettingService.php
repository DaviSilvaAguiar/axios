<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;

class SettingService
{
    /**
     * @return Collection<int, Setting>
     */
    public function list(): Collection
    {
        return Setting::orderBy('parameter')->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Setting
    {
        $setting = Setting::findOrFail($id);
        $setting->update(['value' => (int) $data['value']]);

        return $setting;
    }
}
