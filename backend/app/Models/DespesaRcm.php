<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DespesaRcm extends Model
{
    protected $table = 'despesa_rcm';

    protected $fillable = [
        'id_rcm',
        'id_centro_custo',
        'descricao',
        'descricao_fornecedor',
        'cpf_cnpj_fornecedor',
        'id_fornecedor',
        'valor',
        'data_despesa',
        'id_categoria_despesa',
        'latitude',
        'longitude',
        'endereco',
    ];

    protected $casts = [
        'valor'                => 'decimal:2',
        'id_rcm'               => 'integer',
        'id_centro_custo'      => 'integer',
        'id_categoria_despesa' => 'integer',
        'id_fornecedor'        => 'integer',
        'data_despesa'         => 'date',
        'latitude'             => 'decimal:7',
        'longitude'            => 'decimal:7',
    ];

    public function rcm(): BelongsTo
    {
        return $this->belongsTo(Rcm::class, 'id_rcm');
    }

    public function centroDeCusto(): BelongsTo
    {
        return $this->belongsTo(CentroDeCusto::class, 'id_centro_custo');
    }

    public function categoriaDespesa(): BelongsTo
    {
        return $this->belongsTo(CategoriaDespesa::class, 'id_categoria_despesa');
    }

    public function anexos(): HasMany
    {
        return $this->hasMany(AnexoRcm::class, 'id_despesa_rcm');
    }

    public function fornecedor(): BelongsTo
    {
        return $this->belongsTo(Fornecedor::class, 'id_fornecedor');
    }
}
