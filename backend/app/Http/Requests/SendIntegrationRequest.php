<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\ExportBatch;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendIntegrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'batch_type'          => ['required', Rule::in([ExportBatch::TYPE_EXPENSE_REPORT, ExportBatch::TYPE_REIMBURSEMENT])],
            'integration_id'      => ['required', 'integer', 'min:1'],
            'bank_account_id'  => ['required', 'integer', 'exists:bank_account,id'],
            'ids'                => ['required', 'array', 'min:1'],
            'ids.*'              => ['integer', 'min:1'],
        ];
    }
}
