# P4 — Autorização por dono (corrige IDOR)

> Resolve **#2** (IDOR — qualquer usuário edita reembolso alheio). **Depende de:** P1. **Evidência original:** `INCOMODOS-AXIOS.md` #2.

## Problema

`ReimbursementService` (ex-`RcmService`) faz `findOrFail($id)` em `buscar/atualizar/atualizarStatus/deletar` **sem filtrar por dono** — qualquer usuário com o módulo de reembolso acessa e edita reembolso de qualquer outro. O módulo gêmeo (`ExpenseReport`) já filtra por `user_id`, o que torna a inconsistência gritante. Não há `Policies` no projeto; a autorização é só de módulo/perfil na rota, sem checagem em nível de objeto.

## Objetivo

Autorização consistente em **nível de objeto** em todo o domínio: Provider só enxerga/edita o que é seu; Auditor/Admin conforme a regra de negócio de cada módulo.

## Abordagem

1. Introduzir **Laravel Policies** (`app/Policies`) para os recursos com dono — `Reimbursement`, `ExpenseReport`, `Fund` — com regras por `role` (Admin/Auditor/Provider).
2. Aplicar via `authorize()` no FormRequest (ou `$this->authorize()` no controller / `Gate` no service — escolher um padrão e usar em todos).
3. Auditar os demais recursos por ownership/escopo de tenant; corrigir os que fazem `findOrFail` sem escopo.
4. Alinhar o `authorize()` dos FormRequests (hoje todos `return true`) com as Policies.

## Checklist

- [ ] Policies para `Reimbursement`, `ExpenseReport`, `Fund` (+ auditar demais).
- [ ] `ReimbursementService` (e afins) escopando por dono/role.
- [ ] Padrão único de checagem (Policy) aplicado consistentemente.

## Verificação / Pronto

- [ ] Provider A **não** consegue ler/editar/excluir reembolso do Provider B (403) — teste dedicado (ver P9).
- [ ] Auditor/Admin mantêm o acesso esperado.
- [ ] Comportamento de autorização consistente entre `ExpenseReport` e `Reimbursement`.
