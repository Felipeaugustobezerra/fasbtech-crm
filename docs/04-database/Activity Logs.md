# Activity Logs

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

Este documento define a estratégia oficial de auditoria e rastreabilidade do FASBtech CRM.

O Activity Log é responsável por registrar operações relevantes realizadas no sistema.

Seu objetivo é permitir identificar:

- quem executou uma operação;
- quando a operação ocorreu;
- em qual Organization ocorreu;
- qual entidade foi afetada;
- qual registro foi afetado;
- qual ação foi executada;
- informações complementares necessárias à auditoria.

Todos os módulos do MVP deverão utilizar a mesma infraestrutura centralizada.

---

# Fonte da Verdade

Este documento deverá permanecer alinhado com:

```text
PRD v3.0

↓

MVP Scope v3.0

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
```

As regras de persistência transacional seguem:

```text
ADR-002 — Estratégia de Persistência e Transações
```

---

# Princípio Central

Existe apenas uma infraestrutura de auditoria para todo o CRM.

Tabela oficial:

```text
activity_logs
```

Não deverão ser criadas tabelas específicas como:

```text
client_activities
demand_activities
contract_activities
financial_activities
user_activities
```

Toda auditoria deverá utilizar:

```text
activity_logs
```

---

# Activity Log não é Histórico de Domínio

Activity Logs representam auditoria.

Eles não deverão substituir dados funcionais do domínio.

Exemplo:

```text
Status atual da Demanda
```

deverá existir na própria Demanda.

O Activity Log poderá registrar:

```text
Status alterado

OPEN
→
IN_PROGRESS
```

mas não será a fonte primária do Status atual.

---

# Estrutura Conceitual

A tabela deverá possuir conceitualmente:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---:|---|
| id | UUID | Sim | Identificador único |
| organization_id | UUID | Sim | Organization proprietária do evento |
| user_id | UUID | Quando aplicável | Utilizador responsável pela ação |
| entity_type | TEXT | Sim | Tipo lógico da entidade afetada |
| entity_id | UUID | Sim | Identificador lógico do registro afetado |
| action | TEXT | Sim | Ação realizada |
| metadata | JSONB | Não | Informações complementares |
| created_at | TIMESTAMPTZ | Sim | Data e hora do evento |

A estrutura física definitiva pertence à Migration correspondente.

---

# organization_id

Representa a Organization na qual o evento ocorreu.

Deverá possuir relação com:

```text
organizations.id
```

O `organization_id` não deverá ser fornecido pelo frontend como fonte confiável.

Ele deverá ser resolvido internamente através do contexto autorizado.

---

# user_id

Representa o utilizador responsável pela operação quando existir um ator autenticado.

Deverá estar relacionado à identidade correspondente da aplicação.

Conceitualmente:

```text
auth.uid()

↓

Profile

↓

Activity Log
```

Quando a operação for executada por um utilizador autenticado, o `user_id` deverá ser determinado internamente.

Nunca confiar em:

```text
user_id
```

enviado pela interface.

---

# Eventos sem Utilizador Direto

A infraestrutura deverá permitir evolução para operações internas do sistema que eventualmente não possuam um utilizador humano como ator direto.

Exemplo futuro:

```text
processo interno

↓

evento automático

↓

Activity Log
```

A necessidade concreta desses eventos será definida somente quando existirem funcionalidades automáticas correspondentes.

O MVP não deverá criar atores artificiais apenas para preencher `user_id`.

---

# entity_type

`entity_type` identifica o domínio lógico da entidade auditada.

Valores deverão ser controlados pela aplicação e pelo banco conforme a estratégia definida na Migration.

Tipos esperados ao longo do MVP incluem:

```text
ORGANIZATION
PROFILE
MEMBERSHIP
CLIENT
CLIENT_ASSIGNMENT
DEMAND
FINANCIAL_ENTRY
FINANCIAL_GOAL
CONTRACT
CONTRACT_TEMPLATE
DOCUMENT
```

Novos tipos poderão ser introduzidos somente quando novas entidades entrarem oficialmente no produto.

---

# entity_id

