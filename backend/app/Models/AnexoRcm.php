<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnexoRcm extends Model
{
    protected $table = 'anexo_rcm';

    protected $fillable = [
        'id_despesa_rcm',
        'caminho',
    ];

    public function despesaRcm(): BelongsTo
    {
        return $this->belongsTo(DespesaRcm::class, 'id_despesa_rcm');
    }
}
