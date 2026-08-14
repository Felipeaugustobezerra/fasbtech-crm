# Migration 001 — Foundation

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

A Migration 001 estabelece a fundação persistente do FASBtech CRM.

Sua responsabilidade é criar somente a infraestrutura necessária para a:

```text
Sprint 01 — Foundation
```

e preparar uma base segura para:

```text
Sprint 02 — Clientes & Acessos
```

Esta migration não implementa módulos de negócio.

---

# Responsabilidades

A Migration 001 deverá estabelecer:

- Profiles;
- Organizations;
- Memberships;
- roles;
- estados da Foundation;
- Activity Logs;
- Bootstrap;
- funções auxiliares necessárias;
- constraints;
- índices;
- triggers;
- Row Level Security;
- Policies;
- RPCs estritamente necessárias à Foundation;
- Grants;
- infraestrutura inicial de segurança.

Quando a configuração do Supabase Storage for versionada através das migrations do projeto, a infraestrutura privada mínima de Storage também poderá fazer parte da Foundation.

---

# Filosofia

Cada migration deverá possuir responsabilidade clara.

A responsabilidade da Migration 001 é:

```text
FOUNDATION
```

Ela não deverá antecipar entidades pertencentes às próximas Sprints.

Portanto:

```text
Migration 001
≠
Migration de Clientes

Migration 001
≠
Migration de Demandas

Migration 001
≠
Migration Financeira

Migration 001
≠
Migration de Contratos
```

---

# Fonte da Verdade

Esta migration deverá permanecer consistente com:

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

↓

System Architecture v3.0

↓

Module Architecture v3.0

↓

Data Model v3.0

↓

Organization and User Model v3.0

↓

RLS v3.0

↓

Activity Logs v3.0
```

As decisões transacionais deverão respeitar:

```text
ADR-002 — Estratégia de Persistência e Transações
```

---

# Escopo

A Migration 001 deverá criar apenas as estruturas necessárias à Foundation.

Tabelas principais:

```text
profiles

organizations

organization_members

activity_logs
```

Além das tabelas, poderá criar:

- constraints;
- índices;
- funções auxiliares;
- triggers;
- Bootstrap;
- RPCs necessárias à Foundation;
- RLS;
- Policies;
- Grants;
- configuração mínima de Storage privado quando gerida via SQL.

---

# Fora da Migration 001

Não criar:

```text
leads

clients

client_assignments

demands

demand_assignees

demand_tags

demand_tag_assignments

notifications

financial_entries

financial_goals

contract_templates

contracts

documents
```

Também não criar entidades antigas removidas do MVP:

```text
projects

products

domains

hosting_services

tasks

notes
```

---

# Leads

A tabela:

```text
leads
```

não faz parte do MVP v3.0.

Portanto:

- não deverá existir na Migration 001;
- nenhuma RPC de Lead deverá existir;
- nenhuma Policy de Lead deverá existir;
- nenhum índice de Lead deverá existir;
- nenhum Trigger de Lead deverá existir.

Clientes serão cadastrados diretamente a partir da Sprint 02.

---

# Ordem de Execução

A Migration deverá respeitar dependências técnicas.

Ordem conceitual recomendada:

```text
1. Extensions necessárias

↓

2. Tabelas

↓

3. Constraints

↓

4. Índices

↓

5. Funções auxiliares

↓

6. Triggers

↓

7. Bootstrap e RPCs da Foundation

↓

8. Row Level Security

↓

9. Policies

↓

10. Grants

↓

11. Storage Foundation quando aplicável

↓

