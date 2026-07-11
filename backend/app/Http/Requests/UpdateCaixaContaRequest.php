<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCaixaContaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'descricao'    => ['sometimes', 'required', 'string', 'max:255'],
            'tipo'         => ['sometimes', 'required', 'integer', 'in:1,2,3'],
            'banco'        => ['nullable', 'string', 'max:255'],
            'agencia'      => ['nullable', 'string', 'max:255'],
            'numero_banco' => ['nullable', 'string', 'max:255'],
            'chave_pix'    => ['nullable', 'string', 'max:255'],
        ];
    }
}
