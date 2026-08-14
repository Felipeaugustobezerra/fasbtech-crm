# AGENTS.md — FASBtech CRM

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Objetivo

Construir e evoluir o MVP do CRM interno da FASBtech seguindo rigorosamente:

- documentação oficial;
- arquitetura aprovada;
- escopo da Sprint atual;
- segurança por padrão;
- implementação incremental.

Não implementar funcionalidades fora do escopo aprovado sem alteração prévia da documentação correspondente.

---

# Ordem de Leitura Obrigatória

Ao iniciar qualquer tarefa relevante:

1. Ler este `AGENTS.md`;
2. Ler `docs/00-index/Project Index.md`;
3. Identificar a Sprint atual;
4. Ler a documentação diretamente relacionada à funcionalidade;
5. Somente então iniciar a implementação.

Fluxo:

```text
AGENTS.md

↓

Project Index

↓

Sprint Atual

↓

Documentação relacionada

↓

Implementação
```

A documentação é a fonte oficial do projeto.

---

# Regra de Proporcionalidade

Nem toda alteração exige releitura completa da documentação.

Uma alteração pequena deverá consultar apenas os documentos diretamente relacionados.

Exemplo:

```text
Ajuste visual em Button

↓

Components
Design Tokens
Accessibility
```

Uma alteração estrutural de autorização deverá consultar, conforme aplicável:

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

# Produto Atual

O MVP v3.0 possui os módulos principais:

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

---

# Roadmap Oficial

A sequência funcional atual é:

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

Não antecipar módulos de Sprints futuras.

---

# Sprint Atual

A Sprint atual é:

```text
Sprint 01 — Foundation
```

A Foundation deverá ser concluída e validada antes do início da Sprint 02.

---

# Stack Oficial

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Zod
- React Hook Form

Bibliotecas adicionais deverão seguir os documentos técnicos e o Design System.

---

# Fonte da Verdade

Antes de implementar uma funcionalidade, consultar os documentos relevantes em:

```text
docs/01-product/
docs/02-requirements/
docs/03-architecture/
docs/04-database/
docs/05-decisions/
docs/06-development/
docs/07-design/
docs/08-sprints/
```

O ponto de entrada oficial é:

```text
docs/00-index/Project Index.md
```

---

# Fontes Principais por Domínio

| Área | Fonte principal |
|---|---|
| Produto | PRD |
| Escopo MVP | MVP Scope |
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
| UX/UI | CRM UI Guidelines |
| Dashboard | Dashboard Guidelines |
| Testes | Testing Strategy |
| Execução | Sprint Atual |

---

# Modelo de Utilizadores

Múltiplos utilizadores internos fazem parte do MVP.

Roles oficiais:

```text
OWNER

ADMIN

MEMBER
```

Modelo:

```text
auth.users

↓

profiles

↓

organization_members

↓

organizations
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

acesso operacional ao Cliente
```

Client Assignment não concede automaticamente acesso a:

```text
Financeiro

Contratos
```

---

# Regras Gerais

- Não implementar funcionalidades fora do MVP sem aprovação documental.
- Não antecipar funcionalidades de Sprints futuras.
- Não criar arquivos, módulos ou abstrações sem necessidade real.
- Não utilizar `any` sem justificativa explícita.
- Validar dados no cliente quando útil e obrigatoriamente no servidor.
- Não expor segredos.
- Não confiar na interface como mecanismo de segurança.
- Manter layout responsivo.
- Respeitar WCAG 2.2 AA conforme documentação oficial.
- Atualizar somente a documentação diretamente afetada por mudanças relevantes.
- Executar os testes e verificações aplicáveis antes de concluir uma tarefa.
- Executar `lint` e `typecheck` antes de considerar uma implementação concluída.
- Executar `build` quando a alteração puder afetar compilação ou produção.

---

# Segurança

Nunca confiar em valores enviados pelo navegador como fonte de autorização.

Incluindo:

```text
organization_id

user_id

role

permissions

created_by

updated_by

owner_id
```

Esses valores deverão ser obtidos ou validados pelo contexto autenticado e pelas relações persistidas.

---

# Persistência

## Leituras

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

## Escritas Simples

Quando permitido pela arquitetura:

```text
Server Action

↓

Service

↓

Mutation

↓

RLS + Policies

↓

PostgreSQL
```

---

## Escritas Transacionais

Utilizar RPC quando houver necessidade real de:

- atomicidade;
- múltiplas escritas relacionadas;
- Activity Log obrigatório na mesma transação;
- autorização privilegiada controlada.

Fluxo:

```text
Server Action

↓

Service

↓

RPC

↓

Validação interna

↓

Mutação + Activity Log

↓

Commit / Rollback
```

RPC não é obrigatória para toda escrita.

Seguir sempre:

```text
ADR-002

+

RLS
```

---