`entity_id` identifica o registro afetado.

Exemplo:

```text
entity_type = CLIENT
entity_id   = <UUID do Cliente>
```

---

# Relação Polimórfica

Activity Logs utilizam relacionamento lógico polimórfico.

Portanto:

```text
entity_type

+

entity_id
```

identificam a entidade relacionada.

Não deverão existir Foreign Keys específicas como:

```text
client_id
demand_id
contract_id
financial_entry_id
```

dentro da tabela `activity_logs`.

---

# Integridade do entity_id

Como o relacionamento é polimórfico, `entity_id` não possuirá uma Foreign Key diferente para cada possível entidade.

A validade da entidade deverá ser garantida pelo fluxo que cria o Activity Log.

Quando o Log fizer parte de uma operação transacional:

```text
Validar entidade

↓

Alterar entidade

↓

Criar Activity Log
```

deverão ocorrer dentro da mesma operação autorizada.

---

# action

`action` representa a ação realizada.

Ações deverão possuir nomenclatura consistente.

Domínio inicial conceitual:

```text
CREATED
UPDATED
ARCHIVED
STATUS_CHANGED
ASSIGNED
UNASSIGNED
ROLE_CHANGED
SENT
GENERATED
SIGNED
CANCELED
```

Nem toda entidade utilizará todas essas ações.

A lista poderá evoluir conforme os módulos forem implementados.

---

# Regra para Actions

Evitar criar uma Action diferente para cada campo simples.

Exemplo desnecessário:

```text
PHONE_CHANGED
EMAIL_CHANGED
ADDRESS_CHANGED
```

Quando uma alteração comum puder ser representada adequadamente por:

```text
UPDATED
```

e seus detalhes permanecerem no:

```text
metadata
```

Ações específicas deverão ser utilizadas quando a operação possuir significado relevante no domínio.

---

# Metadata

`metadata` contém informações complementares sobre a operação.

Tipo:

```text
JSONB
```

Exemplo:

```json
{
  "field": "status",
  "old": "OPEN",
  "new": "IN_PROGRESS"
}
```

Outro exemplo:

```json
{
  "role_before": "MEMBER",
  "role_after": "ADMIN"
}
```

---

# Regras de Metadata

Metadata deverá conter apenas informações necessárias à auditoria.

Não deverá ser utilizada como armazenamento paralelo da entidade.

Evitar armazenar:

- senhas;
- tokens;
- secrets;
- cookies;
- credenciais;
- dados técnicos sensíveis;
- conteúdo desnecessário de documentos;
- payload completo de formulários sem necessidade.

---

# Dados Sensíveis

Activity Logs não deverão registrar segredos ou credenciais.

Nunca armazenar em `metadata`:

```text
password
access_token
refresh_token
service_role_key
API keys
session cookies
credentials
```

---

# Imutabilidade

Activity Logs são imutáveis.

Após sua criação:

```text
UPDATE
```

não deverá ser permitido.

Também não deverá existir:

```text
DELETE
```

através do fluxo normal da aplicação.

---

# Regra de Criação

Utilizadores autenticados não poderão inserir Activity Logs diretamente.

Fluxo proibido:

```text
Frontend

↓

INSERT activity_logs
```

ou:

```text
Mutation independente

↓

activity_logs
```

quando o evento fizer parte de uma operação auditável transacional.

---

# Persistência Transacional

Quando uma operação for definida como auditável e exigir atomicidade, a alteração principal e o Activity Log deverão pertencer à mesma transação.

Fluxo:

```text
BEGIN

↓

Validar autorização

↓

Executar mutação principal

↓

Registrar Activity Log

↓

COMMIT
```

Caso qualquer etapa falhe:

```text
ROLLBACK
```

Nenhuma alteração parcial poderá permanecer persistida.

---

# Operação Auditável

Uma operação auditável não deverá ser considerada concluída se o Activity Log obrigatório falhar.

Exemplo:

```text
Criar Cliente
        +
Activity Log
```

Se a criação do Log falhar:

```text
Cliente também não deverá ser criado
```

quando a operação possuir contrato de atomicidade.

---

