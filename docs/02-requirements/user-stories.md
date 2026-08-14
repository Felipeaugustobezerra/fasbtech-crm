# Histórias de Utilizador

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟢 Ativo

---

# Objetivo

Este documento descreve as histórias de utilizador oficiais do MVP do FASBtech CRM.

As histórias devem permanecer alinhadas com:

- PRD v3.0;
- MVP Scope v3.0;
- Product Roadmap v3.0;
- Functional Requirements v3.0;
- Regras de Negócio v3.0.

As histórias descrevem valor e comportamento esperado do ponto de vista do utilizador.

Não definem detalhes de implementação técnica.

---

# Foundation

## Autenticar no sistema

Como utilizador interno,
quero entrar no CRM com minhas credenciais,
para acessar as funcionalidades autorizadas.

### Critérios de aceite

- O utilizador deve informar e-mail e senha válidos.
- Credenciais inválidas devem impedir o acesso.
- Áreas privadas devem exigir autenticação.
- Uma sessão válida deve permanecer ativa conforme as regras do sistema.

---

## Encerrar sessão

Como utilizador autenticado,
quero sair do sistema,
para encerrar meu acesso com segurança.

### Critérios de aceite

- O logout deve encerrar a sessão atual.
- Após o logout, áreas privadas não devem permanecer acessíveis.

---

## Visualizar meu perfil

Como utilizador autenticado,
quero visualizar meus dados de perfil,
para confirmar minhas informações no sistema.

### Critérios de aceite

- O utilizador deve visualizar apenas seu próprio perfil, salvo permissões administrativas específicas.
- Campos editáveis devem seguir as regras definidas para o perfil.

---

# Dashboard

## Visualizar o Dashboard

Como utilizador autenticado,
quero visualizar um resumo da operação,
para identificar rapidamente informações relevantes do CRM.

### Critérios de aceite

- O Dashboard deve ser exibido após o login.
- Indicadores devem usar dados reais dos módulos implementados.
- O sistema não deve apresentar dados simulados como se fossem dados operacionais reais.
- O conteúdo exibido deve respeitar as permissões do utilizador.

---

## Visualizar resumo financeiro

Como utilizador autorizado,
quero visualizar o resumo financeiro no Dashboard,
para acompanhar rapidamente a situação financeira da empresa.

### Critérios de aceite

Quando o módulo Financeiro estiver implementado, o Dashboard deve poder apresentar:

- entradas do mês;
- saídas do mês;
- saldo em caixa;
- progresso da meta mensal.

Os valores devem utilizar as mesmas regras do módulo Financeiro.

---

## Visualizar resumo de Demandas

Como utilizador autorizado,
quero visualizar o estado das Demandas no Dashboard,
para identificar rapidamente trabalhos pendentes ou em risco.

### Critérios de aceite

Quando o módulo Demandas estiver implementado, o Dashboard deve poder apresentar:

- Demandas abertas;
- Demandas em andamento;
- Demandas atrasadas;
- Demandas próximas do prazo;
- Demandas concluídas.

---

# Clientes

## Cadastrar Cliente

Como utilizador autorizado,
quero cadastrar um Cliente,
para centralizar suas informações no CRM.

### Critérios de aceite

- O Cliente deve poder ser criado diretamente, sem Lead prévio.
- Os campos obrigatórios devem ser validados.
- O Cliente deve pertencer à Organization atual.
- A criação deve gerar Activity Log quando definido pelas regras de auditoria.
- O utilizador sem permissão não deve conseguir cadastrar Clientes.

---

## Listar Clientes

Como utilizador autorizado,
quero visualizar os Clientes aos quais tenho acesso,
para localizar rapidamente os registros necessários.

### Critérios de aceite

- A listagem deve respeitar as permissões do utilizador.
- MEMBER deve visualizar apenas Clientes autorizados.
- Clientes arquivados não devem aparecer por padrão.
- A listagem deve permitir paginação quando necessário.

---

## Pesquisar Cliente

Como utilizador autorizado,
quero pesquisar Clientes,
para encontrar rapidamente um Cliente específico.

### Critérios de aceite

- A pesquisa deve ocorrer apenas dentro do conjunto de Clientes que o utilizador pode acessar.
- O resultado não pode expor Clientes não autorizados.

---

## Visualizar Cliente

Como utilizador autorizado,
quero visualizar os detalhes de um Cliente,
para consultar suas informações e relacionamentos.

### Critérios de aceite

