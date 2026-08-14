# Leads Schema

## Projeto

FASBtech CRM

---

## Status

⚪ Arquivado — Não normativo para o MVP v3.0

---

## Versão

2.0 — Histórico

---

# Objetivo

Este documento preserva o schema histórico da antiga entidade:

```text
leads
```

utilizada em uma versão anterior do FASBtech CRM.

A entidade:

```text
Lead
```

não faz parte do MVP v3.0.

Portanto, este documento não deverá ser utilizado como fonte para:

- migrations;
- tabelas;
- tipos TypeScript;
- schemas Zod;
- Queries;
- Mutations;
- RPCs;
- Services;
- Policies;
- RLS;
- componentes;
- rotas;
- testes;
- Sprints atuais.

---

# Status Normativo

Este documento é exclusivamente:

```text
registro histórico
```

Ele não representa:

```text
schema ativo
```

nem:

```text
fonte da verdade do banco atual
```

---

# Modelo Atual

No MVP v3.0:

```text
Lead
```

não existe como entidade operacional.

Também não existe o fluxo:

```text
Lead

↓

Conversão

↓

Cliente
```

Clientes são cadastrados diretamente.

A entidade operacional central atual é:

```text
Cliente
```

---

# Migration 001

A antiga associação deste documento com:

```text
Migration 001
```

não é mais válida.

A Migration 001 v3.0 pertence exclusivamente à:

```text
Foundation
```

e possui como estruturas principais:

```text
profiles

organizations

organization_members

activity_logs
```

Não deverá conter:

```text
leads
```

---

# Sprint 02

A antiga associação deste schema à Sprint 02 também não é mais válida.

A Sprint 02 atual é:

```text
Sprint 02 — Clientes & Acessos
```

e será responsável por:

```text
clients

client_assignments
```

conforme seu contrato oficial.

---

# Regra para Agentes de IA

Agentes de IA não deverão utilizar este documento como base para implementação.

Não criar a partir deste arquivo:

```text
leads

LeadForm

LeadTable

LeadFilters

LeadStatusBadge

Pipeline

next_contact_at

Lead RPCs

Lead Policies

Lead RLS

Conversão de Lead
```

---

# Regra de Conflito

Se este documento divergir de qualquer fonte normativa v3.0:

```text
a documentação v3.0 prevalece
```

Não tentar reconciliar os dois modelos.

---

# Fontes Normativas Atuais

Para produto:

```text
PRD v3.0
MVP Scope v3.0
```

Para comportamento:

```text
Functional Requirements v3.0
Business Rules v3.0
User Stories v3.0
```

Para modelo de dados:

```text
Data Model v3.0
Migrations v3.0
Migration 001 v3.0
```

Para segurança:

```text
Organization User Model v3.0
RLS v3.0
Activity Logs v3.0
```

Para execução:

```text
Sprint atual
```

---

# Conteúdo Histórico

Todo o conteúdo abaixo representa exclusivamente o modelo anterior do FASBtech CRM.

Nomes de tabelas, campos, Status, constraints, índices, relacionamentos, Sprints e migrations descritos abaixo **não deverão ser implementados no MVP v3.0**.

---

# Tabela Histórica

Nome:

```text
leads
```

---

# Chave Primária

## ID

Campo:

```text
id
```

Tipo:

```text
UUID
```

Obrigatório:

```text
Sim
```

Gerado automaticamente.

No modelo histórico não era utilizado:

```text
SERIAL
```

---

# Organização

## Organization ID

Campo:

```text
organization_id
```

Tipo:

```text
UUID
```

Obrigatório:

```text
Sim
```

Foreign Key histórica:

```text
organizations.id
```

O `organization_id` não deveria ser utilizado como fonte de autorização quando recebido do navegador.

---

# Dados do Lead

## Nome

Campo:

```text
name
```

Tipo:

```text
VARCHAR(150)
```

Obrigatório:

```text
Sim
```

---

## Empresa

Campo:

```text
company
```

Tipo:

```text
VARCHAR(150)
```

Obrigatório:

```text
Não
```

---

## Email

Campo:

```text
email
```

Tipo:

```text
VARCHAR(255)
```

Obrigatório:

```text
Não
```

Validação histórica:

```text
e-mail válido
```

Quando informado, deveria ser armazenado em lowercase.

---

## Telefone

Campo:

```text
phone
```

Tipo:

```text
VARCHAR(30)
```

Obrigatório:

```text
Não
```

Formato esperado:

```text
Internacional
```

---

## WhatsApp

Campo:

```text
whatsapp
```

Tipo:

```text
VARCHAR(30)
```

Obrigatório:

```text
Não
```

Formato esperado:

```text
Internacional
```

---

# Comercial

## Serviço de Interesse

Campo:

```text
interested_service
```

Tipo:

```text
VARCHAR(150)
```

Obrigatório:

```text
Não
```

No modelo histórico era texto livre.

A referência futura ao Product Registry não pertence ao MVP v3.0.

---

## Valor Estimado

Campo:

```text
estimated_value
```

Tipo:

```text
NUMERIC(12,2)
```

Obrigatório:

```text
Não
```

Regra histórica:

```text
estimated_value >= 0
```

---

## Moeda

Campo:

```text
currency_code
```

Tipo:

```text
CHAR(3)
```

Obrigatório:

```text
Sim
```

Default histórico:

```text
EUR
```

Padrão:

```text
ISO 4217
```

Exemplos:

```text
EUR
USD
BRL
```

---

## Origem

Campo:

```text
source
```

Tipo:

```text
VARCHAR(50)
```

Obrigatório:

```text
Sim
```

Valores históricos:

```text
Website
Instagram
WhatsApp
Indicação
LinkedIn
Outro
```

Default histórico:

```text
Website
```

---

# Status Histórico do Lead

Campo:

```text
status
```

Tipo:

```text
VARCHAR(30)
```

Obrigatório:

```text
Sim
```

Default histórico:

```text
NEW
```

---

# Enumeração Histórica

No modelo anterior, os valores eram:

```text
NEW
CONTACTED
MEETING
PROPOSAL
NEGOTIATION
WON
LOST
```

Esses valores:

```text
não pertencem ao domínio atual do CRM
```

e não deverão ser reutilizados automaticamente.

---

# Significado Histórico dos Status

## NEW

Lead criado e ainda sem contato comercial registrado.

---

## CONTACTED

Primeiro contato realizado.

---

## MEETING

Lead avançado para reunião ou conversa comercial equivalente.

---

## PROPOSAL

Proposta comercial apresentada ou enviada.

---

## NEGOTIATION

Proposta em negociação.

---

## WON

Oportunidade comercial considerada ganha.

---

## LOST

Oportunidade comercial considerada perdida.

---

# Arquivamento Histórico

No modelo anterior:

```text
status
```

e:

```text
archived_at
```

representavam conceitos independentes.

`ARCHIVED` não era valor válido do campo `status`.

Exemplo histórico:

```text
status = LOST
archived_at = NULL
```

ou:

```text
status = LOST
archived_at = <timestamp>
```

Essas regras pertencem exclusivamente ao modelo antigo.

---

# Próximo Contato

Campo histórico:

```text
next_contact_at
```

Tipo:

```text
TIMESTAMPTZ
```

Obrigatório:

```text
Não
```

Persistência:

```text
UTC
```

O conceito de Próximo Contato não faz parte do MVP v3.0.

---

# Observações

Campo histórico:

```text
notes
```

Tipo:

```text
TEXT
```

Obrigatório:

```text
Não
```

---

# Auditoria Histórica

## Criado em

Campo:

```text
created_at
```

Tipo:

```text
TIMESTAMPTZ
```

Default:

```text
NOW()
```

---

## Atualizado em

Campo:

```text
updated_at
```

Tipo:

```text
TIMESTAMPTZ
```

---

## Arquivado em

Campo:

```text
archived_at
```

Tipo:

```text
TIMESTAMPTZ
```

Sem arquivamento:

```text
NULL
```

---

# Relacionamento Histórico

O modelo anterior utilizava:

```text
organizations

1

↓

N

leads
```

através de:

```text
leads.organization_id
    ↓
organizations.id
```

Esse relacionamento não pertence ao Data Model v3.0.

---

# Constraints Históricas

## Primary Key

```text
id
```

---

## Foreign Key

```text
organization_id
    ↓
organizations.id
```

---

## Estimated Value

```text
estimated_value >= 0
```

---

## Status

Aceitava:

```text
NEW
CONTACTED
MEETING
PROPOSAL
NEGOTIATION
WON
LOST
```

---

## Source

Utilizava os valores históricos definidos neste documento.

---

## Currency Code

```text
currency_code
```

possuía três caracteres.

---

# Índices Históricos

O modelo anterior previa índices como:

