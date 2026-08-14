# Arquitetura do Sistema

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

Este documento define a arquitetura de alto nível do FASBtech CRM.

Seu objetivo é estabelecer:

- os principais componentes da plataforma;
- o fluxo entre frontend, backend e banco;
- as responsabilidades das camadas;
- os limites entre autenticação, autorização, persistência e armazenamento;
- a base arquitetural necessária para o MVP v3.0.

Este documento não define detalhes de implementação de cada módulo.

Esses detalhes pertencem aos documentos específicos de:

- Module Architecture;
- RLS;
- Data Model;
- Migrations;
- ADRs;
- Sprints.

---

# Princípios Arquiteturais

A arquitetura deverá seguir os seguintes princípios:

- Server-first;
- segurança no backend e no banco;
- frontend não confiável para autorização;
- separação de responsabilidades;
- modularidade;
- baixo acoplamento;
- isolamento por Organization;
- autorização por Cliente quando aplicável;
- persistência segura;
- reutilização de infraestrutura;
- evolução incremental por Sprint.

---

# Visão Geral

A arquitetura principal será:

```text
Utilizador
    │
    ▼
Aplicação Next.js
    │
    ├── Server Components
    ├── Client Components
    ├── Server Actions
    └── Services
            │
            ▼
       Supabase Platform
            │
            ├── Auth
            ├── PostgreSQL
            └── Storage
```

---

# Aplicação

A camada de aplicação utilizará:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS.

---

## Next.js

O Next.js será responsável por:

- roteamento;
- App Router;
- Server Components;
- Client Components quando necessários;
- Server Actions;
- layouts;
- renderização;
- integração server-side com Supabase;
- proteção das áreas privadas em conjunto com a camada de autenticação.

---

# Interface

A interface deverá utilizar:

- Design System oficial;
- Components oficiais;
- Design Tokens;
- Layout oficial;
- CRM UI Guidelines;
- Accessibility.

A interface não deverá implementar regras de negócio diretamente.

---

# Validação

A validação funcional utilizará:

```text
Zod
```

Toda entrada não confiável deverá ser validada antes de chegar às regras de negócio.

---

# Formulários

Formulários utilizarão:

```text
React Hook Form
+
Zod
```

React Hook Form será responsável pelo estado do formulário.

Zod será responsável pela validação dos dados.

A validação visual no cliente não substitui validação server-side.

---

# Autenticação

A autenticação será fornecida por:

```text
Supabase Auth
```

O fluxo principal será:

```text
Utilizador

↓

Login

↓

Supabase Auth

↓

Sessão

↓

Aplicação privada
```

A existência de uma sessão autenticada não representa, por si só, autorização para acessar qualquer recurso.

---

# Profile

Cada utilizador autenticado deverá possuir representação no domínio da aplicação através de:

```text
Profile
```

O Profile armazena dados da aplicação relacionados ao utilizador.

A autenticação continua pertencendo ao:

```text
Supabase Auth
```

---

# Organization

Os dados operacionais pertencem a uma:

```text
Organization
```

No MVP inicial existirá uma única Organization operacional:

```text
FASBtech
```

A arquitetura permanece preparada para evolução futura, mas SaaS multiempresa não faz parte do MVP atual.

---

# Membership

A relação entre utilizador e Organization ocorre através de:

```text
Membership
```

Fluxo conceitual:

```text
auth.users

↓

Profile

↓

Membership

↓

Organization
```

Membership será responsável por determinar:

- vínculo;
- estado;
- role.

---

# Roles

Os papéis iniciais são:

```text
OWNER
ADMIN
MEMBER
```

Roles não devem ser decididas pelo frontend.

---

# Autorização

Autenticação e autorização são responsabilidades diferentes.

```text
Autenticação
= Quem é o utilizador?

Autorização
= O que esse utilizador pode acessar?
```

A autorização deverá considerar, quando aplicável:

- utilizador autenticado;
- Profile;
- Membership;
- Organization;
- role;
- associação ao Cliente;
- estado da entidade;
- regras específicas do módulo.

---

# Autorização por Cliente

A partir da Sprint 02, determinados utilizadores deverão possuir acesso somente aos Clientes autorizados.

Modelo conceitual:

```text
Organization
    │
    ├── Cliente A
    ├── Cliente B
    └── Cliente C

MEMBER João
    │
    ├── Cliente A ✅
    ├── Cliente B ✅
    └── Cliente C ❌
```

Essa restrição não poderá existir apenas na interface.

