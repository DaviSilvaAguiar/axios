<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'required', 'integer', 'in:1,2,3,4,5,6,7'],
            'rejection_reason' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'paid_at' => ['sometimes', 'nullable', 'date'],
            'cost_center_id' => ['sometimes', 'required', 'integer', 'exists:cost_center,id'],
            'description' => ['sometimes', 'required', 'string', 'max:255'],
            'period_start_date' => ['sometimes', 'required', 'date'],
            'period_end_date' => ['sometimes', 'required', 'date', 'after_or_equal:period_start_date'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'bank' => ['sometimes', 'nullable', 'string', 'max:255'],
            'branch' => ['sometimes', 'nullable', 'string', 'max:255'],
            'account_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'pix_key' => ['sometimes', 'nullable', 'string', 'max:255'],
            'requester_description' => ['sometimes', 'required', 'string', 'max:255'],
            'requester_department' => ['sometimes', 'required', 'string', 'max:255'],
            'requester_tax_id' => ['sometimes', 'nullable', 'required_without:requester_user_id', 'string', 'max:18'],
            'requester_user_id' => ['sometimes', 'nullable', 'integer', 'exists:user,id'],
        ];
    }
}