12. Validações finais
```

A ordem física poderá ser ajustada somente quando uma dependência real do PostgreSQL exigir.

---

# Extensions

Criar apenas extensões realmente necessárias à Foundation.

Não instalar extensões especulativas.

Quando a geração de UUID depender de funcionalidade já disponibilizada pelo ambiente Supabase/PostgreSQL, não duplicar infraestrutura desnecessariamente.

---

# Tabela Organizations

Criar:

```text
organizations
```

---

## Campos

Conceitualmente:

| Campo | Tipo | Obrigatório |
|---|---|---:|
| id | UUID | Sim |
| name | VARCHAR(150) | Sim |
| slug | VARCHAR(100) | Sim |
| status | VARCHAR(30) | Sim |
| created_at | TIMESTAMPTZ | Sim |
| updated_at | TIMESTAMPTZ | Sim |
| archived_at | TIMESTAMPTZ | Não |

---

## Regras

- `id` será Primary Key;
- `slug` deverá ser único;
- `name` não poderá ser vazio;
- `status` deverá utilizar domínio permitido;
- `created_at` deverá possuir default;
- `updated_at` deverá possuir default;
- `archived_at` representa arquivamento lógico.

---

# Organization Status

Valores oficiais:

```text
ACTIVE
INACTIVE
ARCHIVED
```

---

# Organization Inicial

A Organization inicial será:

```text
Name: FASBtech
Slug: fasbtech
Status: ACTIVE
```

Ela não deverá ser inserida estaticamente pela migration.

Sua criação ocorrerá através do Bootstrap oficial.

---

# Tabela Profiles

Criar:

```text
profiles
```

---

## Campos

Conceitualmente:

| Campo | Tipo | Obrigatório |
|---|---|---:|
| id | UUID | Sim |
| full_name | VARCHAR(150) | Sim |
| avatar_url | TEXT | Não |
| status | VARCHAR(30) | Sim |
| created_at | TIMESTAMPTZ | Sim |
| updated_at | TIMESTAMPTZ | Sim |

---

## Regras

- `id` será Primary Key;
- `id` deverá corresponder a `auth.users.id`;
- `full_name` não poderá ser vazio;
- `status` deverá utilizar domínio permitido;
- `created_at` deverá possuir default;
- `updated_at` deverá possuir default.

---

# Profile Status

Valores oficiais:

```text
ACTIVE
INACTIVE
```

---

# Profile e Soft Delete

Profile não necessita obrigatoriamente de:

```text
archived_at
```

no modelo atual.

Sua disponibilidade operacional é controlada por:

```text
status
```

Não aplicar `archived_at` indiscriminadamente a todas as tabelas.

---

# Tabela Organization Members

Criar:

```text
organization_members
```

---

## Campos

Conceitualmente:

| Campo | Tipo | Obrigatório |
|---|---|---:|
| id | UUID | Sim |
| organization_id | UUID | Sim |
| user_id | UUID | Sim |
| role | VARCHAR(30) | Sim |
| status | VARCHAR(30) | Sim |
| created_at | TIMESTAMPTZ | Sim |
| updated_at | TIMESTAMPTZ | Sim |
| archived_at | TIMESTAMPTZ | Não |

---

## Regras

Cada Membership pertence a:

```text
1 Organization

+

1 Profile
```

A relação de domínio é:

```text
profiles

1

↓

N

organization_members

N

↓

1

organizations
```

---

# Foreign Keys de Membership

`organization_id` deverá referenciar:

```text
public.organizations.id
```

`user_id` deverá corresponder ao Profile do utilizador.

A definição física deverá permanecer consistente com:

```text
profiles.id = auth.users.id
```

---

# Constraint de Membership Único

Não deverá existir Membership duplicado para:

```text
organization_id

+

user_id
```

Criar constraint de unicidade correspondente.

---

# Roles

Valores oficiais:

```text
OWNER
ADMIN
MEMBER
```

Todos fazem parte do MVP atual.

---

# Membership Status

Valores oficiais:

```text
ACTIVE
INVITED
SUSPENDED
ARCHIVED
```

Somente:

```text
ACTIVE
```

concede acesso operacional normal.

---

# OWNER Inicial

O Bootstrap deverá criar inicialmente:

```text
Membership

Role: OWNER

