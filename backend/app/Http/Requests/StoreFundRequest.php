<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id'      => ['required', 'integer', 'exists:user,id'],
            'cost_center_id' => ['required', 'integer', 'exists:cost_center,id'],
            'description'       => ['required', 'string', 'max:255'],
            'type'            => ['required', 'integer', 'in:1,2,3'],
            'bank'           => ['nullable', 'string', 'max:255'],
            'branch'         => ['nullable', 'string', 'max:255'],
            'account_number'    => ['nullable', 'string', 'max:255'],
            'pix_key'       => ['nullable', 'string', 'max:255'],
        ];
    }
}
