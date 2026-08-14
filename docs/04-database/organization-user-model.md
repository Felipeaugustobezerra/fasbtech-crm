# Organization and User Model

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

Este documento define como os utilizadores autenticados se relacionam com a Organization e como o modelo de autorização de utilizadores funciona no FASBtech CRM.

O modelo deverá permitir:

- uma única Organization operacional no MVP;
- múltiplos utilizadores internos;
- diferentes roles;
- controle de Membership;
- autorização por Cliente;
- isolamento seguro dos dados;
- evolução futura sem implementar SaaS multiempresa antecipadamente.

---

# Contexto Atual

No MVP v3.0:

- existe uma única Organization operacional;
- essa Organization representa a FASBtech;
- podem existir múltiplos utilizadores internos;
- todos os utilizadores operacionais pertencem à Organization através de Membership;
- os utilizadores possuem roles;
- MEMBER pode ser restrito aos Clientes aos quais estiver explicitamente associado;
- todos os dados operacionais pertencem à Organization.

A arquitetura poderá suportar múltiplas Organizations futuramente.

Entretanto:

```text
SaaS multiempresa
```

não faz parte do MVP atual.

---

# Princípio de Ownership

Os dados operacionais pertencem à:

```text
Organization
```

e não diretamente ao utilizador.

Fluxo principal:

```text
auth.users

↓

profiles

↓

organization_members

↓

organizations

↓

dados operacionais
```

A autorização poderá aplicar restrições adicionais.

Exemplo:

```text
Organization

↓

Cliente

↓

Utilizadores autorizados
```

Portanto:

```text
Organization
```

define o tenant proprietário dos dados.

Enquanto:

```text
Client Assignment
```

pode restringir quais Clientes determinados utilizadores podem acessar.

---

# Modelo Conceitual

```text
auth.users
    │
    │ 1:1
    ▼
profiles
    │
    │
    ▼
organization_members
    │
    ├──────────────────────────────┐
    │                              │
    ▼                              ▼
organizations              client_assignments
                                   │
                                   ▼
                                clients
```

---

# auth.users

Tabela gerenciada pelo Supabase Auth.

Responsável por:

- autenticação;
- e-mail de autenticação;
- senha;
- sessão;
- recuperação de acesso;
- identidade técnica do utilizador.

A aplicação nunca deverá armazenar senhas manualmente.

---

# profiles

Representa o perfil do utilizador dentro do domínio da aplicação.

Cada Profile corresponde a um utilizador autenticado.

---

## Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| id | UUID | Sim | Mesmo identificador de `auth.users.id` |
| full_name | VARCHAR(150) | Sim | Nome do utilizador |
| avatar_url | TEXT | Não | Referência do avatar |
| status | VARCHAR(30) | Sim | Estado do Profile |
| created_at | TIMESTAMPTZ | Sim | Data de criação |
| updated_at | TIMESTAMPTZ | Sim | Data de atualização |

---

## Regras

- `profiles.id` corresponde a `auth.users.id`;
- cada utilizador autenticado possui no máximo um Profile;
- Profile não determina sozinho quais dados o utilizador pode acessar;
- Profile não determina sozinho a role;
- autorização organizacional depende de Membership;
- autorização por Cliente pode depender de Client Assignment.

---

# Profile Status

Valores oficiais iniciais:

```text
ACTIVE
INACTIVE
```

Um Profile inativo não deverá possuir acesso operacional normal ao sistema.

---

# organizations

Representa uma empresa ou workspace dentro do CRM.

No MVP atual existirá apenas uma Organization operacional.

---

## Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| id | UUID | Sim | Identificador da Organization |
| name | VARCHAR(150) | Sim | Nome |
| slug | VARCHAR(100) | Sim | Identificador amigável e único |
| status | VARCHAR(30) | Sim | Estado |
| created_at | TIMESTAMPTZ | Sim | Data de criação |
| updated_at | TIMESTAMPTZ | Sim | Data de atualização |
| archived_at | TIMESTAMPTZ | Não | Data de arquivamento |

---

# Organization Inicial

