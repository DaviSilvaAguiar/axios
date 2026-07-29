<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCostCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'description' => ['sometimes', 'required', 'string', 'max:255', "unique:cost_center,description,{$id}"],
            'erp_code' => ['sometimes', Setting::enabled(Setting::REQUIRE_ERP_CODE) ? 'required' : 'nullable', 'string', 'max:100'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
