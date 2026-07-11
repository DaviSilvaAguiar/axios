<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rcm extends Model
{
    protected $table = 'rcm';

    public const STATUS_SOLICITADO         = 1;
    public const STATUS_PENDENTE           = 2;
    public const STATUS_EM_ANALISE         = 3;
    public const STATUS_APROVADO           = 4;
    public const STATUS_PAGAMENTO_AGENDADO = 5;
    public const STATUS_PAGO               = 6;
    public const STATUS_REJEITADO          = 7;

    protected $fillable = [
        'id_usuario',
        'id_centro_custo',
        'titulo',
        'nome_solicitante',
        'cpf_cnpj_solicitante',
        'setor_requisitante',
        'id_usuario_requisitante',
        'obs',
        'data_inicio_periodo',
        'data_fim_periodo',
        'status',
        'data_pagamento_programado',
        'motivo_rejeicao',
        'data_exportacao',
        'banco',
        'agencia',
        'numero_banco',
        'chave_pix',
        'id_lote_exportacao',
    ];

    protected $casts = [
        'id_usuario'                => 'integer',
        'id_centro_custo'           => 'integer',
        'id_usuario_requisitante'   => 'integer',
        'status'                    => 'integer',
        'data_inicio_periodo'       => 'datetime',
        'data_fim_periodo'          => 'datetime',
        'data_pagamento_programado' => 'datetime',
        'data_exportacao'           => 'datetime',
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
        return $this->hasMany(DespesaRcm::class, 'id_rcm');
    }

    public function loteExportacao(): BelongsTo
    {
        return $this->belongsTo(LoteExportacao::class, 'id_lote_exportacao');
    }
}
