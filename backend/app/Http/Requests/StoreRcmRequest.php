<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRcmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo'                  => ['required', 'string', 'max:255'],
            'id_centro_custo'         => ['required', 'integer', 'exists:centro_custo,id'],
            'nome_solicitante'        => ['required_without:id_usuario_requisitante', 'nullable', 'string', 'max:255'],
            'cpf_cnpj_solicitante'    => ['required_without:id_usuario_requisitante', 'nullable', 'string', 'max:20'],
            'setor_requisitante'      => ['required', 'string', 'max:255'],
            'id_usuario_requisitante' => ['nullable', 'integer', 'exists:usuarios,id'],
            'obs'                     => ['nullable', 'string'],
            'data_inicio_periodo' => ['required', 'date'],
            'data_fim_periodo'    => ['required', 'date', 'after_or_equal:data_inicio_periodo'],
            'banco'               => ['nullable', 'string', 'max:255'],
            'agencia'             => ['nullable', 'string', 'max:255'],
            'numero_banco'        => ['nullable', 'string', 'max:255'],
            'chave_pix'           => ['nullable', 'string', 'max:255'],
        ];
    }
}
