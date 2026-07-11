<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'perfil'            => ['required', 'integer', 'in:1,2,3'],
            'nome'              => ['required', 'string', 'max:255'],
            'email'             => ['required', 'email', 'unique:usuarios,email'],
            'senha'             => ['required', 'string', 'min:8'],
            'codigo_credor_erp' => ['nullable', 'string', 'max:100'],
            'cpf_cnpj'          => ['nullable', 'string', 'max:20'],
        ];
    }

}
