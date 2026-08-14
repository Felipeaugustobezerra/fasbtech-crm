# 🏠 FASBtech CRM

> Página inicial da documentação oficial do projeto.

---

# 📊 Projeto

| Item | Valor |
|------|--------|
| **Status** | 🟢 Em Desenvolvimento |
| **Versão** | 3.0 |
| **Sprint Atual** | Sprint 01 — Foundation |
| **Arquitetura** | ✅ Consolidada para MVP v3.0 |
| **Documentação** | 🚧 Sincronização final v3.0 |
| **Banco de Dados** | 🚧 Migration 001 — Foundation |
| **Implementação** | 🚧 Foundation v3.0 |

---

# 🎯 Objetivo

O FASBtech CRM é o sistema interno da FASBtech para centralizar e organizar sua operação.

O MVP v3.0 foi estruturado para permitir:

- gerenciar Clientes;
- controlar quais utilizadores possuem acesso a cada Cliente;
- organizar Demandas;
- acompanhar prazos e responsáveis;
- registrar Entradas e Saídas;
- acompanhar metas financeiras;
- gerar e gerenciar Contratos;
- armazenar documentos privados;
- manter histórico de atividades;
- consolidar indicadores operacionais no Dashboard.

---

# 🧭 Módulos Principais

A navegação principal do MVP é:

```text
Dashboard

Demandas

Financeiro

Contratos

Clientes

Acessos
```

---

# 🧩 Entidade Central

A entidade operacional central é:

```text
Cliente
```

Cada Cliente poderá relacionar-se progressivamente com:

```text
Demandas

Contratos

Financeiro

Documentos

Acessos

Atividades
```

---

# 🚀 Início Rápido

Todo desenvolvedor ou agente de IA deverá iniciar pela seguinte sequência:

1. [[AGENTS]]
2. [[docs/00-index/Project Index]]
3. [[docs/01-product/PRD]]
4. [[docs/01-product/MVP-Scope]]
5. [[docs/02-requirements/Functional-Requirements]]
6. [[docs/02-requirements/Business-Rules]]
7. [[docs/03-architecture/Module-Architecture]]
8. [[docs/04-database/Data Model]]
9. [[docs/03-architecture/RLS]]
10. [[docs/05-decisions/ADR-002-Estratégia de Persistência e Transações]]
11. [[docs/08-sprints/Sprint-01]]

Para mudanças específicas, consultar também os documentos diretamente relacionados ao domínio afetado.

---

# 📚 Documentação

## Produto

- [[docs/01-product/PRD]]
- [[docs/01-product/Vision]]
- [[docs/01-product/MVP-Scope]]
- [[docs/01-product/Product Portfolio]]
- [[docs/01-product/Roadmap]]

---

## Requisitos

- [[docs/02-requirements/Functional-Requirements]]
- [[docs/02-requirements/Business-Rules]]
- [[docs/02-requirements/User-Stories]]

---

## Arquitetura

- [[docs/03-architecture/System-Architecture]]
- [[docs/03-architecture/Folder-Structure]]
- [[docs/03-architecture/Module-Architecture]]
- [[docs/03-architecture/Security]]
- [[docs/03-architecture/RLS]]
- [[docs/03-architecture/Error Handling]]

---

## Banco de Dados

- [[docs/04-database/Data Model]]
- [[docs/04-database/Organization-User-Model]]
- [[docs/04-database/Activity Logs]]
- [[docs/04-database/Migrations]]
- [[docs/04-database/Migration-001]]
- [[docs/04-database/Bootstrap]]

---

## ADRs

- [[docs/05-decisions/ADR-001-Stack]]
- [[docs/05-decisions/ADR-002-Estratégia de Persistência e Transações]]

---

## Desenvolvimento

- [[docs/06-development/Setup]]
- [[docs/06-development/Conventions]]
- [[docs/06-development/Testing Strategy]]
- [[docs/06-development/Changelog]]

---

## Design System

### Foundations

- [[docs/07-design/01-foundations/Branding]]
- [[docs/07-design/01-foundations/Color Palette]]
- [[docs/07-design/01-foundations/Typography]]
- [[docs/07-design/01-foundations/Spacing]]
- [[docs/07-design/01-foundations/Design Tokens]]

### Components

- [[docs/07-design/02-components/Components]]
- [[docs/07-design/02-components/Icons]]
- [[docs/07-design/02-components/Animations]]

### Guidelines

- [[docs/07-design/03-guidelines/Layout]]
- [[docs/07-design/03-guidelines/CRM UI Guidelines]]
- [[docs/07-design/03-guidelines/Dashboard Guidelines]]
- [[docs/07-design/03-guidelines/DataTable Guidelines]]
- [[docs/07-design/03-guidelines/Accessibility]]
- [[docs/07-design/03-guidelines/Implementation Guide]]

---

## Sprints

- [[docs/08-sprints/Sprint-01]]
- [[docs/08-sprints/Sprint-02]]

---

