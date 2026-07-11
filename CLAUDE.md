# Axios ERP — Guia para o Agente de IA

## Visão Geral

O **Axios** é um ERP moderno com foco em **gestão financeira e prestação de contas para equipes**. O objetivo é substituir planilhas e conferências manuais por um fluxo automatizado e auditável — independente do setor de atuação da empresa. A visão de longo prazo é evoluir para um ERP completo. Embora as integrações iniciais sejam com ERPs do mercado de construção civil (Sienge, Protheus), a plataforma é generalista e não deve ter o produto ou o UI fortemente atrelados a esse segmento.

Para construir designs/telas SEMPRE use o DESIGN.md que fica na pasta do frontend

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Backend | Laravel 13, PHP 8.3+ |
| Multi-tenancy | stancl/tenancy ^3.10 (banco de dados por tenant) |
| Frontend | Next.js 16, React 19, TypeScript |
| Estilização | Tailwind CSS v4 |
| Banco central | SQLite (dev) / MySQL (prod) |
| Banco tenant | MySQL — um schema por empresa |

## Estrutura do Projeto

```
axios-erp/
├── backend/          # Laravel 13
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # Recebe requisição, delega ao Service
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   │   ├── Tenant.php     # Modelo central (stancl)
│   │   │   └── User.php
│   │   └── Providers/
│   ├── routes/
│   │   ├── api.php            # Rotas centrais (gerenciam tenants)
│   │   └── tenant.php         # Rotas tenant (middleware tenant.header)
│   └── database/
├── frontend/         # Next.js 16 (App Router)
│   └── src/
│       ├── app/      # Rotas e layouts apenas (Next.js App Router)
│       ├── features/ # Lógica por domínio: types, mapper, api
│       ├── ui/       # Componentes genéricos reutilizáveis
│       ├── contexts/ # React contexts globais
│       ├── lib/      # Utilitários base (api client, cookies)
│       └── middleware.ts
└── docs/             # Documentação dos módulos
```

## Multi-tenancy

- **Estratégia:** banco de dados separado por tenant (stancl/tenancy).
- **Identificação:** cookie `app_tenant_id` — o middleware `tenant.header` resolve o tenant ativo.
- **Rotas centrais** (`routes/api.php`): operam no banco central, gerenciam criação/leitura/exclusão de empresas. Não passam pelo middleware de tenancy.
- **Rotas tenant** (`routes/tenant.php`): todas protegidas por `middleware(['tenant.header'])`, operam no banco do tenant ativo.
- Nunca misture lógica de banco central com lógica de banco tenant no mesmo controller.

## Padrão de Projeto Obrigatório: Controller-Service

Todo fluxo de negócio deve seguir este padrão:

```
Requisição → Controller → Service → Model/Repository
```

- **Controller:** valida a requisição (Form Request), chama o Service, retorna a resposta HTTP.
- **Service:** contém toda a lógica de negócio. Não acessa `Request` diretamente.
- Nunca coloque lógica de negócio diretamente no Controller.

## Módulos do Sistema

### Módulo 1 — Adiantamentos / Prestação de Contas (RDC)

Relatório de Despesas de Caixa criado pelo Prestador de Contas em campo e auditado pelo Financeiro.

- **Personas:** Prestador de Contas (cria), Auditor (aprova).
- **RDC** obrigatoriamente vinculado a um Centro de Custo.
- Validações automáticas: NFe via Sefaz (chave 44 dígitos), CNPJ via ReceitaWS.
- Ao submeter: RDC trancado para edição, status → "Pendente".
- Ao aprovar: dispara débito automático no caixa do prestador (Módulo 2) e envia para fila de exportação (Módulo 4).
- Interface de auditoria: visualização lado a lado (dados + anexo + indicadores de API).

### Módulo 2 — Gestão de Caixas

Controla saldos pré-pagos (adiantamentos) dos prestadores.

- **Persona:** Auditor.
- Caixa sempre associado a um Usuário + Centro de Custo. Saldo inicial R$ 0,00.
- Crédito = adiantamento lançado manualmente.
- Débito automático = aprovação de RDC (Módulo 1) obriga seleção do caixa para abatimento.
- Fechamento de caixa só permitido se saldo == R$ 0,00.
- Extrato estilo bancário com links para os RDCs originários.
- Diárias são tratadas como adiantamentos neste módulo, sem necessidade de RDC.

### Módulo 3 — Reembolso (RCM)

Fluxo pós-pago: colaborador gasta do próprio bolso e solicita reembolso.

