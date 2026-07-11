<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Rcm;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRcmStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'                    => ['required', 'integer', Rule::in([
                Rcm::STATUS_SOLICITADO,
                Rcm::STATUS_PENDENTE,
                Rcm::STATUS_EM_ANALISE,
                Rcm::STATUS_APROVADO,
                Rcm::STATUS_PAGAMENTO_AGENDADO,
                Rcm::STATUS_PAGO,
                Rcm::STATUS_REJEITADO,
            ])],
            'data_pagamento_programado' => ['required_if:status,' . Rcm::STATUS_PAGAMENTO_AGENDADO, 'nullable', 'date'],
            'motivo_rejeicao'           => ['required_if:status,' . Rcm::STATUS_REJEITADO, 'nullable', 'string', 'max:1000'],
        ];
    }
}
