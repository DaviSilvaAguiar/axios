<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnexoRcmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'anexo' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf', 'max:10240'],
        ];
    }
}
