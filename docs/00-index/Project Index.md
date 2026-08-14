# 📚 Project Index

## Projeto

FASBtech CRM

---

## Status

🟢 Ativo

---

## Versão

3.0

---

# Objetivo

Este documento é o ponto de entrada oficial da documentação do FASBtech CRM.

Todo desenvolvedor ou agente de IA deverá iniciar por este documento antes de realizar qualquer alteração relevante no projeto.

A documentação representa a principal fonte de conhecimento do sistema e deverá permanecer sincronizada com a implementação.

---

# Objetivo da Leitura

Antes de implementar qualquer funcionalidade, o responsável deverá compreender:

```text
Produto

↓

Requisitos

↓

Arquitetura

↓

Persistência

↓

Segurança

↓

Design

↓

Sprint

↓

Implementação
```

Nenhuma implementação deverá começar apenas a partir de uma tarefa isolada sem consultar o contexto correspondente.

---

# Fluxo Oficial de Leitura

A sequência recomendada é:

```text
AGENTS.md

↓

Project Index

↓

PRD

↓

MVP Scope

↓

Functional Requirements

↓

Business Rules

↓

User Stories

↓

Architecture

↓

Database

↓

ADRs

↓

Development

↓

Design System

↓

Sprint Atual

↓

Implementação
```

Nem todo documento precisa ser relido integralmente para cada pequena alteração.

Entretanto, os documentos diretamente relacionados à funcionalidade deverão ser consultados.

---

# 1. Produto

## Objetivo

Compreender:

- o problema;
- o produto;
- o escopo atual;
- os módulos oficiais;
- o Roadmap.

---

## Documentos

- [[docs/01-product/PRD]]
- [[docs/01-product/Vision]]
- [[docs/01-product/MVP-Scope]]
- [[docs/01-product/Product Portfolio]]
- [[docs/01-product/Roadmap]]

---

# Produto — Fonte Principal

A fonte funcional principal do produto é:

```text
PRD
```

O escopo do MVP é definido por:

```text
MVP Scope
```

A ordem de evolução funcional é definida por:

```text
Roadmap
```

---

# Produto — Modelo Atual

O MVP v3.0 possui os módulos principais:

```text
Dashboard

Demandas

Financeiro

Contratos

Clientes

Acessos
```

---

# Produto — Entidade Central

A entidade operacional central é:

```text
Cliente
```

Clientes podem relacionar-se progressivamente com:

```text
Demandas

Contratos

Financeiro

Documentos

Acessos

Atividades
```

---

# Produto — Fora do MVP Atual

Não fazem parte do MVP atual:

```text
Leads

Projetos como módulo independente

Product Registry operacional

Agenda

Domínios

Hospedagens

Tarefas independentes

Notas independentes
```

Esses conceitos não deverão orientar novas implementações enquanto não retornarem formalmente ao PRD.

---

# 2. Requisitos

## Objetivo

Entender exatamente o comportamento esperado do sistema.

---

## Documentos

- [[docs/02-requirements/Functional-Requirements]]
- [[docs/02-requirements/Business-Rules]]
- [[docs/02-requirements/User-Stories]]

---

# Functional Requirements

Define:

```text
o que o sistema deverá fazer
```

---

# Business Rules

Define:

```text
quais regras funcionais e operacionais deverão ser respeitadas
```

---

# User Stories

Define:

```text
como os objetivos funcionais aparecem na perspectiva do utilizador
```

---

# Documentos Removidos do Fluxo Atual

Não utilizar como referência funcional do MVP v3.0:

```text
Leads User Stories
```

Leads não fazem parte do produto atual.

---

# 3. Arquitetura

## Objetivo

Compreender a arquitetura oficial da aplicação e as responsabilidades de cada camada.

---

## Documentos

- [[docs/03-architecture/System-Architecture]]
- [[docs/03-architecture/Folder-Structure]]
- [[docs/03-architecture/Module-Architecture]]
- [[docs/03-architecture/Security]]
- [[docs/03-architecture/RLS]]
- [[docs/03-architecture/Error Handling]]

---

# System Architecture

Define a arquitetura global da aplicação.

---

# Module Architecture

Define como os módulos devem ser estruturados internamente.

Fluxo geral:

```text
Page / Server Component

↓

Service quando necessário

↓

Query / Mutation / RPC

↓

Supabase

↓

PostgreSQL
```

---

# RLS

Define a estratégia oficial de autorização no banco.

Modelo principal:

```text
auth.uid()

↓

Profile

↓

Membership ACTIVE

↓

Organization

↓

Role
```

Para MEMBER e recursos relacionados a Cliente:

```text
Membership

↓

Client Assignment

↓

Client
```

---

# Security

Define regras de segurança complementares à RLS e à arquitetura.

---

# Error Handling

Define como erros deverão ser tratados e apresentados ao utilizador.