Status: ACTIVE
```

para o utilizador que inicializar legitimamente a Organization.

A Foundation não deverá criar um utilizador ou e-mail fixo diretamente na migration.

---

# Quantidade de OWNER

A Migration 001 não deverá impor arbitrariamente:

```text
máximo de 1 OWNER
```

A regra mínima do modelo atual é que a Organization operacional possua pelo menos um OWNER válido.

Regras futuras de transferência ou multiplicidade de ownership deverão ser tratadas quando forem necessárias.

---

# Tabela Activity Logs

Criar:

```text
activity_logs
```

como única infraestrutura oficial de auditoria.

---

## Campos

Conceitualmente:

| Campo | Tipo | Obrigatório |
|---|---|---:|
| id | UUID | Sim |
| organization_id | UUID | Sim |
| user_id | UUID | Quando aplicável |
| entity_type | TEXT | Sim |
| entity_id | UUID | Sim |
| action | TEXT | Sim |
| metadata | JSONB | Não |
| created_at | TIMESTAMPTZ | Sim |

---

# Activity Logs — Regras

- `id` será Primary Key;
- `organization_id` deverá referenciar a Organization;
- `user_id` deverá representar o ator quando houver utilizador autenticado;
- `entity_type` deverá identificar o tipo lógico da entidade;
- `entity_id` deverá identificar o registro lógico auditado;
- `metadata` será opcional;
- `created_at` deverá possuir default;
- Activity Logs serão imutáveis.

---

# Activity Logs — Relação Polimórfica

Não criar campos como:

```text
client_id

demand_id

contract_id

financial_entry_id
```

dentro de `activity_logs`.

A referência lógica oficial será:

```text
entity_type

+

entity_id
```

---

# Activity Logs — Foundation

Na Migration 001, os tipos utilizados poderão corresponder apenas às entidades da Foundation.

Exemplos:

```text
ORGANIZATION
PROFILE
MEMBERSHIP
```

A estratégia escolhida para controlar `entity_type` e `action` deverá permitir evolução pelas migrations futuras sem reestruturar toda a tabela.

---

# Activity Logs — Imutabilidade

Não criar:

```text
updated_at
```

ou:

```text
archived_at
```

para Activity Logs no modelo atual.

Activity Logs não deverão sofrer:

```text
UPDATE
DELETE
```

através da aplicação.

---

# Constraints

Todas as tabelas deverão possuir somente as constraints necessárias ao domínio.

Aplicar quando adequado:

- Primary Keys;
- Foreign Keys;
- NOT NULL;
- UNIQUE;
- CHECK;
- Defaults.

As constraints deverão proteger invariantes importantes mesmo quando a aplicação falhar.

---

# UUID

Entidades da Foundation utilizarão:

```text
UUID
```

como identificador.

Não utilizar:

```text
SERIAL
```

para essas entidades.

---

# Datas

Datas que representam instantes deverão utilizar:

```text
TIMESTAMPTZ
```

---

# TIMESTAMP

Não utilizar:

```text
TIMESTAMP WITHOUT TIME ZONE
```

para eventos temporais da Foundation sem justificativa explícita.

---

# Soft Delete

Arquivamento lógico deverá ser utilizado apenas nas entidades que exigem preservação desse estado.

Na Foundation:

```text
organizations
organization_members
```

possuem:

```text
archived_at
```

`profiles` utiliza estado operacional.

`activity_logs` são permanentes e imutáveis.

Não aplicar Soft Delete indiscriminadamente.

---

# Índices

Criar apenas índices necessários para:

- Foreign Keys;
- autorização;
- RLS;
- consultas reais;
- auditoria;
- Bootstrap;
- unicidade.

Não criar índices especulativos.

---

# Índices — Organizations

Considerar índices necessários para:

```text
slug

status

archived_at
```

respeitando o fato de que `slug` já possuirá unicidade.

---

# Índices — Profiles

Considerar consultas por:

```text
id

status
```

sem duplicar índices já fornecidos pela Primary Key.

---

# Índices — Organization Members

Priorizar padrões necessários para:

```text
user_id

organization_id

status

role
```

especialmente para autorização e Policies.

A constraint única:

```text
organization_id + user_id
```

também deverá ser considerada ao evitar índices redundantes.

---

# Índices — Activity Logs

Os padrões iniciais de consulta incluem:

```text
organization_id

entity_type + entity_id

