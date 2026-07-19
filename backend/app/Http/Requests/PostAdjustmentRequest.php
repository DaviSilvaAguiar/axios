<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PostAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subtype'        => ['required', 'integer', 'in:3,4,5'],
            'amount'          => ['required', 'numeric', 'min:0.01'],
            'transaction_date' => ['required', 'date'],
            'reason'         => ['required', 'string', 'max:500'],
        ];
    }
}