A primeira Organization será:

```text
Name: FASBtech
Slug: fasbtech
Status: ACTIVE
```

Ela será criada pelo processo de Bootstrap oficial.

---

# Organization Status

Valores oficiais:

```text
ACTIVE
INACTIVE
ARCHIVED
```

Apenas uma Organization em estado operacional permitido poderá executar operações normais do CRM.

---

# organization_members

Representa a associação entre um utilizador e uma Organization.

Essa entidade é responsável pelo vínculo organizacional do utilizador.

---

## Responsabilidades

Membership determina:

- a qual Organization o utilizador pertence;
- estado do vínculo;
- role do utilizador dentro da Organization.

---

## Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| id | UUID | Sim | Identificador do Membership |
| organization_id | UUID | Sim | Organization relacionada |
| user_id | UUID | Sim | Utilizador/Profile relacionado |
| role | VARCHAR(30) | Sim | Role |
| status | VARCHAR(30) | Sim | Estado do Membership |
| created_at | TIMESTAMPTZ | Sim | Data de criação |
| updated_at | TIMESTAMPTZ | Sim | Data de atualização |
| archived_at | TIMESTAMPTZ | Não | Data de arquivamento |

---

# Relação do Membership com Profile

O campo:

```text
user_id
```

deverá identificar o utilizador da aplicação correspondente ao Profile.

Como:

```text
profiles.id = auth.users.id
```

o mesmo UUID representa a identidade autenticada e o Profile da aplicação.

Conceitualmente, a relação de domínio é:

```text
profiles

1

↓

N

organization_members
```

A definição física exata da Foreign Key deverá permanecer consistente com a Migration oficial.

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

# Roles

Os papéis oficiais iniciais do MVP são:

```text
OWNER
ADMIN
MEMBER
```

---

# OWNER

Representa o responsável principal pela Organization.

O OWNER possui acesso administrativo completo dentro do escopo do MVP.

Pode, conforme funcionalidades implementadas:

- acessar todos os Clientes;
- acessar os módulos administrativos;
- gerir dados da Organization;
- gerir utilizadores;
- gerir Memberships;
- gerir associações de Clientes;
- acessar Financeiro;
- acessar Contratos;
- executar operações administrativas autorizadas.

---

# Regra do OWNER

A Organization inicial deverá possuir pelo menos um:

```text
OWNER ACTIVE
```

No Bootstrap inicial, o primeiro utilizador autorizado será associado à FASBtech como:

```text
Role: OWNER
Status: ACTIVE
```

---

# ADMIN

Representa um utilizador administrativo.

Pode administrar funcionalidades conforme as permissões oficiais do sistema.

O ADMIN poderá, quando autorizado pelas regras do módulo:

- gerir Clientes;
- gerir associações de utilizadores;
- executar operações administrativas;
- acessar módulos permitidos.

ADMIN não deverá receber novas permissões implícitas que não estejam definidas pelos requisitos ou regras de negócio.

---

# MEMBER

Representa um utilizador operacional.

MEMBER faz parte do MVP atual.

Não é uma role futura.

Seu acesso será limitado conforme:

- Membership;
- Organization;
- associação aos Clientes;
- permissões específicas dos módulos.

---

# Regra Principal de MEMBER

Um MEMBER somente poderá acessar Clientes aos quais estiver explicitamente associado.

Exemplo:

```text
MEMBER João

├── Cliente A ✅
├── Cliente B ✅
└── Cliente C ❌
```

Conhecer o identificador do Cliente não concede autorização.

---

# Client Assignments

A Sprint 02 introduzirá a relação entre:

```text
organization_members

↕

clients
```

Essa relação será representada conceitualmente por:

```text
client_assignments
```

---

# Objetivo do Client Assignment

Client Assignment responde:

```text
Quais Clientes este utilizador pode acessar?
```

Enquanto Membership responde:

```text
A qual Organization este utilizador pertence e qual é sua role?
```

Essas responsabilidades não devem ser misturadas.

---

# Relação

Um Membership poderá possuir acesso a vários Clientes.