# RPCs Transacionais

Quando Activity Log precisar ocorrer na mesma transação da operação principal, deverá ser utilizado o mecanismo transacional oficial.

Normalmente:

```text
Server Action

↓

Service

↓

RPC PostgreSQL

↓

Mutação

+

Activity Log
```

RPCs privilegiadas deverão seguir:

```text
ADR-002

+

RLS v3.0
```

---

# Escritas Não Auditáveis

Nem toda alteração técnica ou operacional precisa obrigatoriamente gerar Activity Log.

A necessidade de auditoria deverá ser determinada por:

- Business Rules;
- Functional Requirements;
- regras específicas do módulo;
- risco da operação.

Não deverão ser criados Logs apenas para gerar volume sem valor de auditoria.

---

# Segurança

A tabela:

```text
activity_logs
```

deverá possuir RLS ativa.

---

# SELECT

A leitura deverá respeitar:

- autenticação;
- Membership;
- Organization;
- role;
- autorização da entidade relacionada quando aplicável.

Possuir acesso à Organization não significa automaticamente que todo utilizador poderá visualizar todos os Logs.

---

# OWNER

OWNER poderá visualizar Activity Logs da própria Organization conforme as funcionalidades administrativas disponibilizadas.

---

# ADMIN

ADMIN poderá visualizar Activity Logs autorizados conforme as regras administrativas do módulo.

---

# MEMBER

MEMBER não deverá possuir acesso irrestrito a todos os Activity Logs da Organization.

Quando um Log estiver relacionado a um Cliente ou entidade derivada de Cliente:

```text
Activity Log

↓

Entidade relacionada

↓

Cliente correspondente

↓

MEMBER possui autorização?

├── Sim → acesso poderá ser permitido
└── Não → acesso negado
```

---

# Data Leakage

Activity Logs não poderão ser utilizados para descobrir dados que o utilizador não teria autorização para visualizar pela entidade original.

Exemplo:

```text
MEMBER não possui acesso ao Cliente C
```

Portanto, ele não poderá descobrir através dos Logs:

- nome do Cliente;
- existência de determinada Demanda;
- alterações realizadas;
- contrato;
- movimentações;
- documentos;
- membros associados;

relacionados ao Cliente C.

---

# INSERT

INSERT direto por:

```text
authenticated
```

deverá ser negado.

Logs deverão ser criados somente por mecanismos oficiais da aplicação.

Exemplos:

- RPC transacional autorizada;
- função privilegiada oficialmente documentada.

---

# UPDATE

Negado.

```text
Activity Logs são imutáveis.
```

---

# DELETE

Negado.

Activity Logs não deverão ser removidos pelo fluxo normal da aplicação.

---

# Foundation — Sprint 01

A Foundation deverá estabelecer:

```text
activity_logs
```

como infraestrutura compartilhada.

Deverá incluir:

- tabela base;
- RLS;
- Policies;
- índices necessários;
- imutabilidade;
- mecanismo seguro de criação;
- suporte às operações auditáveis da Foundation.

---

# Eventos da Foundation

Eventos relevantes poderão incluir, conforme implementação e regras correspondentes:

```text
ORGANIZATION
MEMBERSHIP
PROFILE
```

Exemplos de operações auditáveis:

```text
Membership alterado

Role alterada

Status do Membership alterado
```

O Bootstrap deverá seguir suas regras próprias de inicialização e auditoria definidas pela arquitetura correspondente.

---

# Sprint 02 — Clientes & Acessos

A Sprint 02 deverá utilizar Activity Logs para operações relevantes de Clientes e Acessos.

---

# Eventos de Clientes

Deverão ser auditados quando definidos pelas regras oficiais:

```text
Cliente criado
Cliente atualizado
Cliente arquivado
```

Representação:

```text
entity_type = CLIENT
```

Actions aplicáveis:

```text
CREATED
UPDATED
ARCHIVED
```

---

# Eventos de Client Assignments

Alterações de autorização por Cliente são operações relevantes de segurança.

Deverão ser auditadas.

Exemplos:

```text
Utilizador associado a Cliente

Utilizador removido de Cliente
```

