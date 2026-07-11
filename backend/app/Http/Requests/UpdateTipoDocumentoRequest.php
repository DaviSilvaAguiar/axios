<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTipoDocumentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'descricao' => ['sometimes', 'required', 'string', 'max:255'],
            'codigo'    => ['sometimes', 'required', 'string', 'size:4', "unique:tipo_documento,codigo,{$id}"],
        ];
    }
}
