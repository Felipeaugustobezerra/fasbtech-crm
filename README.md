
# FASBtech CRM

Sistema interno de gestão operacional da FASBtech.

O projeto está sendo desenvolvido com foco em:

- arquitetura modular;
- documentação consistente;
- segurança por padrão;
- organização operacional;
- qualidade de código;
- escalabilidade;
- evolução futura sem antecipar funcionalidades desnecessárias.

---

# Status

| Item | Status |
|------|--------|
| Projeto | 🚧 Em Desenvolvimento |
| Versão | 3.0 |
| Sprint Atual | Sprint 01 — Foundation |
| Documentação | 🚧 Sincronização final v3.0 |
| Arquitetura | ✅ Consolidada para MVP v3.0 |
| Banco de Dados | 🚧 Migration 001 — Foundation |
| Implementação | 🚧 Foundation v3.0 |

---

# Objetivo

O FASBtech CRM tem como objetivo centralizar a operação interna da FASBtech.

O MVP v3.0 permitirá:

- gerenciar Clientes;
- controlar Acessos por Cliente;
- organizar Demandas;
- acompanhar responsáveis e prazos;
- registrar Entradas e Saídas;
- acompanhar metas financeiras;
- gerar e gerenciar Contratos;
- armazenar documentos privados;
- manter Activity Logs;
- consolidar indicadores operacionais no Dashboard.

---

# Módulos do MVP

A navegação principal será:

```text
Dashboard

Demandas

Financeiro

Contratos

Clientes

Acessos
```

---

# Entidade Central

A entidade operacional central do sistema é:

```text
Cliente
```

Clientes poderão relacionar-se progressivamente com:

```text
Demandas

Contratos

Financeiro

Documentos

Acessos

Atividades
```

---

# Stack Tecnológica

## Frontend

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS v4

---

## Backend

- Next.js Server Components
- Server Actions
- Services
- Supabase

---

## Banco de Dados

- PostgreSQL
- Supabase
- Row Level Security
- PostgreSQL Policies
- PostgreSQL RPC
- PostgreSQL Functions

---

## Autenticação

- Supabase Auth

---

## Formulários

- React Hook Form
- Zod

---

## Interface

- shadcn/ui
- Radix UI
- Lucide React

---

## Testes

- Vitest
- React Testing Library
- Playwright

---

## Qualidade

- ESLint
- TypeScript Strict

---

## Deploy

- Vercel
- Supabase

---

# Arquitetura

A aplicação segue a arquitetura oficial documentada em:

```text
System Architecture

Module Architecture

ADR-002
```

---

# Leitura

Fluxo principal:

```text
Page / Server Component

↓

Service quando necessário

↓

Query

↓

Supabase

↓

RLS + Policies

↓

PostgreSQL
```

---

# Escrita Simples

Quando a operação não exigir transação composta ou auditoria atômica:

```text
Client / Form

↓

Server Action

↓

Service

↓

Mutation

↓

Supabase

↓

RLS + Policies

↓

PostgreSQL
```

---

# Escrita Transacional

Quando a operação exigir:

- múltiplas alterações atômicas;
- Activity Log na mesma transação;
- autorização privilegiada controlada;
- commit/rollback conjunto;

utilizar:

```text
Client / Form

↓

Server Action

↓

Service

↓

PostgreSQL RPC

↓

Validação interna

↓

Mutation principal

+

Activity Log

↓

COMMIT / ROLLBACK
```

RPC não é obrigatória para toda escrita.

A decisão deverá seguir:

```text
ADR-002
```

---

# Segurança

O projeto utiliza:

- Supabase Auth;
- Profile;
- Membership;
- roles;
- Row Level Security;
- PostgreSQL Policies;
- isolamento por Organization;
- autorização por Cliente;
- Activity Logs;
- validação Zod;
- autorização no servidor;
- Storage privado.

Nenhuma informação crítica deverá ser confiada ao navegador.

---

# Modelo de Utilizador

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

# Autorização por Cliente

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

acesso ao Cliente
```

---

# Áreas Sensíveis

Possuir acesso ao Cliente não concede automaticamente acesso a:

```text
Financeiro