Representação:

```text
entity_type = CLIENT_ASSIGNMENT
```

Actions aplicáveis:

```text
ASSIGNED
UNASSIGNED
```

---

# Eventos de Membership

Alterações relevantes em utilizadores internos deverão ser auditadas quando implementadas.

Exemplos:

```text
Role alterada

Membership suspenso

Membership reativado
```

Representação:

```text
entity_type = MEMBERSHIP
```

---

# Alteração de Role

Alterações de:

```text
OWNER
ADMIN
MEMBER
```

deverão possuir rastreabilidade.

Exemplo:

```text
entity_type = MEMBERSHIP
action      = ROLE_CHANGED
```

Metadata poderá registrar:

```json
{
  "old": "MEMBER",
  "new": "ADMIN"
}
```

---

# Sprint 03 — Demandas

Quando implementada, a Sprint 03 deverá auditar operações relevantes de Demandas.

Exemplos conceituais:

```text
Demanda criada
Demanda atualizada
Status alterado
Responsável adicionado
Responsável removido
Demanda arquivada
```

Representação principal:

```text
entity_type = DEMAND
```

---

# Sprint 04 — Financeiro

Quando implementada, a Sprint 04 deverá registrar operações financeiras relevantes.

Exemplos:

```text
Movimentação criada
Movimentação alterada
Movimentação arquivada/cancelada quando aplicável
Meta criada
Meta alterada
```

A auditoria financeira deverá evitar armazenar informações sensíveis desnecessárias em metadata.

---

# Sprint 05 — Contratos

Quando implementada, a Sprint 05 deverá registrar eventos relevantes do ciclo contratual.

Exemplos:

```text
Contrato criado
Contrato gerado
Contrato enviado
Contrato marcado como assinado
Contrato cancelado
```

Actions correspondentes poderão incluir:

```text
CREATED
GENERATED
SENT
SIGNED
CANCELED
```

---

# Documentos

Operações relevantes sobre documentos poderão ser auditadas quando definido pelas regras do módulo.

Exemplos:

```text
Documento anexado

Documento substituído quando permitido

Documento arquivado
```

A auditoria não deverá armazenar o conteúdo binário do documento.

---

# Dashboard

Dashboard não deverá gerar Activity Logs apenas por consultas ou visualização normal.

Exemplo:

```text
Abrir Dashboard
```

não exige Activity Log operacional por padrão.

O Dashboard consome Logs apenas quando informações de atividades recentes fizerem parte da interface autorizada.

---

# Atividades Recentes

Activity Logs poderão alimentar uma área de:

```text
Atividades Recentes
```

quando isso fizer parte da interface.

Essa visualização deverá continuar respeitando:

- Organization;
- role;
- autorização por Cliente;
- autorização do módulo.

---

# Estrutura de Auditoria

Fluxo conceitual:

```text
Organization
    │
    └── Activity Logs
            │
            ├── CLIENT
            ├── CLIENT_ASSIGNMENT
            ├── MEMBERSHIP
            ├── DEMAND
            ├── FINANCIAL_ENTRY
            ├── CONTRACT
            └── DOCUMENT
```

A relação é lógica.

Não representa Foreign Keys específicas para cada entidade.

---

# Ownership

Todo Activity Log pertence à mesma Organization do contexto operacional da ação.

Exemplo:

```text
Client.organization_id

=

ActivityLog.organization_id
```

para uma operação auditada sobre Cliente.

Uma RPC deverá garantir essa consistência internamente.

---

# Utilizador Responsável

Quando existir um utilizador autenticado responsável:

```text
ActivityLog.user_id

=

auth.uid()
```

conforme a identidade resolvida pelo backend.

Nunca aceitar outro `user_id` apenas porque ele foi enviado no formulário.

---

# Metadata e Antes/Depois

Metadata poderá registrar valores anteriores e posteriores quando isso possuir valor de auditoria.

Exemplo:

```json
{
  "changes": {
    "status": {
      "old": "ACTIVE",
      "new": "ARCHIVED"
    }
  }
}
```