---

# 4. Banco de Dados

## Objetivo

Compreender:

- modelo de dados;
- ownership;
- Membership;
- autorização;
- auditoria;
- evolução das migrations;
- Bootstrap.

---

## Documentos

- [[docs/04-database/Data Model]]
- [[docs/04-database/Organization-User-Model]]
- [[docs/04-database/Activity Logs]]
- [[docs/04-database/Migrations]]
- [[docs/04-database/Migration-001]]
- [[docs/04-database/Bootstrap]]

---

# Data Model

Define o modelo conceitual das entidades do sistema.

Não representa obrigatoriamente a estrutura física final de todas as tabelas.

---

# Organization User Model

Define:

```text
auth.users

↓

profiles

↓

organization_members

↓

organizations
```

e o modelo de:

```text
OWNER

ADMIN

MEMBER
```

---

# Client Authorization

A partir da Sprint 02, o acesso operacional por Cliente utiliza:

```text
organization_members

↓

client_assignments

↓

clients
```

Essa relação é documentada no Data Model, Organization User Model e RLS.

---

# Activity Logs

Define a infraestrutura centralizada de auditoria:

```text
activity_logs
```

Não deverão existir tabelas de Activity específicas por módulo.

---

# Migrations

É a fonte oficial para:

- ordem das migrations;
- numeração;
- evolução persistente do banco;
- dependências entre migrations.

---

# Migration 001

Define exclusivamente:

```text
Foundation
```

Incluindo:

```text
profiles
organizations
organization_members
activity_logs
Bootstrap
RLS base
Policies base
Grants
```

Migration 001 não representa o banco completo do sistema.

---

# Bootstrap

Define a inicialização segura de:

```text
Profile

↓

Organization FASBtech

↓

Membership OWNER ACTIVE
```

---

# Documentos Removidos do Modelo Atual

Não utilizar como fonte oficial do MVP v3.0:

```text
Leads Schema
```

Leads não fazem parte do modelo atual.

---

# 5. Decisões Arquiteturais — ADR

## Objetivo

Compreender decisões técnicas que não deverão ser alteradas sem revisão formal.

---

## Documentos

- [[docs/05-decisions/ADR-001-Stack]]
- [[docs/05-decisions/ADR-002-Estratégia de Persistência e Transações]]

---

# ADR-001

Define o Stack oficial do projeto.

---

# ADR-002

Define o contrato oficial de persistência.

---

## Leituras

```text
Server Component

↓

Query

↓

Supabase

↓

PostgreSQL
```

---

## Escritas Simples

Quando permitidas pela arquitetura:

```text
Server Action

↓

Service

↓

Mutation

↓

RLS

↓

PostgreSQL
```

---

## Operações Transacionais

Quando houver necessidade de:

- atomicidade;
- múltiplas alterações;
- Activity Log na mesma transação;
- autorização privilegiada controlada;

utilizar:

```text
Server Action

↓

Service

↓

RPC

↓

PostgreSQL
```

---

# RPC não é Obrigatória para Toda Escrita

A existência de uma operação de escrita não significa automaticamente que ela precisa de RPC.

A decisão deverá respeitar ADR-002 e Module Architecture.

---

# 6. Desenvolvimento

## Objetivo

Padronizar desenvolvimento, testes e evolução do código.

---

## Documentos

- [[docs/06-development/Setup]]
- [[docs/06-development/Conventions]]
- [[docs/06-development/Testing Strategy]]
- [[docs/06-development/Changelog]]

---

# Setup

Define preparação e execução do ambiente de desenvolvimento.

---

# Conventions

Define padrões de implementação e código.

---

# Testing Strategy

Define a estratégia oficial de testes.

---

# Changelog

Registra alterações relevantes do projeto conforme o processo adotado.

---

# 7. Design System

# Foundations

- [[docs/07-design/01-foundations/Branding]]
- [[docs/07-design/01-foundations/Color Palette]]
- [[docs/07-design/01-foundations/Typography]]
- [[docs/07-design/01-foundations/Spacing]]
- [[docs/07-design/01-foundations/Design Tokens]]

---

# Components

- [[docs/07-design/02-components/Components]]
- [[docs/07-design/02-components/Icons]]
- [[docs/07-design/02-components/Animations]]

---

# Guidelines

- [[docs/07-design/03-guidelines/Layout]]
- [[docs/07-design/03-guidelines/DataTable Guidelines]]
- [[docs/07-design/03-guidelines/CRM UI Guidelines]]
- [[docs/07-design/03-guidelines/Dashboard Guidelines]]
- [[docs/07-design/03-guidelines/Accessibility]]
- [[docs/07-design/03-guidelines/Implementation Guide]]

---

# Layout

Define:

```text
AppShell

Sidebar

Header

Page Header

Toolbar

Content
```

---

# Components

