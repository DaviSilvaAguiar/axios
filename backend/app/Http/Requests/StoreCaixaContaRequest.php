<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCaixaContaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_usuario'      => ['required', 'integer', 'exists:usuarios,id'],
            'id_centro_custo' => ['required', 'integer', 'exists:centro_custo,id'],
            'descricao'       => ['required', 'string', 'max:255'],
            'tipo'            => ['required', 'integer', 'in:1,2,3'],
            'banco'           => ['nullable', 'string', 'max:255'],
            'agencia'         => ['nullable', 'string', 'max:255'],
            'numero_banco'    => ['nullable', 'string', 'max:255'],
            'chave_pix'       => ['nullable', 'string', 'max:255'],
        ];
    }
}