Não é obrigatório registrar snapshots completos de cada alteração.

---

# Contratos e Snapshot

O snapshot contratual pertence ao domínio de:

```text
contracts
```

Não ao Activity Log.

Activity Log poderá registrar:

```text
Contrato gerado
```

mas o conteúdo histórico do Contrato deverá permanecer no próprio domínio contratual.

---

# Error Handling

Falhas na criação de um Activity Log obrigatório deverão ser tratadas como falha da operação transacional correspondente.

A interface não deverá receber detalhes internos do banco.

Fluxo:

```text
Activity Log falha

↓

ROLLBACK

↓

Erro seguro para aplicação
```

---

# Performance

A tabela poderá crescer continuamente.

Deverão existir índices adequados para os padrões reais de consulta.

Possíveis critérios de consulta incluem:

- Organization;
- entidade;
- utilizador;
- ação;
- data.

A definição concreta dos índices pertence à Migration.

Não deverão ser criados índices especulativos sem padrão de consulta real.

---

# Ordenação

Históricos de atividades deverão utilizar normalmente:

```text
created_at DESC
```

quando o objetivo for apresentar os eventos mais recentes primeiro.

---

# Paginação

Listagens de Activity Logs deverão utilizar paginação no banco.

Nunca carregar todo o histórico para paginar no navegador.

---

# Retenção

O MVP não define política automática de expiração ou remoção de Activity Logs.

Portanto:

```text
não criar rotina automática de exclusão
```

sem decisão formal de produto, segurança ou conformidade.

---

# Service Role

Service Role não deverá ser utilizada pelo fluxo normal para inserir Activity Logs.

O mecanismo padrão continuará sendo:

```text
RPC / função autorizada

↓

activity_logs
```

conforme arquitetura oficial.

---

# Mass Assignment

Activity Logs nunca deverão ser construídos diretamente a partir de um payload não confiável.

Exemplo proibido:

```ts
insert({
  ...formData
})
```

Campos como:

```text
organization_id
user_id
entity_type
entity_id
action
```

deverão ser determinados ou validados pelo mecanismo responsável pela auditoria.

---

# Testes

A infraestrutura de Activity Logs deverá possuir testes para:

- criação correta;
- Organization correta;
- utilizador correto;
- entidade correta;
- Action correta;
- Metadata correta quando aplicável;
- `created_at` automático;
- impossibilidade de INSERT direto;
- impossibilidade de UPDATE;
- impossibilidade de DELETE;
- isolamento entre Organizations;
- autorização por Cliente;
- Data Leakage;
- atomicidade;
- rollback.

---

# Teste de Atomicidade

Cenário:

```text
Mutação principal funciona

Activity Log falha
```

Resultado esperado:

```text
ROLLBACK completo
```

---

# Teste Inverso

Cenário:

```text
Mutação principal falha
```

Resultado esperado:

```text
Activity Log também não é criado
```

---

# Teste de Organization

```text
Utilizador Organization A

↓

Activity Log Organization B
```

Resultado:

```text
ACESSO NEGADO
```

---

# Teste de MEMBER

```text
MEMBER

↓

Activity Log de Cliente não autorizado
```

Resultado:

```text
ACESSO NEGADO
```

---

# Teste de INSERT Direto

```text
authenticated

↓

INSERT activity_logs
```

Resultado:

```text
NEGADO
```

---

# Teste de UPDATE

```text
authenticated

↓

UPDATE activity_logs
```

Resultado:

```text
NEGADO
```

---

# Teste de DELETE

```text
authenticated

↓

DELETE activity_logs
```

Resultado:

```text
NEGADO
```

---

# Checklist de Operação Auditável

Antes de implementar uma operação auditável verificar:

- qual entidade está sendo auditada?
- qual Action será utilizada?
- qual `entity_id` será registrado?
- qual Organization será registrada?
- quem é o ator?
- Metadata realmente é necessária?
- existem dados sensíveis na Metadata?
- mutação e Log precisam de atomicidade?
- a RPC correspondente é necessária?
- o utilizador poderá visualizar esse Log posteriormente?
- a RLS impede Data Leakage?

