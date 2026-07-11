<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoteExportacao extends Model
{
    public const TIPO_CAIXA     = 'CAIXA';
    public const TIPO_REEMBOLSO = 'REEMBOLSO';

    protected $table = 'lote_exportacao';

    protected $fillable = [
        'id_usuario',
        'tipo_lote',
        'template_utilizado',
        'valor_total',
        'quantidade_itens',
        'nome_arquivo',
        'caminho_arquivo',
    ];

    protected $casts = [
        'valor_total'      => 'decimal:2',
        'quantidade_itens' => 'integer',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function caixas(): HasMany
    {
        return $this->hasMany(Caixa::class, 'id_lote_exportacao');
    }

    public function rcms(): HasMany
    {
        return $this->hasMany(Rcm::class, 'id_lote_exportacao');
    }
}