# 🗺 Roadmap do MVP

A sequência funcional oficial é:

```text
Sprint 01
Foundation

↓

Sprint 02
Clientes & Acessos

↓

Sprint 03
Demandas

↓

Sprint 04
Financeiro

↓

Sprint 05
Contratos

↓

Sprint 06
Dashboard
```

---

# 🏗 Arquitetura Resumida

```text
Next.js

↓

Server Components / Server Actions

↓

Services

↓

Queries / Mutations / RPCs

↓

Supabase

↓

PostgreSQL

↓

RLS + Policies
```

Client Components deverão ser utilizados apenas quando houver necessidade real de interatividade.

---

# 🔐 Modelo de Utilizador

```text
auth.users

↓

profiles

↓

organization_members

↓

organizations
```

Roles oficiais:

```text
OWNER

ADMIN

MEMBER
```

---

# 👥 Autorização por Cliente

A partir da Sprint 02:

```text
organization_members

↓

client_assignments

↓

clients
```

Para MEMBER:

```text
Membership ACTIVE

+

Client Assignment válido

=

acesso operacional ao Cliente
```

---

# 🛡 Segurança

Toda operação deverá respeitar:

- autenticação;
- Profile;
- Membership;
- Organization;
- role;
- Client Assignment quando aplicável;
- Row Level Security;
- Policies;
- autorização específica do módulo;
- Activity Logs quando exigidos.

A interface não representa a fronteira real de segurança.

---

# Dados Não Confiáveis

Nunca confiar em valores enviados pelo navegador como fonte de autorização.

Exemplos:

```text
organization_id

user_id

role

permissions

created_by

updated_by
```

Esses valores deverão ser resolvidos ou validados pelas camadas oficiais.

---

# 🔄 Persistência

Leituras:

```text
Server Component

↓

Query

↓

Supabase

↓

RLS

↓

PostgreSQL
```

---

## Escritas Simples

Quando permitidas:

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

## Escritas Transacionais

Quando houver necessidade de:

- múltiplas alterações;
- atomicidade;
- Activity Log obrigatório na mesma transação;
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

conforme ADR-002.

---

# 🧾 Activity Logs

Existe uma única infraestrutura oficial de auditoria:

```text
activity_logs
```

Ela deverá registrar operações relevantes dos módulos.

Não deverão existir tabelas paralelas como:

```text
client_activities
demand_activities
contract_activities
```

---

# 🗄 Banco de Dados

A evolução persistente atual é:

```text
001 — Foundation

002 — Clientes & Acessos

003 — Demandas

004 — Financeiro

005 — Contratos
```

Essa é a sequência planejada atual.

A numeração real deverá seguir as migrations efetivamente criadas e aplicadas.

---

# Migration 001

A Migration 001 representa apenas:

```text
Foundation
```

Estruturas principais:

```text
profiles

organizations

organization_members

activity_logs
```

Também inclui, quando necessário:

- Bootstrap;
- RLS base;
- Policies base;
- funções auxiliares;
- triggers;
- Grants;
- infraestrutura privada inicial de Storage.

---

# Migration 001 não inclui

```text
Leads

Clients

Client Assignments

Demandas

Financeiro

Contratos
```

Clientes e Client Assignments pertencem à Sprint 02.

---

# 📁 Documentos

Os arquivos utilizarão infraestrutura privada.

Princípio:

```text
sem autorização à entidade relacionada

↓

sem acesso ao documento
```

Arquivos não deverão ser públicos por padrão.

---

# 📊 Dashboard

O Dashboard possui dois estágios.

---

## Foundation

Na Sprint 01:

```text
Dashboard inicial
```

sem métricas fictícias.

---

## Consolidado

Na Sprint 06 poderá apresentar, conforme autorização:

```text
Saldo em caixa

Entradas do mês

Saídas do mês

Progresso da meta

Demandas abertas

Demandas em andamento

Demandas atrasadas

Demandas próximas do prazo

Prazos

Alertas

Atividades recentes
```

O Dashboard deverá derivar os dados dos módulos existentes.

---

# Dashboard não possui

```text
Leads

Pipeline Comercial

Próximos Contatos

Reuniões sem fonte oficial
```

---

# 📈 Situação Atual

## Produto

- ✅ PRD v3.0
- ✅ MVP Scope v3.0
- ✅ Functional Requirements v3.0
- ✅ Business Rules v3.0
- ✅ User Stories v3.0
- ✅ Roadmap v3.0

---

## Arquitetura

- ✅ System Architecture v3.0
- ✅ Module Architecture v3.0
- ✅ Data Model v3.0
- ✅ Organization User Model v3.0
- ✅ RLS v3.0
- ✅ Activity Logs v3.0
- ✅ Migration 001 v3.0
- ✅ Migrations v3.0

---

## Design diretamente afetado

- ✅ Layout v3.0
- ✅ Components v3.0
- ✅ Dashboard Guidelines v3.0
- ✅ CRM UI Guidelines v3.0

