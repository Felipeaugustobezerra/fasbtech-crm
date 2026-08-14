# Functional Requirements

## Projeto

FASBtech CRM

---

## Status

🟢 Ativo

---

## Versão

3.0

---

## Última atualização

Agosto de 2026

---

# Objetivo

Este documento descreve os requisitos funcionais oficiais do FASBtech CRM.

Seu objetivo é definir o comportamento esperado do sistema a partir do escopo aprovado no:

- PRD v3.0;
- MVP Scope v3.0;
- Product Roadmap v3.0.

Este documento não define:

- estrutura física do banco de dados;
- implementação técnica;
- migrations;
- detalhes internos de RPCs;
- estrutura de componentes;
- decisões arquiteturais de baixo nível.

Essas responsabilidades pertencem aos respectivos documentos técnicos.

Em caso de conflito funcional, o **PRD** prevalece.

---

# Organização

Os requisitos são organizados por domínio.

Cada requisito possui um identificador único.

A organização oficial é:

```text
Foundation                 FR-001
Organization               FR-020
Settings                   FR-030
Dashboard                  FR-100
Acessos                    FR-200
Clientes                   FR-300
Demandas                   FR-400
Documentos                 FR-500
Financeiro                 FR-600
Contratos                  FR-650
Activity Logs              FR-700
Segurança                  FR-800
Interface                  FR-900
Acessibilidade             FR-1000
Testes                     FR-1100
```

---

# Foundation

## FR-001

O sistema deve permitir autenticação por e-mail e senha.

---

## FR-002

O sistema deve impedir o acesso às áreas privadas sem autenticação válida.

---

## FR-003

O sistema deve manter a sessão autenticada enquanto ela permanecer válida.

---

## FR-004

O sistema deve permitir logout seguro.

---

## FR-005

O sistema deve validar a identidade do utilizador antes da execução de operações protegidas.

---

## FR-006

O sistema deve permitir que o utilizador visualize seu próprio Perfil.

---

## FR-007

O sistema deve permitir que o utilizador atualize os campos editáveis do próprio Perfil.

---

## FR-008

O sistema deve apresentar um AppShell para as áreas autenticadas.

---

## FR-009

O menu principal deve disponibilizar os seguintes módulos:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

---

## FR-010

Funcionalidades ainda não implementadas não devem apresentar fluxos falsos ou dados simulados como se fossem dados reais da operação.

---

# Organization

## FR-020

O sistema deve permitir visualizar os dados da Organization atual.

---

## FR-021

Somente utilizadores autorizados devem poder alterar os dados administrativos da Organization.

---

## FR-022

O utilizador não deve poder selecionar ou alterar arbitrariamente a Organization utilizada para acessar dados.

---

## FR-023

Alterações relevantes nos dados da Organization devem gerar Activity Log.

---

## FR-024

O MVP deve operar inicialmente com uma única Organization representando a FASBtech.

---

## FR-025

O sistema deve suportar múltiplos utilizadores internos vinculados à Organization.

---

# Configurações

## FR-030

O sistema deve disponibilizar configurações essenciais da Organization.

---

## FR-031

Somente utilizadores autorizados devem poder alterar configurações globais.

---

## FR-032

Alterações relevantes nas configurações devem gerar Activity Log.

---

# Dashboard

## FR-100

O sistema deve apresentar um Dashboard após o login.

---

## FR-101

Durante a Foundation, o Dashboard deve disponibilizar a estrutura inicial necessária para navegação e evolução dos indicadores.

---

## FR-102

O Dashboard consolidado deve utilizar dados reais provenientes dos módulos oficiais do sistema.

---

## FR-103

O Dashboard não deve depender de dados fictícios para apresentar indicadores ainda não disponíveis.

---

## FR-104

O Dashboard deve apresentar resumo financeiro quando o módulo Financeiro estiver implementado.

O resumo deve contemplar, no mínimo:

- entradas do mês;
- saídas do mês;
- saldo em caixa;
- progresso da meta mensal.

---

## FR-105

O Dashboard deve apresentar resumo de Demandas quando o módulo Demandas estiver implementado.

O resumo deve contemplar, quando aplicável:

- Demandas abertas;
- Demandas em andamento;
- Demandas atrasadas;
- Demandas próximas do prazo;
- Demandas concluídas.

---

## FR-106

O Dashboard deve apresentar próximos prazos quando existirem Demandas com prazo definido.

---

## FR-107