Um Cliente poderá possuir vários Memberships autorizados.

```text
organization_members

N

↕

N

clients
```

através de:

```text
client_assignments
```

---

# Regras de Client Assignment

1. O Membership deve pertencer à mesma Organization do Cliente.
2. Um MEMBER sem Client Assignment não deverá acessar o Cliente correspondente.
3. A associação não altera a role do utilizador.
4. A associação não altera o ownership do Cliente.
5. Remover a associação não remove o utilizador.
6. Remover a associação não remove o Cliente.
7. Alterações de associação deverão ser auditadas quando definido pelas regras do sistema.

---

# OWNER e Client Assignments

OWNER possui acesso administrativo completo aos Clientes da própria Organization.

O acesso do OWNER não deverá depender da existência de um Client Assignment individual para cada Cliente.

---

# ADMIN e Client Assignments

O comportamento do ADMIN deverá respeitar as regras de autorização aprovadas.

A existência ou necessidade de Client Assignment para ADMIN deverá ser determinada pelas regras oficiais do módulo.

Não deverão ser inventadas restrições adicionais fora dos documentos funcionais.

---

# MEMBER e Client Assignments

Para MEMBER:

```text
Membership ACTIVE

+

Client Assignment válido

=

Acesso operacional ao Cliente
```

quando o recurso estiver sujeito à autorização por Cliente.

---

# Áreas Sensíveis

Possuir acesso a um Cliente não significa possuir acesso irrestrito a todos os seus dados.

Especialmente:

```text
Financeiro
Contratos
```

deverão possuir autorização própria quando implementados.

Portanto:

```text
Client Assignment
≠
Acesso financeiro automático
```

e:

```text
Client Assignment
≠
Acesso automático a Contratos
```

---

# Organização Atual

No MVP existe uma única Organization operacional.

A Organization atual deverá ser derivada através da identidade autenticada e do Membership.

Fluxo:

```text
auth.uid()

↓

Profile

↓

organization_members

↓

Membership ACTIVE

↓

organization_id
```

A aplicação nunca deverá confiar em:

```text
organization_id
```

enviado pela interface para determinar autorização.

---

# Autorização Base

Para acessar um recurso operacional, o sistema deverá considerar:

```text
Utilizador autenticado

↓

Profile válido

↓

Membership ACTIVE

↓

Organization válida

↓

Role

↓

Client Assignment quando aplicável

↓

Permissão do módulo quando aplicável

↓

Recurso
```

---

# Regra de Segurança

A autenticação sozinha não concede acesso aos dados.

Exemplo incorreto:

```text
Utilizador está autenticado

↓

Pode acessar todos os Clientes
```

Exemplo correto:

```text
Utilizador autenticado

↓

Membership válido

↓

Organization válida

↓

Role válida

↓

Cliente autorizado quando aplicável

↓

Acesso
```

---

# Acesso por URL Direta

Ocultar um Cliente na interface não é mecanismo de segurança suficiente.

Um MEMBER sem autorização para determinado Cliente não poderá acessá-lo através de:

- URL direta;
- Query;
- Server Action;
- RPC;
- banco;
- Storage relacionado.

---

# Dados Operacionais

Os dados operacionais pertencem à Organization.

No MVP v3.0 incluem progressivamente:

```text
clients
demands
financial_entries
financial_goals
contract_templates
contracts
documents
notifications
activity_logs
```

Nem todas essas entidades são implementadas na Foundation.

Cada uma deverá ser introduzida apenas na Sprint correspondente.

---

# Clientes

Clientes pertencem diretamente à Organization.

Fluxo conceitual:

```text
Organization

↓

Clients
```

Eles não pertencem diretamente ao Membership.

Client Assignment apenas determina autorização.

---

# Demandas

Demandas pertencem a Clientes e à Organization correspondente.

Os responsáveis serão utilizadores internos autorizados conforme as regras do módulo.

---

# Financeiro

Movimentações financeiras pertencem à Organization.

Podem possuir Cliente relacionado quando aplicável.

A autorização financeira não deverá ser derivada somente de Client Assignment.