- **Personas:** Prestador (solicita), Auditor (audita e agenda pagamento).
- Centro de Custo definido por **item de despesa** (diferente do M1 onde é por RDC).
- Sem validação de API (NFe/CNPJ) — foco em agilidade.
- Kanban de auditoria: Rascunho → Em Análise → Aprovado → Pagamento Agendado → Pago.
- Ao mover para "Pagamento Agendado": data programada de pagamento é obrigatória.
- Ao aprovar: envia para fila de exportação (Módulo 4).
- **Nunca** interagir com o Módulo 2 (Gestão de Caixas).
- No arquivo de exportação, o fornecedor é o **código do Colaborador no ERP**, não o CNPJ da nota.

### Módulo 4 — Exportação ERP

Geração de arquivos CSV/Excel para integração com Sienge, Protheus e outros ERPs.

- **Persona:** Auditor / Operador do ERP.
- Fila dividida em duas abas: Prestações de Contas (RDC) e Reembolsos (RCM).
- Seleção de múltiplos lotes + escolha  Template de Exportação → download.
- Após exportação: status do lote → "Exportado" permanentemente (sem reversão) para evitar duplicidade de pagamento.
- Motor de templates via **Handlers** específicos por ERP (ex: `SiengeCaixinhaExportHandler.php`).
- Campos de mapeamento obrigatórios: "Código no ERP" em Usuários e Fornecedores; "Código do CC no ERP" em Centros de Custo.

## Entidades Principais

| Entidade | Onde vive | Descrição |
|---|---|---|
| `Tenant` | Banco central | Empresa cliente, dados fiscais |
| `User` | Banco tenant | Perfis: Admin, Auditor, Prestador. Tem "Código no ERP" |
| `RDC` | Banco tenant | Cabeçalho da prestação de contas (Módulo 1) |
| `RCM` | Banco tenant | Solicitação de reembolso (Módulo 3) |
| `Despesa` | Banco tenant | Item individual vinculado a Centro de Custo e Anexos |
| `Caixa` | Banco tenant | Saldo pré-pago de um prestador (Módulo 2) |
| `Anexo` | Banco tenant | Fotos e PDFs de notas fiscais e comprovantes |
| `CentroDeCusto` | Banco tenant | Tem "Código do CC no ERP" para exportação |

## Convenções de Código

- Todo código PHP deve ter `declare(strict_types=1)` no topo do arquivo.
- Código e comentários escritos em **português**.
- Nomes de variáveis, métodos e classes em inglês (convenção Laravel/PHP padrão).
- Rotas versionadas: prefixo `/v1/`.
- Não coloque lógica de negócio em Controllers nem em Models.
- Testes ficam em `backend/tests/`.

### Nomenclatura de Banco de Dados

- **Tabelas sempre no singular:** `rcm`, `centro_custo`, `despesa_rcm` — nunca plural. Definir `protected $table` no Model quando necessário para sobrescrever o padrão Laravel.
- **FK de centro de custo:** sempre `id_centro_custo` (não `id_centro_de_custo`).
- **Campo descritivo:** sempre `descricao` — nunca `nome` ou `name` para campos textuais de identificação de entidades.
- **Datas:** sempre `timestamp` tanto na migration (`$table->timestamp()`) quanto no cast do Model (`'datetime'`) — nunca `date`/`'date'`.

## Regras Obrigatórias de Backend (Laravel)

### 1. Padrão Controller-Service (sem exceções)
- **Controller** só pode: receber o FormRequest validado, chamar o Service e retornar `JsonResponse`.
- **Service** contém toda a lógica de negócio. Nunca acessa `Request` diretamente.
- Nunca use `$request->validate()` no Controller — sempre via FormRequest dedicado.

### 2. FormRequest obrigatório
- Todo endpoint que recebe dados (`POST`, `PUT`, `PATCH`) deve ter um FormRequest exclusivo.
- Nomenclatura: `Store{Recurso}Request` e `Update{Recurso}Request` em `app/Http/Requests/`.
- `authorize()` retorna `true` por padrão (autorização será tratada por middleware/policy).
- **Nunca** adicione método `messages()` — as traduções pt-BR são geradas automaticamente pelo `laravel-lang/common`.

### 3. Internacionalização
- O projeto usa `laravel-lang/common` com locale `pt_BR` configurado no `.env`.
- Todas as mensagens de validação já são traduzidas automaticamente — não é necessário sobrescrever.
- Para adicionar novos locales: `php artisan lang:add {locale}`.

### 4. Rotas (routes/tenant.php e routes/api.php)
- Sempre use `Route::controller()->prefix()->group()` para agrupar rotas do mesmo recurso — nunca repita o nome do controller ou o prefixo linha a linha.
- Parâmetros de ID numérico devem usar `->whereNumber('id')` no grupo.
- Exemplo de estrutura correta:
```php
Route::controller(UsuarioController::class)->prefix('usuarios')->whereNumber('id')->group(function (): void {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{id}', 'show');
    Route::put('/{id}', 'update');
    Route::delete('/{id}', 'destroy');
});
```

