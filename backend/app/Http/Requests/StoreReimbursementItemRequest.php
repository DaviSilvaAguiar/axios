<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReimbursementItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expense_date'    => ['required', 'date'],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'cost_center_id' => ['required', 'integer', 'exists:cost_center,id'],
            'description'       => ['required', 'string', 'max:255'],
            'expense_category_id' => ['nullable', 'integer', 'exists:expense_category,id'],
            'latitude'        => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'       => ['nullable', 'numeric', 'between:-180,180'],
            'address'        => ['nullable', 'string', 'max:255'],
            'supplier_description' => ['nullable', 'string', 'max:255'],
            'supplier_tax_id'  => ['nullable', 'string', 'max:14'],
            'supplier_id'        => ['nullable', 'integer', 'exists:supplier,id'],
            'attachments'     => ['nullable', 'array'],
            'attachments.*'   => ['file', 'mimes:jpeg,jpg,png,pdf', 'max:10240'],
        ];
    }
}