O Dashboard deve apresentar alertas operacionais relevantes quando existirem.

---

## FR-108

O Dashboard deve apresentar atividades recentes quando houver dados disponíveis em Activity Logs.

---

## FR-109

O Dashboard pode apresentar indicadores de Contratos quando houver dados suficientes para isso.

Exemplos:

- contratos em elaboração;
- contratos enviados;
- contratos assinados.

---

## FR-110

O Dashboard não deve apresentar próximas reuniões enquanto não existir uma fonte oficial de dados para reuniões.

---

## FR-111

Os indicadores do Dashboard devem ser derivados dos módulos responsáveis pelos dados.

O utilizador não deve precisar atualizar manualmente o Dashboard.

---

# Acessos

## FR-200

O sistema deve permitir visualizar os utilizadores internos vinculados à Organization.

---

## FR-201

O sistema deve suportar os seguintes papéis iniciais:

```text
OWNER
ADMIN
MEMBER
```

---

## FR-202

O sistema deve permitir que utilizadores autorizados gerenciem o papel dos utilizadores internos dentro das regras permitidas.

---

## FR-203

O sistema deve permitir associar um utilizador interno a um ou mais Clientes.

---

## FR-204

O sistema deve permitir visualizar quais Clientes estão associados a determinado utilizador.

---

## FR-205

O sistema deve permitir visualizar quais utilizadores estão associados a determinado Cliente.

---

## FR-206

Um MEMBER deve acessar somente os Clientes aos quais estiver explicitamente autorizado.

---

## FR-207

Um MEMBER sem autorização para determinado Cliente não deve conseguir acessar seus dados por navegação direta.

---

## FR-208

A associação a um Cliente deve ser considerada na autorização das informações relacionadas ao Cliente.

---

## FR-209

A associação a um Cliente não deve conceder automaticamente acesso irrestrito às informações financeiras.

---

## FR-210

A associação a um Cliente não deve conceder automaticamente acesso irrestrito aos Contratos.

---

## FR-211

A associação a um Cliente não deve conceder automaticamente permissões administrativas sobre a Organization.

---

## FR-212

O OWNER deve possuir acesso administrativo completo à Organization dentro do escopo do sistema.

---

## FR-213

O ADMIN deve possuir acesso administrativo conforme as permissões definidas pelas regras de negócio.

---

## FR-214

O MEMBER deve possuir acesso operacional limitado pelas suas permissões e associações.

---

## FR-215

Alterações relevantes em:

- roles;
- Memberships;
- associações entre utilizadores e Clientes;

devem gerar Activity Log.

---

# Clientes

## FR-300

O sistema deve permitir cadastrar Clientes diretamente.

A existência de um Lead prévio não é obrigatória.

---

## FR-301

O sistema deve permitir listar Clientes.

---

## FR-302

O sistema deve permitir visualizar os detalhes de um Cliente.

---

## FR-303

O sistema deve permitir editar Clientes.

---

## FR-304

O sistema deve permitir arquivar Clientes sem exclusão física pelo fluxo normal da aplicação.

---

## FR-305

Clientes arquivados não devem aparecer nas listagens padrão.

---

## FR-306

O sistema deve permitir pesquisar Clientes.

---

## FR-307

O sistema deve permitir filtrar Clientes quando existirem critérios de filtro aplicáveis.

---

## FR-308

O sistema deve permitir ordenar a listagem de Clientes.

---

## FR-309

O sistema deve permitir paginação da listagem de Clientes.

---

## FR-310

O cadastro de Cliente deve permitir armazenar informações de contato.

---

## FR-311

O cadastro de Cliente deve permitir armazenar informações empresariais quando aplicáveis.

---

## FR-312

O cadastro de Cliente deve permitir armazenar informações fiscais quando necessárias.

---

## FR-313

A identificação fiscal não deve ser limitada exclusivamente ao CPF.

O sistema deve permitir diferentes tipos de documento fiscal.

Exemplos:

```text
CPF
CNPJ
NIF
VAT
```

---

## FR-314

O cadastro de Cliente deve permitir armazenar endereço quando necessário.

---

## FR-315

O sistema deve permitir registrar observações internas sobre o Cliente.

---

## FR-316

A página de detalhes do Cliente deve funcionar como ponto de acesso às informações relacionadas ao Cliente.

Quando os respectivos módulos estiverem implementados, poderá apresentar:

```text
Visão Geral
Demandas
Contratos
Financeiro
Documentos
Acessos
Atividades
```

