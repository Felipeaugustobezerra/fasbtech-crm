# Modelo de Dados

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟢 Ativo

---

## Última atualização

Agosto de 2026

---

# Objetivo

Este documento apresenta o modelo lógico de dados do FASBtech CRM.

Seu objetivo é documentar:

- entidades do sistema;
- responsabilidades conceituais;
- relacionamentos;
- dependências entre domínios;
- evolução prevista ao longo das Sprints.

Este documento representa a visão conceitual do banco de dados.

Ele não substitui:

- Migrations;
- schemas específicos;
- constraints;
- índices;
- Policies;
- RLS;
- funções;
- RPCs.

Os detalhes físicos deverão ser definidos nos documentos técnicos correspondentes.

---

# Fonte Funcional

Este modelo deve permanecer alinhado com:

```text
PRD v3.0

↓

MVP Scope v3.0

↓

Product Roadmap v3.0

↓

Functional Requirements v3.0

↓

Business Rules v3.0
```

---

# Princípios do Modelo

O modelo de dados deverá seguir os seguintes princípios:

- todos os dados operacionais pertencem a uma Organization;
- utilizadores e Organizations relacionam-se através de Memberships;
- Clientes são a entidade operacional central do MVP;
- autorização de MEMBER pode depender da associação ao Cliente;
- Demandas pertencem a Clientes;
- documentos utilizam infraestrutura centralizada;
- Financeiro não depende obrigatoriamente de Cliente;
- Contratos pertencem a Clientes;
- Activity Logs são centralizados;
- Activity Logs não possuem relacionamento estrutural específico com cada tabela auditada;
- Dashboard deriva dados dos módulos e não mantém cópias próprias dos indicadores;
- UUID será utilizado como identificador das entidades do domínio;
- TIMESTAMPTZ será utilizado para datas e horários persistidos quando aplicável;
- arquivamento lógico será utilizado quando o domínio exigir preservação histórica.

---

# Supabase Auth

A autenticação é gerenciada por:

```text
auth.users
```

`auth.users` pertence ao Supabase Auth.

Ela não substitui a entidade:

```text
profiles
```

da aplicação.

Relacionamento conceitual:

```text
auth.users

1

↓

1

profiles
```

---

# Sprint 01 — Foundation

A Foundation deverá possuir apenas as entidades necessárias para sustentar autenticação, Organization, Membership, autorização base e auditoria.

Entidades:

```text
organizations

profiles

organization_members

activity_logs
```

Entidades de negócio como Clientes e Demandas não fazem parte da Migration da Foundation.

---

# Modelo da Foundation

```text
auth.users
    │
    │ 1:1
    ▼
profiles
    │
    │
    ▼
organization_members
    │
    ▼
organizations
    │
    └──────────────► activity_logs
```

A relação entre `profiles` e `organizations` ocorre exclusivamente através de:

```text
organization_members
```

Não existe relação de negócio direta:

```text
organizations → profiles
```

---

# Organizations

`organizations` representa uma empresa ou tenant dentro do sistema.

No MVP inicial existirá uma única Organization operacional:

```text
FASBtech
```

Uma Organization poderá possuir:

- vários Memberships;
- vários Clientes;
- várias Demandas através dos Clientes;
- várias movimentações financeiras;
- vários Contratos;
- vários documentos;
- vários Activity Logs.

---

# Profiles

`profiles` representa os utilizadores no domínio da aplicação.

Cada utilizador autenticado possui um Profile.

Profile contém informações da aplicação relacionadas ao utilizador.

Um Profile não pertence diretamente a uma Organization.

A relação ocorre através de:

```text
organization_members
```

---

# Organization Members

`organization_members` representa o vínculo entre:

```text
Profile

↕

Organization
```

Cada Membership pertence a:

- um Profile;
- uma Organization.

Membership deverá representar também, conforme modelo oficial:

- estado do vínculo;
- role.

Papéis iniciais:

```text
OWNER
ADMIN
MEMBER
```

---

# Activity Logs

`activity_logs` representa a auditoria central do sistema.

Cada Activity Log pertence a:

- uma Organization;
- um utilizador responsável pela ação quando aplicável;
- uma entidade lógica do sistema.

A identificação da entidade auditada utiliza o conceito:

```text
entity_type

+

entity_id
```

Exemplo:

```text
entity_type = CLIENT
entity_id   = <UUID>
```

Activity Logs não deverão possuir Foreign Keys estruturais específicas para:

```text
clients
demands
contracts
financial_entries
```

A relação com essas entidades é conceitualmente polimórfica.

Activity Logs são:

- centralizados;
- imutáveis;
- preservados para histórico.

---

# Sprint 02 — Clientes & Acessos

A Sprint 02 introduzirá as primeiras entidades de negócio.

Entidades principais:

```text
clients

client_assignments
```

---

# Clients

`clients` representa os Clientes da FASBtech.

Clientes são a entidade operacional central do MVP.

Cada Cliente pertence a exatamente uma:

```text
Organization
```

Relacionamento:

```text
organizations

1

↓

N

clients
```

---

# Client Assignments

`client_assignments` representa a autorização operacional entre um utilizador interno e um Cliente.

Relacionamento conceitual:

```text
organization_members

N

↕

N

clients
```

implementado através de:

```text
client_assignments
```

---

## Estrutura Conceitual

```text
organization_members
        │
        │
        ▼
client_assignments
        │
        ▼
     clients
```

---

## Regra

Um MEMBER somente poderá acessar Clientes aos quais estiver associado.

Exemplo:

```text
MEMBER João
    │
    ├── Cliente A ✅
    ├── Cliente B ✅
    └── Cliente C ❌
```

A relação deverá utilizar o Membership do utilizador, e não apenas o Profile isoladamente.

Isso garante que a autorização permaneça vinculada à Organization correta.

---

# Modelo após Sprint 02

```text
auth.users
    │
    ▼
profiles
    │
    ▼
organization_members
    │
    ├──────────────────────────────┐
    │                              │
    ▼                              ▼
organizations              client_assignments
    │                              │
    │                              ▼
    ├──────────────────────────► clients
    │
    └──────────────────────────► activity_logs
```

---

# Regras Estruturais de Clientes

Cada Cliente:

- pertence a uma Organization;
- pode possuir vários utilizadores autorizados;
- pode possuir várias Demandas;
- pode possuir vários Contratos;
- pode possuir várias movimentações financeiras;
- pode possuir vários documentos;
- pode possuir vários Activity Logs relacionados.

Um Cliente não depende de Lead.

---

# Sprint 03 — Demandas

A Sprint 03 introduzirá o domínio operacional de trabalho.

Entidades conceituais principais:

```text
demands

demand_assignees

demand_tags

demand_tag_assignments

notifications
```

As estruturas físicas definitivas serão definidas pela Migration correspondente.

---

# Demands

`demands` representa uma unidade de trabalho executada para um Cliente.

Cada Demanda pertence obrigatoriamente a:

```text
1 Cliente
```

Relacionamento:

```text
clients

1

↓

N

demands
```

Cada Demanda também pertence à Organization correspondente.

---

# Demand Assignees

Uma Demanda poderá possuir múltiplos responsáveis.

Um utilizador também poderá ser responsável por múltiplas Demandas.

Relacionamento conceitual:

```text
organization_members

N

↕

N

demands
```

através da associação:

```text
demand_assignees
```

---

# Demand Tags

Tags representam classificações complementares das Demandas.

Tags não representam:

- Status;
- Prioridade.

Uma Tag poderá ser utilizada em múltiplas Demandas.

Uma Demanda poderá possuir múltiplas Tags.

Relacionamento conceitual:

```text
demands

N

↕

N

demand_tags
```

através de:

```text
demand_tag_assignments
```

---

# Status de Demanda

O Status pertence à própria Demanda.

Domínio oficial inicial:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

Status não deverá ser modelado através das Tags.

---

# Prioridade de Demanda

A Prioridade pertence à própria Demanda.

Domínio inicial:

```text
LOW
MEDIUM
HIGH
URGENT
```

Prioridade é independente de:

- Status;
- Tags.

---

# Notifications

`notifications` representa notificações internas geradas pelo sistema.

