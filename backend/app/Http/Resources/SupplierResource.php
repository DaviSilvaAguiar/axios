<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Supplier
 */
class SupplierResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'tax_id' => $this->tax_id,
            'person_type' => $this->person_type,
            'email' => $this->email,
            'phone' => $this->phone,
            'postal_code' => $this->postal_code,
            'street' => $this->street,
            'number' => $this->number,
            'complement' => $this->complement,
            'district' => $this->district,
            'city' => $this->city,
            'uf' => $this->uf,
            'erp_code' => $this->erp_code,
            'active' => $this->active,
        ];
    }
}
