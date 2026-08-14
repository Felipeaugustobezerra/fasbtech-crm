# Row Level Security (RLS)

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

Este documento define a estratégia oficial de Row Level Security (RLS) e autorização no banco de dados do FASBtech CRM.

Toda operação realizada pela aplicação deverá respeitar:

- autenticação;
- Membership;
- Organization;
- role;
- autorização por Cliente quando aplicável;
- Policies;
- regras de negócio do módulo.

Nenhum utilizador poderá visualizar ou modificar dados pertencentes a outra Organization.

A partir da Sprint 02, um MEMBER também não poderá acessar Clientes aos quais não esteja explicitamente autorizado.

---

# Fonte da Verdade

Este documento implementa a estratégia de segurança definida por:

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

Organization and User Model v3.0
```

As decisões de persistência transacional seguem:

```text
ADR-002 — Estratégia de Persistência e Transações
```

---

# Filosofia

A segurança do sistema não depende do frontend.

A autorização é aplicada em múltiplas camadas:

1. Schema Zod;
2. Server Actions;
3. Services;
4. Row Level Security para operações diretas;
5. validação interna obrigatória nas RPCs privilegiadas;
6. constraints e integridade do PostgreSQL.

Mesmo que uma camada falhe, as demais deverão impedir acesso indevido.

---

# Autenticação não é Autorização

Autenticação responde:

```text
Quem é o utilizador?
```

Autorização responde:

```text
O que esse utilizador pode acessar?
```

Um utilizador autenticado não possui automaticamente acesso a todos os dados da Organization.

O acesso poderá depender de:

- Profile;
- Membership;
- Organization;
- role;
- Client Assignment;
- permissões específicas do módulo;
- estado da entidade.

---

# Arquitetura de Segurança

```text
Browser

↓

Server Action / Server Component

↓

Service

├── Query
│
│   ↓
│
│   Supabase
│
│   ↓
│
│   RLS + Policies
│
│   ↓
│
│   PostgreSQL
│
├── Mutation simples
│
│   ↓
│
│   Supabase
│
│   ↓
│
│   RLS + Policies
│
│   ↓
│
│   PostgreSQL
│
└── RPC transacional privilegiada
    │
    ↓
    PostgreSQL RPC
    SECURITY DEFINER
    │
    ↓
    Validação interna
    │
    ↓
    Operação principal
    +
    Activity Log
    │
    ↓
    Commit / Rollback
```

Queries e Mutations diretas permanecem protegidas por RLS.

RPCs `SECURITY DEFINER` constituem exceções controladas e deverão possuir autorização própria.

---

# Modelo de Autorização

A base de autorização será:

```text
auth.users

↓

profiles

↓

organization_members

↓

organizations
```

Para recursos restritos por Cliente:

```text
organization_members

↓

client_assignments

↓

clients
```

---

# Ownership

Os registros operacionais pertencem à Organization.

Exemplo:

```text
Client

↓

organization_id

↓

Organization
```

O utilizador não escolhe arbitrariamente a Organization proprietária do registro.

---

# Membership

Membership determina:

```text
Este utilizador pertence à Organization?

Qual é sua role?

Qual é o estado do vínculo?
```

Somente Membership:

```text
ACTIVE
```

concede acesso operacional normal.

Estados oficiais:

```text
ACTIVE
INVITED
SUSPENDED
ARCHIVED
```

---

# Client Assignment

Client Assignment determina:

```text
Este MEMBER pode acessar este Cliente?
```

Ele não altera:

- ownership do Cliente;
- role;
- Organization;
- permissões administrativas globais.

---

# Organização Atual

A Organization é resolvida a partir da identidade autenticada.

Fluxo:

```text
auth.uid()

↓

Profile

↓

Membership ACTIVE

↓

