# Axios ERP — AI Agent Guide

## Overview

**Axios** is a modern ERP focused on **financial management and expense accountability for teams**. The goal is to replace spreadsheets and manual reconciliation with an automated, auditable workflow — regardless of the company's industry. The long-term vision is to grow into a full ERP. Although the initial integrations target ERPs from the civil-construction market (Sienge, Protheus), the platform is general-purpose and neither the product nor the UI should be tightly coupled to that segment.

To build designs/screens ALWAYS use the DESIGN.md file located in the frontend folder.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 13, PHP 8.3+ |
| Multi-tenancy | stancl/tenancy ^3.10 (database per tenant) |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Central database | SQLite (dev) / MySQL (prod) |
| Tenant database | MySQL — one schema per company |

## Project Structure

```
axios-erp/
├── backend/          # Laravel 13
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # Receives the request, delegates to the Service
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   │   ├── Tenant.php     # Central model (stancl)
│   │   │   └── User.php
│   │   └── Providers/
│   ├── routes/
│   │   ├── api.php            # Central routes (manage tenants)
│   │   └── tenant.php         # Tenant routes (tenant.header middleware)
│   └── database/
├── frontend/         # Next.js 16 (App Router)
│   └── src/
│       ├── app/      # Routes and layouts only (Next.js App Router)
│       ├── features/ # Domain logic: types, mapper, api
│       ├── ui/       # Generic reusable components
│       ├── contexts/ # Global React contexts
│       ├── lib/      # Base utilities (api client, cookies)
│       └── proxy.ts  # Auth-gate (Next.js 16 proxy convention)
└── docs/             # Module documentation
```

## Language Convention (project-wide)

- **The entire project is in English** — database columns, table names, functions, classes, files, and all user-facing UI copy (labels, buttons, placeholders, validation messages).
- **No comments** — code must be self-explanatory. Do not add explanatory comments in PHP, TypeScript, or JSX. This applies to both "what" and "why" comments.
- Variable, method, and class names follow standard English (Laravel/PHP conventions).

## Multi-tenancy

- **Strategy:** separate database per tenant (stancl/tenancy).
- **Identification:** cookie `app_tenant_id` — the `tenant.header` middleware resolves the active tenant.
- **Central routes** (`routes/api.php`): operate on the central database, managing creation/reading/deletion of companies. They do not go through the tenancy middleware.
- **Tenant routes** (`routes/tenant.php`): all protected by `middleware(['tenant.header'])`, operating on the active tenant's database.
- Never mix central-database logic with tenant-database logic in the same controller.

## Mandatory Design Pattern: Controller-Service

Every business flow must follow this pattern:

```
Request → Controller → Service → Model/Repository
```

- **Controller:** validates the request (Form Request), calls the Service, returns the HTTP response.
- **Service:** holds all business logic. Never accesses `Request` directly.
- Never put business logic directly in the Controller.

## System Modules

### Module 1 — Advances / Expense Reports (`ExpenseReport`)

Cash expense report created by the Provider in the field and audited by Finance.

- **Personas:** Provider (creates), Auditor (approves).
- An `ExpenseReport` must be linked to a Cost Center.
- Automatic validations: NFe via Sefaz (44-digit key), CNPJ via ReceitaWS.
- On submission: the report is locked for editing, status → "Pending".
- On approval: triggers an automatic debit on the provider's fund (Module 2) and enqueues it for export (Module 4).
- Audit interface: side-by-side view (data + attachment + API indicators).

### Module 2 — Fund Management (`Fund`)

Controls the providers' prepaid balances (advances).

- **Persona:** Auditor.
- A `Fund` is always associated with a User + Cost Center. Initial balance R$ 0.00.
- Credit = advance entered manually.
- Automatic debit = approving an `ExpenseReport` (Module 1) requires selecting the fund to be charged.
- Closing a fund is only allowed when the balance == R$ 0.00.
- Bank-statement-style ledger with links to the originating expense reports.
- Per diems are treated as advances in this module, with no expense report required.

