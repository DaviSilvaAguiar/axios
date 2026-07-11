<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OverviewDashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ano' => ['nullable', 'integer', 'min:1900', 'max:2200'],
            'mes' => ['nullable', 'integer', 'min:1', 'max:12'],
        ];
    }
}
