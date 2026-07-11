<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCaixaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_centro_custo'        => ['required', 'integer', 'exists:centro_custo,id'],
            'descricao'              => ['required', 'string', 'max:255'],
            'data_inicio_periodo'    => ['required', 'date'],
            'data_fim_periodo'       => ['required', 'date', 'after_or_equal:data_inicio_periodo'],
            'obs'                    => ['nullable', 'string'],
            'banco'                  => ['nullable', 'string', 'max:255'],
            'agencia'                => ['nullable', 'string', 'max:255'],
            'numero_banco'           => ['nullable', 'string', 'max:255'],
            'chave_pix'              => ['nullable', 'string', 'max:255'],
            'descricao_requisitante'  => ['required_without:id_usuario_requisitante', 'nullable', 'string', 'max:255'],
            'setor_requisitante'      => ['required', 'string', 'max:255'],
            'cpf_cnpj_requisitante'   => ['required_without:id_usuario_requisitante', 'nullable', 'string', 'max:18'],
            'id_usuario_requisitante' => ['nullable', 'integer', 'exists:usuarios,id'],
        ];
    }
}