organization_id
```

O frontend nunca deverá ser considerado fonte confiável de:

```text
organization_id
```

---

# Autorização por Cliente

A partir da Sprint 02, o acesso a Clientes deverá considerar a role.

---

## OWNER

OWNER poderá acessar todos os Clientes pertencentes à própria Organization.

Não depende de Client Assignment individual para cada Cliente.

---

## ADMIN

No modelo administrativo atual do MVP, ADMIN poderá acessar e administrar Clientes pertencentes à própria Organization conforme as regras do módulo.

Restrições futuras mais granulares deverão ser introduzidas somente após decisão formal de produto.

---

## MEMBER

MEMBER somente poderá acessar Clientes aos quais possuir Client Assignment válido.

Fluxo:

```text
MEMBER

↓

Membership ACTIVE

↓

Client Assignment

↓

Cliente
```

Sem associação:

```text
Acesso negado
```

---

# Regra de Mesma Organization

Um Client Assignment somente será válido quando:

```text
Membership.organization_id
=
Client.organization_id
```

Não poderá existir associação operacional entre:

```text
Membership da Organization A

e

Cliente da Organization B
```

---

# Identificador não é Autorização

Valores como:

```text
client_id
demand_id
contract_id
financial_entry_id
```

podem identificar o recurso solicitado.

Porém:

```text
conhecer o ID
≠
ter autorização
```

Toda operação deverá validar o acesso separadamente.

---

# Dados Não Confiáveis

Nunca confiar em dados enviados pela interface para determinar autorização.

Incluindo:

```text
organization_id

user_id

created_by

updated_by

owner_id

role

permissions
```

Esses valores deverão ser obtidos ou validados através do contexto autenticado e das relações persistidas.

---

# Exceções Controladas

A RLS é obrigatória para tabelas protegidas.

Entretanto, algumas operações exigem:

- múltiplas alterações;
- Activity Log na mesma transação;
- autorização privilegiada controlada;
- commit/rollback conjunto.

Nesses casos, a arquitetura permite RPCs PostgreSQL implementadas com:

```text
SECURITY DEFINER
```

O uso de `SECURITY DEFINER` não significa desativação geral da RLS.

Representa apenas uma exceção controlada para operações oficialmente documentadas.

---

# Bootstrap

O Bootstrap inicial será executado através da RPC:

```text
bootstrap_initial_organization()
```

Sua responsabilidade será inicializar atomicamente:

```text
Profile

↓

Organization FASBtech

↓

Membership OWNER ACTIVE
```

O Bootstrap é permitido antes da existência do primeiro Membership.

Suas regras específicas pertencem ao documento:

```text
Bootstrap
```

O Bootstrap não deverá criar:

- Clientes;
- Demandas;
- movimentações financeiras;
- Contratos.

---

# RPCs Transacionais

RPCs deverão ser utilizadas quando uma operação exigir o contrato transacional definido pela ADR-002.

Na Sprint 02, exemplos conceituais de operações que poderão exigir RPC incluem:

```text
criar Cliente

editar Cliente

arquivar Cliente

associar utilizador a Cliente

remover associação de Cliente

alterar role quando auditável
```

Os nomes reais e assinaturas das funções deverão ser definidos pela Migration correspondente.

Este documento não estabelece nomes físicos antecipadamente.

---

# Contrato Obrigatório das RPCs Privilegiadas

Toda RPC `SECURITY DEFINER` deverá validar internamente, conforme aplicável:

1. `auth.uid()` existente;
2. Profile válido;
3. Membership `ACTIVE`;
4. Organization correspondente;
5. estado permitido da Organization;
6. role necessária para a operação;
7. pertencimento da entidade à Organization;
8. Client Assignment quando o utilizador for MEMBER e o recurso estiver sujeito a essa restrição;
9. permissões específicas do módulo quando existirem.

A função deverá interromper a operação caso qualquer validação falhe.

---

# Atomicidade

Quando uma operação exigir:

```text
Alteração principal

+

Activity Log
```

ambas deverão pertencer à mesma transação.

Fluxo:

```text
BEGIN

↓

Validar autorização

↓

Executar alteração

↓

Criar Activity Log

↓

