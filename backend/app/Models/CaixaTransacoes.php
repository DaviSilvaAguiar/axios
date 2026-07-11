<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CaixaTransacoes extends Model
{
    protected $table = 'caixa_transacoes';

    public const TIPO_CREDITO = 1;
    public const TIPO_DEBITO  = 2;

    public const SUBTIPO_ADIANTAMENTO     = 1;
    public const SUBTIPO_ABATIMENTO_RDC   = 2;
    public const SUBTIPO_DEVOLUCAO        = 3;
    public const SUBTIPO_AJUSTE_POSITIVO  = 4;
    public const SUBTIPO_AJUSTE_NEGATIVO  = 5;

    protected $fillable = [
        'id_usuario',
        'id_caixa_conta',
        'id_caixa',
        'tipo_transacao',
        'subtipo',
        'valor',
        'observacao',
        'motivo',
        'data_transacao',
    ];

    protected $casts = [
        'tipo_transacao'  => 'integer',
        'subtipo'         => 'integer',
        'valor'           => 'decimal:2',
        'data_transacao'  => 'datetime',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function caixaConta(): BelongsTo
    {
        return $this->belongsTo(CaixaConta::class, 'id_caixa_conta');
    }

    public function caixa(): BelongsTo
    {
        return $this->belongsTo(Caixa::class, 'id_caixa');
    }
}