---

## Sprints

- 🚧 Sprint 01 — Foundation
- 🟡 Sprint 02 — Clientes & Acessos

---

# Sprint 01 — Trabalho já validado

A implementação inicial já possui partes concluídas, incluindo:

- estrutura inicial;
- autenticação;
- login;
- logout;
- sessão;
- infraestrutura de testes;
- layout autenticado inicial;
- Dashboard inicial.

Essas partes não deverão ser refeitas sem necessidade.

---

# Sprint 01 — Trabalho restante

A Foundation v3.0 ainda precisa consolidar:

- Profile;
- Organization;
- Membership;
- roles;
- Bootstrap;
- Migration 001;
- RLS base;
- Policies;
- Activity Logs;
- Storage privado base;
- AppShell final;
- menu v3.0;
- testes correspondentes.

---

# Sprint 02 — Próxima Etapa

Após concluir a Foundation:

```text
Clientes & Acessos
```

incluindo:

- Clients;
- Client Assignments;
- gestão de utilizadores;
- autorização por Cliente;
- RLS correspondente;
- auditoria;
- testes de isolamento.

---

# 🎯 Próximos Passos

A sequência atual é:

1. concluir a sincronização documental v3.0;
2. executar auditoria final da documentação;
3. corrigir apenas inconsistências reais encontradas;
4. finalizar Sprint 01 — Foundation;
5. implementar Migration 001;
6. implementar Bootstrap;
7. consolidar RLS base;
8. consolidar Activity Logs;
9. validar testes da Foundation;
10. iniciar Sprint 02 — Clientes & Acessos.

---

# Funcionalidades Removidas do MVP Atual

Não implementar atualmente:

```text
Leads

Projects

Product Registry operacional

Agenda

Domínios

Hospedagens

Tarefas independentes

Notas independentes
```

---

# Funcionalidades Futuras Fora do MVP

Também permanecem fora do MVP:

- multiempresa SaaS em produção;
- aplicativo nativo;
- API pública;
- billing SaaS;
- assinatura eletrônica integrada;
- cobrança automática;
- contabilidade fiscal;
- marketplace;
- IA generativa.

---

# 📖 Hierarquia Documental

Em caso de conflito:

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

A fonte especializada de cada domínio também deverá ser respeitada.

---

# 📌 Fontes da Verdade

| Área | Documento |
|------|-----------|
| Produto | PRD |
| Escopo | MVP Scope |
| Funcionalidades | Functional Requirements |
| Regras de Negócio | Business Rules |
| Jornadas | User Stories |
| Arquitetura Global | System Architecture |
| Arquitetura Modular | Module Architecture |
| Modelo de Dados | Data Model |
| Utilizadores e Organization | Organization User Model |
| Persistência | ADR-002 |
| Evolução do Banco | Migrations |
| Foundation do Banco | Migration 001 |
| Segurança | RLS |
| Auditoria | Activity Logs |
| Interface | Layout |
| Componentes | Components |
| Dashboard | Dashboard Guidelines |
| UX/UI | CRM UI Guidelines |
| Testes | Testing Strategy |
| Sprint | Sprint Atual |

---

# 💡 Área de Ideias

Utilize esta seção apenas para ideias temporárias ainda não aprovadas.

Uma ideia registrada aqui:

```text
não faz parte automaticamente do produto
```

Após validação, deverá ser movida para o documento oficial correspondente.

---

# Regras de Documentação

Sempre que houver mudança relevante:

1. atualizar a fonte oficial do domínio;
2. atualizar apenas documentos diretamente afetados;
3. atualizar Sprint quando necessário;
4. atualizar Changelog conforme processo oficial;
5. validar referências cruzadas.

Não modificar documentos não relacionados apenas para sincronizar número de versão.

---

# ✅ Definition of Done

A documentação será considerada sincronizada quando:

- os documentos principais representarem o MVP v3.0;
- nenhuma fonte ativa tratar Leads como módulo atual;
- nenhuma fonte ativa tratar Projects como módulo independente atual;
- todas as ADRs existentes estiverem referenciadas;
- a arquitetura refletir o produto aprovado;
- o modelo de banco estiver coerente;
- Migrations refletir a evolução correta;
- Migration 001 estiver limitada à Foundation;
- RLS estiver coerente com Membership e Client Assignment;
- Activity Logs estiverem centralizados;
- Design diretamente afetado estiver atualizado;
- Sprint 01 representar fielmente o estado da Foundation;
- Sprint 02 representar Clientes & Acessos;
- referências cruzadas estiverem atualizadas;
- o Project Index e esta Home apontarem para os documentos oficiais corretos.

---

# Fonte da Verdade Final

O FASBtech CRM v3.0 evolui através de:

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

Seu modelo central é:

```text
Organization
│
├── Members
│
├── Clients
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

A documentação deverá garantir que:

```text
Produto

Arquitetura

Banco

Segurança

Interface

Implementação
```

continuem representando o mesmo sistema.