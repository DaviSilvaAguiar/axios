# Plano — Módulo Dashboard

## Context

Hoje `/dashboard` mostra apenas uma **grade de módulos** para perfis admin/auditor (sem KPI nenhum) e duas pequenas métricas para prestadores. Vamos transformar em um **dashboard operacional real** baseado no mockup compartilhado: 4 KPI cards no topo, gráfico de movimentação mensal, duas listas de destaques (RDCs aguardando + top centros de custo).

Motivação: auditor precisa abrir 3 telas (Caixas, RDC, Exportação) só pra entender o estado do dia. Um dashboard com os números chave evita navegação repetitiva e funciona como **ponto de partida acionável** (clique no KPI vai pro módulo, clique no destaque vai pra auditoria).

Escopo: dashboard do **admin/auditor** (perfis 1 e 2). O `PrestadorDashboard` (perfil 3) fica intacto.

## Estado atual (do levantamento)

- Frontend: `src/features/dashboard/components/DashboardPage.tsx` tem `PrestadorDashboard` simples + grade de módulos. Sem `dashboard.api.ts`/`types.ts`/`mapper.ts`.
- Backend: **sem** `DashboardController` ou `DashboardService`. Template a seguir: `LoteExportacaoService::obterStatsPendentes()`.
- UI reusável: `Card`, `StatusTagGenerico`, `TipoChip`, `EmptyState`, `Loading`. Tokens estabelecidos (`text-feature-title` 18px, `text-caption` 14px, paleta brand `#0052ff`, surfaces, semantic colors).
- **Sem lib de gráfico** no `package.json` — precisa adicionar (Recharts).

## DESIGN.md alignment (crítico)

O `DESIGN.md` do projeto é Coinbase-inspired. Regras que governam decisões deste plano:
- **Brand `#0052ff` é funcional, NUNCA decorativo.** Usado neste dashboard apenas em: barra do mês ativo no chart, focus rings, hover/active de links.
- **Tipografia faz hierarquia**, não cor. KPIs grandes, labels pequenos uppercase.
- **Cantos arredondados moderados (12-16px)** — `rounded-2xl` do Tailwind = 16px.
- **Sombras mínimas** — depth vem do contraste e tipografia.
- **Spacing base 8px**.

## Decisões tomadas (na revisão)

1. **KPI cards sem ícones decorativos.** Label uppercase pequeno em `text-app-text-muted` + número grande (`text-feature-title` ou maior). Sem quadradinho colorido com ícone — foge do AI slop pattern #2 do blacklist e respeita "blue funcional only".
2. **Estados**: skeleton por widget (mesma forma da peça final) durante loading; empty states positivos (`RDCs pendentes = 0` → "Você está em dia ✓" verde); erro global com card "Não foi possível carregar" + botão Tentar novamente.
3. **Mobile chart**: ≤768px mostra últimos 6 meses, ≥768px mostra 12. Evita barras impossíveis de ler em 375px.
4. **Duas listas de destaques** lado a lado em desktop (`md:grid-cols-2`), stacked em mobile: "Aguardando auditoria" (top 3 RDCs `STATUS_EM_ANALISE` mais antigos, clicável → /rdc) + "Top centros de custo do mês" (top 3 CC por gasto, clicável → extrato do CC).
5. **KPIs clicáveis** com hover sutil: Caixas ativos → `/caixas`, Saldo total → `/caixas`, RDCs pendentes → `/rdc` (filtrado em Em Análise), Lotes exportados → `/exportacao`.
6. **Chart**: barras simples (não empilhadas) — bate com o mockup. Última barra (mês selecionado) em `#0052ff` (uso funcional do brand: sinaliza presente), demais em `bg-app-surface-raised`.
7. **RDCs pendentes**: conta só `STATUS_EM_ANALISE`.
8. **Lotes exportados**: do mês selecionado, não histórico.

## Abordagem

### 1. Backend — endpoint único de visão geral

Novo `DashboardController` + `DashboardService` (padrão controller-service do projeto). Uma rota única:

```
GET /v1/dashboard/overview?ano=YYYY&mes=MM
```

- Middleware: `tenant.header` + `auth:sanctum` + `EnsurePerfilAuditor` (perfis 1/2).
- Defaults: ano/mês = mês corrente do servidor.
- Resposta:

```json
{
  "kpis": {
    "caixas_ativos": 12,
    "saldo_total": "48200.00",
    "rdcs_pendentes": 3,
    "lotes_exportados_mes": 28
  },
  "movimentacao_mensal": [
    {"ano":2025,"mes":6,"creditos":"...","debitos":"...","saldo_liquido":"..."}
  ],
  "aguardando_auditoria": [
    {"id":42,"descricao":"Projeto Alpha","valor":"1840.00","status":2,"created_at":"..."}
  ],
  "top_centros_custo_mes": [
    {"id":7,"descricao":"Centro de Custo 07","valor_gasto":"3100.00"}
  ]
}
```

**Queries (em `DashboardService`):**
- `caixas_ativos`: `CaixaConta::where('status', STATUS_ATIVO)->count()`
- `saldo_total`: `CaixaConta::where('status', STATUS_ATIVO)->sum('saldo')`
- `rdcs_pendentes`: `Caixa::where('status', STATUS_EM_ANALISE)->count()`
- `lotes_exportados_mes`: `LoteExportacao::whereYear('created_at',$ano)->whereMonth('created_at',$mes)->count()`
- `movimentacao_mensal`: `CaixaTransacoes::selectRaw('YEAR(data_transacao) ano, MONTH(data_transacao) mes, tipo_transacao, SUM(valor) total')->whereBetween('data_transacao', [inicio12m, fimMes])->groupByRaw('ano,mes,tipo_transacao')` — pivotar pra crédito/débito, preencher meses zerados.
- `aguardando_auditoria`: top 3 `Caixa::where('status', STATUS_EM_ANALISE)->with('despesas')->orderBy('created_at')->limit(3)` — somar valor via despesas.
- `top_centros_custo_mes`: join `caixa_despesa` + `centro_custo` filtrado por mês, group by CC, sum(valor), order desc, limit 3.

**Arquivos:**
- `backend/app/Http/Controllers/DashboardController.php`
- `backend/app/Services/DashboardService.php`
- `backend/app/Http/Requests/OverviewDashboardRequest.php` (valida `ano`/`mes` opcionais com defaults)
- `backend/routes/tenant.php` — grupo `dashboard` com `EnsurePerfilAuditor`

### 2. Frontend — feature `dashboard`

**Dependência nova:** `recharts` (~40KB gzip).

**Estrutura:**
```
src/features/dashboard/
├── dashboard.types.ts        // Zod: overviewSchema, KpisSchema, MovMensalItem, etc
├── dashboard.mapper.ts       // mapOverviewResponse
├── dashboard.api.ts          // overviewDashboardApi(ano, mes)
└── components/
    ├── DashboardPage.tsx     // refatora: admin (perfil≠3) vs prestador
    ├── KpiCard.tsx           // {label, value, href, accentEmpty?}
    ├── KpiCardSkeleton.tsx   // skeleton com mesmo footprint
    ├── MovimentacaoMensalChart.tsx
    ├── MovimentacaoMensalSkeleton.tsx
    ├── MonthYearFilter.tsx
    ├── AguardandoAuditoriaList.tsx
    ├── TopCentrosCustoList.tsx
    └── ListaSkeleton.tsx     // reusável para as duas listas
```

**Layout `DashboardPage`** (admin):

```
┌────────────────────────────────────────────────────────────┐
│ Dashboard                              [Abril 2026  ▾]    │  ← Header
├────────────────────────────────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                   │
│ │  12  │  │R$ 48k│  │   3  │  │  28  │   ← 4 KPI cards    │
│ │ATIVOS│  │SALDO │  │PEND. │  │LOTES │   (grid-cols-4 md, │
│ └──────┘  └──────┘  └──────┘  └──────┘    grid-cols-2 sm) │
├────────────────────────────────────────────────────────────┤
│ Movimentação mensal                                        │
│ ▁▁▂▂▃▃▂▄▃▃▂█  ← chart (12 meses ≥md, 6 ≤sm)              │
├────────────────────────────────────────────────────────────┤
│ Aguardando auditoria      │  Top centros de custo do mês  │
│ • Projeto Alpha   R$ 1.8k │  • Projeto Alpha    R$ 12.5k  │
│ • Equipe Coml    R$ 620  │  • Equipe Comercial R$  8.3k │
│ • CC 07          R$ 3.1k │  • CC 07            R$  3.1k │  ← md:grid-cols-2
└────────────────────────────────────────────────────────────┘
```