Deverá ser aplicada também nas operações do backend e no banco.

---

# Banco de Dados

O banco oficial será:

```text
PostgreSQL
```

fornecido através do Supabase.

O PostgreSQL será responsável por:

- persistência;
- constraints;
- relacionamentos;
- índices;
- RLS;
- Policies;
- funções;
- RPCs;
- transações;
- integridade dos dados.

---

# Supabase

A plataforma Supabase será utilizada para:

```text
Supabase Auth
        +
PostgreSQL
        +
Storage
```

Cada serviço possui responsabilidade distinta.

---

# Persistência

A persistência seguirá três caminhos oficiais.

---

## Queries

Utilizadas exclusivamente para leitura.

Fluxo:

```text
Server Component / Service

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

## Mutations

Utilizadas para escritas simples quando:

- não houver necessidade de múltiplas alterações atômicas;
- não houver necessidade de Activity Log na mesma transação;
- a arquitetura permitir escrita direta protegida por RLS.

Fluxo:

```text
Server Action

↓

Service

↓

Mutation

↓

Supabase

↓

RLS

↓

PostgreSQL
```

---

## RPCs

Utilizadas quando a operação exigir:

- atomicidade;
- Activity Log na mesma transação;
- múltiplas alterações relacionadas;
- autorização privilegiada controlada;
- commit/rollback conjunto.

Fluxo:

```text
Server Action

↓

Service

↓

PostgreSQL RPC

↓

Validação interna

↓

Operações transacionais

↓

Commit / Rollback
```

O contrato completo pertence à:

```text
ADR-002
```

---

# Services

Services constituem a camada principal de regras de negócio.

Responsabilidades:

- aplicar regras de domínio;
- coordenar operações;
- validar permissões lógicas;
- chamar Queries;
- chamar Mutations;
- chamar RPCs;
- evitar lógica de negócio em componentes.

---

# Server Actions

Server Actions serão utilizadas como entrada server-side para operações disparadas pela interface.

Responsabilidades:

- validar sessão;
- validar input;
- chamar Service;
- converter erros internos em respostas seguras;
- realizar invalidação ou redirecionamento quando necessário.

Server Actions não deverão concentrar regras de negócio complexas.

---

# Row Level Security

A proteção do banco utilizará:

```text
Row Level Security
```

RLS será responsável por garantir isolamento e autorização para operações diretas.

As regras específicas pertencem ao documento:

```text
RLS
```

O frontend nunca será considerado fronteira de segurança.

---

# Activity Logs

O sistema possuirá infraestrutura central de auditoria:

```text
activity_logs
```

Activity Logs deverão registrar operações relevantes definidas pelas regras de negócio.

A arquitetura deve preservar:

- Organization;
- utilizador;
- entidade;
- ação;
- data;
- imutabilidade.

Quando uma operação exigir atomicidade, a alteração principal e o Activity Log deverão ocorrer dentro da mesma transação.

---

# Storage

Os documentos utilizarão:

```text
Supabase Storage
```

O Storage deverá ser privado por padrão.

Será uma infraestrutura central compartilhada por:

```text
Clientes
Demandas
Financeiro
Contratos
```

Não criar sistemas independentes de armazenamento para cada módulo.

---

# Autorização de Documentos

O acesso a um documento deverá respeitar a entidade à qual ele está associado.

Exemplo:

```text
Utilizador
    │
    ▼
Documento
    │
    ▼
Cliente
    │
    ▼
Autorização do utilizador
```

Conhecer a URL do arquivo não deverá ser suficiente para obter acesso.

---

# AppShell

As áreas autenticadas utilizarão um AppShell comum.

Estrutura conceitual:

```text
AppShell
│
├── Sidebar
├── Header
├── Page Header
└── Content
```

---

# Menu Principal

O menu oficial do MVP será:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

---

# Módulos do MVP

A arquitetura deverá suportar progressivamente:

```text
Foundation
    │
    ▼
Clientes & Acessos
    │
    ▼
Demandas
    │
    ▼
Financeiro
    │
    ▼
Contratos
    │
    ▼