# RPCs SECURITY DEFINER

Quando utilizadas, deverão seguir integralmente o contrato oficial de segurança.

Incluindo, conforme aplicável:

- `auth.uid()`;
- Profile;
- Membership `ACTIVE`;
- Organization;
- Organization Status;
- role;
- ownership da entidade;
- Client Assignment;
- `SET search_path = ''`;
- referências de schema explícitas;
- `EXECUTE` restrito.

---

# Activity Logs

Existe uma única infraestrutura oficial:

```text
activity_logs
```

Não criar tabelas específicas como:

```text
client_activities
demand_activities
contract_activities
```

Activity Logs são imutáveis e não aceitam INSERT direto de utilizadores autenticados.

---

# Foundation

A Migration 001 implementa exclusivamente:

```text
profiles

organizations

organization_members

activity_logs
```

além da infraestrutura necessária da Foundation.

Pode incluir, conforme documentação:

- Bootstrap;
- funções auxiliares;
- triggers;
- RLS;
- Policies;
- Grants;
- Storage privado mínimo.

---

# Migration 001 não inclui

Não criar na Migration 001:

```text
leads

clients

client_assignments

demands

financial_entries

financial_goals

contract_templates

contracts
```

Clientes e Client Assignments pertencem à Sprint 02.

---

# Interface

A navegação principal oficial é:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

A interface poderá refletir permissões, mas nunca substituir autorização de backend.

Não apresentar funcionalidades futuras como se estivessem implementadas.

Não apresentar dados simulados como dados reais da operação.

---

# Componentes

Antes de criar um componente:

1. verificar se já existe;
2. verificar se pode ser composto com componentes existentes;
3. verificar se pertence à Sprint atual;
4. verificar se existe necessidade real de reutilização.

Não criar diretórios ou componentes vazios apenas para antecipar arquitetura futura.

---

# Fora do MVP

Não fazem parte do MVP atual:

- Leads;
- Projects como módulo independente;
- Product Registry operacional;
- Agenda;
- Domínios;
- Hospedagens;
- Tarefas independentes;
- Notas independentes;
- aplicativo iOS/nativo;
- inteligência artificial generativa;
- SaaS multiempresa em produção;
- múltiplas Organizations operacionais por utilizador;
- billing SaaS;
- marketplace;
- assinatura eletrônica integrada;
- cobrança automática;
- integração bancária automática;
- WhatsApp automático;
- Portal do Cliente;
- API pública.

---

# Importante sobre Múltiplos Utilizadores

```text
Múltiplos utilizadores internos
```

fazem parte do MVP.

O que está fora do MVP é:

```text
SaaS multiempresa

múltiplas Organizations operacionais

troca de tenant

gestão multiempresa em produção
```

Não confundir esses conceitos.

---

# Domínios Antigos

Não utilizar como fonte ativa do MVP atual:

```text
Leads

Projects

Product Registry operacional

Agenda
```

Documentos históricos relacionados a esses domínios não deverão orientar novas implementações.

---

# Git e Arquivos

Antes de concluir alterações:

- revisar `git diff`;
- revisar arquivos modificados;
- não incluir alterações não relacionadas;
- não remover arquivos sem necessidade;
- não renomear arquivos sem atualizar referências;
- manter documentação e implementação versionadas de forma reproduzível.

---

# Testes

Utilizar apenas scripts realmente existentes no projeto.

Antes de assumir que um comando existe:

```text
verificar package.json
```

Os testes deverão seguir:

```text
Testing Strategy
```

Testes de autorização, RLS, Bootstrap e banco deverão utilizar ambiente isolado quando essa infraestrutura estiver implementada.

---

# Conflitos na Documentação

Caso dois documentos oficiais apresentem regras incompatíveis:

```text
não escolher silenciosamente uma interpretação
```

Interromper a implementação relacionada e resolver o conflito documental.

---

# Alterações de Escopo

Um agente não deverá alterar sozinho:

- PRD;
- escopo do MVP;
- Roadmap;
- arquitetura oficial;
- modelo de autorização;
- modelo de persistência;
- regras de negócio.

Quando uma tarefa exigir mudança desse tipo, ela deverá ser explicitamente aprovada e documentada.

---

# Definition of Done

Uma tarefa será considerada concluída quando, conforme aplicável:

- respeitar o escopo da Sprint;
- seguir a documentação oficial;
- não antecipar funcionalidades futuras;
- possuir tipagem correta;
- possuir validação adequada;
- respeitar autorização;
- respeitar RLS;
- utilizar componentes oficiais;
- funcionar responsivamente;
- atender acessibilidade aplicável;
- possuir testes necessários;
- passar em `lint`;
- passar em `typecheck`;
- passar em `build` quando aplicável;
- não possuir alterações não relacionadas;
- manter documentação diretamente afetada sincronizada.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->