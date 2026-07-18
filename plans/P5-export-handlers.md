# P5 — Reativar exportação em planilha (handlers) + manter Controlle

> Resolve **#5** (padrão de exportação morto). **Depende de:** P1. **Evidência original:** `INCOMODOS-AXIOS.md` #5.

## Problema

A arquitetura prevê dois caminhos de integração:
- **Exportação em planilha/lote** via `ExportHandlerFactory` + `ExportHandlerInterface` (estilo Strategy) — **morto**: `config/export.php` (ex-`exportacao.php`) com `templates` vazio, **zero** classes implementando a interface, e `generateBatch` sempre caindo num `throw`.
- **Integração via API (Controlle)** — **essa funciona**, mas por um `match($integration){ 'Controlle' => … }` hardcoded.

De fora, o caminho de planilha parece **quebrado**, não "desligado de propósito".

## Objetivo

Os **dois caminhos vivos e legíveis**: o repo demonstra exportação em planilha (Strategy/Factory de fato exercitado) **e** integração via API (Controlle). Um "Sienge" ilustrativo é aceitável — o importante é que o export de planilha **gere um arquivo real**.

## Abordagem

1. Implementar **≥1 handler real** de `ExportHandlerInterface` — um export CSV/XLSX genérico (ex.: template rotulado "Sienge"), que produz um arquivo de verdade a partir dos lotes.
2. Popular `config/export.php` com esse template, ligando o `ExportHandlerFactory`.
3. Fazer `generateBatch` de fato gerar e retornar o arquivo pela Strategy (fim do `throw`).
4. Manter a integração **Controlle** viva ao lado. Opcional (nice-to-have): trocar o `match` por string por um pequeno registry, pra consistência com a Factory.
5. Remover a duplicação `modeloDoTipo`/`carregarDocumentos`/`calcularValorTotal` entre os dois motores de exportação (usar a fonte única do P3).

## Checklist

- [ ] Handler CSV/XLSX real + registrado no config.
- [ ] `generateBatch` produz arquivo pela Strategy.
- [ ] Controlle continua despachando.
- [ ] Duplicação entre os dois motores removida (fonte única do P3).

## Verificação / Pronto

- [ ] Gerar um lote pela UI → **baixa um CSV/XLSX real** com os dados corretos.
- [ ] Envio via Controlle continua funcionando.
- [ ] Lote exportado permanece imutável (regra de negócio) — cobrir em P9.
