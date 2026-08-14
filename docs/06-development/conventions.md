# Conventions

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

Este documento define as convenções oficiais de desenvolvimento do FASBtech CRM.

Todas as implementações deverão seguir estas convenções para manter:

- consistência;
- legibilidade;
- qualidade;
- previsibilidade;
- segurança;
- facilidade de manutenção.

Este documento não substitui:

- Module Architecture;
- ADR-002;
- RLS;
- Activity Logs;
- Testing Strategy;
- Design System.

Quando uma convenção depender de um desses domínios, a fonte especializada deverá prevalecer.

---

# Princípios

Todo código deverá ser:

- legível;
- simples;
- tipado;
- testável;
- consistente;
- seguro;
- proporcional à necessidade real.

Preferir:

```text
solução simples

↓

abstração somente quando necessária
```

Evitar arquitetura especulativa.

---

# Escopo Atual

O MVP v3.0 possui:

```text
Dashboard

Demandas

Financeiro

Contratos

Clientes

Acessos
```

A entidade operacional central é:

```text
Cliente
```

Não utilizar como referência para novas implementações:

```text
Leads

Projects como módulo independente

Product Registry operacional

Agenda
```

---

# TypeScript

Utilizar:

```text
TypeScript Strict Mode
```

---

# Tipagem

Preferir:

- inferência quando clara;
- tipagem explícita em contratos;
- tipos reutilizados da fonte oficial;
- unions para domínios fechados;
- `unknown` em fronteiras não confiáveis quando apropriado.

---

# any

Evitar:

```ts
any
```

Só utilizar quando houver justificativa técnica real e documentável.

---

# unknown

`unknown` não é proibido.

Ele é apropriado para dados ainda não validados.

Exemplo:

```ts
function parseInput(value: unknown) {
  // validar antes de utilizar
}
```

O valor deverá ser refinado antes do uso.

---

# Type Assertions

Evitar assertions desnecessárias como:

```ts
as SomeType
```

quando o tipo puder ser:

- inferido;
- validado;
- refinado;
- modelado corretamente.

---

# Tipos de Domínio

Não duplicar tipos oficiais em múltiplas camadas sem necessidade.

Exemplo incorreto:

```text
DemandStatus definido no banco

+

DemandStatus redefinido manualmente na UI
```

Preferir uma fonte tipada consistente conforme a arquitetura adotada.

---

# React

Preferir:

- Functional Components;
- Server Components sempre que possível;
- Client Components somente quando houver necessidade de interatividade;
- composição em vez de duplicação.

---

# Client Components

Utilizar `"use client"` somente quando necessário para:

- estado;
- eventos;
- hooks do navegador;
- APIs exclusivamente client-side;
- componentes interativos.

Não transformar componentes em Client Components apenas por conveniência.

---

# Componentes

Componentes deverão:

- possuir responsabilidade clara;
- utilizar o Design System;
- utilizar Design Tokens quando aplicável;
- permanecer sem regras de negócio;
- receber dados já autorizados;
- ser reutilizados quando houver reutilização real.

---

# Exemplos

```text
ClientForm

ClientTable

ClientAccessList

MemberList

DemandStatusBadge

FinancialEntryForm

ContractForm

MetricCard
```

---

# Componentes Compartilhados

Não mover um componente para:

```text
shared/
```

apenas porque ele potencialmente poderá ser reutilizado no futuro.

Mover somente quando a reutilização for real.

---

# Arquivos

Utilizar nomes em inglês para código.

Preferir:

```text
kebab-case
```

Exemplos:

```text
client-form.tsx

client.service.ts

client.queries.ts

client.mutations.ts
```

---

# Não Utilizar

Evitar nomes como:

```text
ClientFormNew.tsx

FormularioCliente.tsx

ClientFinal2.tsx

NewComponentUpdated.tsx
```

Os nomes deverão representar responsabilidade, não histórico de implementação.

---

# Componentes React

Nome do componente:

```text
PascalCase
```

Exemplo:

```tsx
function ClientForm() {}
```

---

# Funções

Utilizar:

```text
camelCase
```

Exemplo:

```ts
getClientById()
```

---

# Constantes

Utilizar:

```text
UPPER_CASE
```

para constantes verdadeiras quando apropriado.

Exemplo:

```ts
const DEFAULT_PAGE_SIZE = 20;
```

Não transformar toda variável imutável em constante global.

---

# Tipos e Interfaces

Utilizar:

```text
PascalCase
```

Exemplos:

```ts
type ClientFormData = {}

interface ClientTableProps {}
```

---

# Estrutura de Pastas

Toda implementação deverá seguir:

```text
Module Architecture
```

e:

```text
Folder Structure
```

Não criar nova estrutura arquitetural sem necessidade real.

---

