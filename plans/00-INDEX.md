# Planos de amadurecimento — Axios

Manifesto dos planos que corrigem **todos os incômodos** de `INCOMODOS-AXIOS.md`. Cada `Pn-*.md` é **autossuficiente**: pode ser executado numa sessão limpa, sem contexto desta conversa. Executar **um por vez, na ordem numérica**.

## Como executar (para o próximo modelo)

1. Leia `INCOMODOS-AXIOS.md` (diagnóstico) e este índice.
2. Execute **P1 primeiro** — é a fundação (tradução EN + rename). Tudo depois dele assume o código já em inglês.
3. Depois do P1, siga a ordem numérica. As dependências estão na tabela.
4. Cada plano tem checklist, verificação e "definição de pronto". Só feche o plano quando o app subir e a verificação passar. Um commit por plano (ou por fase dentro do plano).

## Ordem e cobertura

| Plano | Objetivo | Incômodos | Depende de |
|---|---|---|---|
| **P1** | Tradução total PT→EN + rename de domínio + CLAUDE.md + remoção de comentários | #3, D5, D6, D8 | — (fundação) |
| **P2** | Value Object `Money` (dinheiro) | #6 | P1 |
| **P3** | Unificar `ExpenseReport`/`Reimbursement` + corrigir valor-total divergente | #1, #4 | P1, P2 |
| **P4** | Autorização por dono (corrige IDOR) | #2 | P1 |
| **P5** | Reativar exportação em planilha (handlers) mantendo Controlle | #5 | P1 |
| **P6** | Front — camada de server-state | #7 | P1 |
| **P7** | Front — arquitetura de componentes (god components, `app/`, formatters, camadas) | #8, cleanup formatter/ui | P1, (ideal após P6) |
| **P8** | Backend — higiene & robustez (PHPDoc, imports, tratamento de erro, envelope de resposta, `env()`, msg de debug) | D1, D2, D3, D4, cleanups | P1 |
| **P9** | Testes das regras financeiras críticas (+ CI opcional) | #9 | P1, (ideal após P2/P3) |
| **P10** | README / documentação de arquitetura *(opcional — além dos incômodos)* | — | último (reflete estado final) |

## Notas transversais

- **Comentários (D5/D6):** removidos **durante o P1** (a tradução toca todo arquivo). Não há plano separado — a "definição de pronto" do P1 exige zero comentários.
- **Capricho no front (D7):** princípio que vale pra P6 e P7 — execução impecável, o dono não domina React.
- **Nomes tentativos** (a bater no P1): `Provider`/`Requester`, `Setting`/`Config`, `Supplier`/`Vendor`.