Contratos
```

Esses módulos deverão possuir autorização específica.

---

# Activity Logs

Existe uma única infraestrutura oficial de auditoria:

```text
activity_logs
```

Ela registra operações relevantes de todos os módulos.

Não deverão ser criadas tabelas específicas como:

```text
client_activities

demand_activities

contract_activities
```

---

# Documentos

Arquivos operacionais utilizarão Storage privado.

Princípio:

```text
sem autorização à entidade relacionada

↓

sem acesso ao documento
```

Arquivos não deverão ser públicos por padrão.

---

# Estrutura do Projeto

Estrutura conceitual:

```text
app/
components/
lib/
schemas/
services/
supabase/
tests/
types/

docs/
```

A estrutura física definitiva deverá seguir:

```text
Folder Structure

Module Architecture
```

---

# Documentação

Toda a documentação oficial encontra-se em:

```text
docs/
```

O ponto de entrada oficial é:

```text
docs/00-index/Project Index
```

---

# Ordem Recomendada de Leitura

1. `AGENTS.md`
2. `Project Index`
3. `PRD`
4. `MVP Scope`
5. `Functional Requirements`
6. `Business Rules`
7. `User Stories`
8. `System Architecture`
9. `Module Architecture`
10. `Data Model`
11. `Organization User Model`
12. `RLS`
13. `ADR-002`
14. `Sprint Atual`

Nem todo documento precisa ser relido integralmente para pequenas alterações.

Consultar sempre os documentos diretamente relacionados ao trabalho executado.

---

# Documentação Oficial

O projeto possui documentação para:

- Produto;
- Requisitos;
- Arquitetura;
- Banco de Dados;
- ADRs;
- Design System;
- Desenvolvimento;
- Testes;
- Sprints.

Toda alteração relevante deverá manter os documentos diretamente afetados sincronizados.

---

# Foundation

A Sprint 01 estabelece:

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

# Migration 001

A Migration 001 implementa exclusivamente a:

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

Também poderá conter:

- Bootstrap;
- funções auxiliares;
- triggers;
- RLS;
- Policies;
- Grants;
- configuração mínima de Storage privado.

---

# Migration 001 não implementa

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

# Sprint 01 — Foundation

## Já validado

A implementação inicial já possui partes concluídas, incluindo:

- estrutura inicial;
- autenticação;
- login;
- logout;
- sessão;
- layout autenticado inicial;
- Dashboard inicial;
- infraestrutura de testes.

Essas partes não deverão ser refeitas sem necessidade.

---

## Trabalho restante

A Foundation v3.0 deverá consolidar:

- Profile;
- Organization;
- Membership;
- roles;
- Bootstrap;
- Migration 001;
- RLS base;
- Policies;
- Activity Logs;
- Storage privado;
- AppShell final;
- menu v3.0;
- testes correspondentes.

---

# Sprint 02 — Clientes & Acessos

Após a Foundation:

```text
Clients

+

Client Assignments

+

Gestão de membros

+

Autorização por Cliente

+

Auditoria

+

Testes de isolamento
```

---

# Sprint 03 — Demandas

Responsável por:

- Demandas;
- responsáveis múltiplos;
- Status;
- Prioridade;
- Tags;
- documentos;
- prazos;
- notificações internas.

Status oficiais:

```text
OPEN

IN_PROGRESS

WAITING_CLIENT

REVIEW

COMPLETED

CANCELED
```

Prioridades:

```text
LOW

MEDIUM

HIGH

URGENT
```

---

# Sprint 04 — Financeiro

Responsável por:

- Entradas;
- Saídas;
- metas mensais;
- saldo em caixa;
- documentos financeiros;
- recorrência informativa.

Natureza de pagamento:

```text
ONE_TIME

RECURRING
```

O Status financeiro exato ainda não está congelado.

---

# Sprint 05 — Contratos

Responsável por:

- Templates;
- seleção de Cliente;
- preenchimento;
- revisão;
- snapshot;
- geração;
- PDF;
- envio;
- upload de contrato assinado.

Status oficiais:

```text
DRAFT

