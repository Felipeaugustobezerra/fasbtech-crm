# ADR-001 — Stack Tecnológica

## Projeto

FASBtech CRM

---

## Status

🟢 Aprovado

---

## Versão

2.0

---

# Contexto

O FASBtech CRM será desenvolvido como uma aplicação web moderna, modular e escalável.

A stack tecnológica deve:

- suportar crescimento incremental;
- facilitar manutenção;
- reduzir complexidade operacional;
- possuir excelente experiência para desenvolvimento;
- permitir futura evolução para SaaS;
- manter consistência entre arquitetura, documentação e implementação.

---

# Decisão

O projeto adota oficialmente uma stack baseada em Next.js, Supabase e PostgreSQL.

A stack é dividida em duas categorias:

- Stack Atual (implementada);
- Stack Aprovada (planejada).

Essa distinção evita divergências entre documentação e código.

---

# Stack Atual (Implementada)

## Front-end

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4

---

## Backend

- Server Actions
- Supabase

---

## Banco de Dados

- PostgreSQL (Supabase)

---

## Autenticação

- Supabase Auth

---

## Persistência

- Queries
- Mutations
- PostgreSQL RPC (operações transacionais)

---

## Segurança

- Row Level Security (RLS)
- PostgreSQL Policies
- Organization Isolation
- Activity Logs
- PostgreSQL Functions
- Triggers

---

## Formulários

- React Hook Form
- Zod

---

## Testes

- Vitest
- React Testing Library
- Playwright

---

## Qualidade de Código

- ESLint

---

## Deploy

- Vercel
- Supabase

---

# Stack Aprovada (Roadmap)

As tecnologias abaixo fazem parte da arquitetura aprovada, porém poderão ser adicionadas apenas quando necessárias.

## Interface

- shadcn/ui
- Radix UI
- Lucide React

---

## UX

- Framer Motion (quando houver necessidade real de animações)

---

## Qualidade

- Prettier
- Husky
- lint-staged

Essas ferramentas poderão ser incorporadas durante as próximas Sprints sem necessidade de alterar a arquitetura.

---

# Arquitetura

A arquitetura oficial utiliza:

```text
Next.js

↓

Server Components

↓

Client Components

↓

Server Actions

↓

Services

↓

Queries / Mutations / RPCs

↓

Supabase

↓

PostgreSQL
```

---

# Persistência

O projeto utiliza três estratégias oficiais.

## Queries

Responsáveis exclusivamente por leitura.

Utilizam apenas operações SELECT.

---

## Mutations

Responsáveis por escritas simples em uma única tabela.

Não iniciam transações.

---

## PostgreSQL RPC

Responsável por operações transacionais.

Obrigatória quando:

- múltiplas tabelas forem alteradas;
- houver necessidade de Activity Logs;
- houver necessidade de rollback atômico.

Esta decisão está documentada na:

```
ADR-002
```

---

# Segurança

Toda operação deverá respeitar:

- autenticação;
- autorização;
- organização atual;
- Row Level Security;
- Policies;
- isolamento entre organizações.

Nenhuma informação de autorização poderá ser enviada pelo navegador.

---

# Motivos

A stack escolhida oferece:

- arquitetura moderna baseada em Server Components;
- excelente integração entre frontend e backend;
- banco PostgreSQL em cloud;
- autenticação integrada;
- tipagem completa;
- alta produtividade;
- baixo custo operacional;
- excelente escalabilidade;
- forte integração com RLS;
- suporte nativo a PostgreSQL RPC.

---

# Alternativas Consideradas

Foram avaliadas:

- Firebase
- Express separado
- Prisma ORM
- Railway
- PlanetScale
- Banco local
- WordPress

A combinação Next.js + Supabase apresentou o melhor equilíbrio entre simplicidade, produtividade e escalabilidade para o MVP.

---

# Consequências

## Positivas

- Arquitetura moderna.
- Código fortemente tipado.
- Banco PostgreSQL gerenciado.
- Autenticação integrada.
- Segurança baseada em RLS.
- Activity Logs transacionais.
- Deploy simplificado.
- Excelente DX.
- Evolução facilitada para SaaS.

---

## Negativas

- Dependência do ecossistema Supabase.
- Necessidade de configuração cuidadosa das Policies.
- Curva de aprendizagem de Server Components.
- Curva de aprendizagem de PostgreSQL RPC.
- Dependência de serviços cloud.

---

# Tecnologias Não Adotadas

Não fazem parte da arquitetura oficial neste momento:

- Firebase
- Express separado
- Prisma ORM
- Redux
- Zustand
- React Query
- Material UI
- Chakra UI
- Bootstrap
- Styled Components
- MongoDB

A adoção futura de qualquer uma dessas tecnologias exigirá uma nova ADR.

---

# Critérios para Inclusão de Novas Tecnologias

Uma nova tecnologia somente poderá ser incorporada quando:

- resolver um problema real;
- reduzir complexidade;
- possuir compatibilidade com a arquitetura oficial;
- não duplicar funcionalidades existentes;
- possuir justificativa técnica documentada;
- ser aprovada através de uma nova ADR.

---

# Revisão

Toda alteração na stack deverá:

1. criar uma nova ADR;
2. justificar tecnicamente a mudança;
3. avaliar impactos na arquitetura;
4. atualizar a documentação relacionada;
5. refletir o estado real da implementação.

---

# Referências

Este documento deve permanecer consistente com:

- PRD
- Module Architecture
- ADR-002 — Estratégia de Persistência e Transações
- RLS
- Migration 001
- Activity Logs
- Implementation Guide
- Setup
- Testing Strategy