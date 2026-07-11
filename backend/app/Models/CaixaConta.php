<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CaixaConta extends Model
{
    protected $table = 'caixa_conta';

    public const STATUS_ATIVO   = 1;
    public const STATUS_FECHADO = 2;

    public const TIPO_DINHEIRO_PIX = 1;
    public const TIPO_CARTAO_PRE   = 2;
    public const TIPO_OUTRO        = 3;

    protected $fillable = [
        'id_usuario',
        'id_centro_custo',
        'descricao',
        'saldo',
        'tipo',
        'status',
        'banco',
        'agencia',
        'numero_banco',
        'chave_pix',
        'data_pagamento',
    ];

    protected $casts = [
        'saldo'          => 'decimal:2',
        'tipo'           => 'integer',
        'status'         => 'integer',
        'data_pagamento' => 'datetime',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function centroDeCusto(): BelongsTo
    {
        return $this->belongsTo(CentroDeCusto::class, 'id_centro_custo');
    }

    public function transacoes(): HasMany
    {
        return $this->hasMany(CaixaTransacoes::class, 'id_caixa_conta');
    }
}