---

# Checklist da Infraestrutura

Antes de considerar `activity_logs` pronta verificar:

- [ ] tabela criada;
- [ ] UUID configurado;
- [ ] `organization_id` protegido;
- [ ] `user_id` resolvido internamente quando aplicável;
- [ ] `entity_type` definido;
- [ ] `entity_id` definido;
- [ ] `action` definido;
- [ ] `metadata` opcional;
- [ ] `created_at` automático;
- [ ] RLS ativa;
- [ ] INSERT direto negado;
- [ ] UPDATE negado;
- [ ] DELETE negado;
- [ ] SELECT autorizado corretamente;
- [ ] MEMBER não acessa Logs de Clientes não autorizados;
- [ ] índices necessários definidos;
- [ ] testes de atomicidade aprovados;
- [ ] testes de rollback aprovados;
- [ ] testes de Data Leakage aprovados.

---

# Fora do Escopo

Não faz parte do MVP atual:

- interface avançada de auditoria;
- exportação completa de Logs;
- SIEM;
- análise automática de segurança;
- retenção configurável;
- compliance engine;
- trilha criptograficamente encadeada;
- event sourcing;
- tabelas de auditoria independentes por módulo.

Essas funcionalidades somente deverão ser consideradas após necessidade concreta.

---

# Decisões Oficiais

- existe uma única tabela central `activity_logs`;
- Activity Log representa auditoria, não estado atual das entidades;
- relacionamento com entidades é polimórfico;
- `entity_type + entity_id` identifica o recurso auditado;
- Activity Logs são imutáveis;
- INSERT direto por utilizadores autenticados é proibido;
- UPDATE é proibido;
- DELETE é proibido;
- operações auditáveis transacionais devem registrar mutação e Log atomicamente;
- Organization é resolvida internamente;
- ator autenticado é resolvido internamente;
- MEMBER não pode utilizar Activity Logs para contornar autorização por Cliente;
- Metadata não deverá armazenar segredos;
- o Dashboard não possui auditoria automática apenas por ser visualizado;
- todos os módulos reutilizam a mesma infraestrutura.

---

# Referências

Este documento deverá permanecer consistente com:

- PRD v3.0;
- MVP Scope v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- System Architecture v3.0;
- Module Architecture v3.0;
- Data Model v3.0;
- Organization and User Model v3.0;
- RLS v3.0;
- ADR-002;
- Migration 001;
- Migrations;
- Sprint 01;
- Sprint 02.

---

# Fonte da Verdade

A arquitetura oficial de auditoria é:

```text
Operação relevante

↓

Autorização

↓

Mutação

+

Activity Log

↓

Commit
```

Quando a operação exigir atomicidade:

```text
Mutação falha
        ou
Activity Log falha

↓

ROLLBACK COMPLETO
```

O modelo central é:

```text
activity_logs

├── organization_id
├── user_id
├── entity_type
├── entity_id
├── action
├── metadata
└── created_at
```

---

# Definition of Done

A infraestrutura de Activity Logs será considerada pronta quando:

- existir apenas uma estrutura central de auditoria;
- `activity_logs` estiver criada;
- todos os Logs pertencerem à Organization correta;
- o ator autenticado for determinado de forma confiável quando aplicável;
- `entity_type` e `entity_id` identificarem logicamente a entidade;
- Activity Logs forem imutáveis;
- INSERT direto estiver negado;
- UPDATE estiver negado;
- DELETE estiver negado;
- operações auditáveis utilizarem atomicidade quando exigida;
- falha no Activity Log causar rollback da mutação correspondente quando obrigatório;
- falha na mutação não produzir Activity Log falso;
- RLS impedir acesso entre Organizations;
- MEMBER não visualizar Logs relacionados a Clientes não autorizados;
- Activity Logs não causarem Data Leakage;
- Metadata não armazenar credenciais ou secrets;
- operações de Clientes e Acessos da Sprint 02 possuírem auditoria quando exigida;
- novas Sprints reutilizarem a mesma infraestrutura;
- todos os testes de segurança e atomicidade aplicáveis estiverem aprovados.