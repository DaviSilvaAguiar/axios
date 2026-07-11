<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDespesaRcmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'data_despesa'    => ['required', 'date'],
            'valor'           => ['required', 'numeric', 'min:0.01'],
            'id_centro_custo' => ['required', 'integer', 'exists:centro_custo,id'],
            'descricao'       => ['required', 'string', 'max:255'],
            'id_categoria_despesa' => ['nullable', 'integer', 'exists:categoria_despesa,id'],
            'latitude'        => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'       => ['nullable', 'numeric', 'between:-180,180'],
            'endereco'        => ['nullable', 'string', 'max:255'],
            'descricao_fornecedor' => ['nullable', 'string', 'max:255'],
            'cpf_cnpj_fornecedor'  => ['nullable', 'string', 'max:14'],
            'id_fornecedor'        => ['nullable', 'integer', 'exists:fornecedor,id'],
            'anexos'          => ['nullable', 'array'],
            'anexos.*'        => ['file', 'mimes:jpeg,jpg,png,pdf', 'max:10240'],
        ];
    }
}
