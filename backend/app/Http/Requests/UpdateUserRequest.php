<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'role' => ['sometimes', 'required', 'integer', 'in:1,2,3'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', "unique:user,email,{$id}"],
            'password' => ['sometimes', 'required', 'string', 'min:8'],
            'active' => ['sometimes', 'boolean'],
            'erp_code' => ['sometimes', 'nullable', 'string', 'max:100'],
            'tax_id' => ['sometimes', 'nullable', 'string', 'max:20'],
        ];
    }
}
