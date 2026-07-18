# P1 — Tradução total PT→EN + rename de domínio + CLAUDE.md

> **Plano fundação.** Todos os outros planos (P2–P7) nascem em cima dos nomes definidos aqui. Precisa ser feito **antes** de qualquer outro refactor — senão a gente renomeia duas vezes.
>
> Referência de diagnóstico: `INCOMODOS-AXIOS.md` (itens **#3** e **D8**).

---

## ⚠️ AVISO — este é o plano de MAIOR superfície e risco do projeto

Não é um refactor pontual. **Toca praticamente todo arquivo do repositório.** Ordem de grandeza:

- **Backend:** 22 models, ~40 migrations (tenant + central), todos os services, controllers, FormRequests, rotas, providers, config, seeders.
- **Frontend:** 17 features (cada uma com `.types`/`.mapper`/`.api` + componentes), ~19 rotas em `app/`, todos os componentes `ui/`, contexts, **e toda a copy visível** (labels, botões, placeholders, mensagens).
- **Contrato back↔front:** nomes de colunas/campos JSON viajam pela API — **backend e frontend têm que ser traduzidos em lockstep**, ou o app quebra silenciosamente (Zod `parse` falha).

**Escopo confirmado:** produto **inteiro** em inglês — código **e** UI **e** mensagens de validação. Não é "código EN, produto PT". É tudo.

**Faça em branch dedicada, com commits pequenos e verificação a cada domínio.** Não tente num commit só.

---

## Decisões travadas

1. **DB → reescrever as migrations direto em inglês.** O `axios` é repo novo, sem banco de produção. Não criar migrations de `alter/rename` — **editar as migrations existentes** (nome do arquivo, `Schema::create('...')`, colunas, FKs). Histórico limpo, lendo inglês do zero.
2. **Locale do app → `en`.** Trocar `APP_LOCALE`/`APP_FALLBACK_LOCALE` para `en`; as mensagens de validação vêm em inglês pelo `laravel-lang` (ou default do Laravel). Remover a dependência de pt_BR onde for só de validação.
3. **Segmentos de URL traduzem** (`/v1/caixas` → `/v1/funds`). Front consome, então muda junto.
4. **Comentários: apagados, não traduzidos.** (Resolve o conflito D8×D5/D6.) A remoção acontece no mesmo passe de tradução de cada arquivo.
5. **Arquivos/pastas: renomear com `git mv`.**
6. **Tabelas continuam no singular** (convenção que a gente mantém): `expense_report`, `fund`, etc.

---

## Mapa de domínio (autoritativo)

| Model hoje | Model novo | Tabela hoje | Tabela nova |
|---|---|---|---|
| `Caixa` *(RDC)* | `ExpenseReport` | `caixa` | `expense_report` |
| `CaixaDespesa` | `ExpenseReportItem` | `caixa_despesa` | `expense_report_item` |
| `CaixaDespesaAnexo` | `ExpenseReportItemAttachment` | `caixa_despesa_anexo` | `expense_report_item_attachment` |
| `CaixaConta` *(M2)* | `Fund` | `caixa_conta` | `fund` |
| `CaixaTransacoes` *(plural!)* | `FundTransaction` | `caixa_transacoes` | `fund_transaction` |
| `Rcm` | `Reimbursement` | `rcm` | `reimbursement` |
| `DespesaRcm` | `ReimbursementItem` | `despesa_rcm` | `reimbursement_item` |
| `AnexoRcm` | `ReimbursementAttachment` | `anexo_rcm` | `reimbursement_attachment` |
| `CentroDeCusto` | `CostCenter` | `centro_custo` | `cost_center` |
| `CategoriaDespesa` | `ExpenseCategory` | `categoria_despesa` | `expense_category` |
| `Fornecedor` | `Supplier` | `fornecedor` | `supplier` |
| `ContaBancaria` | `BankAccount` | `conta_bancaria` | `bank_account` |
| `TipoDocumento` | `DocumentType` | `tipo_documento` | `document_type` |
| `LoteExportacao` | `ExportBatch` | `lote_exportacao` | `export_batch` |
| `Integracao` *(central)* | `Integration` | `integracao` | `integration` |
| `IntegracaoChave` | `IntegrationKey` | `integracao_chave` | `integration_key` |
| `Modulo` *(central)* | `Module` | `modulo` | `module` |
| `UsuarioModulo` | `UserModule` | `usuario_modulo` | `user_module` |
| `Usuario` | `User` | `usuario` | `user` |
| `Config` | `Setting` | `config` | `setting` |
| `Lead` | `Lead` *(ok)* | `leads` | `leads` |
| `Tenant` | `Tenant` *(ok)* | `tenants` | *(stancl, manter)* |

**Nomes a bater durante a execução** (deixados tentativos): `Fornecedor`=`Supplier` (ou `Vendor`); persona `Prestador`=`Provider` (ou `Requester`); `Config`=`Setting` (ou `Config`).

## Glossário de colunas/termos (aplicar em todo lugar)

`descricao`→`description` · `valor`→`amount` · `valor_unitario`→`unit_amount` · `quantidade`→`quantity` · `nome`→`name` · `nome_solicitante`→`requester_name` · `senha`→`password` · `titulo`→`title` · `status`→`status` · `tipo`→`type` · `subtipo`→`subtype` · `observacao`/`obs`→`notes` · `motivo_rejeicao`→`rejection_reason` · `setor`→`department` · `cpf_cnpj`→`tax_id` · `banco`→`bank` · `agencia`→`branch` · `numero_banco`→`account_number` · `chave_pix`→`pix_key` · `codigo_erp`→`erp_code` · `ativo`→`active` · `perfil`→`role` · `localizacao`→`location` · `periodo`→`period` · `data_despesa`→`expense_date` · `data_transacao`→`transaction_date` · `data_pagamento_programado`→`scheduled_payment_date`

**FKs:** `id_centro_custo`→`cost_center_id` · `id_usuario`→`user_id` · `id_usuario_requisitante`→`requester_user_id` · `id_caixa`→`expense_report_id` · `id_rcm`→`reimbursement_id` · `id_lote_exportacao`→`export_batch_id` · `id_integracao`→`integration_id` · `id_modulo`→`module_id`
> Padrão de FK passa a ser `entidade_id` (Laravel-idiomático), aposentando o `id_entidade`.

## Frontend — features e rotas

**Features** (`src/features/`): `caixa-conta`→`fund` · `categoria-despesa`→`expense-category` · `centro-de-custo`→`cost-center` · `conta-bancaria`→`bank-account` · `exportacao`→`export` · `fornecedor`→`supplier` · `geolocalizacao`→`geolocation` · `integracao`→`integration` · `modulo`→`module` · `prestador`→`provider` · `rcm`→`reimbursement` · `rdc`→`expense-report` · `usuario`→`user` · `config`→`settings` *(auth/dashboard/landing mantêm)*

**Rotas** (`src/app/(auth-routes)/`): `caixas`→`funds` · `configuracoes`→`settings` · `conta-bancaria`→`bank-accounts` · `fornecedor`→`suppliers` · `meus-lancamentos`→`my-submissions` · `meus-reembolsos`→`my-reimbursements` · `minha-caixa-de-obra`→`my-expense-reports` · `novo-reembolso`→`new-reimbursement` · `painel`→`overview` · `rcm`→`reimbursements` · `rdc`→`expense-reports` · `usuarios`→`users` · `categoria-despesa`→`expense-categories` · `centro-de-custo`→`cost-centers` · `exportacao`→`export`

---

## Estratégia de execução — por fatia vertical (domínio a domínio)

Não traduzir por camada (todos os models, depois todos os services…) — isso deixa o app quebrado por horas. Traduzir **um domínio inteiro de ponta a ponta** e verificar que o app ainda sobe antes de ir pro próximo.

**Fase 0 — Fundação (sem quebrar nada ainda)**
- [ ] Reescrever o `CLAUDE.md` inteiro pra convenção **inglesa** (código, comentários apagados, colunas EN, `description`/`amount`, tabelas singular EN). Este passo primeiro, pra virar a fonte de verdade das fases seguintes.
- [ ] Trocar locale pra `en` (`config/app.php` / `.env`), ajustar `laravel-lang`.
- [ ] Colar o Mapa de domínio + Glossário acima como anexo do CLAUDE.md (referência viva).

**Fases 1..N — um domínio por vez** (ordem sugerida: os independentes primeiro → `CostCenter`, `ExpenseCategory`, `Supplier`, `BankAccount`, `DocumentType`, `User`; depois os pesados → `Fund`+`FundTransaction`, `ExpenseReport`+item, `Reimbursement`+item; por fim `Integration`/`ExportBatch`). Para **cada** domínio, na ordem:
- [ ] Migration(s): arquivo, `Schema::create`, colunas, FKs.
- [ ] Model: nome da classe, `$table`, `$fillable`, casts, relacionamentos, constantes.
- [ ] Service, Controller, FormRequest(s): nomes de classe, métodos, variáveis, **apagar comentários**.
- [ ] Rotas: prefixo/URL + nome do controller.
- [ ] Front: pasta da feature (`git mv`) + `.types` (schemas Zod → chaves EN), `.mapper`, `.api`, componentes, **copy visível em inglês**, **apagar comentários JSX**.
- [ ] Rota do `app/`: pasta (`git mv`) + imports.
- [ ] **Checkpoint:** `php artisan tenants:migrate:fresh` + subir back e front + exercitar o fluxo do domínio (criar/listar/editar). Só então commit e próximo domínio.

**Fase final — varredura transversal**
- [ ] Termos comuns que escaparam (grep por acentos/palavras PT no código).
- [ ] Copy global: `ui/`, contexts, `layout`, toasts, `EmptyState`, títulos de página, `metadata`.
- [ ] Seeders e dados de exemplo.
- [ ] Identificadores de auth/tenant (cookies `axios_token`/`axios_tenant`, header `X-Account`, `app_tenant_id`) — decidir manter vs renomear, **mantendo back e front em sincronia**.

---

## Riscos & armadilhas

- **Contrato back↔front:** toda chave JSON renomeada no backend tem que mudar no schema Zod correspondente **no mesmo commit**. Um `parse` que falha derruba a tela inteira. Verificar cada domínio no checkpoint.
- **`stancl/tenancy`:** tabelas do framework (`tenants`, `personal_access_tokens`, `domains`) **não** renomear.
- **Enums de status:** os inteiros de `status`/`perfil` não mudam de valor — só os nomes de constantes/labels traduzem.
- **Grep de resíduo:** ao final, `grep -rniE 'caixa|rcm|despesa|usuario|fornecedor|descricao|valor|senha'` no código pra caçar sobras.
- **Case-only no Windows:** renomes que só mudam maiúscula/minúscula precisam de `git mv` em dois passos.

## Definição de pronto

- [ ] `grep` de resíduo PT no código volta limpo (fora de dados legítimos).
- [ ] `php artisan tenants:migrate:fresh` roda do zero sem erro.
- [ ] Back e front sobem; login + 1 fluxo de cada módulo (ExpenseReport, Fund, Reimbursement, Export) funcionam.
- [ ] `npm run lint` e a tipagem passam.
- [ ] `CLAUDE.md` reescrito em inglês e coerente com o código.
- [ ] Zero comentários no repositório.
