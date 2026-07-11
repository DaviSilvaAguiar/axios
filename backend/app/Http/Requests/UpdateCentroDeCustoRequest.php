<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCentroDeCustoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'descricao'     => ['sometimes', 'required', 'string', 'max:255', "unique:centro_custo,descricao,{$id}"],
            'codigo_cc_erp' => ['sometimes', 'nullable', 'string', 'max:100'],
            'ativo'         => ['sometimes', 'boolean'],
        ];
    }
}