# Diretórios Futuros

Não criar diretórios vazios para:

```text
demands/

finance/

contracts/
```

antes da Sprint correspondente apenas para antecipar estrutura.

---

# Validação

Entradas não confiáveis deverão ser validadas no servidor.

Utilizar:

```text
Zod
```

quando aplicável.

---

# Formulários

Formulários interativos poderão utilizar:

```text
React Hook Form

+

Zod
```

conforme Implementation Guide.

Fluxo comum:

```text
Form

↓

Zod

↓

Server Action

↓

Service
```

---

# Validação no Cliente

Validação client-side existe para melhorar UX.

Ela não substitui:

```text
validação server-side
```

---

# Regra de Negócio

Regras de negócio deverão permanecer na camada responsável pelo domínio, normalmente:

```text
Service
```

Não implementar regra de negócio diretamente em:

- Component;
- Page;
- Query;
- Mutation.

---

# Server Actions

Server Actions poderão:

- receber intenção do utilizador;
- validar entrada;
- resolver contexto necessário;
- chamar Service;
- tratar retorno.

Não deverão concentrar regras complexas de domínio.

---

# Services

Services deverão:

- coordenar regras de negócio;
- decidir entre Query, Mutation ou RPC;
- coordenar dependências;
- retornar resultado previsível.

Não criar Service apenas como wrapper sem valor arquitetural.

---

# Persistência

Toda persistência deverá seguir:

```text
ADR-002 — Estratégia de Persistência e Transações
```

---

# Leituras

Fluxo padrão:

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
```

---

# Queries

Queries são responsáveis por leitura.

Deverão aplicar no banco, quando necessário:

- pesquisa;
- filtros;
- ordenação;
- paginação;
- autorização.

Nunca modificar dados.

---

# RPC em Leitura

Não utilizar RPC por padrão para leitura simples.

Uma função PostgreSQL para leitura somente deverá existir quando houver necessidade técnica real e documentada.

---

# Escritas Simples

Quando uma operação:

- possuir escrita simples;
- puder ser autorizada via RLS;
- não exigir múltiplas escritas atômicas;
- não exigir auditoria inseparável;
- não exigir privilégio controlado;

poderá utilizar:

```text
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

# Mutations

Mutations deverão:

- possuir responsabilidade limitada;
- executar escrita simples;
- depender de RLS/Policies;
- não coordenar operação transacional composta.

---

# Escritas Transacionais

Quando houver necessidade de:

- múltiplas escritas atômicas;
- Activity Log obrigatório na mesma operação;
- rollback conjunto;
- privilégio controlado;

utilizar:

```text
Server Action

↓

Service

↓

RPC PostgreSQL
```

conforme ADR-002.

---

# RPCs

RPC não é obrigatória para toda escrita.

Utilizar apenas quando houver necessidade arquitetural real.

---

# Exemplos

Possíveis operações que poderão exigir RPC:

```text
Bootstrap

Alteração de Role + Activity Log

Client Assignment + Activity Log

Atualização composta de responsáveis

Operação financeira composta

Geração de Contrato com snapshot
```

A necessidade concreta deverá vir da regra correspondente.

---

# SECURITY DEFINER

RPCs que utilizem:

```sql
SECURITY DEFINER
```

deverão seguir integralmente:

```text
ADR-002

+

RLS
```

---

# Hardening

Conforme o contrato oficial, utilizar quando aplicável:

```sql
SET search_path = ''
```

e referências explícitas de schema.

---

# EXECUTE

Funções privilegiadas não deverão permanecer executáveis por:

```text
PUBLIC

anon
```

sem necessidade explícita.

Aplicar `REVOKE` e `GRANT` conforme RLS.

---

# Banco de Dados

Componentes visuais nunca deverão acessar diretamente o banco.

---

# IDs Recebidos da Interface

A interface poderá enviar IDs necessários para identificar recursos.

Exemplos legítimos:

```text
client_id

demand_id

contract_id
```

Porém:

```text
ID recebido
≠
autorização
```

Todo recurso deverá ser novamente autorizado no servidor/banco.

---

# Dados de Autorização Não Confiáveis

Nunca confiar em valores enviados pela interface como fonte de identidade ou permissão.

Exemplos:

```text
organization_id

user_id

role

permissions

created_by

updated_by
```

Eles deverão ser resolvidos ou validados através do contexto autenticado.

---

# Organization

Quando `organization_id` fizer parte de uma operação:

```text
não confiar no valor recebido do navegador
```

A Organization deverá ser resolvida ou validada a partir de:

```text
auth.uid()

↓

Profile

↓

Membership
```

conforme o domínio.

---

# Segurança

Toda operação protegida deverá considerar, conforme aplicável:

- autenticação;
- Profile;
- Membership `ACTIVE`;
- Organization;
- Role;
- Client Assignment;
- RLS;
- Policies;
- autorização específica.

---

# UI não é Segurança

Código como:

```tsx
{canEdit && <Button>Editar</Button>}
```

serve apenas para UX.

A operação correspondente deverá continuar protegida no servidor e banco.

---

# Service Role

Não utilizar Service Role no fluxo normal da aplicação para contornar:

- RLS;
- Policies;
- Membership;
- autorização.

---

# Activity Logs

A auditoria oficial utiliza:

```text
activity_logs
```

---

# Nem Toda Escrita Gera Activity Log

A necessidade de auditoria deverá ser definida por:

- Business Rules;
- Functional Requirements;
- Activity Logs;
- Sprint correspondente.

---

# Auditoria Atômica

Quando Activity Log for obrigatório e inseparável da operação:

```text
Mutação

+

Activity Log
```

deverão ocorrer na mesma RPC.

---

# Não Fazer

Não executar:

```text
Mutation

↓

segunda chamada independente

↓

Activity Log
```

quando a regra exigir atomicidade.

---

# INSERT Direto

Utilizadores autenticados não deverão inserir diretamente em:

```text
activity_logs
```

---

# Error Handling

Todo erro deverá seguir:

```text
Error Handling
```

Nunca retornar diretamente ao utilizador:

- Stack Trace;
- erro SQL;
- segredo;
- informação sensível;
- detalhes internos de autorização.

---

# Testes

Toda funcionalidade deverá possuir testes proporcionais ao risco.

Seguir:

```text
Testing Strategy
```

---

# Unitários

Utilizar quando houver:

- regras puras;
- Schema;
- helper;
- formatter;
- mapper;
- validator;
- transformação determinística.

---

# Integração

Utilizar quando houver integração relevante entre:

- Service;
- Query;
- Mutation;
- RPC;
- banco;
- RLS;
- Policies;
- Activity Logs.

---

# E2E

Reservar principalmente para fluxos críticos do utilizador.

Não exigir novo E2E para toda pequena alteração.

---

# Testes de Segurança

Toda funcionalidade protegida deverá considerar:

```text
Happy Path

+

Denied Path
```

---

# Ambiente de Banco

Testes reais de:

```text
RLS

RPC

Bootstrap

Policies

Grants
```

deverão utilizar ambiente isolado conforme Testing Strategy.

---

# Imports

Preferir imports absolutos quando configurados.

Exemplo:

```ts
import { z } from "zod";

import { ClientForm } from "@/components/clients/client-form";
import { getClientById } from "@/services/clients/client.service";

import type { Client } from "@/types/client";
```

---

# Ordem de Imports

A ordem concreta deverá respeitar:

- ESLint;
- formatter;
- ferramentas automáticas configuradas.

Não manter regra manual que conflite com a configuração do projeto.

Quando nenhuma ferramenta definir ordem, preferir agrupamento consistente entre:

```text
externos

↓

internos

↓

types
```

---

# Comentários

O código deverá ser autoexplicativo sempre que possível.

Evitar comentários que apenas repitam o código.

---

# Quando Comentar

Comentários são úteis para:

- regra não evidente;
- workaround;
- decisão arquitetural;
- comportamento de segurança;
- contexto que não possa ser expresso claramente pelo código.

---

# TODO

Evitar:

```text
TODO genérico
```

sem contexto.

Quando necessário, explicar:

- o que falta;
- por que existe;
- qual condição permitirá removê-lo.

---

# Git

Utilizar Conventional Commits conforme o processo adotado pelo projeto.

Exemplos:

```text
feat: add client membership foundation

fix: enforce membership authorization

refactor: simplify app shell

docs: update persistence conventions

test: add bootstrap integration tests

chore: update dependencies
```

---

# Commits

Um commit deverá preferencialmente possuir:

```text
uma intenção coerente
```

Evitar misturar:

- feature;
- refactor não relacionado;
- alteração visual independente;
- documentação de outro domínio;

no mesmo commit sem necessidade.

---

# Pull Requests

Quando houver Pull Request, deverá:

- respeitar o escopo;
- passar nos checks obrigatórios;
- não conter alterações não relacionadas;
- atualizar documentação diretamente afetada;
- respeitar ADR-002;
- respeitar RLS;
- respeitar Module Architecture.

---

# Qualidade

Executar conforme aplicável:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

E2E:

```bash
npm run test:e2e
```

quando aplicável ao fluxo alterado ou exigido pelo CI.

---

# Scripts

Nunca assumir scripts inexistentes.

A fonte da verdade é:

```text
package.json
```

---

# Design System

Toda interface deverá seguir:

```text
Layout

Components

CRM UI Guidelines

Accessibility
```

---

# Design Tokens

