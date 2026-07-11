<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateLoteExportacaoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_lote' => ['required', 'string', 'in:CAIXA,REEMBOLSO'],
            'template'  => ['required', 'string'],
            'ids'       => ['required', 'array', 'min:1'],
            'ids.*'     => ['integer'],
        ];
    }
}