Na Sprint 03 sua principal utilização será relacionada a:

```text
prazos de Demandas
```

Uma Notification deverá pertencer à Organization e possuir destinatário identificado conforme o modelo de autorização.

A estrutura física definitiva deverá ser definida pela Migration correspondente.

---

# Sprint 04 — Financeiro

A Sprint 04 introduzirá o domínio financeiro operacional.

Entidades principais:

```text
financial_entries

financial_goals
```

Outras estruturas auxiliares somente deverão ser criadas quando exigidas pelo domínio.

---

# Financial Entries

`financial_entries` representa entradas e saídas financeiras.

Uma movimentação deverá pertencer obrigatoriamente à:

```text
Organization
```

Ela poderá estar associada a um Cliente quando aplicável.

Relacionamento:

```text
organizations

1

↓

N

financial_entries
```

Relacionamento opcional:

```text
clients

1

↓

N

financial_entries
```

Uma saída financeira não precisa possuir Cliente.

---

# Tipo da Movimentação

A movimentação deverá distinguir:

```text
Entrada

ou

Saída
```

A definição física do campo será feita no schema correspondente.

---

# Tipo de Pagamento

O domínio inicial deverá suportar:

```text
ONE_TIME
RECURRING
```

A recorrência no MVP é informativa.

Não representa geração automática de cobranças.

---

# Financial Goals

`financial_goals` representa metas financeiras mensais.

Cada meta pertence à:

```text
Organization
```

e representa uma combinação de:

```text
Mês

Ano

Valor da Meta
```

O progresso da meta será calculado através das movimentações financeiras realizadas.

---

# Saldo em Caixa

O saldo em caixa não deverá ser mantido como entidade independente com valor manual.

Ele deverá ser derivado de:

```text
Entradas realizadas

-

Saídas realizadas
```

Isso evita divergência entre:

```text
movimentações

e

saldo armazenado
```

---

# Sprint 05 — Contratos

A Sprint 05 introduzirá o domínio contratual.

Entidades principais:

```text
contract_templates

contracts
```

---

# Contract Templates

`contract_templates` representa modelos reutilizáveis de contratos.

Os templates deverão ser utilizados como base para geração dos contratos específicos dos Clientes.

---

# Contracts

`contracts` representa contratos gerados para Clientes.

Todo Contrato deverá estar associado a:

```text
1 Cliente
```

Relacionamento:

```text
clients

1

↓

N

contracts
```

Todo Contrato também pertence à Organization correspondente.

---

# Snapshot Contratual

O Contrato deverá preservar os dados utilizados no momento da geração.

Conceitualmente:

```text
Cliente atual

↓

Dados usados na geração

↓

Snapshot do Contrato
```

Alterações futuras no Cliente não poderão modificar o snapshot de um Contrato já gerado.

A estrutura física utilizada para persistir esse snapshot será definida na Migration correspondente.

---

# Status de Contrato

Domínio inicial:

```text
DRAFT
GENERATED
SENT
SIGNED
CANCELED
```

---

# Documentos

O MVP deverá possuir uma infraestrutura centralizada de documentos.

Documentos poderão estar relacionados a:

- Clientes;
- Demandas;
- Contratos;
- movimentações financeiras.

---

# Storage e Metadados

Os arquivos físicos serão armazenados em:

```text
Supabase Storage
```

de forma privada.

O banco armazenará os metadados necessários para relacionar os documentos às entidades do sistema quando a funcionalidade for implementada.

O modelo físico de documentos deverá ser definido pela Migration da primeira Sprint que necessitar persistir esses metadados.

Não deverá existir uma solução independente de arquivos para cada módulo.

---

# Relação Conceitual de Documentos

```text
Organization
      │
      ▼
  Documentos
      │
      ├── Cliente
      ├── Demanda
      ├── Contrato
      └── Movimentação Financeira
```

Um documento deverá respeitar a autorização da entidade à qual estiver associado.

---

# Modelo Conceitual Completo do MVP