---

## FR-317

O sistema deve permitir visualizar os utilizadores autorizados a acessar determinado Cliente.

---

## FR-318

Toda alteração relevante em Clientes deve gerar Activity Log.

Incluindo, quando aplicável:

- criação;
- atualização;
- arquivamento;
- alteração de dados relevantes.

---

# Demandas

## FR-400

O sistema deve permitir cadastrar Demandas.

---

## FR-401

Toda Demanda deve estar associada a um Cliente.

---

## FR-402

O sistema deve permitir listar Demandas.

---

## FR-403

O sistema deve permitir visualizar os detalhes de uma Demanda.

---

## FR-404

O sistema deve permitir editar Demandas.

---

## FR-405

O sistema deve permitir arquivar Demandas sem exclusão física pelo fluxo normal.

---

## FR-406

Demandas arquivadas não devem aparecer nas listagens padrão.

---

## FR-407

O sistema deve permitir pesquisar Demandas.

---

## FR-408

O sistema deve permitir filtrar Demandas por critérios relevantes.

Incluindo, quando aplicável:

- Cliente;
- Status;
- Prioridade;
- Responsável;
- Tags;
- prazo.

---

## FR-409

O sistema deve permitir ordenar a listagem de Demandas.

---

## FR-410

O sistema deve permitir paginação da listagem de Demandas.

---

## FR-411

Uma Demanda deve possuir título.

---

## FR-412

Uma Demanda deve permitir descrição do trabalho solicitado.

---

## FR-413

Uma Demanda deve possuir associação ao Cliente responsável pela solicitação ou serviço.

---

## FR-414

O sistema deve permitir associar um ou mais responsáveis a uma Demanda.

---

## FR-415

Os responsáveis por uma Demanda devem ser utilizadores autorizados conforme as regras de acesso aplicáveis.

---

## FR-416

Uma Demanda deve permitir informar data de início.

---

## FR-417

Uma Demanda deve permitir informar prazo de entrega.

---

## FR-418

O Status da Demanda deve utilizar exclusivamente o domínio oficial:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

---

## FR-419

A Prioridade da Demanda deve utilizar exclusivamente o domínio inicial:

```text
LOW
MEDIUM
HIGH
URGENT
```

---

## FR-420

Status e Prioridade devem ser conceitos independentes.

---

## FR-421

O sistema deve permitir adicionar Tags a Demandas.

---

## FR-422

Tags devem ser independentes do Status.

---

## FR-423

Tags devem ser independentes da Prioridade.

---

## FR-424

Tags não devem ser utilizadas como única fonte para determinar o workflow operacional da Demanda.

---

## FR-425

O sistema deve permitir registrar observações em uma Demanda.

---

## FR-426

O sistema deve identificar Demandas atrasadas quando o prazo tiver expirado e a Demanda ainda não estiver concluída ou cancelada.

---

## FR-427

O sistema deve identificar Demandas próximas do prazo de entrega.

---

## FR-428

O sistema deve permitir gerar notificações internas relacionadas a prazos de Demandas.

---

## FR-429

As notificações de prazo não devem depender exclusivamente da permanência do navegador aberto.

---

## FR-430

Toda operação relevante em Demandas deve gerar Activity Log.

Incluindo, quando aplicável:

- criação;
- edição;
- arquivamento;
- alteração de Status;
- alteração de Prioridade;
- alteração de prazo;
- alteração de responsáveis.

---

# Documentos

## FR-500

O sistema deve possuir uma infraestrutura centralizada para documentos.

---

## FR-501

O sistema não deve exigir mecanismos de armazenamento independentes para cada módulo funcional.

---

## FR-502

O sistema deve permitir associar documentos a Clientes.

---

## FR-503

O sistema deve permitir associar documentos a Demandas.

---

## FR-504

O sistema deve permitir associar documentos a Contratos.

---

## FR-505

O sistema deve permitir associar documentos a movimentações financeiras.

---

## FR-506

O sistema deve permitir enviar arquivos para o armazenamento autorizado.

---

## FR-507

O sistema deve permitir listar os documentos relacionados a uma entidade autorizada.

---

## FR-508

O sistema deve permitir acessar ou obter documentos apenas quando o utilizador possuir autorização para a entidade relacionada.

---

## FR-509

Os documentos devem ser privados por padrão.

---

## FR-510

Um utilizador sem acesso ao Cliente relacionado não deve conseguir acessar documentos privados desse Cliente por URL direta ou outro fluxo não autorizado.