- O utilizador deve possuir acesso ao Cliente.
- O sistema deve impedir acesso direto por URL a Cliente não autorizado.
- A página pode apresentar, conforme os módulos estiverem disponíveis:
  - Visão Geral;
  - Demandas;
  - Contratos;
  - Financeiro;
  - Documentos;
  - Acessos;
  - Atividades.

---

## Editar Cliente

Como utilizador autorizado,
quero editar os dados de um Cliente,
para manter suas informações atualizadas.

### Critérios de aceite

- O utilizador deve possuir permissão de edição.
- Os campos devem ser validados.
- Alterações relevantes devem gerar Activity Log.
- Alterações no Cliente não devem modificar retroativamente contratos já gerados.

---

## Arquivar Cliente

Como utilizador autorizado,
quero arquivar um Cliente,
para removê-lo das listagens operacionais sem apagar seu histórico.

### Critérios de aceite

- O Cliente não deve ser excluído fisicamente pelo fluxo normal.
- Clientes arquivados não devem aparecer na listagem padrão.
- Demandas, Contratos, documentos, movimentações e Activity Logs relacionados não devem ser apagados automaticamente.
- O arquivamento deve ser auditado quando aplicável.

---

# Acessos

## Visualizar utilizadores

Como OWNER ou ADMIN autorizado,
quero visualizar os utilizadores internos,
para gerir quem participa da operação da FASBtech.

### Critérios de aceite

- A listagem deve apresentar utilizadores da Organization.
- O acesso deve respeitar as permissões administrativas.
- MEMBER não deve receber automaticamente permissão de gestão de utilizadores.

---

## Definir papel do utilizador

Como utilizador administrativo autorizado,
quero definir o papel de um utilizador,
para controlar seu nível de acesso no CRM.

### Critérios de aceite

Os papéis iniciais devem ser:

- OWNER;
- ADMIN;
- MEMBER.

Alterações relevantes de papel devem gerar Activity Log.

---

## Associar funcionário a Cliente

Como utilizador administrativo autorizado,
quero associar um funcionário a um Cliente,
para permitir que ele acesse somente os Clientes sob sua responsabilidade.

### Critérios de aceite

- Um utilizador pode estar associado a vários Clientes.
- Um Cliente pode possuir vários utilizadores associados.
- A associação deve ser persistida.
- A alteração deve gerar Activity Log quando aplicável.

---

## Restringir acesso por Cliente

Como OWNER,
quero que MEMBERS acessem somente os Clientes autorizados,
para proteger informações de outros Clientes.

### Critérios de aceite

- Um MEMBER não associado ao Cliente não deve visualizá-lo.
- O acesso deve ser negado também por URL direta.
- Queries não devem retornar Clientes não autorizados.
- Documentos privados do Cliente não devem ser acessíveis.
- A restrição não pode existir apenas no frontend.

---

## Restringir áreas sensíveis

Como OWNER,
quero controlar o acesso de funcionários a Financeiro e Contratos,
para evitar exposição indevida de informações sensíveis.

### Critérios de aceite

- Associação a Cliente não deve conceder automaticamente acesso ao Financeiro.
- Associação a Cliente não deve conceder automaticamente acesso a Contratos.
- MEMBER não deve receber permissões administrativas globais por estar associado a um Cliente.

---

# Demandas

## Criar Demanda

Como utilizador autorizado,
quero criar uma Demanda para um Cliente,
para registrar um trabalho que precisa ser executado.

### Critérios de aceite

- Toda Demanda deve estar associada a um Cliente.
- Deve existir um título.
- O utilizador deve possuir autorização para o Cliente.
- O Status deve utilizar o domínio oficial.
- A Prioridade deve utilizar o domínio oficial.
- A criação deve ser auditada quando aplicável.

---

## Atribuir responsáveis

Como utilizador autorizado,
quero atribuir um ou mais responsáveis a uma Demanda,
para definir quem executará o trabalho.

### Critérios de aceite

- Uma Demanda pode possuir múltiplos responsáveis.
- Os responsáveis devem ser utilizadores válidos e autorizados conforme as regras do sistema.
- Alterações de responsáveis devem ser auditadas quando aplicável.

---

## Atualizar Status da Demanda

Como utilizador autorizado,
quero atualizar o Status de uma Demanda,
para representar corretamente seu progresso operacional.

### Critérios de aceite

Os únicos Status oficiais são:

- OPEN;
- IN_PROGRESS;
- WAITING_CLIENT;
- REVIEW;
- COMPLETED;
- CANCELED.

Tags não podem substituir o Status.

---

## Definir Prioridade

