# P9 — Testes das regras financeiras críticas

> Resolve **#9** (cobertura praticamente inexistente). **Depende de:** P1; **ideal após P2/P3** (para o teste de valor-total já assertar o comportamento corrigido).
> **Evidência original:** `INCOMODOS-AXIOS.md` #9.

## Problema

`tests/` tem 1 teste real e **não-hermético** (depende de tenant semeado à mão, senão dá 404) + boilerplate. **Zero cobertura das regras financeiras críticas** — justamente as operações mais arriscadas do sistema. Para um projeto-carro-chefe, pasta de testes vazia é bandeira vermelha na primeira olhada.

## Objetivo

Suíte **hermética** (roda em checkout limpo, sem setup manual) cobrindo as regras de negócio críticas. Não busca cobertura total — busca proteger o que quebra dinheiro.

## Abordagem

1. **Base hermética:** setup de teste que cria tenant + migra o banco tenant automaticamente (factory/seed no `setUp`, `RefreshDatabase` para o tenant). Aposentar a dependência de dados semeados à mão.
2. **Casos críticos (mínimo):**
   - Aprovação de `ExpenseReport` → **débito no `Fund`** (valor certo, saldo atualizado).
   - Saldo insuficiente **bloqueia** o débito.
   - `Fund` só fecha com **saldo zero**.
   - **Valor-total** de uma prestação é consistente (teste de **regressão do bug #1** — o mesmo total em aprovação/dashboard/exportação).
   - Lote exportado é **imutável** (sem estorno).
   - `Reimbursement` **nunca** toca o `Fund` (regra de negócio do Módulo 3).
   - Autorização por dono (do P4): Provider não acessa reembolso alheio.
3. **CI (opcional, alto retorno):** GitHub Actions rodando `composer test` + lint a cada push.

## Checklist

- [ ] Base de teste hermética funcionando.
- [ ] Os 7 casos críticos acima cobertos e passando.
- [ ] (Opcional) workflow de CI verde.

## Verificação / Pronto

- [ ] `composer test` passa **num clone limpo**, sem setup manual.
- [ ] Os testes falham de propósito se as regras forem violadas (verificar quebrando uma).
