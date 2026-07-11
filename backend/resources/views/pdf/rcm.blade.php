<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>RCM #{{ str_pad($rcm->id, 6, '0', STR_PAD_LEFT) }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: DejaVu Sans, sans-serif;
    font-size: 10px;
    color: #000000;
    background: #ffffff;
    padding: 20px 30px;
  }

  /* ────────── CABEÇALHO ────────── */
  .doc-header {
    width: 100%;
    border: 1px solid #000000;
    margin-bottom: 10px;
  }

  .doc-header-inner {
    width: 100%;
    border-collapse: collapse;
  }

  /* Bloco empresa */
  .doc-brand {
    padding: 10px 15px;
    border-right: 1px solid #000000;
    vertical-align: middle;
  }

  .doc-brand-name {
    font-size: 16px;
    font-weight: 700;
    color: #000000;
    text-transform: uppercase;
  }

  .doc-brand-sub {
    font-size: 8px;
    color: #333333;
    margin-top: 2px;
    line-height: 1.4;
  }

  /* Bloco número do documento */
  .doc-number-block {
    padding: 10px;
    text-align: center;
    vertical-align: middle;
  }

  .doc-number-label {
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .doc-number-value {
    font-size: 22px;
    font-weight: 700;
    margin-top: 2px;
  }

  .doc-number-tipo {
    font-size: 9px;
    margin-top: 2px;
    font-weight: 700;
    text-transform: uppercase;
  }

  /* ────────── STATUS BANNER ────────── */
  .status-banner {
    width: 100%;
    margin-bottom: 10px;
    border: 1px solid #000000;
    border-collapse: collapse;
  }

  .status-banner td {
    padding: 5px 12px;
    vertical-align: middle;
    background: #f2f2f2;
  }

  .status-banner-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .status-banner-date {
    font-size: 9px;
    font-weight: 600;
  }

  /* ────────── SEÇÃO GENÉRICA ────────── */
  .section {
    border: 1px solid #000000;
    margin-bottom: 8px;
  }

  .section-header {
    background: #e0e0e0;
    border-bottom: 1px solid #000000;
    padding: 3px 10px;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .section-body {
    padding: 0;
  }

  /* ────────── GRID DE CAMPOS ────────── */
  .fields-table {
    width: 100%;
    border-collapse: collapse;
  }

  .fields-table td {
    border-right: 1px solid #000000;
    border-bottom: 1px solid #000000;
    padding: 5px 10px;
    vertical-align: top;
  }

  .fields-table td:last-child {
    border-right: none;
  }

  .fields-table tr:last-child td {
    border-bottom: none;
  }

  .field-label {
    font-size: 7px;
    font-weight: 700;
    text-transform: uppercase;
    display: block;
    margin-bottom: 1px;
  }

  .field-value {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
  }

  /* ────────── TABELA DE DESPESAS ────────── */
  .expense-table {
    width: 100%;
    border-collapse: collapse;
  }

  .expense-table th {
    background: #f2f2f2;
    color: #000000;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 5px 10px;
    text-align: left;
    border-right: 1px solid #000000;
    border-bottom: 1px solid #000000;
  }

  .expense-table th:last-child { border-right: none; }
  .expense-table th.right { text-align: right; }

  .expense-table td {
    padding: 6px 10px;
    font-size: 9px;
    border-bottom: 1px solid #000000;
    border-right: 1px solid #000000;
    vertical-align: middle;
  }

  .expense-table td:last-child { border-right: none; }
  .expense-table td.right { text-align: right; }

  .expense-table tr:last-child td { border-bottom: none; }

  .expense-table-empty {
    text-align: center;
    padding: 15px;
    font-size: 9px;
  }

  /* Linha de subtotal */
  .subtotal-row td {
    background: #f2f2f2 !important;
    font-weight: 700;
    font-size: 9px;
    border-top: 1px solid #000000 !important;
  }

  /* Linha de total geral */
  .total-row td {
    background: #e0e0e0 !important;
    font-size: 10px;
    font-weight: 700;
    padding: 8px 10px;
    border: none !important;
  }

  /* ────────── ALERTA ────────── */
  .alert-box {
    padding: 6px 10px;
    border-top: 1px solid #000000;
    font-size: 9px;
    background: #f9f9f9;
  }

  /* ────────── RODAPÉ ────────── */
  .footer {
    width: 100%;
    margin-top: 15px;
    border-top: 1px solid #000000;
    border-collapse: collapse;
  }

  .footer td {
    padding-top: 5px;
    vertical-align: middle;
  }

  .footer-left {
    font-size: 7px;
    color: #333333;
  }

  .footer-right {
    text-align: right;
    font-size: 7px;
    color: #333333;
  }

  .footer-hash {
    font-size: 6px;
    font-family: DejaVu Sans Mono, monospace;
  }

  /* ────────── ANEXOS ────────── */
  .anexo-item {
    border: 1px solid #cccccc;
    margin-bottom: 6px;
    page-break-inside: avoid;
  }

  .anexo-header {
    background: #f2f2f2;
    border-bottom: 1px solid #cccccc;
    padding: 3px 8px;
    font-size: 7px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .anexo-body {
    padding: 6px;
    text-align: center;
  }

  .anexo-img {
    max-width: 100%;
    max-height: 200px;
  }

  .anexo-pdf-label {
    font-size: 9px;
    font-weight: 600;
    color: #555555;
    padding: 20px 0;
    display: block;
  }
</style>
</head>
<body>

@php
  $statusLabel = match($rcm->status) {
    1 => 'Rascunho',
    2 => 'Pendente',
    3 => 'Em Análise',
    4 => 'Aprovado',
    5 => 'Pagamento Agendado',
    6 => 'Pago',
    7 => 'Rejeitado',
    default => 'Desconhecido',
  };

  $total = $rcm->despesas->sum('valor');
  $hash  = strtoupper(substr(sha1('rcm-' . $rcm->id . '-' . $rcm->created_at), 0, 32));

  $todosAnexos = [];
  foreach ($rcm->despesas as $i => $despesa) {
      foreach ($despesa->anexos as $anexo) {
          $todosAnexos[] = [
              'item'      => $i + 1,
              'descricao' => $despesa->descricao,
              'caminho'   => $anexo->caminho,
              'ext'       => strtolower(pathinfo($anexo->caminho, PATHINFO_EXTENSION)),
              'fullPath'  => storage_path('app/public/' . $anexo->caminho),
          ];
      }
  }
@endphp

{{-- ═══ CABEÇALHO ═══ --}}
<div class="doc-header">
  <table class="doc-header-inner">
    <tr>
      <td class="doc-brand" style="width:65%">
        <div class="doc-brand-name">Axios</div>
        <div class="doc-brand-sub">
          SOLICITAÇÃO DE REEMBOLSO DE DESPESAS (RCM)<br>
          DOCUMENTO INTERNO PARA CONTROLE ADMINISTRATIVO
        </div>
      </td>
      <td class="doc-number-block" style="width:35%">
        <div class="doc-number-label">NÚMERO</div>
        <div class="doc-number-value">{{ str_pad($rcm->id, 6, '0', STR_PAD_LEFT) }}</div>
        <div class="doc-number-tipo">REEMBOLSO / BAIXA</div>
      </td>
    </tr>
  </table>
</div>

{{-- ═══ BANNER STATUS ═══ --}}
<table class="status-banner">
  <tr>
    <td class="status-banner-label">STATUS ATUAL: {{ mb_strtoupper($statusLabel) }}</td>
    <td class="status-banner-date" style="text-align:right;">EMISSÃO: {{ $rcm->created_at?->format('d/m/Y H:i') }}</td>
  </tr>
</table>

{{-- ═══ IDENTIFICAÇÃO ═══ --}}
<div class="section">
  <div class="section-header">1. IDENTIFICAÇÃO DO DOCUMENTO</div>
  <div class="section-body">
    <table class="fields-table">
      <tr>
        <td style="width:60%">
          <span class="field-label">DESCRIÇÃO DA SOLICITAÇÃO</span>
          <span class="field-value">{{ $rcm->titulo }}</span>
        </td>
        <td style="width:20%">
          <span class="field-label">INÍCIO PERÍODO</span>
          <span class="field-value">{{ $rcm->data_inicio_periodo?->format('d/m/Y') }}</span>
        </td>
        <td style="width:20%">
          <span class="field-label">FIM PERÍODO</span>
          <span class="field-value">{{ $rcm->data_fim_periodo?->format('d/m/Y') }}</span>
        </td>
      </tr>
    </table>
  </div>
</div>

{{-- ═══ COLABORADOR ═══ --}}
<div class="section">
  <div class="section-header">2. DADOS DO REQUISITANTE</div>
  <div class="section-body">
    <table class="fields-table">
      <tr>
        <td style="width:55%">
          <span class="field-label">NOME DO SOLICITANTE</span>
          <span class="field-value">{{ mb_strtoupper($rcm->nome_solicitante ?? $rcm->usuario->nome ?? 'NÃO INFORMADO') }}</span>
        </td>
        <td style="width:45%">
          <span class="field-label">CPF / CNPJ</span>
          <span class="field-value">{{ $rcm->cpf_cnpj_solicitante ?: '—' }}</span>
        </td>
      </tr>
      <tr>
        <td style="width:55%">
          <span class="field-label">E-MAIL CORPORATIVO</span>
          <span class="field-value">{{ $rcm->usuario->email ?? '—' }}</span>
        </td>
        <td style="width:45%">
          <span class="field-label">PERFIL ACESSO</span>
          <span class="field-value">
            @switch($rcm->usuario?->perfil)
              @case(1) ADMINISTRADOR @break
              @case(2) AUDITOR @break
              @case(3) PRESTADOR @break
              @default — @break
            @endswitch
          </span>
        </td>
      </tr>
    </table>
  </div>
</div>

{{-- ═══ DESPESAS ═══ --}}
<div class="section">
  <div class="section-header">3. RELAÇÃO DE ITENS E DESPESAS</div>
  <div class="section-body">
    <table class="expense-table">
      <thead>
        <tr>
          <th style="width:5%">IT</th>
          <th style="width:12%">DATA</th>
          <th style="width:35%">DESCRIÇÃO DO ITEM</th>
          <th style="width:15%">CATEGORIA</th>
          <th style="width:20%">CENTRO CUSTO</th>
          <th class="right" style="width:13%">VALOR (R$)</th>
        </tr>
      </thead>
      <tbody>
        @forelse($rcm->despesas as $i => $despesa)
          <tr>
            <td style="text-align:center;">{{ $i + 1 }}</td>
            <td>{{ $despesa->data_despesa?->format('d/m/Y') }}</td>
            <td>{{ mb_strtoupper($despesa->descricao) }}</td>
            <td>{{ mb_strtoupper($despesa->categoriaDespesa?->descricao ?? 'GERAL') }}</td>
            <td>{{ mb_strtoupper($despesa->centroDeCusto?->descricao ?? 'PADRÃO') }}</td>
            <td class="right">{{ number_format($despesa->valor, 2, ',', '.') }}</td>
          </tr>
        @empty
          <tr>
            <td colspan="6" class="expense-table-empty">NENHUMA DESPESA REGISTRADA.</td>
          </tr>
        @endforelse
      </tbody>
      @if($rcm->despesas->isNotEmpty())
      <tfoot>
        <tr class="subtotal-row">
          <td colspan="5" class="right" style="padding-right:10px;">
            TOTAL DE ITENS: {{ $rcm->despesas->count() }}
          </td>
          <td class="right">{{ number_format($total, 2, ',', '.') }}</td>
        </tr>
        <tr class="total-row">
          <td colspan="5" style="text-align:right; font-size:9px;">
            VALOR LÍQUIDO A REEMBOLSAR
          </td>
          <td class="right">R$ {{ number_format($total, 2, ',', '.') }}</td>
        </tr>
      </tfoot>
      @endif
    </table>

    @if($rcm->status === 7 && $rcm->motivo_rejeicao)
      <div class="alert-box">
        <strong>MOTIVO DA REJEIÇÃO:</strong> {{ mb_strtoupper($rcm->motivo_rejeicao) }}
      </div>
    @endif

    @if($rcm->status === 5 && $rcm->data_pagamento_programado)
      <div class="alert-box">
        <strong>PAGAMENTO PROGRAMADO:</strong> {{ $rcm->data_pagamento_programado->format('d/m/Y') }}
      </div>
    @endif
  </div>
</div>

{{-- ═══ DADOS BANCÁRIOS ═══ --}}
@if($rcm->banco || $rcm->chave_pix || $rcm->agencia || $rcm->numero_banco)
<div class="section">
  <div class="section-header">4. DADOS PARA CRÉDITO EM CONTA</div>
  <div class="section-body">
    <table class="fields-table">
      <tr>
        <td style="width:25%">
          <span class="field-label">INSTITUIÇÃO</span>
          <span class="field-value">{{ mb_strtoupper($rcm->banco ?: '—') }}</span>
        </td>
        <td style="width:15%">
          <span class="field-label">AGÊNCIA</span>
          <span class="field-value">{{ $rcm->agencia ?: '—' }}</span>
        </td>
        <td style="width:25%">
          <span class="field-label">CONTA</span>
          <span class="field-value">{{ $rcm->numero_banco ?: '—' }}</span>
        </td>
        <td style="width:35%">
          <span class="field-label">CHAVE PIX</span>
          <span class="field-value">{{ $rcm->chave_pix ?: '—' }}</span>
        </td>
      </tr>
    </table>
  </div>
</div>
@endif

{{-- ═══ ANEXOS ═══ --}}
@if(count($todosAnexos) > 0)
<div style="page-break-before: always;"></div>
<div class="section">
  <div class="section-header">5. COMPROVANTES E ANEXOS</div>
  <div class="section-body" style="padding: 8px;">
    @foreach($todosAnexos as $idx => $anexo)
    <div class="anexo-item">
      <div class="anexo-header">
        ITEM {{ $anexo['item'] }} &mdash; {{ mb_strtoupper(mb_substr($anexo['descricao'], 0, 60)) }}@if(mb_strlen($anexo['descricao']) > 60)&hellip;@endif
        &nbsp;({{ $idx + 1 }}/{{ count($todosAnexos) }})
      </div>
      <div class="anexo-body">
        @if(in_array($anexo['ext'], ['jpg', 'jpeg', 'png']) && file_exists($anexo['fullPath']))
          <img class="anexo-img" src="{{ $anexo['fullPath'] }}" alt="Anexo item {{ $anexo['item'] }}" />
        @elseif($anexo['ext'] === 'pdf' && file_exists($anexo['fullPath']))
          <span class="anexo-pdf-label">[ ARQUIVO PDF &mdash; {{ basename($anexo['caminho']) }} ]</span>
        @else
          <span class="anexo-pdf-label">[ ARQUIVO NÃO ENCONTRADO ]</span>
        @endif
      </div>
    </div>
    @endforeach
  </div>
</div>
@endif

{{-- ═══ RODAPÉ ═══ --}}
<table class="footer">
  <tr>
    <td class="footer-left">
      AXIOS . SISTEMA DE GESTÃO<br>
      GERADO EM {{ now()->format('d/m/Y H:i:s') }}
    </td>
    <td class="footer-right">
      DOCUMENTO ID: {{ str_pad($rcm->id, 8, '0', STR_PAD_LEFT) }}<br>
      <span class="footer-hash">AUTH: {{ $hash }}</span>
    </td>
  </tr>
</table>

</body>
</html>
