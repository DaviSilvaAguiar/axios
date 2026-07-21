<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class SupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('tax_id')) {
            $this->merge(['tax_id' => preg_replace('/\D/', '', (string) $this->input('tax_id'))]);
        }
    }

    public function rules(): array
    {
        $id = (int) ($this->route('id') ?? 0);
        $sometimes = $id > 0 ? ['sometimes'] : [];
        $uniqueTaxId = $id > 0
            ? "unique:supplier,tax_id,{$id}"
            : 'unique:supplier,tax_id';

        return [
            'description' => [...$sometimes, 'required', 'string', 'max:255'],
            'tax_id' => [...$sometimes, 'required', 'string', $uniqueTaxId, $this->ruleTaxIdLength()],
            'person_type' => [...$sometimes, 'required', 'in:F,J'],
            'email' => [...$sometimes, 'nullable', 'email', 'max:255'],
            'phone' => [...$sometimes, 'nullable', 'string', 'max:20'],
            'postal_code' => [...$sometimes, 'nullable', 'string', 'max:8'],
            'street' => [...$sometimes, 'nullable', 'string', 'max:255'],
            'number' => [...$sometimes, 'nullable', 'string', 'max:20'],
            'complement' => [...$sometimes, 'nullable', 'string', 'max:100'],
            'district' => [...$sometimes, 'nullable', 'string', 'max:100'],
            'city' => [...$sometimes, 'nullable', 'string', 'max:100'],
            'uf' => [...$sometimes, 'nullable', 'string', 'size:2'],
            'erp_code' => [...$sometimes, 'nullable', 'string', 'max:100'],
            'active' => [...$sometimes, 'boolean'],
        ];
    }

    private function ruleTaxIdLength(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            $type = $this->input('person_type');
            $digits = (string) $value;

            if ($type === 'F' && strlen($digits) !== 11) {
                $fail('CPF must have 11 digits.');

                return;
            }

            if ($type === 'J' && strlen($digits) !== 14) {
                $fail('CNPJ must have 14 digits.');
            }
        };
    }
}