---

## FR-511

O sistema deve permitir armazenar documentos como:

- briefing;
- templates;
- protótipos;
- contratos;
- contratos assinados;
- comprovantes;
- notas fiscais;
- recibos;
- documentos enviados pelo Cliente;
- arquivos relacionados às Demandas.

---

## FR-512

Alterações relevantes relacionadas ao armazenamento ou associação de documentos devem gerar Activity Log quando definido pelas regras de negócio.

---

# Financeiro

## FR-600

O sistema deve disponibilizar um módulo de gestão financeira operacional.

---

## FR-601

O sistema deve permitir registrar entradas financeiras.

---

## FR-602

Uma entrada financeira deve poder ser associada a um Cliente.

---

## FR-603

O sistema deve permitir registrar saídas financeiras.

---

## FR-604

Uma saída financeira não deve exigir associação obrigatória a um Cliente.

---

## FR-605

O sistema deve permitir informar descrição da movimentação financeira.

---

## FR-606

O sistema deve permitir informar categoria da movimentação financeira.

---

## FR-607

O sistema deve permitir informar valor da movimentação financeira.

---

## FR-608

O sistema deve permitir informar a data da movimentação.

---

## FR-609

O sistema deve permitir informar vencimento quando aplicável.

---

## FR-610

O sistema deve permitir registrar quando uma movimentação foi efetivamente paga ou recebida.

---

## FR-611

O sistema deve distinguir movimentações realizadas de movimentações ainda pendentes.

---

## FR-612

O saldo em caixa deve considerar somente movimentações efetivamente realizadas.

---

## FR-613

Movimentações previstas ou pendentes não devem alterar o saldo realizado.

---

## FR-614

O sistema deve distinguir os seguintes tipos iniciais de pagamento:

```text
ONE_TIME
RECURRING
```

---

## FR-615

O tipo `RECURRING` deve identificar a natureza recorrente da movimentação.

---

## FR-616

O MVP não deve executar cobrança automática de movimentações recorrentes.

---

## FR-617

O sistema deve permitir registrar observações em movimentações financeiras.

---

## FR-618

O sistema deve permitir anexar documentos a movimentações financeiras.

---

## FR-619

Os anexos financeiros devem utilizar a infraestrutura centralizada de documentos.

---

## FR-620

O sistema deve apresentar total de entradas realizadas no período.

---

## FR-621

O sistema deve apresentar total de saídas realizadas no período.

---

## FR-622

O sistema deve apresentar saldo em caixa.

---

## FR-623

O sistema deve permitir criar uma meta mensal de receita.

---

## FR-624

A meta mensal deve estar associada a:

- mês;
- ano;
- valor da meta.

---

## FR-625

O sistema deve apresentar o progresso da meta mensal.

---

## FR-626

O progresso da meta deve considerar a receita efetivamente recebida no período correspondente.

---

## FR-627

O módulo Financeiro não deve ser apresentado como substituto de sistema contábil ou fiscal completo.

---

## FR-628

Toda operação financeira relevante deve gerar Activity Log quando aplicável.

---

# Contratos

## FR-650

O sistema deve permitir gerenciar Contratos.

---

## FR-651

O sistema deve permitir cadastrar e utilizar modelos reutilizáveis de contrato.

---

## FR-652

O sistema deve permitir iniciar a criação de um Contrato a partir de um Cliente.

---

## FR-653

O sistema deve permitir selecionar um modelo de contrato para geração.

---

## FR-654

O sistema deve reutilizar automaticamente informações já disponíveis no cadastro do Cliente quando aplicável.

---

## FR-655

O sistema deve permitir preencher dados adicionais necessários ao Contrato.

---

## FR-656

O sistema deve permitir revisar os dados do Contrato antes da geração final.

---

## FR-657

O sistema deve preservar um snapshot dos dados utilizados quando um Contrato for gerado.

---

## FR-658

Alterações posteriores no cadastro do Cliente não devem modificar retroativamente um Contrato já gerado.

---

## FR-659

O sistema deve permitir gerar o documento final do Contrato.

---

## FR-660

O sistema deve permitir gerar uma versão PDF do Contrato.

---

## FR-661

A versão gerada do Contrato deve permanecer armazenada no sistema.

---

## FR-662

O sistema deve permitir enviar o Contrato ao Cliente por e-mail.

---

## FR-663

A versão enviada ao Cliente deve permanecer preservada.

