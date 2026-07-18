# Incômodos — Axios (core)

> Lista **filtrada**: só o que um engenheiro sênior / recrutador técnico abriria o repo e apontaria como sinal de imaturidade. Cada item tem evidência em `arquivo:linha`. Ainda sem soluções — isso é diagnóstico.
>
> **Contexto:** projeto próprio, nascido de uma dor real. O objetivo do amadurecimento é que o código sustente a boa ideia, sem furar a primeira olhada de quem entende.
>
> _Cortado de propósito (ruído, não erro): casts de timestamp faltando, `whereNumber` sobrando em rotas, `next/headers` importado por request, `nome` vs `descricao` em models secundários, double round-trip no login, e afins._
>
> _Contestado e concedido: a crítica ao `IntegracaoService` ler o banco central — o split catálogo (central) / chaves (tenant) é decisão de design defensável, não amadorismo. Fora do core._

---

## 🔴 Tier 1 — Bugs reais (um sênior aponta na hora)

**1. O valor total do mesmo RDC diverge entre telas.** Há 3-4 cálculos diferentes de "quanto vale a despesa": aprovação soma só `valor` (`CaixaService.php:162`), exportação usa `valor_unitario × quantidade` e ignora `valor` (`LoteExportacaoService.php:118-120`), dashboard soma `valor` de novo (`DashboardService.php:134-136`). Como `CaixaDespesa` tem os dois campos e vários nullable, **a mesma prestação mostra números diferentes em aprovação, dashboard e exportação.** É bug financeiro, e é a primeira coisa que um revisor atento pega.

**2. Sem autorização por dono (IDOR).** `RcmService.buscar/atualizar/atualizarStatus/deletar` fazem `findOrFail($id)` **sem** filtrar por usuário (`RcmService.php:85-135`) — qualquer usuário com o módulo `rcm` acessa e edita reembolso de qualquer outro. O módulo irmão faz certo (`CaixaService` filtra `where('id_usuario', Auth::id())`, `:32,41,77`), o que deixa a falha ainda mais evidente. Falha de segurança clássica; recrutador que lê isso desconfia de tudo.

## 🟠 Tier 2 — Modelo de domínio confuso (o que mais contamina a leitura)

**3. A nomenclatura mente sobre o domínio.** O conceito central tem nomes opacos (siglas RDC/RCM) e, pior, **"Caixa" significa duas coisas**: a *prestação de contas* do Módulo 1 (`Models/Caixa.php`, chamado de "RDC" nos próprios comentários — `CaixaService.php:66,79`) **e** a *conta de saldo* do Módulo 2 (`CaixaConta` + `CaixaTransacoes`). São quatro entidades `Caixa*` cruzando dois módulos — quem abre a base não entende o domínio pelos nomes.
> **Nomenclatura decidida.** Matar as siglas RDC/RCM e resolver a sobrecarga de "Caixa". **Como o projeto inteiro vai pra inglês (ver D8), o rename é feito direto em inglês — renomear PT→PT e depois pra EN seria desperdício. Funde com o D8 num plano só.**
>
> | Conceito | Hoje | Novo (EN) |
> |---|---|---|
> | Conta de saldo pré-pago (M2) — *o dinheiro* | `CaixaConta` | `Fund` |
> | Extrato/movimento (M2) | `CaixaTransacoes` *(plural)* | `FundTransaction` |
> | Prestação de contas (M1, o "RDC") | `Caixa` | `ExpenseReport` |
> | Item da prestação (M1) — *consequência* | `CaixaDespesa` | `ExpenseReportItem` |
> | Reembolso (M3, o "RCM") | `Rcm` | `Reimbursement` |
> | Item do reembolso (M3) — *consequência* | `DespesaRcm` | `ReimbursementItem` |
>
> _Maior superfície do projeto (model, `$table`, migrations, FKs, services, rotas, front) — o que mais limpa a leitura da base._