```text
organization_id
```

```text
organization_id + archived_at
```

```text
organization_id + status
```

```text
organization_id + created_at DESC
```

```text
organization_id + next_contact_at
```

```text
LOWER(name)
```

```text
LOWER(email)
```

```text
company
```

```text
source
```

Nenhum desses índices deverá ser criado a partir deste documento.

---

# Exclusão Histórica

No modelo anterior, Leads utilizavam arquivamento por:

```text
archived_at
```

em vez de DELETE no fluxo normal.

Essa regra não deverá ser generalizada para todas as entidades do MVP v3.0.

---

# Listagem Histórica

A listagem padrão antiga utilizava:

```sql
archived_at IS NULL
```

---

# Pesquisa Histórica

A antiga funcionalidade permitia pesquisa por:

- nome;
- empresa;
- email;
- telefone.

---

# Ordenação Histórica

Era prevista ordenação por:

- Nome;
- Empresa;
- Status;
- Valor;
- Data de criação;
- Próximo contato.

---

# Filtros Históricos

Eram previstos filtros por:

- Status;
- Origem;
- Serviço;
- Próximo contato;
- Data de criação.

Esses filtros não fazem parte do MVP v3.0.

---

# Segurança Histórica

O antigo modelo utilizava isolamento por:

```text
organization_id
```

A arquitetura atual de autorização deverá ser consultada exclusivamente em:

```text
Organization User Model v3.0

RLS v3.0

ADR-002 v3.0
```

---

# Conversão Histórica

O modelo antigo previa futuramente:

```text
Lead

↓

Cliente
```

Esse fluxo foi removido.

No MVP v3.0:

```text
Cliente
```

é criado diretamente.

---

# Histórico de Atividades

O modelo anterior previa eventos como:

```text
Lead criado

Status alterado

Lead editado

Próximo contato alterado

Observação alterada

Lead arquivado
```

Esses eventos não deverão ser adicionados ao domínio atual de `activity_logs`.

A infraestrutura v3.0 deverá utilizar somente entidades e ações oficialmente previstas em:

```text
Activity Logs v3.0
```

---

# Fonte Histórica de Status

No modelo anterior, a precedência era:

```text
Leads Schema

↓

Migration

↓

Zod / TypeScript

↓

Design System

↓

Components
```

Essa precedência foi desativada junto com o módulo de Leads.

Atualmente:

```text
Leads Schema
```

não possui autoridade normativa.

---

# Definition of Done Histórica

No modelo anterior, a tabela `leads` seria considerada concluída quando possuísse:

- UUID;
- `organization_id`;
- Foreign Key;
- índices;
- constraints;
- `TIMESTAMPTZ`;
- `NUMERIC(12,2)`;
- `currency_code`;
- `archived_at`;
- RLS;
- Policies;
- os Status históricos;
- testes de banco.

Essa Definition of Done está arquivada.

Ela não representa nenhuma obrigação de implementação atual.

---

# Não Criar Migration a Partir deste Arquivo

É expressamente proibido utilizar este documento para criar:

```text
CREATE TABLE leads
```

ou qualquer migration equivalente no MVP v3.0.

Também não adicionar `leads` a:

```text
Migration 001

Migration 002

ou qualquer migration atual
```

sem uma futura decisão formal de produto.

---

# Não Reutilizar Enum de Lead

Não reutilizar automaticamente:

```text
NEW
CONTACTED
MEETING
PROPOSAL
NEGOTIATION
WON
LOST
```

para:

- Clientes;
- Demandas;
- Contratos;
- Financeiro;
- outros domínios.

Cada módulo possui seu próprio contrato.

---

# Referências Atuais

Para o modelo conceitual atual:

```text
Data Model v3.0
```

Para evolução física:

```text
Migrations v3.0
```

Para Foundation:

```text
Migration 001 v3.0
```

Para Clientes:

```text
Sprint 02 — Clientes & Acessos
```

Para autorização:

```text
Organization User Model v3.0

RLS v3.0
```

Para auditoria:

```text
Activity Logs v3.0
```

---

# Fonte da Verdade Final

```text
Leads Schema
      │
      └── histórico
           │
           └── sem autoridade normativa

Data Model v3.0
      │
      └── modelo conceitual atual

Migrations v3.0
      │
      └── evolução física atual
```

Portanto:

```text
schema histórico
≠
schema implementável
```

e:

```text
Leads
≠
entidade do MVP v3.0
```