---

# Contratos

Contratos pertencem à Organization e a um Cliente.

O acesso deverá considerar as permissões específicas do módulo.

---

# Documentos

Documentos privados deverão respeitar a autorização da entidade relacionada.

Exemplo:

```text
MEMBER

↓

Documento de Cliente

↓

Client Assignment válido?

├── Sim → avaliar demais permissões
└── Não → negar
```

---

# Activity Logs

Activity Logs pertencem à Organization.

O acesso ao histórico deverá respeitar as mesmas regras de autorização aplicáveis ao contexto consultado.

Alterações relevantes em:

- Membership;
- role;
- Client Assignment;

deverão ser auditadas quando definido pelas regras de negócio.

---

# Regras de Negócio

1. Todo utilizador autenticado utilizado pelo CRM deverá possuir Profile válido.

2. Todo utilizador operacional deverá possuir Membership `ACTIVE`.

3. Todo Membership pertence a uma Organization.

4. Todo registro operacional deverá pertencer à Organization quando aplicável ao domínio.

5. O `organization_id` nunca poderá ser escolhido arbitrariamente pelo frontend como fonte de autorização.

6. Uma Organization `INACTIVE` ou `ARCHIVED` não deverá permitir operações operacionais normais.

7. Membership `INVITED`, `SUSPENDED` ou `ARCHIVED` não concede acesso operacional normal.

8. Um utilizador não poderá possuir Membership duplicado para a mesma Organization.

9. A Organization inicial deverá possuir pelo menos um OWNER ativo.

10. Registros operacionais não deverão ser movidos entre Organizations através das operações normais do CRM.

11. MEMBER deverá respeitar Client Assignments quando acessar Clientes.

12. Um Client Assignment somente poderá relacionar Membership e Cliente pertencentes à mesma Organization.

13. Client Assignment não altera ownership do Cliente.

14. Client Assignment não concede automaticamente acesso a Financeiro.

15. Client Assignment não concede automaticamente acesso a Contratos.

16. Remover um Client Assignment deverá retirar o acesso correspondente sem apagar histórico.

---

# Constraints Esperadas

# profiles

Esperado:

- Primary Key em `id`;
- relação com `auth.users.id`;
- `full_name` não vazio;
- `status` dentro do domínio permitido;
- timestamps apropriados.

---

# organizations

Esperado:

- Primary Key em `id`;
- `slug` único;
- `name` não vazio;
- `status` dentro do domínio permitido;
- timestamps apropriados.

---

# organization_members

Esperado:

- Primary Key em `id`;
- relação com Organization;
- relação com utilizador/Profile;
- combinação única entre Organization e utilizador;
- `role` dentro do domínio permitido;
- `status` dentro do domínio permitido;
- timestamps apropriados.

---

# client_assignments

A estrutura física será definida pela Migration da Sprint 02.

Conceitualmente deverá garantir:

- Membership válido;
- Cliente válido;
- mesma Organization;
- ausência de associação duplicada;
- rastreabilidade adequada.

---

# Estratégia de Exclusão

Entidades administrativas e operacionais que exigem preservação histórica deverão utilizar arquivamento quando definido pelo domínio.

Não realizar exclusão física através do fluxo normal quando isso comprometer:

- auditoria;
- integridade;
- histórico;
- relacionamentos.

Exclusões físicas, quando necessárias, deverão ocorrer somente por procedimento administrativo controlado.

---

# Row Level Security

As Policies detalhadas pertencem ao documento:

```text
docs/03-architecture/rls.md
```

Princípio organizacional:

```text
Um utilizador somente acessa dados da Organization
na qual possui Membership válido.
```

A partir da Sprint 02, para MEMBER:

```text
Membership válido

+

Client Assignment válido

=

acesso ao Cliente
```

quando a autorização por Cliente for aplicável.

---

# Bootstrap

O Bootstrap inicial deverá criar de forma segura:

```text
Profile

↓

Organization FASBtech

↓

Membership OWNER ACTIVE
```

