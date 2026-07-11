<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'perfil'            => ['sometimes', 'required', 'integer', 'in:1,2,3'],
            'nome'              => ['sometimes', 'required', 'string', 'max:255'],
            'email'             => ['sometimes', 'required', 'email', "unique:usuarios,email,{$id}"],
            'senha'             => ['sometimes', 'required', 'string', 'min:8'],
            'ativo'             => ['sometimes', 'boolean'],
            'codigo_credor_erp' => ['sometimes', 'nullable', 'string', 'max:100'],
            'cpf_cnpj'          => ['sometimes', 'nullable', 'string', 'max:20'],
        ];
    }

}