Como utilizador autorizado,
quero definir a Prioridade de uma Demanda,
para indicar a urgência relativa do trabalho.

### Critérios de aceite

Os valores permitidos são:

- LOW;
- MEDIUM;
- HIGH;
- URGENT.

Prioridade deve ser independente do Status.

---

## Adicionar Tags

Como utilizador autorizado,
quero adicionar Tags a uma Demanda,
para classificá-la de forma complementar.

### Critérios de aceite

- Tags não podem substituir Status.
- Tags não podem substituir Prioridade.
- Tags podem ser utilizadas para organização e contexto operacional.

---

## Definir prazo

Como utilizador autorizado,
quero definir um prazo para uma Demanda,
para acompanhar a data esperada de entrega.

### Critérios de aceite

- A Demanda deve permitir uma data de prazo.
- Demandas vencidas devem ser identificadas conforme as regras de negócio.
- Demandas COMPLETED ou CANCELED não devem ser consideradas atrasadas.

---

## Receber alerta de prazo

Como utilizador responsável,
quero receber aviso quando uma Demanda estiver próxima do prazo,
para reduzir o risco de atraso.

### Critérios de aceite

- A verificação não deve depender exclusivamente do navegador aberto.
- O sistema deve poder identificar Demandas próximas do prazo.
- O aviso deve respeitar as permissões do utilizador.

---

## Arquivar Demanda

Como utilizador autorizado,
quero arquivar uma Demanda,
para removê-la das listagens operacionais preservando o histórico.

### Critérios de aceite

- Não deve ocorrer exclusão física pelo fluxo normal.
- Demandas arquivadas não devem aparecer por padrão.
- O histórico deve permanecer preservado.

---

# Documentos

## Anexar documento a Cliente

Como utilizador autorizado,
quero anexar documentos a um Cliente,
para centralizar arquivos relacionados ao atendimento.

### Critérios de aceite

- O documento deve utilizar armazenamento privado.
- O utilizador deve possuir acesso ao Cliente.
- O documento deve permanecer relacionado ao Cliente correspondente.

---

## Anexar documento a Demanda

Como utilizador autorizado,
quero anexar arquivos a uma Demanda,
para manter briefing, protótipos e materiais junto ao trabalho executado.

### Critérios de aceite

- O utilizador deve possuir acesso à Demanda e ao Cliente correspondente.
- Os arquivos devem utilizar a infraestrutura central de documentos.
- O acesso deve respeitar as permissões do Cliente.

---

## Acessar documento privado

Como utilizador autorizado,
quero acessar documentos relacionados aos Clientes permitidos,
para consultar os arquivos necessários ao meu trabalho.

### Critérios de aceite

- Utilizadores não autorizados não podem acessar o arquivo.
- Conhecer uma URL não deve ser suficiente para obter acesso.
- O acesso deve respeitar as regras da entidade relacionada.

---

# Financeiro

## Registrar entrada

Como utilizador autorizado,
quero registrar uma entrada financeira,
para acompanhar receitas da FASBtech.

### Critérios de aceite

- O valor deve ser maior que zero.
- A entrada pode estar associada a um Cliente.
- Deve ser possível informar se a movimentação é ONE_TIME ou RECURRING.
- Deve ser possível distinguir valores realizados de valores pendentes.
- A operação deve ser auditada quando aplicável.

---

## Registrar saída

Como utilizador autorizado,
quero registrar uma saída financeira,
para acompanhar despesas da FASBtech.

### Critérios de aceite

- O valor deve ser maior que zero.
- Associação a Cliente não deve ser obrigatória.
- Deve ser possível distinguir valores realizados de valores pendentes.
- A operação deve ser auditada quando aplicável.

---

## Anexar comprovante

Como utilizador autorizado,
quero anexar um comprovante ou nota a uma movimentação,
para manter a documentação financeira organizada.

### Critérios de aceite

- O arquivo deve utilizar a infraestrutura central de documentos.
- O acesso deve respeitar as permissões do módulo Financeiro.
- O documento deve permanecer relacionado à movimentação correta.

---

## Visualizar saldo em caixa

Como utilizador autorizado,
quero visualizar o saldo em caixa,
para saber o resultado financeiro realizado da empresa.

### Critérios de aceite

- Somente movimentações efetivamente realizadas devem compor o saldo.
- Valores pendentes ou previstos não devem alterar o saldo realizado.
- O saldo não deve depender de um valor manual independente.

---

## Definir meta mensal

Como utilizador autorizado,
quero definir uma meta mensal de receita,
para acompanhar o desempenho financeiro do mês.

