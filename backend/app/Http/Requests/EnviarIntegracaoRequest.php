<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\LoteExportacao;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EnviarIntegracaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_lote'          => ['required', Rule::in([LoteExportacao::TIPO_CAIXA, LoteExportacao::TIPO_REEMBOLSO])],
            'id_integracao'      => ['required', 'integer', 'min:1'],
            'id_conta_bancaria'  => ['required', 'integer', 'exists:conta_bancaria,id'],
            'ids'                => ['required', 'array', 'min:1'],
            'ids.*'              => ['integer', 'min:1'],
        ];
    }
}