COMMIT
```

Se qualquer etapa falhar:

```text
ROLLBACK
```

Não poderá permanecer alteração parcial.

---

# Hardening das RPCs

Toda função `SECURITY DEFINER` deverá utilizar contexto SQL seguro.

O padrão oficial será:

```sql
SET search_path = ''
```

Objetos acessados deverão utilizar schema explícito.

Exemplos:

```sql
public.profiles
public.organization_members
public.organizations
public.clients
public.client_assignments
public.activity_logs
```

Quando aplicável:

```sql
auth.users
```

Nenhuma RPC privilegiada deverá depender de resolução implícita através de `search_path` inseguro.

---

# Permissões de Execução

RPCs privilegiadas não poderão ser executadas indiscriminadamente.

Aplicar permissões equivalentes a:

```sql
REVOKE EXECUTE ON FUNCTION ... FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION ... FROM anon;

GRANT EXECUTE ON FUNCTION ... TO authenticated;
```

As assinaturas completas deverão ser utilizadas quando exigidas pelo PostgreSQL.

Nenhuma RPC privilegiada da aplicação deverá conceder execução a:

```text
anon
```

---

# Relação entre RPC e RLS

Operações diretas:

```text
RLS + Policies
```

RPCs `SECURITY DEFINER`:

```text
Autorização interna

+

Permissões EXECUTE

+

Constraints

+