O Bootstrap é responsável apenas pela inicialização da Foundation.

Não deverá criar automaticamente:

- Clientes;
- Demandas;
- Financeiro;
- Contratos.

---

# Fluxo do Utilizador Inicial

```text
Utilizador criado no Supabase Auth

↓

Login

↓

Bootstrap

↓

Profile

↓

Organization FASBtech

↓

Membership
Role OWNER
Status ACTIVE

↓

Acesso administrativo
```

---

# Fluxo de Novo Utilizador Interno

A gestão completa de convites poderá evoluir posteriormente.

No MVP, qualquer novo utilizador operacional deverá possuir:

```text
auth.users

↓

Profile

↓

Membership ACTIVE

↓

Role
```

Para MEMBER acessar Clientes:

```text
Membership

↓

Client Assignment

↓

Cliente permitido
```

O mecanismo concreto de criação ou convite deverá seguir a funcionalidade realmente implementada e não deverá ser inventado por este documento.

---

# Multiempresa

O modelo permanece preparado conceitualmente para várias Organizations.

Entretanto, o MVP utiliza:

```text
1 Organization operacional
```

Não implementar antecipadamente:

- seletor de Organization;
- troca de tenant;
- billing por Organization;
- planos por Organization;
- limites SaaS.

---

# Evoluções Futuras

Poderão ser avaliados futuramente:

- convites completos por e-mail;
- múltiplas Organizations;
- troca de Organization ativa;
- permissões granulares;
- roles customizadas;
- equipes;
- transferência de ownership;
- desativação administrativa de utilizadores;
- billing por Organization;
- limites por plano.

Essas evoluções não fazem parte do MVP atual.

---

# Decisões Oficiais

- dados pertencem à Organization, não diretamente ao utilizador;
- `auth.users` permanece responsável pela autenticação;
- `profiles` representa o utilizador no domínio da aplicação;
- `organization_members` representa vínculo, role e estado dentro da Organization;
- múltiplos utilizadores internos fazem parte do MVP;
- `OWNER`, `ADMIN` e `MEMBER` fazem parte do MVP;
- a Organization atual é derivada no servidor;
- `organization_id` não é confiado ao frontend;
- Clientes pertencem à Organization;
- `client_assignments` controla autorização operacional por Cliente;
- Client Assignment não altera ownership;
- MEMBER depende de associação ao Cliente quando essa restrição for aplicável;
- Financeiro e Contratos possuem restrições adicionais;
- SaaS multiempresa não é implementado no MVP atual.

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
- RLS;
- Activity Logs;
- Bootstrap;
- Migration 001;
- Migrations;
- Sprint 01;
- Sprint 02.

---

# Fonte da Verdade

O modelo oficial de utilizador e autorização é:

```text
auth.users

↓

profiles

↓

organization_members

↓

Organization
```

Para recursos restritos por Cliente:

```text
organization_members

↓

client_assignments

↓

clients
```

Membership responde:

```text
Este utilizador pertence à Organization?
Qual é sua role?
Qual é o estado do vínculo?
```

Client Assignment responde:

```text
Este utilizador possui acesso a este Cliente?
```

Essas responsabilidades não deverão ser misturadas.

---

# Definition of Done

Este modelo será considerado implementado quando:

- `profiles` existir;
- `organizations` existir;
- `organization_members` existir;
- o utilizador inicial estiver associado à FASBtech como OWNER ACTIVE;
- múltiplos utilizadores internos forem suportados pela estrutura;
- roles `OWNER`, `ADMIN` e `MEMBER` estiverem definidas;
- a Organization atual puder ser derivada de forma segura;
- Membership fizer parte da autorização;
- RLS utilizar o modelo organizacional;
- Bootstrap estiver implementado;
- a Sprint 02 puder introduzir `client_assignments` sem alterar o ownership central;
- MEMBER puder ser restringido aos Clientes autorizados;
- associação a Cliente não conceder automaticamente acesso a Financeiro ou Contratos;
- acesso direto por identificador não contornar autorização;
- migrations e documentação diretamente relacionada estiverem sincronizadas.