**Detalhes visuais (calibrados ao DESIGN.md):**
- KPI card: `Card` com `p-5`, `cursor-pointer`, hover `bg-app-surface-raised/40` + `ring-1 ring-brand/10`. Conteúdo: label `text-caption text-app-text-muted uppercase tracking-wide mb-2`, valor `text-3xl font-semibold text-app-text` (ou maior, `text-4xl`).
- Chart: container `Card p-5`, título `text-caption font-semibold mb-4`, bars com `radius-sm`, mês ativo `fill="#0052ff"`, demais `fill={app-surface-raised}`. Tooltip on hover mostra valor formatado em BRL.
- Listas: `Card p-5`, título `text-caption font-semibold uppercase tracking-wide mb-3`, itens em `divide-y divide-app-border`, cada linha `py-3 cursor-pointer hover:bg-app-surface-raised/30 transition-colors`.
- `MonthYearFilter`: dropdown com mês (selo "Abril") + ano. Implementação: um `<button>` que abre um `<Popover>` (Radix) com dois `<select>`-like — ou dois selects simples lado a lado. Range de anos = ano atual ± 2.

**Estados:**
- Loading: cada widget renderiza seu skeleton (`KpiCardSkeleton`, `MovimentacaoMensalSkeleton`, `ListaSkeleton`). Sem spinner global.
- Empty positivo: KPIs zerados mostram o número `0` normal (não é vazio, é informação válida). Listas vazias mostram um `EmptyState` minimalista: "Você está em dia ✓" (verde, ícone CheckCircle) para "Aguardando auditoria"; "Sem gastos no período" para "Top CC".
- Chart sem transações: container vazio com texto centralizado `text-app-text-subtle` "Sem movimentação no período".
- Erro: tela inteira vira card centralizado: "Não foi possível carregar o dashboard" + botão Tentar novamente (chama `recarregar()`).

**Sidebar/menu**: nada muda — `HouseLine /dashboard` já existe.

### 3. Permissões

- Endpoint `/v1/dashboard/overview` gated por `EnsurePerfilAuditor` (403 pra prestador).
- Frontend: switch por perfil no `DashboardPage` já cobre — admin vê novo, prestador vê antigo.

## Reuso vs novo

**Reuso (já existe):**
- UI: `Card`, `EmptyState`, `Loading`, tokens de cor, `text-feature-title`/`text-caption`/`text-small`.
- Backend: padrão de `LoteExportacaoController::statsPendentes` como template.
- Padrão de feature folder (`*.types.ts` / `*.mapper.ts` / `*.api.ts`).

**Novo:**
- Dependência: `recharts`.
- Backend: 3 arquivos (Controller, Service, FormRequest) + 1 rota.
- Frontend: 1 feature folder com ~9 componentes + types/api/mapper.

## NOT in scope

- **Filtros adicionais** (por centro de custo, por usuário) — escopo crescente, fica pra V2.
- **Drill-down do chart** (clicar numa barra abre detalhe do mês) — ergonomia legal mas pode esperar.
- **Comparativo vs mês anterior** (delta % nos KPIs) — exigiria backend devolver ambos os períodos; deferido.
- **Realtime/WebSocket** — refresh manual ao recarregar a página é suficiente pra V1.
- **Persistência do filtro de mês** (lembrar última seleção) — defer.
- **Dark mode polish específico** — tokens cobrem automaticamente, mas QA visual em dark é defer.

## Verificação

1. `cd backend && composer run test` (se houver testes; senão, smoke manual abaixo).
2. Smoke manual backend:
   ```bash
   cd backend && php artisan tinker --execute='tenancy()->initialize(\App\Models\Tenant::find(2)); dump(app(\App\Services\DashboardService::class)->overview(2026,4));'
   ```
   Conferir shape e números coerentes.
3. `cd frontend && npx tsc --noEmit` — type-check.
4. `cd frontend && npm run build` — build de produção passa.
5. Abrir `/dashboard` autenticado como admin (tenant com dados — tenant 2 tem caixas reais). Conferir:
   - 4 KPIs com valores coerentes (Caixas ativos = 3, Saldo total ~R$ 3.700, etc).
   - Skeletons aparecem brevemente durante o load.
   - Chart renderiza 12 barras em desktop, 6 em mobile (testar `<768px`).
   - Mês selecionado em destaque `#0052ff`.
   - Lista "Aguardando auditoria" mostra RDCs em Em Análise (ou empty state verde).
   - Lista "Top CC" mostra centros de custo com gasto no mês.
   - Mudar mês/ano no filtro recarrega tudo.
   - Clique em KPI navega pro módulo correspondente.
6. Como prestador (perfil 3): vê dashboard antigo, intacto.
7. Erro forçado (matar backend): card de erro com Tentar novamente aparece, botão funciona.
8. Dark mode toggle: tokens cobrem (testar /dashboard com dark).