Transação
```

Como uma função `SECURITY DEFINER` pode executar com privilégios superiores aos do chamador, ela não poderá depender exclusivamente da RLS para autorização.

---

# Responsabilidades

## Frontend

Pode enviar apenas dados funcionais necessários à operação.

Exemplos de Cliente:

- nome;
- empresa;
- e-mail;
- telefone;
- identificação fiscal;
- endereço;
- observações.

Pode enviar:

```text
client_id
```

quando necessário para identificar o recurso solicitado.

Porém, `client_id` nunca será considerado autorização.

---

## Server Actions

Responsáveis por:

- validar sessão;
- validar entrada;
- chamar Services;
- retornar respostas seguras.

Não deverão confiar em campos de autorização enviados pela interface.

---

## Services

Responsáveis por:

- regras de negócio;
- coordenação;
- validação lógica de autorização;
- escolha entre Query, Mutation ou RPC.

---

## Queries

Responsáveis apenas por leitura.

As Queries deverão depender da proteção do banco e nunca retornar dados que o utilizador não possa acessar.

---

## Mutations

Responsáveis por escritas simples quando:

- não houver múltiplas alterações atômicas;
- não houver Activity Log obrigatório na mesma transação;
- a arquitetura permitir escrita direta.

Mutations permanecem protegidas por RLS.

---

## RPCs

Responsáveis por operações transacionais e privilegiadas quando justificadas.

RPCs deverão:

- validar identidade;
- validar Membership;
- validar Organization;
- validar role;
- validar Client Assignment quando aplicável;
- executar atomicamente;
- cumprir ADR-002;
- cumprir este documento.

---

# Tabelas Protegidas da Foundation

A Sprint 01 deverá proteger:

```text
profiles
organizations
organization_members
activity_logs
```

---

# Tabelas Protegidas da Sprint 02

A Sprint 02 adicionará:

```text
clients
client_assignments
```

As Policies concretas deverão ser implementadas na Migration correspondente.

---

# Tabelas Futuras

Quando implementadas, também deverão possuir RLS adequada ao domínio:

```text
demands
demand_assignees
demand_tags
demand_tag_assignments
financial_entries
financial_goals
contract_templates
contracts
documents
notifications
```

Não criar Policies para tabelas que ainda não existem.

---

# Policies — Profiles

## SELECT

O próprio utilizador poderá visualizar seu Profile.

OWNER e ADMIN poderão visualizar Profiles necessários à gestão dos utilizadores da própria Organization, quando essa funcionalidade estiver autorizada.

MEMBER não deverá obter acesso indiscriminado aos Profiles dos demais utilizadores.

---

## UPDATE

O utilizador poderá atualizar apenas os campos do próprio Profile permitidos pelas regras do sistema.

Alterações administrativas deverão seguir fluxo específico quando necessário.

---

## INSERT

A criação de Profile deverá ocorrer apenas através dos fluxos oficialmente autorizados.

O Bootstrap possui exceção própria.

---

## DELETE

Negado pelo fluxo normal da aplicação.

---

# Policies — Organizations

## SELECT

Permitido quando existir:

```text
Membership ACTIVE
```

na Organization correspondente.

---

## INSERT

Não permitido pelas operações normais.

A primeira Organization será criada exclusivamente pelo Bootstrap.

---

## UPDATE

Permitido somente às roles administrativas autorizadas.

No MVP:

```text
OWNER
```

possui autoridade administrativa completa sobre a Organization.

---

## DELETE

Negado.

Utilizar arquivamento quando previsto pelo domínio.

---

# Policies — Organization Members

## SELECT

OWNER e ADMIN autorizados poderão visualizar Memberships necessários à gestão da Organization.

MEMBER deverá visualizar apenas as informações necessárias ao próprio contexto operacional.

---

## INSERT

Não deverá ser permitido de forma irrestrita.

A criação de Membership deverá seguir o fluxo administrativo oficialmente implementado.

O primeiro Membership OWNER é criado pelo Bootstrap.

---

## UPDATE

Alterações de:

- role;
- status;

deverão respeitar autorização administrativa e auditoria.

Quando a operação exigir Activity Log atômico, deverá utilizar RPC.

---

## DELETE

Negado pelo fluxo normal.

Utilizar alteração de estado ou arquivamento quando aplicável.

---

# Policies — Clients

## SELECT

OWNER:

```text
todos os Clientes da própria Organization
```

ADMIN:

```text
Clientes da própria Organization
conforme regras administrativas do MVP
```

MEMBER:

```text
somente Clientes com Client Assignment válido
```

Sempre exigir também:

```text
Membership ACTIVE
```

---

## INSERT

Criação de Cliente deverá ser permitida somente a utilizadores autorizados.

Quando a criação for auditável e exigir Activity Log atômico, deverá ocorrer pela RPC oficial da Sprint 02.

O `organization_id` deverá ser resolvido internamente.

---

## UPDATE

Atualização de Cliente deverá exigir:

- Membership válido;
- Organization correta;
- role autorizada;
- acesso ao Cliente.

Quando a operação for auditável, utilizar o mecanismo transacional correspondente.

---

## DELETE

Negado.

Clientes deverão utilizar arquivamento lógico.

---

# Policies — Client Assignments

## SELECT

OWNER e ADMIN autorizados poderão visualizar associações necessárias à gestão de Acessos.

MEMBER poderá visualizar apenas as próprias associações quando necessário ao funcionamento da aplicação.

---

## INSERT

A criação de Client Assignment deverá exigir autorização administrativa.

Deverá validar:

```text
Membership.organization_id
=
Client.organization_id
```

Quando auditável, a criação e o Activity Log deverão ocorrer atomicamente.

---

## UPDATE

Não deverá ser utilizado para alterar arbitrariamente ownership ou Organization.

Alterações permitidas deverão seguir as regras do domínio.

---

## DELETE

A remoção lógica da associação deverá utilizar o mecanismo oficialmente definido pela Migration.

Se a remoção for auditável, deverá ocorrer atomicamente com o Activity Log.

A remoção da associação não remove:

- Cliente;
- Profile;
- Membership;
- histórico.

---

# Policies — Activity Logs

## SELECT

OWNER e ADMIN autorizados poderão visualizar Activity Logs da própria Organization conforme o contexto permitido.

MEMBER não deverá receber automaticamente todos os Activity Logs da Organization.

Para MEMBER, o acesso ao histórico deverá respeitar a autorização da entidade relacionada.

Exemplo:

```text
Activity Log de Cliente

↓

MEMBER possui acesso ao Cliente?

├── Sim → pode ser apresentado quando permitido
└── Não → acesso negado
```

Logs administrativos ou de entidades não autorizadas não deverão ser expostos ao MEMBER.

---

## INSERT

Nenhum utilizador autenticado poderá inserir Activity Logs diretamente.

Activity Logs somente poderão ser criados por:

- RPCs transacionais oficiais;
- funções privilegiadas explicitamente autorizadas.

---

## UPDATE

Negado.

---

## DELETE

Negado.

Activity Logs são imutáveis.

---

# Fluxo de Criação de Cliente

Quando a criação for uma operação auditada:

```text
Utilizador autenticado

