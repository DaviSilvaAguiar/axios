<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => ['required', 'string', 'max:255', 'unique:bank_account,description'],
            'erp_code' => ['nullable', 'string', 'max:100'],
            'active' => ['nullable', 'boolean'],
        ];
    }
}
