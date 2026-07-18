# P2 — Value Object `Money`

> Resolve o incômodo **#6** (dinheiro sem abstração). Habilita o **P3** (que usa o `Money` pra unificar o cálculo de valor-total).
> **Depende de:** P1 (código já em inglês). **Evidência original (pré-P1, nomes PT):** `INCOMODOS-AXIOS.md` #6.

## Problema

O dinheiro não tem representação única no backend:
- BCMath (string) para saldos/débitos, mas `float` puro para totais de lote (`valor_total` gravado como float) — os dois paradigmas coexistem e **anulam a proteção do BCMath**.
- Escala `2` hardcoded em vários services.
- A normalização de string monetária ("1.234,56" → "1234.56") vive `private` num único service, inacessível ao resto.

## Objetivo

Um único tipo de dinheiro, imutável, usado em todo o domínio financeiro. Nenhum `bcadd/bcsub/(float)` solto; nenhuma escala hardcoded espalhada.

## Abordagem

1. Criar um Value Object `Money` (ex.: `app/Support/Money.php` ou `app/ValueObjects/Money.php`), imutável:
   - Internamente inteiro em centavos (ou string BCMath escala 2) — escolher um e documentar.
   - Métodos: `add`, `subtract`, `compareTo`/`isZero`/`isNegative`, `format()` (saída localizada), `fromDecimalString()` (aceita entrada BR e ISO), `zero()`, `fromCents()`.
2. **Custom Eloquent cast** (`MoneyCast`) para as colunas monetárias dos models — o model expõe `Money`, o banco guarda o formato canônico.
3. Substituir os cálculos soltos: `bcadd/bcsub` (débitos/saldos), `(float)` (totais de lote), `round($valor*100)` (dispatch de integração) → todos passam por `Money`.
4. Mover a normalização de string monetária pra dentro do `Money::fromDecimalString()`.

## Escopo / não-escopo

- **Escopo:** introduzir o VO e trocar as representações mantendo o comportamento atual.
- **Não-escopo:** consertar a *divergência* de cálculo de valor-total entre telas — isso é o P3 (que já herda o `Money`).

## Checklist

- [ ] `Money` VO + testes unitários (add/subtract/compare/format/parse, arredondamento, negativo).
- [ ] `MoneyCast` aplicado nas colunas monetárias (amount, unit_amount, balance, batch total…).
- [ ] Grep e substituição de `bcadd|bcsub|bccomp|(float)|(int) round` no domínio financeiro.
- [ ] Remover a escala `2` hardcoded — encapsulada no VO.

## Verificação / Pronto

- [ ] Testes do `Money` passam.
- [ ] Fluxos financeiros existentes (aprovação, extrato, exportação) exibem os **mesmos números** de antes (nenhuma regressão).
- [ ] `grep` por `bcadd|bcsub|(float)` no domínio volta limpo.
