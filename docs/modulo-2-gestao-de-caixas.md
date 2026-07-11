## Objetivo

Controlar saldos e adiantamentos (pré-pago) concedidos aos prestadores de contas.

## Persona

- **Auditor (Financeiro):** Responsável por abrir caixas, lançar créditos e gerenciar saldos.
## Requisitos Funcionais

- **RF-011 (Dashboard):** Visualização em cards com Responsável, Centro de Custo e Saldo Atual calculado em tempo real.
    
- **RF-012 (Abertura):** Cadastro de novo caixa associado a um usuário e Centro de Custo. Status inicial "Aberto" e saldo R$ 0,00.
    
- **RF-013 (Crédito):** Lançamento de adiantamentos que somam ao saldo atual e geram histórico.
    
- **RF-014 (Débito Automático):** Conexão com o Módulo 1. Ao aprovar um RDC, o sistema obriga a seleção do caixa para abatimento do valor.
    
- **RF-015 (Ajustes):** Lançamento manual de devoluções ou ajustes positivos/negativos com motivo obrigatório.
    

## Regras de Negócio

- **Fechamento de Caixa:** O sistema só permite fechar o caixa (status "Fechado") se o saldo atual for exatamente R$ 0,00.
    
- **Extrato:** Tela de histórico estilo extrato bancário detalhando créditos, débitos e links para os RDCs originários.
    
- **Caso das Diárias:** Devem ser tratadas como adiantamentos neste módulo e fechadas manualmente sem necessidade de RDC.