created_at
```

Índices concretos deverão ser escolhidos conforme esses padrões.

Não duplicar índices sem benefício real.

---

# Funções Auxiliares

Criar apenas funções auxiliares realmente necessárias à Foundation.

Possíveis responsabilidades:

- atualização automática de `updated_at`;
- verificação de Membership;
- verificação de role;
- validações reutilizadas pelas Policies;
- validações reutilizadas pelas RPCs.

Funções auxiliares não deverão concentrar regras de negócio dos módulos futuros.

---

# Organization Atual

Evitar criar funções que dependam desnecessariamente da premissa permanente de:

```text
1 utilizador
=
1 Organization para sempre
```

O MVP utiliza apenas uma Organization operacional, mas a arquitetura deve evitar acoplamento desnecessário.

Sempre que possível, autorização deverá validar a Organization do recurso contra os Memberships do utilizador.

---

# updated_at

Criar mecanismo padronizado para atualizar automaticamente:

```text
updated_at
```

quando aplicável.

---

# Triggers

Aplicar trigger de `updated_at` nas tabelas:

```text
organizations
profiles
organization_members
```

Não aplicar trigger de `updated_at` em:

```text
activity_logs
```

porque Activity Logs são imutáveis.

---

# Bootstrap

A Migration 001 deverá criar a infraestrutura necessária para:

```text
bootstrap_initial_organization()
```

conforme o contrato oficial de Bootstrap.

---

# Responsabilidade do Bootstrap

Conceitualmente:

```text
Utilizador autenticado

↓

Profile

↓

Organization FASBtech

↓

Membership OWNER ACTIVE
```

---

# Requisitos do Bootstrap

O Bootstrap deverá:

- validar `auth.uid()`;
- criar ou validar o Profile necessário;
- criar a Organization inicial quando permitido;
- criar o primeiro Membership OWNER;
- ser atômico;
- ser idempotente;
- impedir duplicações;
- lidar corretamente com chamadas concorrentes;
- não confiar em `organization_id` enviado pelo navegador;
- não confiar em `user_id` fornecido pelo navegador.

---

# Atomicidade do Bootstrap

O Bootstrap deverá comportar-se como uma única operação.

Conceitualmente:

```text
BEGIN

↓

Validar identidade

↓

Criar / validar Profile

↓

Criar / validar Organization

↓

Criar / validar Membership OWNER

↓

COMMIT
```

Se qualquer etapa obrigatória falhar:

```text
ROLLBACK
```

---

# Bootstrap e Activity Logs

A política de auditoria do Bootstrap deverá seguir o contrato oficial definido nos documentos técnicos correspondentes.

Não criar uma segunda infraestrutura de auditoria apenas para Bootstrap.

---

# RPCs da Foundation

A Migration 001 deverá criar somente RPCs necessárias à Foundation.

Não criar RPCs para funcionalidades de Sprints futuras.

---

# Não criar RPCs de Lead

Remover completamente operações antigas como:

```text
create_lead()

update_lead()

archive_lead()

change_lead_status()

update_lead_next_contact()

update_lead_notes()
```

Essas funções não fazem parte do MVP v3.0.

---

# Não criar RPCs de Cliente

Também não criar antecipadamente:

```text
create_client()

update_client()

archive_client()

assign_user_to_client()
```

na Migration 001.

Essas operações pertencem à:

```text
Sprint 02 — Clientes & Acessos
```

e deverão ser introduzidas pela Migration correspondente.

---

# RPCs SECURITY DEFINER

Quando uma RPC da Foundation precisar utilizar:

```text
SECURITY DEFINER
```

deverá cumprir integralmente o contrato do RLS v3.0.

---

# Hardening

Toda RPC `SECURITY DEFINER` deverá utilizar:

```sql
SET search_path = ''
```

ou mecanismo equivalente explicitamente aprovado pela arquitetura.

Objetos deverão utilizar schema explícito.

Exemplos:

```sql
public.profiles
public.organizations
public.organization_members
public.activity_logs
```

Quando aplicável:

```sql
auth.users
```

---

# Autorização Interna das RPCs

Conforme a operação, a RPC deverá validar:

- `auth.uid()`;
- Profile;
- Membership `ACTIVE`;
- Organization;
- Organization Status;
- role;
- ownership da entidade.

O Bootstrap possui contrato especial porque ocorre antes da existência do primeiro Membership.

---

# Dados Não Confiáveis

RPCs não poderão confiar em:

```text
organization_id
user_id
created_by
updated_by
role
permissions
```

recebidos do navegador para decidir autorização.

---

# Row Level Security

Ativar RLS em:

```text
profiles

organizations

organization_members

