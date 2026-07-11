<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRcmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo'                  => ['sometimes', 'required', 'string', 'max:255'],
            'id_centro_custo'         => ['sometimes', 'required', 'integer', 'exists:centro_custo,id'],
            'nome_solicitante'        => ['sometimes', 'nullable', 'required_without:id_usuario_requisitante', 'string', 'max:255'],
            'cpf_cnpj_solicitante'    => ['sometimes', 'nullable', 'required_without:id_usuario_requisitante', 'string', 'max:20'],
            'setor_requisitante'      => ['sometimes', 'required', 'string', 'max:255'],
            'id_usuario_requisitante' => ['sometimes', 'nullable', 'integer', 'exists:usuarios,id'],
            'obs'                     => ['sometimes', 'nullable', 'string'],
            'data_inicio_periodo' => ['sometimes', 'required', 'date'],
            'data_fim_periodo'    => ['sometimes', 'required', 'date', 'after_or_equal:data_inicio_periodo'],
            'banco'               => ['sometimes', 'nullable', 'string', 'max:255'],
            'agencia'             => ['sometimes', 'nullable', 'string', 'max:255'],
            'numero_banco'        => ['sometimes', 'nullable', 'string', 'max:255'],
            'chave_pix'           => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
