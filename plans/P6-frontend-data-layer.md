# P6 — Front: camada de server-state

> Resolve **#7** (camada de dados amadora). Vale o princípio **D7** (capricho máximo — o dono não domina React, execução tem que ser impecável).
> **Depende de:** P1. **Evidência original:** `INCOMODOS-AXIOS.md` #7.

## Problema

- ~15 telas repetem o mesmo fetch manual `useEffect + useState + loading/erro`, sem cache, dedupe, revalidação ou cancelamento — cada montagem refaz a request, com tratamento de erro copiado à mão.
- ~14 arquivos com `setState` dentro de `useEffect` — padrão que **o próprio eslint do projeto acusa** (`react-hooks/set-state-in-effect`).
- **3 implementações de paginação** convivendo (`usePaginatedList`, paginação manual, hook próprio do RDC).

## Objetivo

Uma camada de **server-state** única e idiomática, separada do UI-state. Zero fetch manual espalhado; zero `set-state-in-effect`; uma paginação só.

## Decisão de abordagem (bater no início)

- **Recomendado: TanStack Query** (`@tanstack/react-query`) — padrão de mercado, cache/dedupe/cancelamento/revalidação de graça, forte sinal de portfólio front.
- Alternativa (se quiser evitar dependência): uma camada de hooks própria bem desenhada em cima do `api.ts`. Menos sinal, mais código.

## Abordagem (com TanStack Query)

1. Instalar + `QueryClientProvider` no layout raiz; integrar o `api.ts` (repassar `signal` pro fetch → cancelamento).
2. Criar hooks de query/mutation por feature (ex.: `useReimbursements`, `useFunds`), tipados via os schemas Zod (mapper continua validando).
3. Migrar as ~15 telas: remover `useEffect`+`useState`+loading manual → `useQuery`/`useMutation`.
4. Substituir as 3 paginações por um padrão único (query com `useInfiniteQuery` ou page param).
5. Eliminar os `set-state-in-effect` restantes.

## Checklist

- [ ] Provider + integração `api.ts`/`signal`.
- [ ] Hooks por feature.
- [ ] 15 telas migradas.
- [ ] Paginação unificada; hooks antigos removidos.

## Verificação / Pronto

- [ ] Telas carregam; navegação reaproveita cache (sem refetch redundante visível).
- [ ] `npm run lint` sem erros `react-hooks/set-state-in-effect`.
- [ ] Tipagem passa; nenhuma tela quebrada.