activity_logs
```

Nenhuma tabela protegida da Foundation deverá permanecer sem RLS.

---

# Policies — Profiles

## SELECT

O utilizador poderá visualizar o próprio Profile.

A ampliação de leitura para gestão administrativa de outros utilizadores deverá ocorrer quando a funcionalidade de Acessos for implementada.

---

## INSERT

A criação deverá ocorrer apenas pelos fluxos autorizados da Foundation.

O Bootstrap possui contrato específico.

---

## UPDATE

O utilizador poderá atualizar somente os campos próprios permitidos pela aplicação.

Campos administrativos não deverão ser alterados livremente.

---

## DELETE

Negado.

---

# Policies — Organizations

## SELECT

Permitido quando o utilizador possuir:

```text
Membership ACTIVE
```

na Organization correspondente.

---

## INSERT

Negado para operações diretas normais.

A criação inicial ocorre pelo Bootstrap.

---

## UPDATE

Permitido somente para operação administrativa oficialmente autorizada.

No MVP inicial:

```text
OWNER
```

possui autoridade administrativa sobre a Organization.

---

## DELETE

Negado.

Utilizar arquivamento quando aplicável.

---

# Policies — Organization Members

## SELECT

Na Foundation, o utilizador deverá conseguir consultar o próprio contexto de Membership necessário à autorização.

A leitura administrativa de todos os membros para a interface de:

```text
Acessos
```

pertence à Sprint 02 e poderá ampliar as Policies conforme necessário.

---

## INSERT

Não permitir INSERT direto irrestrito.

O primeiro Membership OWNER será criado exclusivamente pelo Bootstrap.

A gestão operacional de novos Memberships pertence à Sprint 02.

---

## UPDATE

Não permitir alteração irrestrita de:

```text
role

status
```

pela aplicação.

Operações administrativas correspondentes deverão utilizar o fluxo autorizado quando implementadas.

---

## DELETE

Negado.

---

# Policies — Activity Logs

## SELECT

Na Foundation, OWNER e operações administrativas autorizadas poderão consultar Logs dentro da própria Organization conforme o contexto permitido.

MEMBER não deverá possuir acesso irrestrito aos Logs da Organization.

As Policies específicas para Activity Logs relacionados a Clientes serão ampliadas na Sprint 02.

---

## INSERT

Não criar Policy de INSERT direto para utilizadores autenticados.

Activity Logs deverão ser criados apenas por mecanismos oficiais autorizados.

---

## UPDATE

Negado.

---

## DELETE

Negado.

---

# Policies Futuras

A Migration 001 não deverá tentar implementar antecipadamente Policies para:

```text
clients
client_assignments
demands
financial_entries
contracts
documents
```

Cada domínio deverá introduzir ou ampliar as Policies quando sua tabela passar a existir.

---

# Activity Logs

Operações auditáveis da Foundation deverão utilizar a infraestrutura central:

```text
activity_logs
```

Não criar:

```text
organization_activities

membership_activities

profile_activities
```

---

# Atomicidade de Auditoria

Quando uma operação da Foundation exigir Activity Log obrigatório:

```text
Mutação

+

Activity Log
```

deverão ocorrer na mesma transação.

Se o Log falhar:

```text
ROLLBACK
```

da operação correspondente.

---

# Grants

Aplicar princípio do menor privilégio.

RPCs utilizadas pela aplicação deverão possuir apenas as permissões necessárias.

Para funções destinadas a utilizadores autenticados:

```sql
REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION ... FROM anon;