Utilizar Design Tokens quando existir token correspondente.

Evitar:

- HEX arbitrário;
- spacing arbitrário quando houver token;
- radius improvisado;
- shadow improvisada.

---

# Responsividade

Toda funcionalidade essencial deverá funcionar em:

```text
Desktop

Tablet

Mobile
```

Nenhuma operação essencial poderá depender exclusivamente de hover.

---

# Acessibilidade

Meta oficial:

```text
WCAG 2.2 AA
```

Garantir, conforme aplicável:

- teclado;
- Focus visível;
- Labels;
- semântica;
- contraste;
- estados acessíveis.

---

# Sprint Atual

A Sprint atual é:

```text
Sprint 01 — Foundation
```

Implementar somente o necessário para:

- Auth;
- Profile;
- Organization;
- Membership;
- Roles;
- Bootstrap;
- RLS base;
- Policies;
- Activity Logs;
- Storage privado base;
- AppShell;
- menu v3.0;
- Dashboard inicial;
- testes correspondentes.

---

# Migration 001

Não incluir na Migration 001:

```text
Leads

Clients

Client Assignments

Demandas

Financeiro

Contratos
```

A Foundation possui somente as entidades definidas no documento oficial da Migration 001.

---

# Sprints Futuras

Não criar implementação antecipada para:

```text
Sprint 02 — Clientes & Acessos

Sprint 03 — Demandas

Sprint 04 — Financeiro

Sprint 05 — Contratos

Sprint 06 — Dashboard consolidado
```

---

# Funcionalidades Fora do MVP

Não implementar atualmente:

```text
Leads

Projects como módulo independente

Product Registry operacional

Agenda

Domínios

Hospedagens
```

---

# Checklist Antes de Implementar

- [ ] Está dentro da Sprint?
- [ ] Existe requisito?
- [ ] Existe regra de negócio?
- [ ] O contrato de dados está definido?
- [ ] A autorização está definida?
- [ ] A estratégia Query/Mutation/RPC está clara?
- [ ] Existe impacto de Activity Log?
- [ ] Existe impacto de RLS?
- [ ] O Design System aplicável foi consultado?
- [ ] Os testes esperados estão claros?

---

# Checklist Antes de Finalizar

- [ ] Código tipado?
- [ ] Sem `any` injustificado?
- [ ] Sem regra de negócio na UI?
- [ ] Sem acesso direto ao banco em componente visual?
- [ ] Autorização validada?
- [ ] RLS respeitada?
- [ ] Activity Log correto quando aplicável?
- [ ] Testes aplicáveis adicionados?
- [ ] Lint aprovado?
- [ ] Typecheck aprovado?
- [ ] Build aprovado quando aplicável?
- [ ] Responsividade validada?
- [ ] Acessibilidade validada?
- [ ] Documentação afetada atualizada?
- [ ] `git diff` contém apenas alterações relacionadas?

---

# Regras

Nunca:

- implementar módulos fora da Sprint;
- recriar Leads;
- recriar Projects como módulo independente;
- colocar regra de negócio na UI;
- confiar em autorização enviada pelo navegador;
- utilizar RPC para toda escrita;
- inserir Activity Logs diretamente;
- utilizar Service Role para contornar RLS;
- criar abstração antecipada;
- duplicar tipos e componentes sem necessidade.

Sempre:

- seguir Module Architecture;
- seguir ADR-002;
- seguir RLS;
- seguir Testing Strategy;
- manter tipagem;
- validar entradas;
- validar autorização;
- implementar apenas o necessário.

---

# Relação com Outros Documentos

Este documento deverá permanecer sincronizado com:

- AGENTS.md;
- PRD;
- MVP Scope;
- Functional Requirements;
- Business Rules;
- Module Architecture;
- ADR-002;
- RLS;
- Activity Logs;
- Testing Strategy;
- Implementation Guide;
- Layout;
- Components;
- Sprint atual.

---

# Definition of Done

Uma implementação estará em conformidade com estas convenções quando, conforme aplicável:

- estiver dentro do escopo;
- respeitar a Sprint atual;
- possuir código legível e tipado;
- respeitar Module Architecture;
- respeitar ADR-002;
- utilizar Query para leitura normal;
- utilizar Mutation para escrita simples quando suficiente;
- utilizar RPC somente quando necessária;
- respeitar RLS;
- validar autorização no backend;
- registrar Activity Log quando obrigatório;
- não possuir Data Leakage;
- implementar Error Handling adequado;
- possuir testes proporcionais ao risco;
- funcionar responsivamente;
- respeitar acessibilidade;
- passar em lint;
- passar em typecheck;
- passar nos testes aplicáveis;
- passar em build quando aplicável;
- manter somente alterações relacionadas;
- manter documentação diretamente afetada sincronizada.