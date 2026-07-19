<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role'            => ['required', 'integer', 'in:1,2,3'],
            'name'              => ['required', 'string', 'max:255'],
            'email'             => ['required', 'email', 'unique:user,email'],
            'password'             => ['required', 'string', 'min:8'],
            'erp_code' => ['nullable', 'string', 'max:100'],
            'tax_id'          => ['nullable', 'string', 'max:20'],
        ];
    }
}