Define a biblioteca oficial de componentes reutilizáveis.

---

# CRM UI Guidelines

Define os padrões gerais de UX e UI do CRM.

---

# Dashboard Guidelines

Define o comportamento e hierarquia do Dashboard.

---

# Accessibility

Define os requisitos oficiais de acessibilidade.

---

# Design System não Define Regras de Negócio

Documentos de Design não poderão alterar:

- permissões;
- domínio;
- Status;
- ownership;
- regras financeiras;
- regras contratuais.

Essas decisões pertencem aos documentos funcionais e técnicos correspondentes.

---

# 8. Sprints

## Objetivo

Compreender:

- escopo atual;
- entregas previstas;
- Definition of Done;
- dependências.

---

## Documentos Existentes

- [[docs/08-sprints/Sprint-01]]
- [[docs/08-sprints/Sprint-02]]

---

# Sprint 01 — Foundation

Responsável por:

```text
Auth
Profile
Organization
Membership
Roles
RLS base
Activity Logs
Bootstrap
Storage privado base
AppShell
Menu principal
Dashboard inicial
```

---

# Sprint 02 — Clientes & Acessos

Responsável por:

```text
Clients

Client Assignments

Gestão de membros

Autorização por Cliente

RLS correspondente

Auditoria correspondente
```

---

# Sprints Planejadas

A sequência funcional aprovada é:

```text
Sprint 01 — Foundation

↓

Sprint 02 — Clientes & Acessos

↓

Sprint 03 — Demandas

↓

Sprint 04 — Financeiro

↓

Sprint 05 — Contratos

↓

Sprint 06 — Dashboard
```

Documentos específicos das Sprints futuras somente deverão ser criados quando o processo oficial exigir.

Não criar arquivos vazios apenas para representar o Roadmap.

---

# 9. Ordem Obrigatória para Implementação

Antes de implementar uma funcionalidade relevante:

1. Ler `AGENTS.md`;
2. Ler este `Project Index`;
3. Identificar a Sprint correspondente;
4. Consultar o PRD;
5. Consultar o MVP Scope quando houver dúvida de escopo;
6. Consultar Functional Requirements;
7. Consultar Business Rules;
8. Consultar User Stories relacionadas;
9. Consultar a arquitetura correspondente;
10. Consultar o modelo de dados quando houver persistência;
11. Consultar RLS quando houver acesso a dados;
12. Consultar ADRs relacionadas;
13. Consultar Design System quando houver interface;
14. Ler a Sprint correspondente;
15. Somente então implementar.

---

# Regra de Proporcionalidade

Pequenas alterações não exigem releitura completa de toda a documentação.

Exemplo:

```text
ajuste visual em Button existente
```

poderá exigir apenas:

```text
Components

Design Tokens

Accessibility
```

Já uma alteração de autorização de Cliente deverá exigir leitura de:

```text
PRD

Functional Requirements

Business Rules

Organization User Model

RLS

Activity Logs

Migration correspondente

Sprint
```

---

# Conflitos Documentais

Caso exista conflito real entre documentos:

```text
não escolher silenciosamente uma versão
```

O conflito deverá ser resolvido antes da implementação correspondente.

---

# Hierarquia dos Documentos

Em caso de conflito entre decisões do mesmo assunto, utilizar inicialmente:

```text
PRD
    │
    ▼
MVP Scope
    │
    ▼
Functional Requirements
    │
    ▼
Business Rules
    │
    ▼
Architecture
    │
    ▼
Database
    │
    ▼
ADR
    │
    ▼
Development
    │
    ▼
Design System
    │
    ▼
Sprint
```

Entretanto, a fonte específica de cada domínio também deverá ser respeitada.

---

# Fontes da Verdade por Domínio

| Área | Documento principal |
|---|---|
| Produto | PRD |
| Escopo MVP | MVP Scope |
| Funcionalidades | Functional Requirements |
| Regras de Negócio | Business Rules |
| Jornada funcional | User Stories |
| Arquitetura Global | System Architecture |
| Arquitetura Modular | Module Architecture |
| Modelo Conceitual | Data Model |
| Utilizadores e Organization | Organization User Model |
| Persistência | ADR-002 |
| Evolução das Migrations | Migrations |
| Foundation do Banco | Migration 001 |
| Segurança de Dados | RLS |
| Auditoria | Activity Logs |
| Layout | Layout |
| Componentes | Components |
| UX/UI | CRM UI Guidelines |
| Dashboard | Dashboard Guidelines |
| Testes | Testing Strategy |
| Execução da Sprint | Sprint Atual |

---

# Conflito entre Hierarquia e Documento Especializado

A hierarquia não deverá ser interpretada como autorização para um documento genérico sobrescrever um contrato especializado sem necessidade.

Exemplo:

```text
RLS
```

é a fonte específica para autorização no banco.