GENERATED

SENT

SIGNED

CANCELED
```

Assinatura integrada não faz parte do MVP.

---

# Sprint 06 — Dashboard

O Dashboard consolidado utilizará dados reais dos módulos anteriores.

Poderá apresentar, conforme autorização:

```text
Saldo em caixa

Entradas do mês

Saídas do mês

Progresso da meta mensal

Demandas abertas

Demandas em andamento

Demandas atrasadas

Demandas próximas do prazo

Prazos

Alertas

Atividades recentes
```

---

# Dashboard

Na Foundation:

```text
Dashboard inicial
```

sem métricas fictícias.

No Dashboard consolidado:

```text
dados reais

↓

Queries

↓

agregações

↓

resumo executivo
```

---

# Dashboard não possui

```text
Leads

Pipeline Comercial

Próximos Contatos

Reuniões sem fonte oficial
```

---

# Roadmap

A sequência oficial do MVP v3.0 é:

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

# Migrations Planejadas

A evolução persistente atualmente planejada é:

```text
001 — Foundation

002 — Clientes & Acessos

003 — Demandas

004 — Financeiro

005 — Contratos
```

O Dashboard não exige migration própria por padrão.

---

# Desenvolvimento

Instalar dependências:

```bash
npm install
```

Executar ambiente local:

```bash
npm run dev
```

---

# Qualidade

Executar:

```bash
npm run lint

npm run typecheck

npm run build
```

---

# Testes

Executar conforme scripts disponíveis no projeto:

```bash
npm run test

npm run test:coverage

npm run test:e2e
```

Consulte:

```text
docs/06-development/Setup.md
```

e:

```text
docs/06-development/Testing Strategy.md
```

para a configuração oficial.

---

# Observação sobre Testes

A documentação e os scripts reais do repositório deverão permanecer sincronizados.

Não assumir que um comando existe apenas porque está documentado.

A auditoria final deverá validar os scripts disponíveis antes da implementação continuar.

---

# Funcionalidades Fora do MVP

Não fazem parte do MVP atual:

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

# Evoluções Futuras

Também permanecem fora do MVP:

- SaaS multiempresa em produção;
- aplicação mobile nativa;
- API pública;
- billing SaaS;
- marketplace;
- assinatura eletrônica integrada;
- cobrança automática;
- contabilidade fiscal;
- IA generativa.

---

# Hierarquia Documental

Em caso de conflito:

```text
PRD

↓

MVP Scope

↓

Functional Requirements

↓

Business Rules

↓

Architecture

↓

Database

↓

ADR

↓

Development

↓

Design System

↓

Sprint
```

A fonte especializada de cada domínio também deverá ser respeitada.

---

# Fontes da Verdade

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

# Regras para Alterações

Toda alteração relevante deverá:

1. identificar o domínio afetado;
2. consultar a fonte da verdade correspondente;
3. modificar somente os arquivos necessários;
4. atualizar documentação diretamente afetada;
5. executar testes relevantes;
6. validar segurança;
7. evitar antecipar funcionalidades futuras.

---

# Não Fazer

Não:

- recriar Leads;
- recriar Projects como módulo independente;
- criar Product Registry sem alteração formal do produto;
- criar funcionalidades futuras antecipadamente;
- usar o frontend como única camada de segurança;
- confiar em `organization_id` do navegador;
- criar tabelas de auditoria por módulo;
- armazenar métricas duplicadas do Dashboard sem necessidade;
- criar RPC para toda escrita;
- utilizar Service Role no fluxo normal da aplicação.

---

# Próximos Passos

A sequência atual é:

1. concluir a sincronização documental v3.0;
2. executar auditoria final;
3. corrigir somente inconsistências reais;
4. concluir Sprint 01 — Foundation;
5. implementar Migration 001;
6. implementar Bootstrap;
7. consolidar RLS base;
8. consolidar Activity Logs;
9. validar testes da Foundation;
10. iniciar Sprint 02 — Clientes & Acessos.

---

# Licença

Projeto proprietário da FASBtech.

Uso interno.

Todos os direitos reservados.