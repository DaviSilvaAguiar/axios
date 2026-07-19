<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Expense Report #{{ str_pad($expenseReport->id, 6, '0', STR_PAD_LEFT) }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: DejaVu Sans, sans-serif;
    font-size: 10px;
    color: #000000;
    background: #ffffff;
    padding: 20px 30px;
  }

  .doc-header {
    width: 100%;
    border: 1px solid #000000;
    margin-bottom: 10px;
  }

  .doc-header-inner {
    width: 100%;
    border-collapse: collapse;
  }

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

  .subtotal-row td {
    background: #f2f2f2 !important;
    font-weight: 700;
    font-size: 9px;
    border-top: 1px solid #000000 !important;
  }

  .total-row td {
    background: #e0e0e0 !important;
    font-size: 10px;
    font-weight: 700;
    padding: 8px 10px;
    border: none !important;
  }

  .alert-box {
    padding: 6px 10px;
    border-top: 1px solid #000000;
    font-size: 9px;
    background: #f9f9f9;
  }

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

  .attachment-item {
    border: 1px solid #cccccc;
    margin-bottom: 6px;
    page-break-inside: avoid;
  }

  .attachment-header {
    background: #f2f2f2;
    border-bottom: 1px solid #cccccc;
    padding: 3px 8px;
    font-size: 7px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .attachment-body {
    padding: 6px;
    text-align: center;
  }

  .attachment-img {
    max-width: 100%;
    max-height: 200px;
  }

  .attachment-pdf-label {
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
  $statusLabel = match($expenseReport->status) {
    1 => 'Draft',
    2 => 'Pending',
    3 => 'Under Review',
    4 => 'Approved',
    5 => 'Payment Scheduled',
    6 => 'Paid',
    7 => 'Rejected',
    default => 'Unknown',
  };

  $total = $expenseReport->items->sum('amount');
  $hash  = strtoupper(substr(sha1('expense-report-' . $expenseReport->id . '-' . $expenseReport->created_at), 0, 32));

  $allAttachments = [];
  foreach ($expenseReport->items as $i => $item) {
      foreach ($item->attachments as $attachment) {
          $allAttachments[] = [
              'item'        => $i + 1,
              'description' => $item->description,
              'path'        => $attachment->path,
              'ext'         => strtolower(pathinfo($attachment->path, PATHINFO_EXTENSION)),
              'fullPath'    => storage_path('app/public/' . $attachment->path),
          ];
      }
  }
@endphp

<div class="doc-header">
  <table class="doc-header-inner">
    <tr>
      <td class="doc-brand" style="width:65%">
        <div class="doc-brand-name">Axios</div>
        <div class="doc-brand-sub">
          EXPENSE REPORT<br>
          INTERNAL DOCUMENT FOR ADMINISTRATIVE CONTROL
        </div>
      </td>
      <td class="doc-number-block" style="width:35%">
        <div class="doc-number-label">NUMBER</div>
        <div class="doc-number-value">{{ str_pad($expenseReport->id, 6, '0', STR_PAD_LEFT) }}</div>
        <div class="doc-number-tipo">EXPENSE REPORT</div>
      </td>
    </tr>
  </table>
</div>

<table class="status-banner">
  <tr>
    <td class="status-banner-label">CURRENT STATUS: {{ mb_strtoupper($statusLabel) }}</td>
    <td class="status-banner-date" style="text-align:right;">ISSUED: {{ $expenseReport->created_at?->format('d/m/Y H:i') }}</td>
  </tr>
</table>

<div class="section">
  <div class="section-header">1. DOCUMENT IDENTIFICATION</div>
  <div class="section-body">
    <table class="fields-table">
      <tr>
        <td style="width:60%">
          <span class="field-label">REPORT DESCRIPTION</span>
          <span class="field-value">{{ $expenseReport->description }}</span>
        </td>
        <td style="width:20%">
          <span class="field-label">PERIOD START</span>
          <span class="field-value">{{ $expenseReport->period_start_date?->format('d/m/Y') ?? '—' }}</span>
        </td>
        <td style="width:20%">
          <span class="field-label">PERIOD END</span>
          <span class="field-value">{{ $expenseReport->period_end_date?->format('d/m/Y') ?? '—' }}</span>
        </td>
      </tr>
    </table>
  </div>
</div>

<div class="section">
  <div class="section-header">2. REQUESTER DETAILS</div>
  <div class="section-body">
    <table class="fields-table">
      <tr>
        <td style="width:55%">
          <span class="field-label">REQUESTER NAME</span>
          <span class="field-value">{{ mb_strtoupper($expenseReport->requester_description ?: ($expenseReport->requesterUser->name ?? 'NOT PROVIDED')) }}</span>
        </td>
        <td style="width:45%">
          <span class="field-label">TAX ID</span>
          <span class="field-value">{{ $expenseReport->requester_tax_id ?: '—' }}</span>
        </td>
      </tr>
      <tr>
        <td style="width:55%">
          <span class="field-label">DEPARTMENT</span>
          <span class="field-value">{{ mb_strtoupper($expenseReport->requester_department ?: '—') }}</span>
        </td>
        <td style="width:45%">
          <span class="field-label">COST CENTER</span>
          <span class="field-value">{{ mb_strtoupper($expenseReport->costCenter?->description ?? '—') }}</span>
        </td>
      </tr>
    </table>
  </div>
</div>

<div class="section">
  <div class="section-header">3. EXPENSE ITEMS</div>
  <div class="section-body">
    <table class="expense-table">
      <thead>
        <tr>
          <th style="width:5%">IT</th>
          <th style="width:12%">DATE</th>
          <th style="width:35%">ITEM DESCRIPTION</th>
          <th style="width:15%">CATEGORY</th>
          <th style="width:20%">COST CENTER</th>
          <th class="right" style="width:13%">AMOUNT (R$)</th>
        </tr>
      </thead>
      <tbody>
        @forelse($expenseReport->items as $i => $item)
          <tr>
            <td style="text-align:center;">{{ $i + 1 }}</td>
            <td>{{ $item->expense_date?->format('d/m/Y') }}</td>
            <td>{{ mb_strtoupper($item->description) }}</td>
            <td>{{ mb_strtoupper($item->expenseCategory?->description ?? 'GENERAL') }}</td>
            <td>{{ mb_strtoupper($item->costCenter?->description ?? 'DEFAULT') }}</td>
            <td class="right">{{ number_format($item->amount, 2, ',', '.') }}</td>
          </tr>
        @empty
          <tr>
            <td colspan="6" class="expense-table-empty">NO EXPENSES RECORDED.</td>
          </tr>
        @endforelse
      </tbody>
      @if($expenseReport->items->isNotEmpty())
      <tfoot>
        <tr class="subtotal-row">
          <td colspan="5" class="right" style="padding-right:10px;">
            TOTAL ITEMS: {{ $expenseReport->items->count() }}
          </td>
          <td class="right">{{ number_format($total, 2, ',', '.') }}</td>
        </tr>
        <tr class="total-row">
          <td colspan="5" style="text-align:right; font-size:9px;">
            TOTAL REPORT AMOUNT
          </td>
          <td class="right">R$ {{ number_format($total, 2, ',', '.') }}</td>
        </tr>
      </tfoot>
      @endif
    </table>

    @if($expenseReport->notes)
      <div class="alert-box">
        <strong>NOTES:</strong> {{ mb_strtoupper($expenseReport->notes) }}
      </div>
    @endif
  </div>
</div>

@if($expenseReport->bank || $expenseReport->pix_key || $expenseReport->branch || $expenseReport->account_number)
<div class="section">
  <div class="section-header">4. BANK CREDIT DETAILS</div>
  <div class="section-body">
    <table class="fields-table">
      <tr>
        <td style="width:25%">
          <span class="field-label">BANK</span>
          <span class="field-value">{{ mb_strtoupper($expenseReport->bank ?: '—') }}</span>
        </td>
        <td style="width:15%">
          <span class="field-label">BRANCH</span>
          <span class="field-value">{{ $expenseReport->branch ?: '—' }}</span>
        </td>
        <td style="width:25%">
          <span class="field-label">ACCOUNT</span>
          <span class="field-value">{{ $expenseReport->account_number ?: '—' }}</span>
        </td>
        <td style="width:35%">
          <span class="field-label">PIX KEY</span>
          <span class="field-value">{{ $expenseReport->pix_key ?: '—' }}</span>
        </td>
      </tr>
    </table>
  </div>
</div>
@endif

@if(count($allAttachments) > 0)
<div style="page-break-before: always;"></div>
<div class="section">
  <div class="section-header">5. RECEIPTS AND ATTACHMENTS</div>
  <div class="section-body" style="padding: 8px;">
    @foreach($allAttachments as $idx => $attachment)
    <div class="attachment-item">
      <div class="attachment-header">
        ITEM {{ $attachment['item'] }} &mdash; {{ mb_strtoupper(mb_substr($attachment['description'], 0, 60)) }}@if(mb_strlen($attachment['description']) > 60)&hellip;@endif
        &nbsp;({{ $idx + 1 }}/{{ count($allAttachments) }})
      </div>
      <div class="attachment-body">
        @if(in_array($attachment['ext'], ['jpg', 'jpeg', 'png']) && file_exists($attachment['fullPath']))
          <img class="attachment-img" src="{{ $attachment['fullPath'] }}" alt="Attachment item {{ $attachment['item'] }}" />
        @elseif($attachment['ext'] === 'pdf' && file_exists($attachment['fullPath']))
          <span class="attachment-pdf-label">[ PDF FILE &mdash; {{ basename($attachment['path']) }} ]</span>
        @else
          <span class="attachment-pdf-label">[ FILE NOT FOUND ]</span>
        @endif
      </div>
    </div>
    @endforeach
  </div>
</div>
@endif

<table class="footer">
  <tr>
    <td class="footer-left">
      AXIOS . MANAGEMENT SYSTEM<br>
      GENERATED ON {{ now()->format('d/m/Y H:i:s') }}
    </td>
    <td class="footer-right">
      DOCUMENT ID: {{ str_pad($expenseReport->id, 8, '0', STR_PAD_LEFT) }}<br>
      <span class="footer-hash">AUTH: {{ $hash }}</span>
    </td>
  </tr>
</table>

</body>
</html>
