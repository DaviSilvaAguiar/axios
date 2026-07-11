<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fornecedor extends Model
{
    protected $table = 'fornecedor';

    protected $fillable = [
        'descricao',
        'cpf_cnpj',
        'tipo_pessoa',
        'email',
        'telefone',
        'cep',
        'logradouro',
        'numero',
        'complemento',
        'bairro',
        'cidade',
        'uf',
        'codigo_erp',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
    ];
}
