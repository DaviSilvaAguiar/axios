<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CaixaDespesa extends Model
{
    protected $table = 'caixa_despesa';

    protected $fillable = [
        'id_caixa',
        'id_tipo_documento',
        'id_centro_custo',
        'id_categoria_despesa',
        'valor',
        'descricao',
        'data_despesa',
        'cpf_cnpj_fornecedor',
        'descricao_fornecedor',
        'id_fornecedor',
        'quantidade',
        'unidade',
        'valor_unitario',
        'numero_documento',
        'serie_documento',
        'chave_de_acesso',
        'latitude',
        'longitude',
        'endereco',
    ];

    protected $casts = [
        'id_caixa'             => 'integer',
        'id_tipo_documento'    => 'integer',
        'id_centro_custo'      => 'integer',
        'id_categoria_despesa' => 'integer',
        'id_fornecedor'        => 'integer',
        'data_despesa'         => 'datetime',
        'valor'                => 'decimal:2',
        'quantidade'           => 'decimal:2',
        'valor_unitario'       => 'decimal:2',
        'numero_documento'     => 'integer',
        'serie_documento'      => 'integer',
        'latitude'             => 'decimal:7',
        'longitude'            => 'decimal:7',
    ];

    public function anexos(): HasMany
    {
        return $this->hasMany(CaixaDespesaAnexo::class, 'id_caixa_despesa');
    }

    public function caixa(): BelongsTo
    {
        return $this->belongsTo(Caixa::class, 'id_caixa');
    }

    public function tipoDocumento(): BelongsTo
    {
        return $this->belongsTo(TipoDocumento::class, 'id_tipo_documento');
    }

    public function centroDeCusto(): BelongsTo
    {
        return $this->belongsTo(CentroDeCusto::class, 'id_centro_custo');
    }

    public function categoriaDespesa(): BelongsTo
    {
        return $this->belongsTo(CategoriaDespesa::class, 'id_categoria_despesa');
    }

    public function fornecedor(): BelongsTo
    {
        return $this->belongsTo(Fornecedor::class, 'id_fornecedor');
    }
}
