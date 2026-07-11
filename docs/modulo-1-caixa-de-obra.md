Objetivo

Permitir que o Prestador de Contas submeta um Relatório de Despesas de Caixa de Obra (RDC) com validações automáticas para aprovação do Auditor.

## Personas

- **Prestador de Contas (Engenheiro):** Realiza os gastos e submete o relatório.
    
- **Auditor (Financeiro/Controladoria):** Revisa, valida e aprova as despesas.
    

## Requisitos Funcionais

- **RF-001 (Criação):** O RDC deve ser associado obrigatoriamente a um único Centro de Custo.
    
- **RF-002 (Itens):** Adição de N despesas com categoria, tipo de documento e justificativa.
    
- **RF-003 (Validações):**
    
    - Se NFe: Validar chave de acesso (44 dígitos) via API pública (Sefaz).
        
    - Se Fornecedor: Validar CNPJ e buscar Razão Social via API (ReceitaWS).
        
- **RF-004 (Submissão):** Ao submeter, o RDC é trancado para o prestador e o status muda para "Pendente".
    
- **RF-005 (Interface de Auditoria):** Visualização dividida com dados do prestador, anexo e indicadores de validação das APIs.
    

## Regras de Negócio e Conexões

- **Integração M1:** Ao aprovar, o sistema deve disparar um gatilho para abater o valor do saldo do caixa do prestador.
    
- **Integração M2:** Após aprovação total, as despesas entram na fila de exportação para o ERP.
    
- **Artefato:** Geração automática de PDF formatado após aprovação 100%.