<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'description' => ['sometimes', 'required', 'string', 'max:255'],
            'code'    => ['sometimes', 'required', 'string', 'size:4', "unique:document_type,code,{$id}"],
        ];
    }
}
