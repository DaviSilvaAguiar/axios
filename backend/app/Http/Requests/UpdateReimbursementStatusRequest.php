<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Reimbursement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReimbursementStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'                    => ['required', 'integer', Rule::in([
                Reimbursement::STATUS_REQUESTED,
                Reimbursement::STATUS_PENDING,
                Reimbursement::STATUS_UNDER_REVIEW,
                Reimbursement::STATUS_APPROVED,
                Reimbursement::STATUS_PAYMENT_SCHEDULED,
                Reimbursement::STATUS_PAID,
                Reimbursement::STATUS_REJECTED,
            ])],
            'scheduled_payment_date' => ['required_if:status,' . Reimbursement::STATUS_PAYMENT_SCHEDULED, 'nullable', 'date'],
            'rejection_reason'           => ['required_if:status,' . Reimbursement::STATUS_REJECTED, 'nullable', 'string', 'max:1000'],
        ];
    }
}
