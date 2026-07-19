<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'description'  => ['sometimes', 'required', 'string', 'max:255', "unique:bank_account,description,{$id}"],
            'erp_code' => ['sometimes', 'nullable', 'string', 'max:100'],
            'active'      => ['sometimes', 'boolean'],
        ];
    }
}
