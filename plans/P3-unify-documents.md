# P3 — Unificar `ExpenseReport`/`Reimbursement` + corrigir valor-total

> Resolve **#1** (valor-total divergente entre telas — bug financeiro) e **#4** (gêmeos que divergem em comportamento).
> **Depende de:** P1 (nomes EN) e P2 (`Money`). **Evidência original:** `INCOMODOS-AXIOS.md` #1, #4.

## Problema

`ExpenseReport` (ex-`Caixa`/RDC) e `Reimbursement` (ex-`Rcm`) são documentos de prestação gêmeos, mas o comportamento é duplicado e **divergente**:
- **Valor-total calculado de 3-4 formas** (aprovação soma `amount`; exportação usa `unit_amount × quantity`; dashboard soma `amount`) → **a mesma prestação mostra totais diferentes em telas diferentes.** É o bug mais grave da base.
- Resolução de "requester" duplicada e com comportamento divergente (um lança exceção, outro ignora em silêncio).
- Estilos de erro diferentes entre os dois fluxos.
- Services de item (`ExpenseReportItemService`/`ReimbursementItemService`) quase idênticos, com divergências perigosas (proteção de período nulo só num lado).

## Objetivo

Uma **fonte única de verdade** para o comportamento compartilhado dos dois documentos — acima de tudo, **um único cálculo de valor-total**, de modo que todas as telas mostrem o mesmo número.

## Abordagem

1. Definir a regra canônica do valor de um item (decidir: `amount` é a fonte, ou `unit_amount × quantity`? — resolver a ambiguidade dos campos nullable de uma vez) e implementá-la **num só lugar**, retornando `Money` (P2).
2. Extrair o comportamento comum num contrato/trait/base (ex.: `AccountableDocument` / `HasExpenseItems`): total, resolução de requester, transições de status.
3. Unificar a resolução de "requester" (um comportamento só) e o **estilo de tratamento de erro** entre os dois fluxos (escolher um — alinhar com o P8).
4. Consolidar a lógica gêmea dos services de item, corrigindo a divergência de período nulo.
5. Trocar **todos os pontos de cálculo de total** (aprovação, dashboard, exportação, dispatch) para o método único.

## Checklist

- [ ] Regra de valor de item decidida e documentada.
- [ ] Método único de total (retornando `Money`) na abstração compartilhada.
- [ ] Aprovação, dashboard, exportação e dispatch usando o método único.
- [ ] Resolução de requester unificada; estilo de erro unificado.
- [ ] Services de item consolidados; período nulo protegido nos dois.

## Verificação / Pronto

- [ ] Uma mesma prestação exibe **total idêntico** em aprovação, dashboard e exportação (teste de regressão — ver P9).
- [ ] Nenhuma duplicação restante de "somar itens" / "resolver requester" (grep).
- [ ] Fluxos dos dois módulos funcionam ponta a ponta.
