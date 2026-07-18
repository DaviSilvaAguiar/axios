# P7 — Front: arquitetura de componentes

> Resolve **#8** (god components + lógica na camada errada) e os cleanups de front (formatters duplicados, `ui/` acoplado a feature). Princípio **D7** (capricho máximo).
> **Depende de:** P1; **ideal após P6** (a camada de dados enxuga muito os componentes). **Evidência original:** `INCOMODOS-AXIOS.md` #8, E1, I1.

## Problema

- **God components:** `FormReimbursement` ~879 linhas, `my-reimbursements/[id]/page` ~725, `export/page` ~524 com 16 `useState`.
- **Lógica na camada errada:** o CLAUDE.md manda `src/app/` ser só rota, mas várias rotas concentram handlers de CRUD, componentes inline e regra de negócio. Inconsistência: o RDC extraiu tudo pra um hook, o RCM gêmeo faz tudo inline.
- **Formatters duplicados:** `formatMoney`/`formatDate` reimplementados em ~13 lugares apesar do canônico em `lib/formatters`.
- **Camada furada:** componente `ui/` importando API de feature (`Sidebar` chama a API de usuário).

## Objetivo

`src/app/` só com rotas finas; componentes decompostos e com responsabilidade única; utilitários centralizados; `ui/` genérico de verdade. E uma regra de lint que **impeça a regressão**.

## Abordagem

1. **`app/` = só rota:** extrair a lógica de cada `page.tsx` pesada para hooks de feature (espelhar o padrão do `useRdcPage` em todos os domínios); mover regra de negócio (ex.: `getCategoryIcon`) pra `features/`/`ui/`.
2. **Quebrar god components** em subcomponentes coesos (form em seções, auditoria em painéis, etc.).
3. **Centralizar formatters:** um `formatMoney`/`formatDate` só; remover as ~13 cópias.
4. **Inverter dependência `ui/`→feature:** `ui/` recebe dados via props; quem busca é a feature/rota.
5. **Trava de lint:** `no-restricted-imports` impedindo `ui/` importar `features/`, e regra pra manter `app/` fino.

## Checklist

- [ ] Páginas pesadas reduzidas a rota fina + hook de feature.
- [ ] God components decompostos.
- [ ] Formatters unificados; cópias removidas.
- [ ] `ui/` sem import de feature.
- [ ] Regra(s) de eslint de camada adicionadas.

## Verificação / Pronto

- [ ] Nenhum componente/rota acima de um teto razoável de tamanho/`useState` (definir, ex.: alertar > 250 linhas).
- [ ] `npm run lint` passa (inclusive as novas regras de camada).
- [ ] Telas funcionam idênticas ao antes (sem regressão visual/comportamental).