---

## FR-664

O Status do Contrato deve utilizar o domínio inicial:

```text
DRAFT
GENERATED
SENT
SIGNED
CANCELED
```

---

## FR-665

O sistema deve permitir fazer upload de uma cópia assinada externamente.

---

## FR-666

O sistema deve permitir marcar um Contrato como `SIGNED` conforme o fluxo autorizado.

---

## FR-667

Assinatura eletrônica integrada não faz parte do MVP.

---

## FR-668

Os arquivos de Contratos devem utilizar a infraestrutura centralizada de documentos.

---

## FR-669

Toda operação relevante em Contratos deve gerar Activity Log.

Incluindo, quando aplicável:

- criação;
- geração;
- envio;
- alteração de Status;
- upload da versão assinada;
- cancelamento.

---

# Activity Logs

## FR-700

Toda operação definida como auditável pelas regras de negócio deve gerar Activity Log.

---

## FR-701

O histórico de Activity Logs não deve poder ser removido pelo fluxo normal da aplicação.

---

## FR-702

Activity Logs devem permanecer imutáveis após sua criação.

---

## FR-703

Quando uma operação exigir atomicidade entre alteração do dado principal e Activity Log, ambos devem ser registrados como uma única operação lógica.

---

## FR-704

O Activity Log deve permitir identificar, quando aplicável:

- utilizador;
- Organization;
- entidade;
- ação;
- data.

---

## FR-705

Activity Logs não substituem logs técnicos ou observabilidade da aplicação.

---

# Segurança

## FR-800

Toda área protegida deve exigir autenticação válida.

---

## FR-801

Toda operação protegida deve validar autorização.

---

## FR-802

Nenhum utilizador deve acessar dados pertencentes a outra Organization.

---

## FR-803

Um utilizador limitado por associação a Clientes não deve acessar Clientes para os quais não possui autorização.

---

## FR-804

A restrição de acesso por Cliente deve ser aplicada independentemente de a navegação ocorrer pela interface ou por URL direta.

---

## FR-805

O sistema não deve confiar em informações de autorização controláveis pelo utilizador para decidir a Organization acessada.

---

## FR-806

O sistema não deve confiar em informações de autorização controláveis pelo utilizador para decidir quais Clientes podem ser acessados.

---

## FR-807

Informações administrativas de auditoria não devem ser editáveis livremente pela interface.

---

## FR-808

O utilizador não deve poder criar Activity Logs arbitrários através da interface.

---

## FR-809

Documentos privados devem respeitar as mesmas regras de autorização aplicáveis às entidades às quais estão associados.

---

## FR-810

Acesso a Financeiro deve respeitar permissões específicas.

---

## FR-811

Acesso a Contratos deve respeitar permissões específicas.

---

## FR-812

A associação de um MEMBER a um Cliente não deve, isoladamente, conceder acesso administrativo global ao sistema.

---

# Interface

## FR-900

Todas as páginas devem seguir o Design System oficial.

---

## FR-901

Listagens que utilizarem DataTable devem seguir o documento DataTable Guidelines.

---

## FR-902

Os componentes devem utilizar os Design Tokens oficiais.

---

## FR-903

Formulários devem possuir validação adequada aos dados esperados.

---

## FR-904

Formulários devem apresentar mensagens claras de erro.

---

## FR-905

Ações devem apresentar feedback visual apropriado.

---

## FR-906

Telas que dependam de carregamento assíncrono devem possuir estado de Loading adequado.

---

## FR-907

Listagens sem registros devem possuir Empty State adequado.

---

## FR-908

Telas que possam falhar durante carregamento ou operação devem possuir Error State adequado.

---

## FR-909

Operações concluídas com sucesso devem apresentar feedback apropriado quando necessário.

---

## FR-910

A interface deve funcionar em:

- Desktop;
- Tablet;
- Mobile.

---

## FR-911

O menu principal deve manter os módulos oficiais definidos no PRD:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

---

# Acessibilidade

## FR-1000

Todas as páginas devem cumprir WCAG 2.2 nível AA.

---

## FR-1001

Todos os componentes interativos devem ser navegáveis por teclado quando aplicável.

---

## FR-1002

Formulários devem possuir labels acessíveis.

---

## FR-1003

Estados, erros e informações relevantes não devem depender exclusivamente de cor.

---

## FR-1004

O foco visível deve permanecer disponível para elementos interativos.

---

# Testes

## FR-1100