```text
auth.users
    │
    ▼
profiles
    │
    ▼
organization_members
    │
    ├────────────────────────────────────┐
    │                                    │
    ▼                                    ▼
organizations                    client_assignments
    │                                    │
    │                                    ▼
    ├────────────────────────────────► clients
    │                                    │
    │                                    ├──► demands
    │                                    │      │
    │                                    │      ├──► demand_assignees
    │                                    │      └──► demand_tags
    │                                    │
    │                                    ├──► contracts
    │                                    │
    │                                    ├──► financial_entries
    │                                    │
    │                                    └──► documents
    │
    ├──► financial_entries
    │
    ├──► financial_goals
    │
    ├──► contract_templates
    │
    ├──► notifications
    │
    ├──► documents
    │
    └──► activity_logs
```

Este diagrama representa relações conceituais.

As Foreign Keys concretas serão definidas pelas respectivas Migrations.

---

# Relações Principais

## Organization → Memberships

```text
1:N
```

---

## Profile → Memberships

```text
1:N
```

---

## Organization → Clients

```text
1:N
```

---

## Memberships ↔ Clients

```text
N:N
```

através de:

```text
client_assignments
```

---

## Client → Demands

```text
1:N
```

---

## Memberships ↔ Demands

```text
N:N
```

através de:

```text
demand_assignees
```

---

## Demands ↔ Tags

```text
N:N
```

através de:

```text
demand_tag_assignments
```

---

## Client → Contracts

```text
1:N
```

---

## Client → Financial Entries

```text
1:N opcional
```

Uma movimentação financeira poderá existir sem Cliente.

---

## Organization → Financial Goals

```text
1:N
```

---

## Organization → Activity Logs

```text
1:N
```

---

# Activity Logs e Entidades

Activity Logs não possuem uma cadeia estrutural como:

```text
Client

↓

Activity Log
```

ou:

```text
Demand

↓

Activity Log
```

A relação é lógica e polimórfica:

```text
activity_logs.entity_type

+

activity_logs.entity_id
```

Isso permite utilizar uma única infraestrutura de auditoria para todos os módulos.

---

# Dashboard

O Dashboard não representa uma entidade persistente do domínio.

Não deverá existir tabela criada apenas para armazenar:

```text
saldo do Dashboard
quantidade de Demandas
total de Clientes
total de Contratos
KPIs
```

Esses valores deverão ser derivados das fontes oficiais.

Exemplo:

```text
financial_entries
        ↓
Saldo em caixa
```

```text
demands
        ↓
Demandas em andamento
```

```text
contracts
        ↓
Contratos enviados
```

O Dashboard é uma camada de consulta e apresentação.

---

# Evolução por Sprint

## Sprint 01 — Foundation

```text
organizations
profiles
organization_members
activity_logs
```

---

## Sprint 02 — Clientes & Acessos

```text
clients
client_assignments
```

---

## Sprint 03 — Demandas

Conceitualmente:

```text
demands
demand_assignees
demand_tags
demand_tag_assignments
notifications
```

---

## Sprint 04 — Financeiro

Conceitualmente:

```text
financial_entries
financial_goals
```

---

## Sprint 05 — Contratos

Conceitualmente:

```text
contract_templates
contracts
```

---

## Sprint 06 — Dashboard

Nenhuma entidade de negócio nova é obrigatória.

O Dashboard deverá consumir os dados produzidos pelas Sprints anteriores.

---

# Entidades Removidas do MVP Atual

As seguintes entidades pertenciam ao modelo anterior e não fazem parte do MVP v3.0:

```text
leads
projects
products
domains
hosting_services
tasks
notes
```

Essas entidades não deverão ser criadas antecipadamente.

Poderão retornar futuramente somente após decisão formal de produto.

---

# Leads

O módulo de Leads não faz parte do MVP atual.

Clientes podem ser cadastrados diretamente.

Não existe no MVP a dependência:

```text
Lead

↓

Cliente
```

---

# Projetos

Projetos não fazem parte do MVP atual.

Demandas representam a unidade de trabalho operacional.

Caso futuramente exista necessidade de agrupar várias Demandas em um Projeto, essa entidade poderá ser introduzida em nova versão do produto.

---

# Product Registry