### Module 3 — Reimbursement (`Reimbursement`)

Post-paid flow: the employee pays out of pocket and requests reimbursement.

- **Personas:** Provider (requests), Auditor (audits and schedules payment).
- Cost Center is defined **per expense item** (unlike Module 1 where it is per report).
- No API validation (NFe/CNPJ) — focused on speed.
- Audit kanban: Draft → Under Review → Approved → Payment Scheduled → Paid.
- When moving to "Payment Scheduled": the scheduled payment date is required.
- On approval: enqueues it for export (Module 4).
- **Never** interacts with Module 2 (Fund Management).
- In the export file, the supplier is the **employee's ERP code**, not the invoice CNPJ.

### Module 4 — ERP Export (`ExportBatch`)

Generates CSV/Excel files for integration with Sienge, Protheus, and other ERPs.

- **Persona:** Auditor / ERP Operator.
- Queue split into two tabs: Expense Reports and Reimbursements.
- Select multiple batches + choose an Export Template → download.
- After export: batch status → "Exported" permanently (no reversal) to prevent duplicate payments.
- Template engine via ERP-specific **Handlers** (e.g., `SiengeFundExportHandler.php`).
- Required mapping fields: "ERP Code" on Users and Suppliers; "Cost Center ERP Code" on Cost Centers.

## Main Entities

| Entity | Where it lives | Description |
|---|---|---|
| `Tenant` | Central DB | Client company, tax data |
| `User` | Tenant DB | Roles: Admin, Auditor, Provider. Has an "ERP Code" |
| `ExpenseReport` | Tenant DB | Expense report header (Module 1) |
| `Reimbursement` | Tenant DB | Reimbursement request (Module 3) |
| `ExpenseReportItem` / `ReimbursementItem` | Tenant DB | Individual item linked to a Cost Center and Attachments |
| `Fund` | Tenant DB | Provider's prepaid balance (Module 2) |
| `FundTransaction` | Tenant DB | Fund ledger entry (Module 2) |
| `Attachment` | Tenant DB | Photos and PDFs of invoices and receipts |
| `CostCenter` | Tenant DB | Has a "Cost Center ERP Code" for export |

## Code Conventions

- Every PHP file must have `declare(strict_types=1)` at the top.
- Code and UI written in **English** (see Language Convention).
- **No comments** anywhere in the codebase.
- Versioned routes: `/v1/` prefix.
- Do not put business logic in Controllers or Models.
- Tests live in `backend/tests/`.

### Database Naming

- **Tables always singular:** `reimbursement`, `cost_center`, `reimbursement_item` — never plural. Define `protected $table` on the Model when needed to override the Laravel default.
- **Foreign keys:** always `entity_id` (Laravel-idiomatic), e.g. `cost_center_id`, `user_id`, `expense_report_id` — never `id_entity`.
- **Descriptive field:** always `description` — never `name`/`title` for the textual identifier of an entity.
- **Dates:** always `timestamp`, both in the migration (`$table->timestamp()`) and in the Model cast (`'datetime'`) — never `date`/`'date'`.

## Mandatory Backend Rules (Laravel)

### 1. Controller-Service pattern (no exceptions)
- **Controller** may only: receive the validated FormRequest, call the Service, and return a `JsonResponse`.
- **Service** holds all business logic. Never accesses `Request` directly.
- Never use `$request->validate()` in the Controller — always via a dedicated FormRequest.

### 2. FormRequest mandatory
- Every endpoint that receives data (`POST`, `PUT`, `PATCH`) must have a dedicated FormRequest.
- Naming: `Store{Resource}Request` and `Update{Resource}Request` in `app/Http/Requests/`.
- `authorize()` returns `true` by default (authorization handled by middleware/policy).
- **Never** add a `messages()` method — translations are provided automatically by the configured locale (`laravel-lang/common`).

### 3. Internationalization
- The application locale is `en` (configured in `.env`). Validation messages come in English automatically (framework defaults / `laravel-lang`).
- No need to override validation messages.
- To add new locales: `php artisan lang:add {locale}`.