### 5. Multi-tenancy
- Migrations de entidades do tenant ficam em `database/migrations/tenant/`.
- Migrations centrais ficam em `database/migrations/`.
- **Nunca** misture operações do banco central com operações do banco tenant no mesmo Controller ou Service.
- Rotas tenant sempre dentro do grupo `Route::middleware(['tenant.header'])->prefix('v1')`.
- Para aplicar migrations nos tenants: `php artisan tenants:migrate`.

## Frontend — Convenções

### Estrutura de pastas

- `src/app/` → **apenas** rotas Next.js (`page.tsx`, `layout.tsx`). Nenhum código de lógica ou UI aqui.
- `src/features/{dominio}/` → lógica de cada domínio (ver padrão abaixo).
- `src/ui/` → componentes genéricos reutilizáveis.
- `src/contexts/` → React contexts globais.
- `src/lib/` → utilitários base (`api.ts`, `cookies.ts`).
- O alias `@/` aponta para `src/`. Exemplo: `@/ui/Button`, `@/features/auth/auth.types`.

### Padrão de Feature obrigatório

Todo domínio de dados segue a estrutura:

```
src/features/{dominio}/
  {dominio}.types.ts   # Schemas Zod + tipos inferidos (nunca declare tipos à mão)
  {dominio}.mapper.ts  # Parseia a resposta bruta da API com Zod
  {dominio}.api.ts     # Funções de chamada à API (usa mapper internamente)
```

- **Nunca** use `interface` ou `type` avulso para dados da API — derive sempre de `z.infer<typeof schema>`.
- O mapper chama `schema.parse(raw)` — isso garante validação em runtime e tipagem estática.
- A camada de página/componente importa apenas de `{dominio}.types.ts` e `{dominio}.api.ts`.

Exemplo:
```ts
// auth.types.ts
export const usuarioSchema = z.object({ id: z.number(), nome: z.string(), ... });
export type Usuario = z.infer<typeof usuarioSchema>;

// auth.mapper.ts
export function mapLoginResponse(raw: unknown): LoginResponse {
  return loginResponseSchema.parse(raw);
}

// auth.api.ts
export async function loginApi(...): Promise<LoginResponse> {
  const raw = await api.post('/v1/auth/login', { email, senha });
  return mapLoginResponse(raw);
}
```

### Validação de formulários

- Use **react-hook-form** + **zodResolver** para todos os formulários.
- O schema de validação do form fica em `{dominio}.types.ts` junto com os demais schemas.
- Erros de campo são exibidos via prop `error` no componente `Input`.
- Erros vindos do servidor são setados em `errors.root` via `setError("root", ...)`.

### Componentes UI

- Botões e inputs genéricos ficam em `src/ui/`.
- **Nunca** recrie estilos de botão ou input inline em páginas — sempre importe de `@/ui/`.
- Use **Phosphor Icons** (`@phosphor-icons/react`) para todos os ícones.

#### Button (`src/ui/Button.tsx`)
Props: `variant` (`"light"` | `"dark"` | `"outlined"`, padrão `"dark"`), `fullWidth`, mais todos os atributos nativos de `<button>`.

#### Input (`src/ui/Input.tsx`)
Props: `label` (string obrigatória), `icon` (ReactNode), `rightElement` (ReactNode), `error` (string — mensagem de validação inline), mais todos os atributos nativos de `<input>`. Suporta `ref` (forwardRef) para integração com react-hook-form.

## Comandos de Desenvolvimento

```bash
# Backend — dentro de backend/
composer run dev          # Sobe servidor, queue, logs e Vite em paralelo
composer run test         # Roda PHPUnit
composer run setup        # Instalação completa do zero

# Frontend — dentro de frontend/
npm run dev               # Next.js dev server
npm run build             # Build de produção
npm run lint              # ESLint
```

## Integrações Externas

| API | Uso | Módulo |
|---|---|---|
| Sefaz (pública) | Validar chave de acesso NFe (44 dígitos) | M1 |
| ReceitaWS | Validar CNPJ e buscar Razão Social | M1 |

## Regras Críticas de Negócio

1. RDC só pode ser editado pelo prestador enquanto estiver com status "Rascunho" — após submissão, fica trancado.
2. Caixa só fecha com saldo exatamente R$ 0,00.
3. Lote exportado nunca muda de status — sem estorno de exportação.
4. Módulo 3 (Reembolso) **nunca** interage com Módulo 2 (Gestão de Caixas).
5. No arquivo de exportação de reembolsos, o fornecedor é sempre o código do colaborador no ERP.
