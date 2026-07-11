<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaixaDespesaAnexo extends Model
{
    protected $table = 'caixa_despesa_anexo';

    protected $fillable = [
        'id_caixa_despesa',
        'caminho',
    ];

    public function caixaDespesa(): BelongsTo
    {
        return $this->belongsTo(CaixaDespesa::class, 'id_caixa_despesa');
    }
}
