<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Caixa extends Model
{
    protected $table = 'caixa';

    public const STATUS_RASCUNHO           = 1;
    public const STATUS_PENDENTE           = 2;
    public const STATUS_EM_ANALISE         = 3;
    public const STATUS_APROVADO           = 4;
    public const STATUS_PAGAMENTO_AGENDADO = 5;
    public const STATUS_PAGO               = 6;
    public const STATUS_REJEITADO          = 7;

    protected $fillable = [
        'id_usuario',
        'id_centro_custo',
        'descricao',
        'status',
        'motivo_rejeicao',
        'data_necessidade',
        'data_inicio_periodo',
        'data_fim_periodo',
        'obs',
        'banco',
        'agencia',
        'numero_banco',
        'chave_pix',
        'descricao_requisitante',
        'setor_requisitante',
        'cpf_cnpj_requisitante',
        'id_usuario_requisitante',
        'data_exportacao',
        'data_pagamento',
        'id_lote_exportacao',
    ];

    protected $casts = [
        'id_usuario'              => 'integer',
        'id_centro_custo'         => 'integer',
        'id_usuario_requisitante' => 'integer',
        'id_lote_exportacao'      => 'integer',
        'status'                  => 'integer',
        'data_necessidade'        => 'datetime',
        'data_inicio_periodo'     => 'datetime',
        'data_fim_periodo'        => 'datetime',
        'data_exportacao'         => 'datetime',
        'data_pagamento'          => 'datetime',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function usuarioRequisitante(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario_requisitante');
    }

    public function centroDeCusto(): BelongsTo
    {
        return $this->belongsTo(CentroDeCusto::class, 'id_centro_custo');
    }

    public function despesas(): HasMany
    {
        return $this->hasMany(CaixaDespesa::class, 'id_caixa');
    }

    public function loteExportacao(): BelongsTo
    {
        return $this->belongsTo(LoteExportacao::class, 'id_lote_exportacao');
    }
}