↓

Server Action

↓

Service

↓

RPC autorizada

↓

auth.uid()

↓

Profile

↓

Membership ACTIVE

↓

Organization

↓

Validar role

↓

INSERT Client

+

INSERT Activity Log

↓

COMMIT
```

Em caso de falha:

```text
ROLLBACK
```

---

# Fluxo de Consulta de Cliente

```text
Utilizador autenticado

↓

Query

↓

RLS

↓

Membership ACTIVE

↓

Organization válida

↓

Role
```

Para MEMBER:

```text
↓

Client Assignment válido

↓

Cliente
```

Resultado não autorizado:

```text
Acesso negado
```

---

# Fluxo de Atualização de Cliente

```text
Server Action

↓

Service

↓

Operação oficial

↓

Validar identidade

↓

Validar Membership

↓

Validar Organization

↓

Validar role

↓

Validar acesso ao Cliente

↓

UPDATE

+

Activity Log quando aplicável

↓

COMMIT
```

---

# Fluxo de Arquivamento de Cliente

```text
Server Action

↓

Service

↓

Operação transacional autorizada

↓

Validar autorização

↓

UPDATE archived_at

+

Activity Log

↓

COMMIT
```

Não utilizar DELETE físico.

---

# Fluxo de Associação de Utilizador a Cliente

```text
Utilizador administrativo

↓

Server Action

↓

Service

↓

Operação transacional

↓

Validar Membership do administrador

↓

Validar role

↓

Validar Membership alvo

↓

Validar Cliente

↓

Validar mesma Organization

↓

Criar Client Assignment

+

Activity Log

↓

COMMIT
```

---

# Fluxo de Remoção de Associação

```text
Utilizador administrativo

↓

Service

↓

Operação transacional

↓

Validar autorização

↓

Remover / arquivar associação

+

Activity Log

↓

COMMIT
```

Após a conclusão:

```text
MEMBER

↓

não possui mais Client Assignment

↓

perde acesso ao Cliente
```

---

# Operações Diretas

Operações diretas utilizam:

```text
Query / Mutation

↓

Supabase

↓

RLS + Policies

↓

PostgreSQL
```

---

# Operações Transacionais Auditadas

```text
Server Action

↓

Service

↓

RPC SECURITY DEFINER

↓

Autorização interna

↓

Mutação

+

Activity Log

↓

Commit / Rollback
```

---

# Arquivamento

Entidades que exigirem preservação histórica deverão utilizar arquivamento lógico.

Para Clientes:

```sql
archived_at IS NULL
```

representa registros ativos nas listagens padrão.

O arquivamento não altera:

- Organization;
- Activity Logs;
- histórico relacionado.

---

# Organization Inativa

Organizations com estado:

```text
INACTIVE
ARCHIVED
```

não deverão permitir operações operacionais normais.

RPCs privilegiadas deverão validar o estado da Organization.

---

# Membership Não Ativo

Membership nos estados:

```text
INVITED
SUSPENDED
ARCHIVED
```

não concede acesso operacional normal.

---

# Papéis

## OWNER

Possui acesso administrativo completo à própria Organization.

---

## ADMIN

Possui acesso administrativo aos módulos permitidos pelo MVP.

As Policies deverão permanecer dentro das permissões oficialmente definidas.

---

## MEMBER

Possui acesso operacional restrito.

Para Clientes:

```text
MEMBER
+
Client Assignment
=
acesso
```

---

# Áreas Sensíveis Futuras

A associação a Cliente não deverá conceder automaticamente acesso a:

```text
Financeiro