Dashboard
```

---

# Clientes

Clientes são a entidade operacional central do MVP.

Outros módulos poderão se relacionar ao Cliente.

Modelo conceitual:

```text
Cliente
├── Demandas
├── Contratos
├── Financeiro
├── Documentos
└── Acessos
```

---

# Demandas

Demandas representarão unidades operacionais de trabalho.

Não existe necessidade de um módulo independente de Projetos no MVP atual.

---

# Financeiro

Financeiro será responsável por gestão financeira operacional.

Não representa sistema contábil ou fiscal completo.

---

# Contratos

Contratos utilizarão:

- templates;
- dados de Cliente;
- snapshot;
- geração;
- PDF;
- armazenamento;
- envio.

---

# Dashboard

O Dashboard consolidará informações produzidas pelos módulos.

Não deverá manter duplicação manual dos indicadores.

---

# Fluxo Geral de Leitura

```text
Utilizador

↓

Página

↓

Server Component

↓

Query

↓

Supabase

↓

RLS

↓

PostgreSQL

↓

Resultado autorizado

↓

Interface
```

---

# Fluxo Geral de Escrita Simples

```text
Utilizador

↓

Formulário

↓

Server Action

↓

Zod

↓

Service

↓

Mutation

↓

RLS

↓

PostgreSQL

↓

Feedback
```

---

# Fluxo Geral de Escrita Transacional

```text
Utilizador

↓

Formulário

↓

Server Action

↓

Zod

↓

Service

↓

RPC

↓

Autorização interna

↓

Mutação principal

+

Activity Log

↓

Commit / Rollback

↓

Feedback
```

---

# Segurança

A arquitetura deve aplicar segurança em múltiplas camadas:

```text
Interface

↓

Server Action

↓

Service

↓

RLS / RPC Authorization

↓

PostgreSQL
```

Nenhuma camada isoladamente substitui as demais.

---

# Dados Não Confiáveis

A aplicação nunca deverá confiar diretamente em valores enviados pelo cliente para determinar:

```text
organization_id
user_id
created_by
updated_by
role
permissões
```

Identificadores como:

```text
client_id
demand_id
contract_id
```

podem identificar o recurso solicitado.

Eles nunca representam, sozinhos, autorização para acessar o recurso.

---

# Error Handling

Erros técnicos deverão ser tratados internamente.

A interface deverá receber mensagens seguras e compreensíveis.

O contrato completo pertence ao documento:

```text
Error Handling
```

---

# Testes

A arquitetura deverá permitir testes de:

- autenticação;
- autorização;
- Services;
- Queries;
- Mutations;
- RPCs;
- RLS;
- Policies;
- Activity Logs;
- isolamento por Organization;
- autorização por Cliente;
- Storage privado;
- fluxos E2E críticos.

A estratégia detalhada pertence ao:

```text
Testing Strategy
```

---

# Hospedagem

A aplicação será hospedada inicialmente na:

```text
Vercel
```

Os serviços de backend serão fornecidos pelo:

```text
Supabase
```

---

# Fora do Escopo Arquitetural do MVP

Não deverão ser antecipadas arquiteturas específicas para:

- pipeline de Leads;
- Projetos;
- Product Registry operacional;
- Agenda;
- reuniões;
- assinatura eletrônica integrada;
- gateway de pagamentos;
- contabilidade completa;
- SaaS multiempresa em produção;
- Mobile nativo;
- API Pública;
- Marketplace;
- IA.

Esses domínios somente deverão influenciar a arquitetura após decisão formal de produto.

---

# Fonte da Verdade

Esta arquitetura implementa a direção definida em:

```text
PRD v3.0

↓

MVP Scope v3.0

↓

Product Roadmap v3.0

↓

Functional Requirements v3.0
```

A arquitetura de alto nível oficial é:

```text
Utilizador

↓

Next.js

↓

Server Components / Server Actions

↓

Services

↓

Queries / Mutations / RPCs

↓

Supabase

├── Auth
├── PostgreSQL
└── Storage

↓

RLS + autorização

↓

Dados
```

Clientes são a entidade operacional central do MVP.

A autorização por Cliente será uma característica fundamental a partir da Sprint 02.

---

# Definition of Done

A arquitetura será considerada corretamente aplicada quando:

- autenticação estiver separada de autorização;
- Organization e Membership fizerem parte da Foundation;
- roles forem resolvidas no backend;
- autorização por Cliente não depender da interface;
- Queries forem utilizadas para leitura;
- Mutations forem utilizadas somente quando apropriadas;
- RPCs forem utilizadas quando atomicidade for necessária;
- regras de negócio permanecerem nos Services;
- RLS proteger operações diretas;
- Activity Logs respeitarem o contrato de auditoria;
- Storage privado respeitar autorização;
- o frontend não controlar dados administrativos;
- os módulos respeitarem os limites definidos neste documento;
- a implementação permanecer alinhada ao PRD v3.0.