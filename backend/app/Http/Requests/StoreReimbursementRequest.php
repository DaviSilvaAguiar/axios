<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReimbursementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'                  => ['required', 'string', 'max:255'],
            'cost_center_id'         => ['required', 'integer', 'exists:cost_center,id'],
            'requester_name'        => ['required_without:requester_user_id', 'nullable', 'string', 'max:255'],
            'requester_tax_id'    => ['required_without:requester_user_id', 'nullable', 'string', 'max:20'],
            'requester_department'      => ['required', 'string', 'max:255'],
            'requester_user_id' => ['nullable', 'integer', 'exists:user,id'],
            'notes'                   => ['nullable', 'string'],
            'period_start_date' => ['required', 'date'],
            'period_end_date'    => ['required', 'date', 'after_or_equal:period_start_date'],
            'bank'               => ['nullable', 'string', 'max:255'],
            'branch'             => ['nullable', 'string', 'max:255'],
            'account_number'        => ['nullable', 'string', 'max:255'],
            'pix_key'           => ['nullable', 'string', 'max:255'],
        ];
    }
}