Contratos
```

Quando esses módulos forem implementados, deverão possuir Policies específicas.

---

# Storage Privado

Os documentos utilizarão Supabase Storage privado.

A infraestrutura deverá respeitar:

- autenticação;
- Organization;
- autorização da entidade relacionada;
- Client Assignment quando aplicável.

---

# Storage não é Público

Arquivos privados não deverão depender de URL pública permanente.

Conhecer o caminho ou nome de um arquivo não concede autorização.

---

# Policies de Storage

As Policies de `storage.objects` deverão ser definidas conforme a estrutura de documentos implementada.

Na Foundation:

- buckets operacionais deverão ser privados;
- acesso anônimo deverá ser negado.

Quando documentos relacionados a Clientes forem implementados:

- o utilizador deverá possuir acesso ao Cliente correspondente;
- MEMBER deverá possuir Client Assignment válido;
- OWNER e ADMIN deverão respeitar as regras administrativas do módulo.

A autorização não deverá depender exclusivamente de texto controlável no caminho do arquivo sem validação da relação persistida correspondente.

---

# Activity Logs

Toda operação relevante deverá registrar:

- utilizador;
- Organization;
- ação;
- entidade;
- data.

Para operações auditadas:

```text
Mutação principal

+

Activity Log
```

deverão ocorrer na mesma transação quando exigido pela arquitetura.

Utilizadores autenticados não possuem INSERT direto em:

```text
activity_logs
```

---

# Service Role

A chave Service Role nunca poderá ser utilizada no fluxo normal da aplicação.

Não utilizar em:

- navegador;
- Client Components;
- Server Actions acessíveis ao utilizador;
- operações normais de persistência.

Uso permitido apenas para:

- infraestrutura administrativa controlada;
- operações de teste explicitamente autorizadas;
- tarefas internas que realmente exijam privilégio.

RPC `SECURITY DEFINER` não significa utilização da Service Role.

---

# Mass Assignment

Nunca persistir diretamente objetos de formulário não mapeados.

Exemplo proibido:

```ts
insert(formData)
```

Mapear explicitamente os campos permitidos.

Campos de autorização não pertencem ao payload funcional.

---

# Testes da Foundation

As tabelas base deverão possuir testes para:

- utilizador autenticado;
- utilizador não autenticado;
- Membership ACTIVE;
- Membership SUSPENDED;
- Membership ARCHIVED;
- acesso entre Organizations;
- Organization INACTIVE;
- Organization ARCHIVED;
- role autorizada;
- role não autorizada quando aplicável.

---

# Testes da Sprint 02

A Sprint 02 deverá validar obrigatoriamente:

```text
OWNER
→ Cliente da própria Organization
→ permitido
```

```text
ADMIN autorizado
→ Cliente da própria Organization
→ permitido
```

```text
MEMBER associado
→ Cliente
→ permitido
```

```text
MEMBER não associado
→ Cliente
→ negado
```

```text
MEMBER
→ Cliente de outra Organization
→ negado
```

```text
Utilizador não autenticado
→ Cliente
→ negado
```

---

# Testes de Data Leakage

Validar que um utilizador não autorizado não consiga descobrir dados através de:

- listagem;
- pesquisa;
- filtros;
- paginação;
- ordenação;
- contagens;
- URL direta;
- Query por ID;
- Activity Logs;
- documentos privados.

---

# Testes de Client Assignments

Validar:

- criação autorizada;
- criação negada;
- mesma Organization;
- associação duplicada;
- remoção autorizada;
- remoção negada;
- perda efetiva de acesso após remoção;
- Activity Log correspondente.

---

# Testes de RPC

Toda RPC privilegiada deverá possuir testes para:

- utilizador autorizado;
- utilizador não autenticado;
- Membership inválido;
- Organization inválida;
- role inadequada;
- recurso de outra Organization;
- Client Assignment ausente quando exigido;
- execução por `anon` negada;
- atomicidade;
- rollback;
- Activity Log.

---

# Checklist de Tabela Protegida

Antes de considerar uma tabela pronta verificar:

- possui RLS?
- possui Policies?
- possui vínculo com Organization quando aplicável?
- impede acesso entre Organizations?
- valida role quando aplicável?
- valida Client Assignment quando aplicável?
- possui índices adequados?
- utiliza UUID quando definido pelo modelo?
- utiliza TIMESTAMPTZ quando apropriado?
- utiliza arquivamento quando exigido?
- possui testes de autorização?

---

# Checklist de RPC SECURITY DEFINER

Antes de considerar uma RPC pronta verificar:

- é realmente necessária?
- está documentada?
- valida `auth.uid()`?
- valida Profile?
- valida Membership `ACTIVE`?
- resolve Organization internamente?
- valida estado da Organization?
- valida role?
- valida ownership da entidade?
- valida Client Assignment quando aplicável?
- utiliza `SET search_path = ''`?
- utiliza referências de schema explícitas?
- revoga `EXECUTE` de `PUBLIC`?
- revoga `EXECUTE` de `anon`?
- concede `EXECUTE` apenas aos papéis PostgreSQL autorizados?
- possui testes de atomicidade?
- possui testes de rollback?

---

# Fluxo de Autorização Direta

```text
Utilizador autenticado

