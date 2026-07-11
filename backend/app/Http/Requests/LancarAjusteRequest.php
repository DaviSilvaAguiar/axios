<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LancarAjusteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subtipo'        => ['required', 'integer', 'in:3,4,5'],
            'valor'          => ['required', 'numeric', 'min:0.01'],
            'data_transacao' => ['required', 'date'],
            'motivo'         => ['required', 'string', 'max:500'],
        ];
    }
}
