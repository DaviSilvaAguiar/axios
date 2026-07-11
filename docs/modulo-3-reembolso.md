## Objetivo

Gerenciar solicitações de reembolso para gastos feitos com dinheiro próprio do colaborador (pós-pago).

## Personas

- **Prestador (Colaborador):** Solicita o reembolso.
    
- **Auditor (Financeiro):** Audita e agenda o pagamento via Kanban.
    

## Requisitos Funcionais

- **RF-018/019 (Lançamento):** Criação de RCM com N despesas. Diferente do M1, o Centro de Custo é definido por item de despesa.
    
- **RF-019.1 (Simplicidade):** Não há validação de API para NFe ou CNPJ. Foco na agilidade.
    
- **RF-022 (Kanban de Auditoria):** Gestão visual por colunas (Rascunho, Em Análise, Aprovado, Pagamento Agendado, Pago).
    
- **RF-024 (Agendamento):** Ao mover para "Pagamento Agendado", o sistema exige a definição da "Data Programada do Pagamento".
    

## Regras de Negócio e Conexões

- **Visibilidade:** O colaborador deve visualizar o status e a data programada para reduzir a ansiedade.
    
- **Integração M4:** Ao aprovar, envia para a fila de exportação.
    
- **Exportação ERP:** O fornecedor no arquivo CSV deve ser o código do próprio Colaborador no ERP, não o CNPJ da nota.
    
- **Restrição:** Este módulo nunca deve interagir com o Módulo 2 (Gestão de Caixas).