### Critérios de aceite

- A meta deve possuir mês.
- A meta deve possuir ano.
- A meta deve possuir valor.
- Deve existir apenas uma meta ativa para a mesma combinação de mês e ano.

---

## Acompanhar meta mensal

Como utilizador autorizado,
quero visualizar o progresso da meta mensal,
para saber quanto da meta já foi atingido.

### Critérios de aceite

- O progresso deve usar apenas receitas efetivamente recebidas no período.
- O valor deve ser calculado a partir das movimentações financeiras.

---

# Contratos

## Criar contrato

Como utilizador autorizado,
quero iniciar um Contrato para um Cliente,
para formalizar um serviço prestado pela FASBtech.

### Critérios de aceite

- O Contrato deve estar associado a um Cliente.
- Deve ser possível selecionar um modelo de contrato.
- Dados existentes do Cliente devem ser reutilizados quando aplicável.
- Deve ser possível complementar informações antes da geração.

---

## Revisar contrato

Como utilizador autorizado,
quero revisar os dados do Contrato antes de gerar a versão final,
para reduzir erros no documento.

### Critérios de aceite

- Os dados utilizados devem estar visíveis antes da geração.
- O sistema deve permitir corrigir informações ainda editáveis.
- A geração final só deve ocorrer após o fluxo de revisão.

---

## Gerar contrato

Como utilizador autorizado,
quero gerar a versão final do Contrato,
para produzir o documento que será enviado ao Cliente.

### Critérios de aceite

- O sistema deve preservar um snapshot dos dados utilizados.
- Alterações futuras no Cliente não podem modificar a versão gerada.
- O Status deve refletir a geração.
- A operação deve ser auditada quando aplicável.

---

## Gerar PDF

Como utilizador autorizado,
quero gerar o Contrato em PDF,
para enviar e arquivar uma versão final consistente.

### Critérios de aceite

- O PDF deve representar a versão gerada.
- A versão gerada deve permanecer armazenada.
- O arquivo deve utilizar a infraestrutura oficial de documentos.

---

## Enviar contrato por e-mail

Como utilizador autorizado,
quero enviar o Contrato ao Cliente por e-mail,
para encaminhar formalmente o documento.

### Critérios de aceite

- O destinatário deve ser validado.
- A versão enviada deve permanecer preservada.
- O Status deve poder refletir que o Contrato foi enviado.
- O envio deve ser auditado quando aplicável.

---

## Registrar contrato assinado

Como utilizador autorizado,
quero anexar a cópia assinada de um Contrato,
para manter o documento final registrado no CRM.

### Critérios de aceite

- O MVP não exige assinatura eletrônica integrada.
- Deve ser possível fazer upload da cópia assinada externamente.
- O arquivo deve permanecer armazenado.
- O Contrato pode ser marcado como SIGNED conforme as regras definidas.

---

## Cancelar contrato

Como utilizador autorizado,
quero cancelar um Contrato,
para representar corretamente sua situação sem apagar o histórico.

### Critérios de aceite

- O histórico do Contrato deve ser preservado.
- Versões já geradas não devem ser apagadas automaticamente.
- O Status deve passar a CANCELED conforme o fluxo permitido.
- O cancelamento deve ser auditado.

---

# Activity Logs

## Consultar histórico

Como utilizador autorizado,
quero consultar atividades relacionadas a uma entidade,
para compreender alterações importantes realizadas no sistema.

### Critérios de aceite

- Os registros devem respeitar as permissões do utilizador.
- Activity Logs não devem ser editáveis.
- Activity Logs não devem ser excluídos pelo fluxo normal da aplicação.

---

# Fora do Escopo

Não fazem parte das Histórias de Utilizador do MVP v3.0:

- cadastro de Leads;
- pipeline comercial de Leads;
- conversão Lead em Cliente;
- Projetos;
- Product Registry operacional;
- Agenda;
- renovação de domínio;
- gestão estruturada de reuniões;
- assinatura eletrônica integrada;
- cobrança automática;
- emissão fiscal automática;
- SaaS multiempresa em produção.

Esses fluxos só devem receber novas User Stories após alteração formal do PRD.

---

# Rastreabilidade

As histórias deste documento correspondem aos seguintes domínios funcionais:

```text
Foundation      → FR-001+
Dashboard       → FR-100+
Acessos         → FR-200+
Clientes        → FR-300+
Demandas        → FR-400+
Documentos      → FR-500+
Financeiro      → FR-600+
Contratos       → FR-650+
Activity Logs   → FR-700+
Segurança       → FR-800+
```