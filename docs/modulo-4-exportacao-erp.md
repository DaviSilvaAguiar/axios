## Objetivo

Ferramenta operacional para gerar arquivos de integração (CSV/Excel) com sistemas Sienge e Protheus.

## Persona

- **Auditor (Operador do ERP):** Realiza o fechamento dos lotes e gera os arquivos.
    

## Requisitos Funcionais

- **RF-028 (Fila de Exportação):** Tela dividida em duas abas: Prestações de Contas (RDC) e Reembolsos (RCM).
    
- **RF-029/030 (Geração):** Seleção de múltiplos lotes e escolha de "Template de Exportação" para download do arquivo formatado.
    
- **RF-031 (Segurança):** Após a exportação, o status do lote muda permanentemente para "Exportado" para evitar duplicidade de pagamento.
    

## Arquitetura e Configuração (Admin)

- **RF-032 (Motor de Templates):** O backend deve utilizar Handlers específicos para cada tipo de exportação (ex: `SiengeCaixinhaExportHandler.php`).
    
- **RF-033 (Campos de Mapeamento/Pontes):**
    
    - Usuários e Fornecedores devem ter o campo "Código no ERP".
        
    - Centros de Custo devem ter o campo "Código do CC no ERP".
        
- Esses mapeamentos permitem que o sistema traduza nomes de usuários para códigos de credores entendidos pelo ERP.