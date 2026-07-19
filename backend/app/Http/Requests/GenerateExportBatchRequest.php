<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateExportBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'batch_type' => ['required', 'string', 'in:EXPENSE_REPORT,REIMBURSEMENT'],
            'template'  => ['required', 'string'],
            'ids'       => ['required', 'array', 'min:1'],
            'ids.*'     => ['integer'],
        ];
    }
}
