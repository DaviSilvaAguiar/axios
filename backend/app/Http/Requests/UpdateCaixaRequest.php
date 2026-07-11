<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCaixaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'                 => ['sometimes', 'required', 'integer', 'in:1,2,3,4,5,6,7'],
            'motivo_rejeicao'        => ['sometimes', 'nullable', 'string', 'max:1000'],
            'data_pagamento'         => ['sometimes', 'nullable', 'date'],
            'id_centro_custo'        => ['sometimes', 'required', 'integer', 'exists:centro_custo,id'],
            'descricao'              => ['sometimes', 'required', 'string', 'max:255'],
            'data_inicio_periodo'    => ['sometimes', 'required', 'date'],
            'data_fim_periodo'       => ['sometimes', 'required', 'date', 'after_or_equal:data_inicio_periodo'],
            'obs'                    => ['sometimes', 'nullable', 'string'],
            'banco'                  => ['sometimes', 'nullable', 'string', 'max:255'],
            'agencia'                => ['sometimes', 'nullable', 'string', 'max:255'],
            'numero_banco'           => ['sometimes', 'nullable', 'string', 'max:255'],
            'chave_pix'              => ['sometimes', 'nullable', 'string', 'max:255'],
            'descricao_requisitante'  => ['sometimes', 'required', 'string', 'max:255'],
            'setor_requisitante'      => ['sometimes', 'required', 'string', 'max:255'],
            'cpf_cnpj_requisitante'   => ['sometimes', 'nullable', 'required_without:id_usuario_requisitante', 'string', 'max:18'],
            'id_usuario_requisitante' => ['sometimes', 'nullable', 'integer', 'exists:usuarios,id'],
        ];
    }
}