**4. RDC e RCM são gêmeos que divergem em tudo.** As duas prestações usam campos diferentes pro mesmo conceito (`descricao` vs `titulo` — `Caixa.php:26`/`Rcm.php:26`; `descricao_requisitante` vs `nome_solicitante`), tipos de data diferentes (`datetime` vs `date` — `DespesaRcm.php:36`), estilos de erro diferentes (`ValidationException` vs `abort()`) e autorização diferente (item 2). Não há fonte única de verdade pro conceito central do produto — cada fluxo reimplementa o outro com pequenas divergências (que geram, inclusive, o bug #1).

**5. O caminho de exportação em planilha está desligado, e de fora parece quebrado.** A arquitetura tem dois caminhos de integração — exportação em planilha/lote (via `ExportHandlerFactory` + `ExportHandlerInterface`, estilo Strategy) e integração via API (**Controlle**, que é a que está de fato ligada hoje — `IntegracaoDispatchService.php:143-146`). O problema é o estado do caminho de planilha: `config/exportacao.php` com `templates` vazio, **zero** classes implementando a interface, e `LoteExportacaoService.gerarLote` caindo sempre num `throw` (`ExportHandlerFactory.php:27`). Quem lê de fora não distingue "desligado de propósito" de "quebrado/inacabado".
> _Direção acordada: reativar o caminho de planilha com ≥1 handler real (ex.: export CSV/XLSX genérico, rotulado como template "Sienge" ilustrativo), mantendo a integração Controlle ao lado. Resultado: o repo demonstra exportação em planilha **e** integração via API, com o Strategy/Factory de fato exercitado._

## 🟡 Tier 3 — Sinais de maturidade que faltam

**6. Dinheiro sem abstração.** BCMath (string) e `float` misturados no mesmo domínio — débitos usam `bcadd/bcsub` (`CaixaTransacaoService.php:38,64`), totais de lote usam float puro e gravam `valor_total` como float (`LoteExportacaoService.php:118,260-270`). Escala `2` hardcoded em vários services e a normalização de moeda presa `private` num único service. Sem Value Object, a proteção do BCMath é anulada na prática (e alimenta o bug #1).

**7. Camada de dados do front é amadora.** ~15 telas repetem o mesmo fetch manual `useEffect + useState + loading/erro` sem cache/dedupe/cancelamento (ex.: `dashboard/components/PendentesAprovacaoList.tsx:17-21`, `caixa-conta/components/FormCaixaConta.tsx:64-70`). ~14 arquivos têm `setState` dentro de `useEffect` — padrão que **o próprio eslint do projeto acusa** (`react-hooks/set-state-in-effect`). E há 3 implementações de paginação convivendo. Qualquer revisor de front moderno lê isso como "não conhece server-state".

**8. God components e lógica na camada errada.** `FormRcm.tsx` tem 879 linhas, `meus-reembolsos/[id]/page.tsx` tem 725, `exportacao/page.tsx` 524 com 16 `useState`. Pior: o CLAUDE.md manda `src/app/` ser só rota, mas várias rotas concentram handlers de CRUD, componentes inline e regra de negócio (`rcm/page.tsx` faz tudo inline enquanto o RDC irmão extraiu pra um hook — inconsistência gritante entre dois domínios paralelos).

## ⚪ Tier 4 — Rede de segurança

**9. Praticamente sem testes.** `tests/` tem 1 teste real e não-hermético (`AuthLoginTest.php` depende de tenant semeado à mão, senão dá 404) + boilerplate. Zero cobertura das regras financeiras críticas — aprovação de RDC com débito de caixa, saldo negativo, fechamento só com saldo 0, imutabilidade de lote. Para um projeto-carro-chefe, a pasta de testes vazia é das primeiras coisas que um recrutador checa.

---

## Cleanups rápidos (baixo esforço, alto "vexame se alguém ler")

- **Mensagem de debug vazando como erro de runtime:** `ControlleApiService.php:54-56` lança exceção com o texto _"POSTs estavam virando GET — esse era o motivo…"_ — comentário de investigação virou erro exposto.
- **`env()` cru no construtor de service** (`ControlleApiService.php:18`, `ReceitaWsService.php:17`) — quebra silenciosamente com `config:cache`.
- **Respostas da API inconsistentes** — uns endpoints retornam o model cru, outros `{mensagem, …}`, outros `{data}`; mistura chave `mensagem` (pt) e `message` (en).
- **`formatarMoeda` reimplementado em ~13 lugares** apesar de existir o canônico em `lib/formatters.ts:6`.

---

## Incômodos do Davi

### Backend

**D1. PHPDoc sem padrão.** 131 blocos `/**` no backend sem critério — umas funções têm, outras não. Ou segue em todas, ou só nas que agregam anotação — mas hoje não é nem uma coisa nem outra.

**D2. PHPDoc com prosa redundante.** Descrição que só repete o nome da função deve sair; manter só o que o tipo não expressa (`@throws`, e `@param`/`@return` quando útil). Ex.: `AuthService.php` — o bloco _"Autentica o usuário e retorna o token…"_ deve virar só `@throws AuthenticationException`.

**D3. Falta de tratamento de erro de retorno em muitas funções.** (a mapear caso a caso no plano).

**D4. Imports inline em vez de no topo.** Ex.: `\Illuminate\Contracts\Http\Kernel::class` usado inline em `TenancyServiceProvider.php:109`, e `Events\TenantCreated` (`:25,30`). Sempre importar no topo.

**D5. Comentários "o quê" desnecessários — remover.** Ex.: `// Database events` (`TenancyServiceProvider.php:45`); ~14 comentários `//` no `app/`.

### Frontend

**D6. Comentários JSX desnecessários — remover.** 109 ocorrências `{/* … */}` (ex.: `{/* Recovery side */}` `login/page.tsx:131`; vários em `Sidebar.tsx`, `Header.tsx`, `Combobox.tsx`).

**D7. Capricho máximo no front.** Davi não domina React — o que for feito aqui tem que ser impecável e levado ao extremo, com atenção redobrada em cada mudança.

> **Nota sobre D5/D6 (decidido):** remover **TODOS** os comentários, sem exceção — inclusive os de "porquê". _(Davi confirmou: "é tudo".)_

### Projeto inteiro

**🌍 D8. TRADUZIR TODO O PROJETO PARA INGLÊS.** Colunas de banco, nomes de tabelas, funções, classes, arquivos, comentários — tudo. Para portfólio internacional. É o item de **maior superfície e risco** (contrato back↔front tem que ficar sincronizado, migrations, FKs, schemas Zod, pastas de feature). **Consequências:**
- **(a)** O `CLAUDE.md` precisa ser reescrito pra fixar a convenção em inglês — hoje ele manda o oposto (PT), e se não mudar, reverte trabalho futuro.
- **(b)** Unifica com o rename do #3 — o rename de domínio é feito direto nos nomes em inglês, não PT→PT.
