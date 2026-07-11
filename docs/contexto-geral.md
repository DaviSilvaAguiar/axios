## 1. Visão do Produto

O **Axios** é um ERP moderno desenvolvido com foco inicial na resolução de dores críticas de gestão financeira e prestação de contas na construção civil. O objetivo estratégico é substituir processos arcaicos baseados em planilhas e conferências manuais por um fluxo automatizado e auditável. No longo prazo, o sistema foi projetado para ser expansível, evoluindo para um ERP completo capaz de competir com grandes players como TOTVS e Sienge.

## 2. Pilares de Diferenciação

O projeto se destaca por três diferenciais principais:

- **Barreira Anti-Erro:** Integração nativa com APIs da Sefaz e ReceitaWS para validar NFes e CNPJs em tempo real, impedindo erros de digitação e fraudes antes da auditoria.
    
- **UX de Auditoria (Tela Limpa):** Interface pensada para o auditor financeiro, com visualização de documentos e dados lado a lado, eliminando a necessidade de abrir múltiplos PDFs.
    
- **Motor de Exportação Flexível:** Arquitetura que permite criar "Handlers" customizados para gerar arquivos CSV/Excel compatíveis com qualquer ERP do mercado (Sienge, Protheus, etc.).
    

## 3. Arquitetura Técnica

A stack foi escolhida para garantir isolamento de dados e performance:

- **Backend:** Laravel com arquitetura Multi-tenant (Banco de dados por cliente).
    
- **Padrão de Projeto:** Implementação rigorosa do padrão Controller-Service para manter a lógica de negócio isolada e testável.
    
- **Frontend:** Next.js de alta performance.
    
- **Banco de Dados:** PostgreSQL ou MySQL, com estrutura normalizada para suportar múltiplos anexos e auditoria.
    

## 4. Módulos do Escopo Inicial

### Módulo 1: Caixa de Obra (RDC)

Gerencia o fluxo de gastos de engenheiros em campo. Obriga a associação de despesas a centros de custo específicos e realiza a validação automática de documentos fiscais.

### Módulo 2: Gestão de Caixas

Controla o saldo "pré-pago" (adiantamentos). Funciona como uma conta corrente para o prestador, onde cada aprovação de despesa gera um débito automático no saldo disponível.

### Módulo 3: Reembolso (RCM)

Fluxo para despesas "pós-pagas" feitas com dinheiro do próprio colaborador. Utiliza um dashboard em Kanban para que o funcionário acompanhe o status e a data programada para o pagamento.

### Módulo 4: Exportação ERP

Interface operacional para fechamento de lotes. Garante que nenhuma despesa seja paga em duplicidade ao travar itens já exportados e gerar os arquivos formatados para integração externa.

## 5. Entidades Principais do Sistema

- **Tenant:** Representa a empresa cliente e seus dados fiscais.
    
- **Usuário:** Gerencia perfis (Admin, Auditor, Prestador) e códigos de integração ERP.
    
- **Reembolso/RDC:** O cabeçalho da prestação de contas com status e dados bancários.
    
- **Despesas:** Os itens individuais de cada relatório, vinculados a centros de custo e anexos.
    
- **Anexos:** Armazenamento de fotos e PDFs das notas fiscais e comprovantes.