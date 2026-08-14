# Implementation Guide

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

Este documento define como a arquitetura, o Design System e as convenções oficiais do FASBtech CRM deverão ser traduzidos para código.

Ele conecta:

```text
Produto

↓

Arquitetura

↓

Persistência

↓

Design System

↓

Implementação
```

Toda nova funcionalidade deverá seguir este guia em conjunto com as fontes oficiais do domínio correspondente.

---

# Filosofia

A implementação deverá priorizar:

- consistência;
- reutilização;
- escalabilidade;
- performance;
- segurança;
- acessibilidade;
- simplicidade;
- evolução incremental.

Nenhuma decisão arquitetural permanente deverá ser criada durante a implementação sem respaldo na documentação oficial.

Decisões locais de baixo impacto poderão ser tomadas quando não alterarem:

- domínio;
- arquitetura;
- segurança;
- persistência;
- Design System;
- escopo.

---

# Stack Oficial

## Frontend

- Next.js;
- React;
- TypeScript;
- Tailwind CSS v4.

---

## Componentes

- shadcn/ui;
- Radix UI;
- Lucide React.

---

## Formulários

- React Hook Form;
- Zod.

---

## Backend e Banco

- Next.js Server Components;
- Server Actions;
- Supabase;
- PostgreSQL.

---

# Estrutura do Projeto

Estrutura conceitual:

```text
app/
components/
lib/
services/
schemas/
types/
hooks/
utils/
supabase/
tests/
```

A estrutura física deverá seguir:

```text
Folder Structure

+

Module Architecture
```

Não criar diretórios vazios apenas para antecipar Sprints futuras.

---

# Arquitetura Geral

Todo fluxo deverá seguir uma das estratégias oficiais abaixo.

---

# Leitura

```text
Server Component

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

↓

Renderização
```

---

# Escrita Simples

```text
Client Component / Form

↓

React Hook Form

↓

Zod

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

# Escrita Transacional ou Privilegiada

```text
Client Component / Form

↓

React Hook Form

↓

Zod

↓

Server Action

↓

Service

↓

RPC PostgreSQL

↓

Autorização interna

↓

Mutações relacionadas

+

Activity Log quando obrigatório

↓

Resposta
```

A função PostgreSQL executa dentro da transação da chamada.

Se a função falhar:

```text
a operação é revertida
```

conforme o contrato definido em:

```text
ADR-002
```

---

# Como Escolher a Estratégia

## Query

Utilizar quando houver leitura.

Exemplos:

- listagem;
- pesquisa;
- paginação;
- filtros;
- detalhes;
- agregações simples;
- Dashboard.

---

# Mutation

Utilizar quando:

- existir escrita simples;
- a operação puder ser autorizada corretamente por RLS;
- não houver múltiplas escritas atômicas;
- não houver Activity Log obrigatório na mesma transação;
- não houver necessidade de privilégio controlado.

Exemplos possíveis:

- atualizar informação simples de Profile;
- alterar preferência local persistida;
- atualizar campo isolado quando a regra de negócio permitir.

---

# RPC

Utilizar quando houver necessidade real de:

- múltiplas escritas atômicas;
- auditoria obrigatória na mesma operação;
- rollback conjunto;
- autorização privilegiada controlada;
- unidade de negócio que não possa ficar parcialmente persistida.

Exemplos possíveis:

```text
Bootstrap

Alteração de Role + Activity Log

Client Assignment + Activity Log

Alteração composta de responsáveis de Demanda

Operação financeira composta

Geração de Contrato com snapshot e auditoria
```

RPC não é obrigatória para toda escrita.

---

# Componentes

Os componentes são divididos em três categorias.

---

## UI

Componentes genéricos e reutilizáveis.

Exemplos:

- Button;
- Input;
- Badge;
- Card;
- Dialog;
- Select;
- Table.

---

## Feature

Componentes específicos de domínio.

Exemplos atuais ou futuros:

- ClientForm;
- ClientTable;
- ClientAccessList;
- MemberList;
- DemandForm;
- DemandStatusBadge;
- FinancialEntryForm;
- ContractForm.

Criar apenas quando o domínio correspondente estiver na Sprint atual ou houver necessidade real.

---

## Layout

Componentes estruturais.

Exemplos:

- AppShell;
- Sidebar;
- Header;
- PageHeader;
- Container.

A estrutura deverá seguir:

```text
Layout
```

---

# Ordem de Implementação

Não existe uma sequência física obrigatória única para todos os casos.

A implementação deverá respeitar dependências.

Fluxo recomendado:

```text
Documentação

↓

Schema / contrato de dados quando necessário

↓

Types

↓

Queries / Mutations / RPCs

↓

Services

↓

Server Actions

