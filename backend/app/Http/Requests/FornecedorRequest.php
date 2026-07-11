<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class FornecedorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('cpf_cnpj')) {
            $this->merge(['cpf_cnpj' => preg_replace('/\D/', '', (string) $this->input('cpf_cnpj'))]);
        }
    }

    public function rules(): array
    {
        $id           = (int) ($this->route('id') ?? 0);
        $sometimes    = $id > 0 ? ['sometimes'] : [];
        $uniqueCpfCnpj = $id > 0
            ? "unique:fornecedor,cpf_cnpj,{$id}"
            : 'unique:fornecedor,cpf_cnpj';

        return [
            'descricao'   => [...$sometimes, 'required', 'string', 'max:255'],
            'cpf_cnpj'    => [...$sometimes, 'required', 'string', $uniqueCpfCnpj, $this->ruleTamanhoCpfCnpj()],
            'tipo_pessoa' => [...$sometimes, 'required', 'in:F,J'],
            'email'       => [...$sometimes, 'nullable', 'email', 'max:255'],
            'telefone'    => [...$sometimes, 'nullable', 'string', 'max:20'],
            'cep'         => [...$sometimes, 'nullable', 'string', 'max:8'],
            'logradouro'  => [...$sometimes, 'nullable', 'string', 'max:255'],
            'numero'      => [...$sometimes, 'nullable', 'string', 'max:20'],
            'complemento' => [...$sometimes, 'nullable', 'string', 'max:100'],
            'bairro'      => [...$sometimes, 'nullable', 'string', 'max:100'],
            'cidade'      => [...$sometimes, 'nullable', 'string', 'max:100'],
            'uf'          => [...$sometimes, 'nullable', 'string', 'size:2'],
            'codigo_erp'  => [...$sometimes, 'nullable', 'string', 'max:100'],
            'ativo'       => [...$sometimes, 'boolean'],
        ];
    }

    private function ruleTamanhoCpfCnpj(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            $tipo   = $this->input('tipo_pessoa');
            $digits = (string) $value;

            if ($tipo === 'F' && strlen($digits) !== 11) {
                $fail('CPF deve ter 11 dígitos.');
                return;
            }

            if ($tipo === 'J' && strlen($digits) !== 14) {
                $fail('CNPJ deve ter 14 dígitos.');
            }
        };
    }
}