O Product Registry operacional não faz parte do MVP atual.

Documentação estratégica de produtos poderá continuar existindo independentemente do modelo operacional do CRM.

---

# Segurança do Modelo

Todo registro operacional deverá respeitar:

- Organization;
- Membership;
- role quando aplicável;
- autorização por Cliente quando aplicável;
- RLS;
- Policies.

A existência de uma Foreign Key não representa autorização.

Exemplo:

```text
client_id conhecido
```

não significa:

```text
Cliente autorizado
```

A autorização deverá ser validada pelas regras oficiais do sistema.

---

# Organization ID

Entidades operacionais deverão possuir vínculo com a Organization quando exigido pelo modelo.

O `organization_id` não deverá ser utilizado como informação confiável enviada pela interface.

Sua resolução e validação pertencem à arquitetura de segurança.

---

# Arquivamento

Entidades que exigirem preservação histórica deverão utilizar arquivamento lógico.

Exemplos:

- Clientes;
- Demandas.

Arquivamento não deverá eliminar:

- histórico;
- Activity Logs;
- documentos relacionados;
- registros que devam ser preservados por regra de negócio.

Nem toda entidade precisa obrigatoriamente possuir Soft Delete.

A decisão deverá seguir as regras do domínio correspondente.

---

# Identificadores

Entidades do domínio deverão utilizar:

```text
UUID
```

como identificador principal, salvo decisão arquitetural formal em contrário.

---

# Datas

Datas persistidas que representem instante temporal deverão utilizar:

```text
TIMESTAMPTZ
```

quando aplicável.

Datas puramente civis ou de calendário poderão utilizar tipos adequados definidos no schema específico.

---

# Migrations

Este documento não define a numeração física das Migrations.

A fonte oficial para ordem e numeração é:

```text
Migrations
```

Cada Migration deverá implementar apenas as entidades pertencentes à Sprint correspondente ou à infraestrutura compartilhada explicitamente aprovada.

---

# Referências

Este documento deverá permanecer consistente com:

- PRD v3.0;
- MVP Scope v3.0;
- Product Roadmap v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- System Architecture v3.0;
- Module Architecture v3.0;
- Organization User Model;
- RLS;
- Activity Logs;
- Migration 001;
- Migrations;
- Sprint 01;
- Sprint 02.

O antigo Leads Schema não é mais fonte ativa do modelo do MVP v3.0.

---

# Fonte da Verdade

O modelo conceitual oficial do MVP é:

```text
Organization
│
├── Memberships
│
├── Clients
│   │
│   ├── Client Assignments
│   ├── Demands
│   ├── Contracts
│   ├── Financial Entries
│   └── Documents
│
├── Financial Goals
├── Contract Templates
├── Notifications
├── Documents
└── Activity Logs
```

Clientes são a entidade operacional central.

Demandas são a unidade de trabalho.

Memberships representam vínculo e role dentro da Organization.

Client Assignments representam autorização operacional por Cliente.

Activity Logs utilizam referência polimórfica.

Dashboard não possui entidade própria.

---

# Definition of Done

O modelo de dados será considerado consistente quando:

- `auth.users` e `profiles` estiverem corretamente separados;
- Profiles se relacionarem com Organizations apenas através de Memberships;
- Organization possuir seus registros operacionais;
- Clientes pertencerem à Organization;
- autorização por Cliente utilizar associação própria;
- Demandas pertencerem a Clientes;
- responsáveis de Demandas permitirem múltiplos utilizadores;
- Status, Prioridade e Tags de Demandas permanecerem separados;
- movimentações financeiras puderem existir com ou sem Cliente quando permitido;
- saldo financeiro for derivado das movimentações;
- Contratos pertencerem a Clientes;
- Contratos preservarem snapshot dos dados gerados;
- documentos utilizarem infraestrutura centralizada;
- Activity Logs permanecerem centralizados e polimórficos;
- Dashboard não possuir duplicação persistida dos indicadores;
- Leads e Projetos não fizerem parte do MVP atual;
- Migrations implementarem apenas entidades pertencentes às Sprints correspondentes;
- o modelo permanecer alinhado ao PRD v3.0.