↓

Componentes

↓

Pages

↓

Testes
```

Em funcionalidades fortemente visuais, componentes e páginas poderão evoluir em paralelo quando isso não violar dependências.

---

# Regra Principal

Nunca implementar uma camada que dependa de um contrato ainda indefinido.

Exemplo:

```text
Formulário de Cliente
```

não deverá congelar campos físicos antes de o schema oficial de Cliente estar definido.

---

# Design Tokens

Todo componente deverá utilizar Design Tokens quando existir token correspondente.

Evitar valores arbitrários.

Exemplo incorreto:

```css
padding: 24px;
```

quando já existir um token oficial equivalente.

Exemplo correto:

```text
spacing.xl
```

---

# CSS Variables

Cores e demais valores globais deverão utilizar as variáveis definidas pelo Design System.

Exemplos conceituais:

```css
--color-primary-600
--color-neutral-900
--spacing-lg
--radius-md
```

A nomenclatura concreta deverá seguir os arquivos oficiais de tokens.

---

# Tailwind

Utilizar classes alinhadas ao Design System.

Exemplo:

```tsx
bg-primary
text-muted
rounded-md
```

Evitar:

```tsx
bg-[#dc2626]
```

quando existir token equivalente.

---

# Valores Hardcoded

Nem todo número em código representa violação.

Hardcoded é inadequado quando substitui:

- Design Token;
- regra de negócio;
- configuração;
- constante de domínio.

Valores técnicos locais poderão existir quando não houver token ou abstração necessária.

---

# Estrutura dos Componentes

Componentes deverão manter responsabilidade clara.

Estrutura comum:

```text
imports

↓

types / props

↓

component

↓

hooks quando necessários

↓

render

↓

export
```

Não existe obrigação de criar seções artificiais quando o componente for simples.

---

# Props

Utilizar tipagem explícita.

Pode ser:

```ts
interface
```

ou:

```ts
type
```

conforme as convenções do projeto.

Não utilizar `any` sem justificativa.

---

# Tipagem

Utilizar TypeScript Strict.

Evitar:

- `any`;
- assertions desnecessárias;
- tipos duplicados;
- tipos de domínio definidos na UI sem fonte oficial.

---

# Estado

Preferir:

```text
Server Components
```

quando não houver necessidade de interatividade no cliente.

Utilizar Client Components apenas quando necessário.

---

# React Hooks

Utilizar hooks quando houver necessidade real.

Evitar:

- estado duplicado;
- efeitos usados para derivar estado que poderia ser calculado;
- chamadas de banco em hooks visuais;
- lógica de autorização no cliente.

---

# Server Actions

Server Actions deverão:

- receber a intenção do utilizador;
- validar entrada;
- validar contexto necessário;
- chamar Service;
- tratar o retorno.

Não deverão concentrar regras de negócio complexas.

---

# Services

Services deverão:

- aplicar ou coordenar regras de negócio;
- decidir entre Query, Mutation e RPC;
- coordenar dependências;
- devolver resultados previsíveis.

Não criar Service apenas para envolver uma função sem benefício real.

---

# Queries

Responsáveis por leitura.

Deverão:

- respeitar autorização;
- aplicar filtros no banco;
- aplicar paginação no banco;
- aplicar ordenação no banco;
- evitar Data Leakage.

Nunca modificar dados.

---

# Mutations

Responsáveis por escritas simples.

Deverão:

- depender de RLS/Policies;
- possuir responsabilidade limitada;
- não coordenar transações compostas;
- não criar Activity Log obrigatório em segunda chamada.

---

# RPCs

RPCs serão utilizadas conforme:

```text
ADR-002
```

Quando `SECURITY DEFINER` for necessário, deverão também seguir:

```text
RLS
```

---

# RPC SECURITY DEFINER

Conforme aplicável, deverá validar internamente:

- `auth.uid()`;
- Profile;
- Membership `ACTIVE`;
- Organization;
- estado da Organization;
- Role;
- ownership;
- Client Assignment;
- permissões específicas.

Também deverá aplicar o hardening oficial.

Incluindo:

```sql
SET search_path = ''
```

quando definido pelo contrato.

Utilizar referências explícitas de schema.

---

# Grants de RPC

Não deixar funções privilegiadas executáveis por:

```text
PUBLIC
```

ou:

```text
anon
```

sem justificativa explícita.

Aplicar:

```text
REVOKE

+

GRANT
```

conforme o RLS oficial.

---

# Activity Logs

A auditoria utiliza:

```text
activity_logs
```

de forma centralizada.

---

# Operações Auditadas

Nem toda escrita precisa obrigatoriamente de Activity Log.

A necessidade deverá vir de:

- Business Rules;
- Functional Requirements;
- Activity Logs;
- Sprint correspondente.

---

# Auditoria Atômica

Quando a auditoria for obrigatória e inseparável da mutação:

```text
Mutação

+

Activity Log
```

deverão ocorrer na mesma RPC.

Não utilizar:

```text
Mutation

↓

segunda chamada para Activity Log
```

quando isso permitir estado persistido sem auditoria.

---

# INSERT Direto em Activity Logs

Utilizadores autenticados não deverão inserir diretamente em:

```text
activity_logs
```

---

# Segurança

Toda implementação deverá:

- validar autenticação;
- validar autorização;
- respeitar Organization;
- respeitar Membership;
- respeitar Role;
- respeitar Client Assignment quando aplicável;
- respeitar RLS;
- seguir ADR-002.

---

# Dados Não Confiáveis

Nunca utilizar como fonte de autorização valores enviados pelo navegador como:

```text
organization_id

user_id

role

permissions

created_by

updated_by
```

O contexto deverá ser resolvido ou validado no servidor/banco.

---

# Service Role

Não utilizar Service Role no fluxo normal da aplicação para contornar:

- RLS;
- Policies;
- Membership;
- autorização.

Seu uso deverá ser restrito a infraestrutura ou operações explicitamente autorizadas.

---

# Schemas

Validação de entrada deverá utilizar:

```text
Zod
```

quando aplicável.

Não duplicar regras de domínio apenas na interface.

---

# Validação

A aplicação poderá validar:

```text
cliente
+
servidor
```

para UX e segurança.

A validação do cliente nunca substitui a validação server-side.

---

# Formulários

Formulários interativos deverão utilizar:

```text
React Hook Form

+

Zod
```

quando o fluxo se beneficiar deles.

Formulários simples server-first poderão adotar abordagem diferente somente se permanecerem consistentes com a arquitetura oficial.

---

# Responsividade

Seguir:

```text
Layout

+

CRM UI Guidelines
```

Toda funcionalidade essencial deverá funcionar em:

- Desktop;
- Tablet;
- Mobile.

---

# Estados de Interface

Componentes deverão possuir apenas os estados aplicáveis.

Podem incluir:

- Default;
- Hover;
- Focus;
- Disabled;
- Loading;
- Error;
- Success.

Nem todo componente precisa de todos esses estados.

---

# Loading

Preferir Skeleton quando representar estrutura de conteúdo.

Spinner poderá ser utilizado em:

- Button;
- ações locais;
- operações pequenas.

Evitar Spinner como único estado de carregamento de páginas completas.

---

# Feedback

Toda ação relevante deverá gerar feedback apropriado.

Pode utilizar:

- Toast;
- Alert;
- mensagem inline;
- redirecionamento com confirmação visual.

Não exigir Toast para toda ação sem necessidade.

---

# Acessibilidade

Seguir:

```text
Accessibility
```

Meta oficial:

```text
WCAG 2.2 AA
```

---

# Ícones

Seguir:

```text
Icons
```

Biblioteca oficial:

```text
Lucide React
```

---

# Animações

Seguir:

```text
Animations
```

Respeitar:

```text
prefers-reduced-motion
```

---

# Organização do Código

Nunca:

- colocar regra de negócio na interface;
- acessar banco diretamente de componentes visuais;
- duplicar lógica de autorização;
- criar abstração sem necessidade;
- criar código de Sprint futura antecipadamente.

---

# Convenções

## Arquivos

Preferir:

```text
kebab-case
```

quando definido pelas convenções do projeto.

---

## Componentes

```text
PascalCase
```

---

## Funções

```text
camelCase
```

---

## Constantes

```text
UPPER_CASE
```

quando representarem constantes verdadeiras.

---

## Tipos e Interfaces

```text
PascalCase
```

---

# Imports

A ordem concreta deverá seguir:

```text
Conventions
+
ESLint
```

Não manter uma ordenação manual que conflite com ferramentas automáticas.

---

# Implementação por Sprint

## Sprint 01 — Foundation

Implementar somente:

- Auth;
- Profile;
- Organization;
- Membership;
- roles;
- Bootstrap;
- RLS base;
- Activity Logs;
- Storage privado base;
- AppShell;
- menu v3.0;
- Dashboard inicial;
- testes correspondentes.

Não criar Clientes na Migration 001.

---

## Sprint 02 — Clientes & Acessos

Somente após a Foundation validada:

- Clients;
- Client Assignments;
- gestão de membros;
- autorização por Cliente;
- RLS correspondente;
- auditoria;
- testes de isolamento.

---

## Sprint 03 — Demandas

Somente após Sprint 02 concluída.

---

## Sprint 04 — Financeiro

Somente após Sprint 03 conforme Roadmap aprovado.

---

## Sprint 05 — Contratos

Somente após Sprint 04 conforme Roadmap aprovado.

---

## Sprint 06 — Dashboard

Consolidar indicadores reais derivados dos módulos anteriores.

---

# Funcionalidades Fora do MVP

Não implementar:

```text
Leads
Projects como módulo independente
Product Registry operacional
Agenda
Domínios
Hospedagens
```

nem outros recursos explicitamente fora do MVP.

---

# Checklist Antes de Iniciar uma Funcionalidade

- [ ] Sprint correta?
- [ ] Escopo aprovado?
- [ ] Functional Requirements existentes?
- [ ] Business Rules existentes?
- [ ] Schema necessário definido?
- [ ] Modelo de autorização definido?
- [ ] RLS necessária definida?
- [ ] Design necessário definido?
- [ ] Dependências existentes?
- [ ] Testes esperados compreendidos?

---

# Checklist Antes de Finalizar

- [ ] Implementação respeita o escopo?
- [ ] Não antecipou módulo futuro?
- [ ] Lint aprovado?
- [ ] Typecheck aprovado?
- [ ] Build aprovado quando aplicável?
- [ ] Testes aplicáveis aprovados?
- [ ] Responsividade validada?
- [ ] Acessibilidade validada?
- [ ] Segurança validada?
- [ ] RLS validada quando aplicável?
- [ ] Activity Log validado quando aplicável?
- [ ] Documentação diretamente afetada atualizada?
- [ ] Git diff contém somente alterações relacionadas?

---

# Code Review

Todo código deverá responder adequadamente:

- Está dentro da Sprint?
- Reutiliza componentes quando faz sentido?
- Utiliza Design Tokens?
- Segue Module Architecture?
- Segue ADR-002?
- Respeita RLS?
- Segue o Design System?
- Segue PRD e requisitos?
- Evita Data Leakage?
- Não antecipa funcionalidades futuras?
- Possui testes suficientes?

---

# Fluxo Git

Fluxo conceitual:

```text
Nova funcionalidade

↓

Branch quando aplicável

↓

Implementação

↓

Lint

↓

Typecheck

↓

Testes

↓

Build quando aplicável

↓

Review

↓

Commit

↓

Push

↓

Merge
```

O fluxo concreto deverá respeitar a estratégia Git adotada pela equipa.

---

# Prompt para Agentes de IA

Antes de qualquer implementação relevante, o agente deverá:

1. Ler `AGENTS.md`;
2. Ler `Project Index`;
3. Identificar a Sprint atual;
4. Ler PRD e MVP Scope quando houver impacto funcional;
5. Ler Functional Requirements;
6. Ler Business Rules;
7. Ler Module Architecture;
8. Ler ADR-002 quando houver persistência;
9. Ler RLS quando houver dados protegidos;
10. Ler Activity Logs quando houver auditoria;
11. Ler Design System quando houver UI;
12. Ler schemas/contratos existentes;
13. Implementar somente depois disso.

---

# Conflitos

Se houver conflito real entre documentos oficiais:

```text
interromper a implementação relacionada
```

Não escolher silenciosamente uma interpretação.

---

# Fonte da Verdade

Este guia não substitui documentos especializados.

Para:

```text
produto
→ PRD

escopo
→ MVP Scope

requisitos
→ Functional Requirements

regras
→ Business Rules

arquitetura
→ Module Architecture

persistência
→ ADR-002

segurança
→ RLS

auditoria
→ Activity Logs

interface
→ Layout / CRM UI Guidelines

componentes
→ Components

testes
→ Testing Strategy

execução
→ Sprint atual
```

---

# Definition of Done

Uma implementação somente será considerada concluída quando, conforme aplicável:

- respeitar PRD;
- respeitar MVP Scope;
- respeitar Functional Requirements;
- respeitar Business Rules;
- respeitar Module Architecture;
- respeitar ADR-002;
- respeitar RLS;
- respeitar Activity Logs;
- respeitar Design System;
- utilizar Design Tokens quando aplicável;
- utilizar Query para leitura normal;
- utilizar Mutation para escrita simples quando suficiente;
- utilizar RPC apenas quando houver necessidade real;
- registrar Activity Log quando obrigatório;
- reutilizar componentes quando houver reutilização real;
- possuir tipagem completa;
- não utilizar `any` sem justificativa;
- passar em lint;
- passar em typecheck;
- passar em build quando aplicável;
- passar nos testes aplicáveis;
- funcionar responsivamente;
- cumprir acessibilidade aplicável;
- não possuir Data Leakage;
- não antecipar funcionalidades futuras;
- possuir documentação diretamente afetada sincronizada;
- permanecer dentro da Sprint correspondente.