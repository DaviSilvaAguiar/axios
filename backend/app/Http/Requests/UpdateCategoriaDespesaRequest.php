<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoriaDespesaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'descricao'  => ['sometimes', 'required', 'string', 'max:255', "unique:categoria_despesa,descricao,{$id}"],
            'codigo_erp' => ['sometimes', 'nullable', 'string', 'max:100'],
            'ativo'      => ['sometimes', 'boolean'],
        ];
    }
}
