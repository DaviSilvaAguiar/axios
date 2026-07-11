<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AprovarCaixaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_caixa_conta' => ['required', 'integer', 'exists:caixa_conta,id'],
        ];
    }
}