↓

Profile

↓

Membership ACTIVE

↓

Organization

↓

Role

↓

Client Assignment quando aplicável

↓

RLS + Policies

↓

Recurso
```

---

# Fluxo de Autorização em RPC

```text
Utilizador autenticado

↓

RPC SECURITY DEFINER

↓

auth.uid()

↓

Profile

↓

Membership ACTIVE

↓

Organization

↓

Organization Status

↓

Role

↓

Client Assignment quando aplicável

↓

Entidade pertence à Organization?

↓

Executar operação

↓

Activity Log

↓

Commit
```

---

# Importante

A RLS não substitui as demais camadas de segurança.

Para operações diretas:

```text
Zod

↓

Server Action

↓

Service

↓

RLS
```

Para RPCs privilegiadas:

```text
Zod

↓

Server Action

↓

Service

↓

Autorização interna da RPC

↓

PostgreSQL
```

RLS e RPCs possuem responsabilidades complementares.

---

# Fora do Escopo Atual

Este documento não define Policies concretas de:

- Leads;
- Projetos;
- Product Registry;
- Agenda;
- Demandas;
- Financeiro;
- Contratos.

Demandas, Financeiro e Contratos pertencem ao MVP, mas suas Policies específicas serão definidas quando suas respectivas Sprints forem implementadas.

Leads e Projetos não fazem parte do MVP atual.

---

# Referências

Este documento deverá permanecer consistente com:

- PRD v3.0;
- MVP Scope v3.0;
- Product Roadmap v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- System Architecture v3.0;
- Module Architecture v3.0;
- Data Model v3.0;
- Organization and User Model v3.0;
- Activity Logs;
- Bootstrap;
- ADR-002;
- Migration 001;
- Migrations;
- Sprint 01;
- Sprint 02.

---

# Fonte da Verdade

O modelo de autorização oficial do MVP v3.0 é:

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

Para MEMBER acessar Cliente:

```text
Membership

↓

Client Assignment

↓

Client
```

Portanto:

```text
Membership
=
autorização organizacional
```

e:

```text
Client Assignment
=
autorização específica de Cliente
```

As duas responsabilidades não deverão ser misturadas.

---

# Definition of Done

Uma tabela ou operação protegida será considerada pronta quando:

- RLS estiver ativa;
- Policies estiverem definidas;
- isolamento entre Organizations estiver garantido;
- Membership ACTIVE for obrigatório quando aplicável;
- roles forem validadas;
- MEMBER respeitar Client Assignment para Clientes;
- `organization_id` não for confiado ao frontend;
- `client_id` não for tratado como prova de autorização;
- acesso por URL direta não contornar segurança;
- Queries não vazarem registros;
- pesquisa e filtros não vazarem registros;
- Activity Logs não puderem ser criados diretamente pelo utilizador;
- Activity Logs não expuserem entidades não autorizadas;
- Storage privado respeitar autorização;
- RPCs privilegiadas validarem `auth.uid()`;
- RPCs validarem Profile;
- RPCs validarem Membership;
- RPCs resolverem Organization internamente;
- RPCs validarem Organization Status;
- RPCs validarem role;
- RPCs validarem Client Assignment quando aplicável;
- RPCs utilizarem `SET search_path = ''`;
- objetos acessados por RPC utilizarem schema explícito;
- `EXECUTE` estiver revogado de `PUBLIC`;
- `EXECUTE` estiver revogado de `anon`;
- operações auditadas forem atômicas quando exigido;
- falhas transacionais resultarem em rollback integral;
- todos os testes de autorização aplicáveis estiverem aprovados.