GRANT EXECUTE ON FUNCTION ... TO authenticated;
```

A assinatura completa deverá ser utilizada quando necessário.

---

# Bootstrap Grants

A RPC de Bootstrap deverá possuir somente as permissões necessárias para que um utilizador autenticado elegível execute o processo inicial.

Sua segurança não poderá depender apenas do:

```text
GRANT EXECUTE
```

A função deverá validar internamente se o Bootstrap pode ocorrer.

---

# Service Role

A Service Role não será utilizada no fluxo normal da aplicação.

Nunca expor em:

- navegador;
- Client Components;
- código público;
- payloads;
- operações normais de persistência.

Uso administrativo deverá ser explicitamente controlado.

---

# Storage Foundation

A Sprint 01 exige infraestrutura privada de Storage.

Quando essa configuração for gerenciada por SQL versionado, a Migration 001 poderá configurar o mínimo necessário.

---

## Regras

A Foundation poderá:

- criar ou configurar bucket privado oficial;
- negar acesso anônimo;
- estabelecer Policies mínimas de segurança;
- impedir exposição pública por padrão.

---

## Limite

A Migration 001 não deverá criar ainda:

```text
documents
```

como entidade de domínio.

Também não deverá implementar antecipadamente autorização de documentos por Cliente.

Essa autorização será adicionada quando existir a relação persistida necessária.

---

# Storage e Segurança

Na Foundation:

```text
anon
→ acesso negado
```

e arquivos operacionais não deverão ser públicos por padrão.

Policies futuras deverão relacionar documentos às entidades correspondentes.

---

# Mass Assignment

Nenhuma operação deverá persistir diretamente um payload completo e não confiável.

Exemplo proibido:

```ts
insert(formData)
```

Campos administrativos deverão ser determinados internamente.

---

# Organization ID

A Migration deverá garantir que o modelo permita obter e validar Organization através do Membership.

Não criar fluxos que dependam de:

```text
organization_id
```

fornecido livremente pelo frontend.

---

# Constraints de Segurança

A Migration deverá utilizar constraints para impedir estados estruturalmente inválidos sempre que possível.

Exemplos:

- Membership duplicado;
- role fora do domínio permitido;
- status fora do domínio permitido;
- Organization inexistente;
- Profile inexistente;
- slug duplicado.

---

# Concorrência

Operações críticas da Foundation deverão considerar concorrência.

Principalmente:

```text
Bootstrap
```

Chamadas simultâneas não poderão produzir:

- duas Organizations FASBtech indevidas;
- Memberships duplicados;
- ownership inconsistente.

---

# Validação da Migration

Após aplicação, deverão ser validados:

- existência das tabelas;
- constraints;
- Foreign Keys;
- índices;
- triggers;
- funções auxiliares;
- Bootstrap;
- RLS;
- Policies;
- Grants;
- imutabilidade de Activity Logs;
- isolamento por Organization;
- Membership Status;
- roles;
- rollback de operações transacionais.

---

# Testes de Profiles

Validar:

```text
Utilizador autenticado
→ próprio Profile
→ permitido
```

```text
Utilizador não autorizado
→ Profile de terceiro
→ negado
```

---

# Testes de Organizations

Validar:

```text
Membership ACTIVE
→ própria Organization
→ permitido
```

```text
Sem Membership
→ Organization
→ negado
```

---

# Testes de Membership

Validar:

```text
Membership ACTIVE
→ acesso operacional
```

```text
Membership SUSPENDED
→ acesso negado
```

```text
Membership ARCHIVED
→ acesso negado
```

```text
Membership INVITED
→ acesso operacional negado
```

---

# Testes de Activity Logs

Validar:

- INSERT direto negado;
- UPDATE negado;
- DELETE negado;
- Organization correta;
- ator correto quando aplicável;
- imutabilidade;
- atomicidade;
- rollback.

---

# Testes do Bootstrap

Validar:

- primeiro Bootstrap autorizado;
- criação do Profile;
- criação da Organization;
- criação do OWNER;
- role `OWNER`;
- Membership `ACTIVE`;
- idempotência;
- concorrência;
- execução por utilizador não autenticado negada;
- ausência de duplicação;
- rollback integral em falha.

---

# Rollback

Caso seja necessário desfazer a Migration 001 em ambiente apropriado, as dependências deverão ser removidas em ordem segura.

Ordem conceitual:

```text
1. Revogar Grants

↓

2. Remover Policies

↓

3. Remover configurações de Storage criadas pela Migration quando aplicável

↓

4. Desativar RLS quando necessário ao rollback

↓

5. Remover RPCs

↓

6. Remover Triggers

↓

7. Remover Funções Auxiliares

↓

8. Remover Índices explícitos

↓

9. Remover Constraints

↓

