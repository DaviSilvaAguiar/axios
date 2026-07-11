<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LancarCreditoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'valor'          => ['required', 'numeric', 'min:0.01'],
            'data_transacao' => ['required', 'date'],
            'observacao'     => ['nullable', 'string', 'max:500'],
        ];
    }
}