### 4. Routes (routes/tenant.php and routes/api.php)
- Always use `Route::controller()->prefix()->group()` to group routes for the same resource — never repeat the controller name or the prefix line by line.
- Numeric ID parameters must use `->whereNumber('id')` on the group.
- Example of the correct structure:
```php
Route::controller(UserController::class)->prefix('users')->whereNumber('id')->group(function (): void {
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::get('/{id}', 'show');
    Route::put('/{id}', 'update');
    Route::delete('/{id}', 'destroy');
});
```

### 5. Multi-tenancy
- Tenant-entity migrations live in `database/migrations/tenant/`.
- Central migrations live in `database/migrations/`.
- **Never** mix central-database operations with tenant-database operations in the same Controller or Service.
- Tenant routes always inside the `Route::middleware(['tenant.header'])->prefix('v1')` group.
- To apply migrations to tenants: `php artisan tenants:migrate`.

## Frontend — Conventions

### Folder structure

- `src/app/` → **only** Next.js routes (`page.tsx`, `layout.tsx`). No logic or UI code here.
- `src/features/{domain}/` → each domain's logic (see the pattern below).
- `src/ui/` → generic reusable components.
- `src/contexts/` → global React contexts.
- `src/lib/` → base utilities (`api.ts`, `cookies.ts`).
- The `@/` alias points to `src/`. Example: `@/ui/Button`, `@/features/auth/auth.types`.

### Mandatory Feature pattern

Every data domain follows this structure:

```
src/features/{domain}/
  {domain}.types.ts   # Zod schemas + inferred types (never hand-declare types)
  {domain}.mapper.ts  # Parses the raw API response with Zod
  {domain}.api.ts     # API call functions (uses the mapper internally)
```

- **Never** use a standalone `interface` or `type` for API data — always derive from `z.infer<typeof schema>`.
- The mapper calls `schema.parse(raw)` — this guarantees runtime validation and static typing.
- The page/component layer imports only from `{domain}.types.ts` and `{domain}.api.ts`.

Example:
```ts
// auth.types.ts
export const userSchema = z.object({ id: z.number(), name: z.string(), ... });
export type User = z.infer<typeof userSchema>;

// auth.mapper.ts
export function mapLoginResponse(raw: unknown): LoginResponse {
  return loginResponseSchema.parse(raw);
}

// auth.api.ts
export async function loginApi(...): Promise<LoginResponse> {
  const raw = await api.post('/v1/auth/login', { email, password });
  return mapLoginResponse(raw);
}
```

### Form validation

- Use **react-hook-form** + **zodResolver** for all forms.
- The form validation schema lives in `{domain}.types.ts` alongside the other schemas.
- Field errors are shown via the `error` prop on the `Input` component.
- Server-side errors are set on `errors.root` via `setError("root", ...)`.

### UI Components

- Generic buttons and inputs live in `src/ui/`.
- **Never** recreate button or input styles inline in pages — always import from `@/ui/`.
- Use **Phosphor Icons** (`@phosphor-icons/react`) for all icons.

#### Button (`src/ui/Button.tsx`)
Props: `variant` (`"light"` | `"dark"` | `"outlined"`, default `"dark"`), `fullWidth`, plus all native `<button>` attributes.

#### Input (`src/ui/Input.tsx`)
Props: `label` (required string), `icon` (ReactNode), `rightElement` (ReactNode), `error` (string — inline validation message), plus all native `<input>` attributes. Supports `ref` (forwardRef) for react-hook-form integration.

## Development Commands

```bash
# Backend — inside backend/
composer run dev          # Starts server, queue, logs, and Vite in parallel
composer run test         # Runs PHPUnit
composer run setup        # Full from-scratch install

# Frontend — inside frontend/
npm run dev               # Next.js dev server
npm run build             # Production build
npm run lint              # ESLint
```

## External Integrations