10. Remover Tabelas
```

A ordem física deverá respeitar Foreign Keys e demais dependências do PostgreSQL.

---

# Rollback e Produção

Rollback destrutivo de estrutura não deverá ser utilizado indiscriminadamente em ambiente com dados reais.

Mudanças posteriores deverão preferir migrations corretivas quando existirem dados que precisam ser preservados.

---

# Critérios de Aceite

A Migration 001 será considerada concluída quando:

- `profiles` existir;
- `organizations` existir;
- `organization_members` existir;
- `activity_logs` existir;
- nenhuma tabela de Lead existir;
- nenhuma tabela de Cliente existir;
- roles `OWNER`, `ADMIN` e `MEMBER` estiverem suportadas;
- estados oficiais estiverem protegidos;
- Membership duplicado estiver bloqueado;
- Foreign Keys estiverem corretas;
- constraints obrigatórias estiverem aplicadas;
- índices necessários estiverem aplicados;
- triggers de `updated_at` funcionarem;
- Activity Logs permanecerem imutáveis;
- Bootstrap estiver implementado;
- Bootstrap for atômico;
- Bootstrap for idempotente;
- concorrência do Bootstrap estiver protegida;
- RLS estiver ativa em todas as tabelas da Foundation;
- Policies da Foundation estiverem corretas;
- INSERT direto em Activity Logs estiver negado;
- UPDATE de Activity Logs estiver negado;
- DELETE de Activity Logs estiver negado;
- RPCs privilegiadas estiverem endurecidas;
- `EXECUTE` estiver corretamente restringido;
- isolamento por Organization estiver validado;
- Membership não ativo não conceder acesso operacional;
- Service Role não fizer parte do fluxo normal;
- Storage estiver privado quando configurado nesta migration;
- testes obrigatórios estiverem aprovados;
- nenhuma entidade futura tiver sido criada antecipadamente.

---

# Entidades após Migration 001

Após a aplicação da Migration 001, o modelo persistido deverá ser:

```text
auth.users
    │
    │
    ▼
profiles
    │
    ▼
organization_members
    │
    ▼
organizations
    │
    └──────────► activity_logs
```

A relação conceitual correta também pode ser representada como:

```text
profiles
    │
    └──► organization_members ◄── organizations

organizations
    │
    └──► activity_logs
```

Não deverá existir ainda:

```text
clients
```

nem:

```text
client_assignments
```

---

# Próxima Evolução

Após a conclusão da Foundation, a próxima migration de negócio deverá implementar:

```text
Clientes

+

Client Assignments

+

RLS correspondente

+

Policies correspondentes

+

auditoria correspondente
```

como parte da:

```text
Sprint 02 — Clientes & Acessos
```

A numeração concreta das migrations posteriores pertence ao documento:

```text
Migrations
```

e não deverá ser duplicada ou antecipada neste arquivo.

---

# Referências

Este documento deverá permanecer consistente com:

- PRD v3.0;
- MVP Scope v3.0;
- Product Roadmap v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- Sprint 01 v3.0;
- Sprint 02 v3.0;
- System Architecture v3.0;
- Module Architecture v3.0;
- Data Model v3.0;
- Organization and User Model v3.0;
- RLS v3.0;
- Activity Logs v3.0;
- ADR-002;
- Bootstrap;
- Migrations.

---

# Fonte da Verdade

A responsabilidade oficial da Migration 001 é:

```text
FOUNDATION

├── profiles
├── organizations
├── organization_members
├── activity_logs
├── Bootstrap
├── RLS
├── Policies
├── Grants
└── Storage privado mínimo quando aplicável
```

Ela não contém:

```text
Leads
Clientes
Demandas
Financeiro
Contratos
```

A regra principal é:

```text
Migration 001
=
somente infraestrutura compartilhada necessária
para o início seguro do CRM
```

---

# Definition of Done

A Migration 001 será considerada pronta quando:

- implementar exclusivamente a Foundation;
- manter Auth separado de Profile;
- utilizar Membership como vínculo entre Profile e Organization;
- suportar `OWNER`, `ADMIN` e `MEMBER`;
- suportar múltiplos utilizadores internos;
- não implementar Client Assignments prematuramente;
- criar Activity Logs centralizados e imutáveis;
- impedir escrita direta indevida nos Activity Logs;
- implementar Bootstrap seguro;
- implementar RLS base;
- implementar Policies base;
- endurecer RPCs privilegiadas;
- proteger Organization e Membership;
- não confiar em campos administrativos enviados pela interface;
- não possuir referências a Leads;
- não possuir tabelas de módulos futuros;
- permitir que a Sprint 02 seja implementada sem reconstruir a Foundation;
- passar nos testes de segurança, autorização, atomicidade e rollback aplicáveis.