<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContaBancariaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'descricao'  => ['required', 'string', 'max:255', 'unique:conta_bancaria,descricao'],
            'codigo_erp' => ['nullable', 'string', 'max:100'],
            'ativo'      => ['nullable', 'boolean'],
        ];
    }
}
