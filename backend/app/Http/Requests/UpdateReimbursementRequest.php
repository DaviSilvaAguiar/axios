<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReimbursementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'cost_center_id' => ['sometimes', 'required', 'integer', 'exists:cost_center,id'],
            'requester_name' => ['sometimes', 'nullable', 'required_without:requester_user_id', 'string', 'max:255'],
            'requester_tax_id' => ['sometimes', 'nullable', 'required_without:requester_user_id', 'string', 'max:20'],
            'requester_department' => ['sometimes', 'required', 'string', 'max:255'],
            'requester_user_id' => ['sometimes', 'nullable', 'integer', 'exists:user,id'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'period_start_date' => ['sometimes', 'required', 'date'],
            'period_end_date' => ['sometimes', 'required', 'date', 'after_or_equal:period_start_date'],
            'bank' => ['sometimes', 'nullable', 'string', 'max:255'],
            'branch' => ['sometimes', 'nullable', 'string', 'max:255'],
            'account_number' => ['sometimes', 'nullable', 'string', 'max:255'],
            'pix_key' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