```text
Activity Logs
```

é a fonte específica para auditoria.

```text
Migrations
```

é a fonte específica para ordem das migrations.

Documentos deverão permanecer sincronizados.

---

# Processo de Atualização

Sempre que houver alteração significativa:

1. Atualizar a fonte principal do domínio.
2. Atualizar apenas os documentos diretamente afetados.
3. Atualizar a Sprint correspondente quando necessário.
4. Atualizar o Changelog conforme o processo oficial.
5. Validar referências cruzadas.
6. Validar se a implementação continua coerente.

---

# Não Atualizar Documentos sem Necessidade

Não modificar documentos apenas para aumentar números de versão ou repetir informação já correta.

Exemplo:

Uma alteração em:

```text
RLS de Client Assignment
```

não exige automaticamente alteração em:

```text
Branding
Typography
Spacing
```

---

# Regras para Agentes de IA

Antes de qualquer implementação relevante, um agente deverá:

- ler `AGENTS.md`;
- iniciar por este Project Index;
- identificar os documentos diretamente relacionados;
- respeitar a hierarquia documental;
- não inventar domínio inexistente;
- não antecipar módulos futuros;
- não recriar Leads ou Projects;
- respeitar ADRs;
- respeitar RLS;
- não tomar decisões arquiteturais permanentes sem documentação correspondente.

---

# Agentes e Escopo

O agente deverá implementar somente o escopo solicitado.

Não deverá:

- modificar arquivos não relacionados;
- criar entidades futuras;
- adicionar arquitetura especulativa;
- criar componentes vazios para módulos futuros;
- alterar Design System sem necessidade real.

---

# Estado Atual do Produto

O roadmap aprovado é:

```text
Foundation

↓

Clientes & Acessos

↓

Demandas

↓

Financeiro

↓

Contratos

↓

Dashboard consolidado
```

---

# Modelo Operacional

```text
Organization
│
├── Members
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
├── Notifications
└── Activity Logs
```

Essa representação é conceitual.

A estrutura física deverá seguir as migrations realmente implementadas.

---

# Referências

Este documento deverá permanecer sincronizado com:

- AGENTS.md;
- PRD v3.0;
- MVP Scope v3.0;
- Product Roadmap v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- User Stories v3.0;
- System Architecture v3.0;
- Module Architecture v3.0;
- Data Model v3.0;
- Organization User Model v3.0;
- ADR-001;
- ADR-002;
- RLS v3.0;
- Activity Logs v3.0;
- Migration 001 v3.0;
- Migrations v3.0;
- Layout v3.0;
- Components v3.0;
- Dashboard Guidelines v3.0;
- CRM UI Guidelines v3.0;
- Setup;
- Testing Strategy;
- Implementation Guide;
- Sprint 01 v3.0;
- Sprint 02 v3.0.

---

# Checklist do Project Index

Antes de considerar este documento atualizado verificar:

- [ ] Todos os documentos oficiais atuais estão referenciados?
- [ ] Documentos removidos do produto não aparecem como fonte ativa?
- [ ] Leads foram removidos?
- [ ] Projects deixaram de aparecer como módulo atual?
- [ ] Sprint 01 está correta?
- [ ] Sprint 02 está correta?
- [ ] Roadmap de Sprints está correto?
- [ ] Migrations está identificada como fonte de evolução persistente?
- [ ] Migration 001 está limitada à Foundation?
- [ ] RLS está identificada como fonte de segurança no banco?
- [ ] Activity Logs está identificada como fonte de auditoria?
- [ ] Links apontam para documentos existentes?
- [ ] A ordem de leitura continua coerente?

---

# Definition of Done

O Project Index será considerado atualizado quando:

- todos os documentos oficiais relevantes estiverem listados;
- documentos obsoletos não forem apresentados como fonte ativa;
- todas as ADRs existentes estiverem referenciadas;
- a ordem de leitura estiver sincronizada com o MVP v3.0;
- a hierarquia documental estiver coerente;
- as fontes da verdade de cada domínio estiverem explícitas;
- Sprint 01 e Sprint 02 estiverem atualizadas;
- o Roadmap de Sprints estiver correto;
- a estratégia de migrations estiver corretamente representada;
- Leads e Projects não forem tratados como módulos atuais;
- as referências cruzadas estiverem válidas;
- todos os links apontarem para documentos existentes.

---

# Fonte da Verdade Final

Todo trabalho no projeto deverá começar conceitualmente por:

```text
Project Index

↓

Produto

↓

Requisitos

↓

Arquitetura

↓

Banco / Segurança

↓

Design quando aplicável

↓

Sprint

↓

Implementação
```

O objetivo da documentação não é aumentar burocracia.

Seu objetivo é garantir que:

```text
Produto

Arquitetura

Banco

Interface

Implementação
```

permaneçam descrevendo o mesmo sistema.