A implementação deve possuir testes conforme a Testing Strategy oficial.

---

## FR-1101

Regras de negócio críticas devem possuir testes adequados.

---

## FR-1102

Fluxos críticos do utilizador devem possuir testes End-to-End quando definidos pela Testing Strategy.

---

## FR-1103

Os testes devem validar isolamento entre Organizations.

---

## FR-1104

Os testes da Sprint 02 devem validar autorização por Cliente.

Incluindo pelo menos:

- acesso autorizado;
- acesso não autorizado;
- MEMBER associado;
- MEMBER não associado;
- acesso direto indevido.

---

## FR-1105

Os testes devem validar acesso a documentos privados quando houver documentos envolvidos no módulo.

---

## FR-1106

Operações auditáveis críticas devem validar a geração correta de Activity Logs.

---

## FR-1107

Operações que exigirem atomicidade devem possuir testes compatíveis com esse requisito.

---

# Fora do Escopo Funcional do MVP Atual

Os seguintes domínios não fazem parte dos requisitos funcionais do MVP v3.0:

- pipeline completo de Leads;
- conversão Lead → Cliente;
- módulo independente de Projetos;
- Product Registry operacional;
- Agenda completa;
- gestão estruturada de reuniões;
- assinatura eletrônica integrada;
- processamento de pagamentos;
- cobrança automática;
- emissão fiscal automática;
- contabilidade completa;
- SaaS multiempresa em produção;
- aplicativo Mobile nativo;
- API Pública;
- Billing SaaS;
- Marketplace;
- IA generativa;
- Portal do Cliente;
- integrações bancárias;
- automações externas avançadas.

A inclusão futura de qualquer um desses domínios deverá iniciar pelo PRD.

---

# Rastreabilidade por Sprint

## Sprint 01 — Foundation

Principais grupos:

```text
FR-001 — Foundation
FR-020 — Organization
FR-030 — Settings
FR-100 — Dashboard Inicial
FR-700 — Activity Logs base
FR-800 — Segurança base
FR-900 — Interface base
FR-1000 — Acessibilidade
FR-1100 — Testes
```

---

## Sprint 02 — Clientes & Acessos

Principais grupos:

```text
FR-200 — Acessos
FR-300 — Clientes
FR-500 — Documentos de Cliente quando aplicável
FR-700 — Activity Logs
FR-800 — Segurança
FR-1100 — Testes
```

---

## Sprint 03 — Demandas

Principais grupos:

```text
FR-400 — Demandas
FR-500 — Documentos
FR-700 — Activity Logs
FR-800 — Segurança
FR-1100 — Testes
```

---

## Sprint 04 — Financeiro

Principais grupos:

```text
FR-600 — Financeiro
FR-500 — Documentos
FR-700 — Activity Logs
FR-800 — Segurança
FR-1100 — Testes
```

---

## Sprint 05 — Contratos

Principais grupos:

```text
FR-650 — Contratos
FR-500 — Documentos
FR-700 — Activity Logs
FR-800 — Segurança
FR-1100 — Testes
```

---

## Sprint 06 — Dashboard

Principais grupos:

```text
FR-100 — Dashboard Consolidado
```

---

# Fonte da Verdade

Este documento implementa funcionalmente o escopo definido por:

```text
PRD v3.0

↓

MVP Scope v3.0

↓

Product Roadmap v3.0
```

Os domínios oficiais do MVP são:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

Clientes são a entidade operacional central.

Demandas representam unidades de trabalho.

Status, Prioridade e Tags de Demandas são conceitos independentes.

Documentos utilizam uma infraestrutura centralizada.

Financeiro representa gestão financeira operacional.

Contratos preservam snapshot dos dados utilizados na geração.

Acessos controlam utilizadores, roles e autorização por Cliente.

---

# Definition of Done

Um requisito funcional será considerado implementado quando:

- o comportamento estiver implementado conforme o PRD;
- as regras de negócio correspondentes estiverem respeitadas;
- as User Stories relacionadas estiverem atendidas quando aplicável;
- os critérios de aceite estiverem aprovados;
- os testes exigidos pela Testing Strategy estiverem aprovados;
- as regras de autorização aplicáveis estiverem funcionando;
- Activity Logs estiverem funcionando quando exigidos;
- Error Handling aplicável estiver implementado;
- acessibilidade obrigatória estiver respeitada;
- documentação diretamente afetada estiver atualizada;
- revisão técnica estiver aprovada.