| API | Use | Module |
|---|---|---|
| Sefaz (public) | Validate NFe access key (44 digits) | M1 |
| ReceitaWS | Validate CNPJ and fetch company name | M1 |

## Critical Business Rules

1. An `ExpenseReport` can only be edited by the provider while its status is "Draft" — after submission it is locked.
2. A `Fund` only closes with a balance of exactly R$ 0.00.
3. An exported batch never changes status — no export reversal.
4. Module 3 (Reimbursement) **never** interacts with Module 2 (Fund Management).
5. In the reimbursement export file, the supplier is always the employee's ERP code.

---

## Appendix — Domain Map (authoritative)

Reference for the English domain model. Portuguese legacy names are historical only; the codebase uses the English column.

| Model | Table | Notes |
|---|---|---|
| `ExpenseReport` | `expense_report` | Module 1 report (was `Caixa`/RDC) |
| `ExpenseReportItem` | `expense_report_item` | Report item |
| `ExpenseReportItemAttachment` | `expense_report_item_attachment` | Item attachment |
| `Fund` | `fund` | Prepaid balance, Module 2 (was `CaixaConta`) |
| `FundTransaction` | `fund_transaction` | Ledger entry (was `CaixaTransacoes`) |
| `Reimbursement` | `reimbursement` | Module 3 (was `Rcm`) |
| `ReimbursementItem` | `reimbursement_item` | Reimbursement item |
| `ReimbursementAttachment` | `reimbursement_attachment` | Reimbursement attachment |
| `CostCenter` | `cost_center` | Was `CentroDeCusto` |
| `ExpenseCategory` | `expense_category` | Was `CategoriaDespesa` |
| `Supplier` | `supplier` | Was `Fornecedor` |
| `BankAccount` | `bank_account` | Was `ContaBancaria` |
| `DocumentType` | `document_type` | Was `TipoDocumento` |
| `ExportBatch` | `export_batch` | Was `LoteExportacao` |
| `Integration` | `integration` | Central (was `Integracao`) |
| `IntegrationKey` | `integration_key` | Was `IntegracaoChave` |
| `Module` | `module` | Central (was `Modulo`) |
| `UserModule` | `user_module` | Was `UsuarioModulo` |
| `User` | `user` | Was `Usuario` |
| `Setting` | `setting` | Was `Config` |
| `Lead` | `leads` | Central |
| `Tenant` | `tenants` | stancl — do not rename |

Personas: **Provider** (was Prestador), **Auditor**, **Admin**.

**stancl/tenancy framework tables — do not rename:** `tenants`, `domains`, `personal_access_tokens`.

## Appendix — Column Glossary (apply everywhere)

`descricao`→`description` · `valor`→`amount` · `valor_unitario`→`unit_amount` · `quantidade`→`quantity` · `nome`→`name` · `nome_solicitante`→`requester_name` · `senha`→`password` · `titulo`→`title` · `status`→`status` · `tipo`→`type` · `subtipo`→`subtype` · `observacao`/`obs`→`notes` · `motivo_rejeicao`→`rejection_reason` · `setor`→`department` · `cpf_cnpj`→`tax_id` · `banco`→`bank` · `agencia`→`branch` · `numero_banco`→`account_number` · `chave_pix`→`pix_key` · `codigo_erp`→`erp_code` · `ativo`→`active` · `perfil`→`role` · `localizacao`→`location` · `periodo`→`period` · `data_despesa`→`expense_date` · `data_transacao`→`transaction_date` · `data_pagamento_programado`→`scheduled_payment_date`

**Foreign keys:** `id_centro_custo`→`cost_center_id` · `id_usuario`→`user_id` · `id_usuario_requisitante`→`requester_user_id` · `id_caixa`→`expense_report_id` · `id_rcm`→`reimbursement_id` · `id_lote_exportacao`→`export_batch_id` · `id_integracao`→`integration_id` · `id_modulo`→`module_id`

**Enum values:** status/role integer values do **not** change — only constant/label names are translated.
