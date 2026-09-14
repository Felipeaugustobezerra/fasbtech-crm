# Financial

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟢 Contrato físico aprovado e ainda não implementado

---

## Última atualização

Setembro de 2026

---

# Objetivo

Este documento registra o contrato físico do módulo Financeiro para a Sprint 04.

Ele define, antes da migration:

- tabelas, colunas, tipos e defaults;
- domínios e constraints;
- representação monetária;
- integridade de realização;
- relação opcional com Cliente;
- arquivamento e autoria;
- autorização OWNER-only;
- RLS, Grants e fronteiras RPC;
- Activity Logs atômicos;
- resumo financeiro derivado;
- pesquisa, filtros, ordenação e paginação;
- índices mínimos;
- cobertura física futura;
- itens deliberadamente fora do escopo.

Nenhum SQL, migration, código ou teste é criado por este documento.

---

# Fontes Normativas

Este contrato permanece subordinado a:

- PRD v3.0;
- MVP Scope v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- System Architecture;
- Module Architecture;
- Data Model;
- Organization and User Model;
- RLS;
- Activity Logs;
- Migrations;
- ADR-002;
- Conventions;
- Testing Strategy;
- Sprint 04.

Também foram inspecionadas as migrations reais de Foundation, Clientes & Acessos e Demandas para preservar os padrões já implementados de UUID, autoria por Profile, integridade entre Organizations, RLS, Grants, RPCs privilegiadas e auditoria.

Em caso de conflito futuro, a implementação deverá parar e sincronizar as fontes oficiais.

---

# Escopo Físico Congelado

A migration da Sprint 04 deverá criar exclusivamente as entidades financeiras:

```text
financial_entries
financial_goals
```

Também deverá implementar somente a infraestrutura necessária para:

- constraints e Foreign Keys deste contrato;
- triggers privados de integridade e `updated_at` quando necessários;
- RLS e Grants mínimos;
- helpers privados de autorização OWNER-only;
- cinco RPCs transacionais de escrita;
- uma RPC de leitura agregada;
- Activity Logs financeiros na infraestrutura central existente;
- índices sustentados pelas leituras aprovadas.

---

# Fora do Escopo Físico

Não criar:

```text
financial_categories
financial_documents
documents
currency
exchange_rate
demand_id
contract_id
```

Também não criar:

- multi-currency ou conversão cambial;
- catálogo de categorias;
- recorrência automática;
- cron, scheduler ou worker;
- cobrança ou integração bancária;
- restore de movimentação;
- delete físico operacional;
- totais, saldos ou progresso persistidos;
- infraestrutura do Dashboard consolidado;
- tabela de Activity Log específica para Financeiro.

---

# Modelo Relacional

```text
organizations
    │
    ├── financial_entries ── 0..1 clients
    ├── financial_goals
    └── activity_logs, por relação polimórfica
```

Uma Organization possui `0..N` movimentações financeiras e no máximo uma meta por combinação de ano e mês.

A relação com Cliente é opcional e nunca concede autorização financeira.

---

# Convenções Físicas

- Primary Keys próprias utilizam UUID gerado pelo banco;
- valores monetários utilizam `NUMERIC(12,2)`;
- datas financeiras civis utilizam `DATE`;
- timestamps técnicos utilizam `TIMESTAMPTZ`;
- domínios fechados utilizam `TEXT` com constraints, seguindo o padrão atual;
- timestamps de criação e atualização possuem default do banco;
- `updated_at` reutiliza o mecanismo privado já existente;
- autoria referencia `profiles`;
- nomes físicos utilizam inglês e `snake_case`;
- campos opcionais textuais vazios são normalizados para `NULL` pela RPC;
- nenhuma coluna de autorização é determinada livremente pelo browser.

---

# Tabela `financial_entries`

## Responsabilidade

Representar uma entrada ou saída financeira operacional da Organization.

## Colunas

| Coluna | Tipo | Obrigatória | Default | Responsabilidade |
|---|---|---:|---|---|
| `id` | UUID | Sim | UUID gerado pelo banco | Identificador da movimentação |
| `organization_id` | UUID | Sim | Nenhum | Organization proprietária, resolvida internamente |
| `client_id` | UUID | Não | `NULL` | Cliente opcional da mesma Organization |
| `type` | TEXT | Sim | Nenhum | `INCOME` ou `EXPENSE` |
| `status` | TEXT | Sim | `PENDING` | Estado financeiro |
| `payment_nature` | TEXT | Sim | `ONE_TIME` | Natureza informativa |
| `description` | TEXT | Sim | Nenhum | Descrição operacional |
| `category` | TEXT | Não | `NULL` | Categoria livre normalizada |
| `amount` | NUMERIC(12,2) | Sim | Nenhum | Valor monetário positivo em EUR |
| `reference_date` | DATE | Sim | Nenhum | Data operacional do lançamento |
| `due_date` | DATE | Não | `NULL` | Vencimento quando aplicável |
| `realized_date` | DATE | Não | `NULL` | Data efetiva de pagamento ou recebimento |
| `notes` | TEXT | Não | `NULL` | Observações opcionais |
| `created_by` | UUID | Sim | Determinado pela RPC | Profile que criou a movimentação |
| `updated_by` | UUID | Sim | Determinado pela RPC | Profile da última alteração |
| `created_at` | TIMESTAMPTZ | Sim | Instante atual do banco | Criação |
| `updated_at` | TIMESTAMPTZ | Sim | Instante atual do banco | Última alteração |
| `archived_at` | TIMESTAMPTZ | Não | `NULL` | Arquivamento lógico |

## Primary Key e Foreign Keys

- `id` é a Primary Key;
- `organization_id` referencia `organizations.id`;
- `created_by` referencia `profiles.id`;
- `updated_by` referencia `profiles.id`;
- `(client_id, organization_id)` referencia `(clients.id, clients.organization_id)`;
- a constraint única já existente em `clients (id, organization_id)` sustenta a Foreign Key composta;
- `client_id = NULL` é válido e representa movimento interno sem Cliente.

Não há delete operacional que exija cascade. As relações deverão preservar histórico e utilizar o comportamento restritivo padrão das Foreign Keys.

## Campos Imutáveis

Após a criação, são imutáveis:

```text
id
organization_id
created_by
created_at
```

Essa integridade deverá ser protegida no banco, além do mapeamento explícito das RPCs.

`client_id` não é campo de ownership e possui regra própria de edição.

---

# Tipo da Movimentação

Domínio físico:

```text
INCOME
EXPENSE
```

Não existe default.

`INCOME` representa entrada e `EXPENSE` representa saída. O tipo é armazenado independentemente do valor, que permanece sempre positivo.

---

# Status e Realização

Domínio físico:

```text
PENDING
REALIZED
CANCELED
```

Default:

```text
PENDING
```

Integridade obrigatória:

| Status | Regra de `realized_date` | Participa de agregados realizados |
|---|---|---:|
| `PENDING` | Deve ser `NULL` | Não |
| `REALIZED` | Deve ser preenchida | Sim |
| `CANCELED` | Pode ser `NULL` ou preenchida | Não |

A constraint deverá impedir `PENDING` com data preenchida e `REALIZED` sem data.

`CANCELED` preserva a possibilidade de manter a data histórica de um movimento anteriormente realizado. Independentemente dessa data, somente `status = REALIZED` participa de agregados.

Não existe máquina rígida de transições.

---

# Natureza do Pagamento

Domínio físico:

```text
ONE_TIME
RECURRING
```

Default:

```text
ONE_TIME
```

`RECURRING` é informação classificatória. Não cria lançamentos futuros nem dispara automação.

---

# Descrição, Categoria e Notas

## `description`

- obrigatória;
- normalizada com trim pela RPC;
- armazenada sem espaços externos;
- não pode ficar vazia após trim;
- não possui limite arbitrário adicional nesta Sprint.

## `category`

- `TEXT NULL`;
- normalizada com trim;
- string vazia torna-se `NULL`;
- não utiliza enum, tabela ou catálogo;
- preserva o texto informado após normalização.

## `notes`

- `TEXT NULL`;
- string vazia após trim torna-se `NULL` na fronteira RPC.

---

# Valor Monetário e EUR

`amount` utiliza:

```text
NUMERIC(12,2)
```

Regras:

- obrigatório;
- estritamente maior que zero;
- zero e valores negativos são inválidos;
- o sinal não representa entrada ou saída;
- JavaScript `float` não é fonte de verdade monetária.

Não existe coluna `currency` nesta Sprint.

Todos os valores de `financial_entries.amount` e `financial_goals.target_amount` são interpretados como:

```text
EUR
```

Essa é uma regra organizacional única do MVP, sem suporte genérico a moedas ou câmbio.

---

# Datas Financeiras

Contrato físico:

```text
reference_date DATE NOT NULL
due_date       DATE NULL
realized_date  DATE NULL
```

Não existe componente de horário nesses campos.

Não será criada constraint `due_date >= reference_date`, pois essa regra não foi aprovada.

`created_at`, `updated_at` e `archived_at` permanecem timestamps técnicos separados.

---

# Relação e Editabilidade do Cliente

`client_id` é opcional.

Quando preenchido, a Foreign Key composta garante:

```text
Client.organization_id
=
FinancialEntry.organization_id
```

Contrato de edição:

- OWNER autorizado pode alterar `client_id` enquanto a movimentação não estiver arquivada;
- é permitido trocar entre Cliente válido da mesma Organization e `NULL`;
- a RPC valida a Organization do novo Cliente;
- um Cliente de outra Organization é rejeitado;
- escrita direta permanece negada;
- movimentação arquivada não pode ter `client_id` alterado.

Essa edição não altera autorização, pois o módulo é OWNER-only. Client Assignment permanece irrelevante para Financeiro.

Não criar `demand_id` nem `contract_id`.

---

# Arquivamento

Arquivamento utiliza:

```text
archived_at
```

Regras:

- não existe delete físico operacional;
- arquivar define o instante de `archived_at`;
- a listagem operacional padrão usa `archived_at IS NULL`;
- registro, autoria e Activity Logs são preservados;
- arquivamento não altera `status`;
- arquivamento não altera `realized_date`;
- arquivamento não representa cancelamento;
- movimentos arquivados não podem ser editados nem ter Status alterado;
- nova chamada de arquivamento sobre registro já arquivado é idempotente e não cria novo log.

Um movimento `REALIZED` arquivado continua participando de entradas, saídas e saldo. Para excluir um movimento dos agregados realizados, seu Status deve ser `CANCELED` antes do arquivamento.

Não existe restore nesta Sprint.

---

# Tabela `financial_goals`

## Responsabilidade

Representar a meta mensal de receita da Organization.

## Colunas

| Coluna | Tipo | Obrigatória | Default | Responsabilidade |
|---|---|---:|---|---|
| `id` | UUID | Sim | UUID gerado pelo banco | Identificador da meta |
| `organization_id` | UUID | Sim | Nenhum | Organization proprietária, resolvida internamente |
| `year` | INTEGER | Sim | Nenhum | Ano da meta |
| `month` | INTEGER | Sim | Nenhum | Mês da meta |
| `target_amount` | NUMERIC(12,2) | Sim | Nenhum | Meta positiva em EUR |
| `created_by` | UUID | Sim | Determinado pela RPC | Profile que criou a meta |
| `updated_by` | UUID | Sim | Determinado pela RPC | Profile da última alteração |
| `created_at` | TIMESTAMPTZ | Sim | Instante atual do banco | Criação |
| `updated_at` | TIMESTAMPTZ | Sim | Instante atual do banco | Última alteração |

Não existem `status`, `active`, `archived_at`, `client_id`, `current_amount` ou `progress_percentage`.

## Constraints

- `id` é a Primary Key;
- `organization_id` referencia `organizations.id`;
- `created_by` e `updated_by` referenciam `profiles.id`;
- `target_amount > 0`;
- `month` fica entre `1` e `12`, inclusive;
- `year > 0`;
- `(organization_id, year, month)` é único.

A unicidade garante no máximo uma meta por Organization, ano e mês e sustenta o comportamento transacional de criação ou atualização.

## Identidade Imutável

Após a criação, são imutáveis:

```text
id
organization_id
year
month
created_by
created_at
```

Somente `target_amount`, `updated_by` e `updated_at` mudam quando uma meta existente é atualizada.

Não existe delete nem arquivamento de meta nesta Sprint.

---

# Autoria e Contexto Autenticado

As RPCs resolvem internamente:

```text
auth.uid()
→ Profile ACTIVE
→ Membership OWNER ACTIVE
→ Organization ACTIVE e não arquivada
```

`created_by` e `updated_by` recebem o `profiles.id` correspondente ao utilizador autenticado.

O browser não pode definir ou sobrescrever:

```text
organization_id
user_id
role
created_by
updated_by
created_at
updated_at
archived_at
status inicial
```

Criação, definição de meta e resumo utilizarão `private.require_active_owner_organization()` para resolver a Organization. Operações sobre movimentação existente validarão a Organization da linha com `private.is_active_owner_of_organization(organization_id)`. Ambos os helpers já existem e nenhum deles aceita Organization como fonte de autorização enviada pelo caller.

---

# Matriz de Autorização

| Ator | Ler movimentações | Escrever movimentações | Ler meta/resumo | Definir meta |
|---|---:|---:|---:|---:|
| OWNER `ACTIVE` da própria Organization | Sim | Sim, somente por RPC | Sim | Sim, somente por RPC |
| ADMIN | Não | Não | Não | Não |
| MEMBER, com ou sem Client Assignment | Não | Não | Não | Não |
| Membership não `ACTIVE` | Não | Não | Não | Não |
| Profile não `ACTIVE` | Não | Não | Não | Não |
| Organization não `ACTIVE` ou arquivada | Não | Não | Não | Não |
| Utilizador de outra Organization | Não | Não | Não | Não |
| `anon` | Não | Não | Não | Não |

Conhecer `client_id`, `entry_id`, ano ou mês não concede autorização.

Não reutilizar `private.can_access_client()` como autorização financeira.

---

# Row Level Security e Grants

## Tabelas

RLS deverá ser ativada em:

```text
financial_entries
financial_goals
```

## SELECT

Cada tabela terá Policy de leitura somente para utilizador `authenticated` que seja OWNER `ACTIVE` da Organization da linha, com Profile e Organization válidos.

ADMIN, MEMBER, outra Organization e `anon` não recebem Policy de leitura.

## Escritas Diretas

Não criar Policies de `INSERT`, `UPDATE` ou `DELETE` para `anon` ou `authenticated`.

Grants das tabelas:

- revogar todos os privilégios de `anon` e `authenticated` inicialmente;
- conceder somente `SELECT` a `authenticated`;
- não conceder escrita direta;
- não conceder qualquer acesso a `anon`.

As escritas ocorrem exclusivamente pelas RPCs aprovadas.

## Activity Logs

A Policy OWNER já existente em `activity_logs` autoriza o OWNER da própria Organization. Nenhuma Policy adicional deve ampliar visibilidade a ADMIN ou MEMBER para facilitar o Financeiro.

INSERT, UPDATE e DELETE diretos em `activity_logs` permanecem negados.

---

# RPCs de Escrita

Todas as escritas financeiras exigem Activity Log na mesma transação. Por isso, as fronteiras oficiais são:

```text
create_financial_entry
update_financial_entry
change_financial_entry_status
archive_financial_entry
set_financial_goal
```

Cada RPC:

- é `SECURITY DEFINER` por necessidade de escrita privilegiada controlada e auditoria atômica;
- usa `SET search_path = ''`;
- utiliza schemas explícitos;
- obtém a identidade por `auth.uid()`;
- valida Profile, Membership, Organization e role OWNER internamente;
- não depende da RLS como única autorização;
- não usa Service Role;
- revoga `EXECUTE` de `PUBLIC` e `anon`;
- concede `EXECUTE` somente a `authenticated`;
- retorna apenas o UUID necessário;
- transforma inexistência e falta de autorização em resultado indistinguível para evitar enumeração.

---

# `create_financial_entry`

## Contrato de Entrada

Parâmetros funcionais:

```text
p_type             text
p_description      text
p_amount           numeric
p_reference_date   date
p_client_id        uuid    default NULL
p_payment_nature   text    default ONE_TIME
p_category         text    default NULL
p_due_date         date    default NULL
p_notes            text    default NULL
```

Não recebe Organization, autoria, Status, data de realização, timestamps ou arquivamento.

## Comportamento

- resolve ator e Organization internamente;
- normaliza e valida os campos funcionais;
- valida Cliente da mesma Organization quando informado;
- cria com `status = PENDING` e `realized_date = NULL`;
- atribui `created_by` e `updated_by` ao Profile autenticado;
- registra `FINANCIAL_ENTRY / CREATED` atomicamente;
- retorna o UUID da movimentação.

---

# `update_financial_entry`

## Contrato de Entrada

Parâmetros:

```text
p_entry_id          uuid
p_type              text
p_description       text
p_amount            numeric
p_reference_date    date
p_client_id         uuid    default NULL
p_payment_nature    text    default ONE_TIME
p_category          text    default NULL
p_due_date          date    default NULL
p_notes             text    default NULL
```

O payload representa o estado completo dos campos editáveis. Campos opcionais podem ser limpos com `NULL`.

Não recebe nem altera:

```text
organization_id
status
realized_date
created_by
created_at
archived_at
```

## Comportamento

- exige OWNER autorizado da Organization da movimentação;
- bloqueia movimentação arquivada;
- permite alterar tipo, Cliente, natureza, descrição, categoria, valor, data de referência, vencimento e observações;
- valida a mesma Organization do novo Cliente quando informado;
- atualiza `updated_by` e `updated_at`;
- registra `FINANCIAL_ENTRY / UPDATED` atomicamente;
- retorna o UUID da movimentação.

---

# `change_financial_entry_status`

## Contrato de Entrada

```text
p_entry_id       uuid
p_status         text
p_realized_date  date default NULL
```

## Comportamento por Status Destino

```text
PENDING
→ resultado realized_date = NULL

REALIZED
→ p_realized_date obrigatória
→ resultado realized_date = p_realized_date

CANCELED
→ p_realized_date deve ser NULL
→ preserva a realized_date já armazenada, inclusive quando veio de REALIZED
```

Não existe restrição de transição entre os três Status.

A RPC:

- exige OWNER autorizado;
- bloqueia movimentação arquivada;
- compara Status e data anteriores com o resultado solicitado;
- retorna sem novo log quando não houver mudança efetiva;
- atualiza `updated_by` e `updated_at` quando houver mudança;
- registra `FINANCIAL_ENTRY / STATUS_CHANGED` atomicamente;
- retorna o UUID.

---

# `archive_financial_entry`

Contrato de entrada:

```text
p_entry_id uuid
```

Comportamento:

- exige OWNER autorizado;
- define `archived_at` com o instante do banco;
- atualiza `updated_by` e `updated_at`;
- não muda Status nem `realized_date`;
- registra `FINANCIAL_ENTRY / ARCHIVED` atomicamente;
- retorna o UUID;
- é idempotente: registro já arquivado retorna o mesmo UUID sem nova mutação ou Activity Log.

---

# `set_financial_goal`

## Contrato de Entrada

```text
p_year           integer
p_month          integer
p_target_amount  numeric
```

Não recebe Organization, autoria, Status ou progresso.

## Comportamento Transacional

Para a Organization resolvida internamente e a combinação `year + month`:

```text
meta inexistente
→ criar
→ FINANCIAL_GOAL / CREATED

meta existente com valor diferente
→ atualizar target_amount
→ FINANCIAL_GOAL / UPDATED

meta existente com o mesmo valor
→ retornar UUID existente
→ sem mutação e sem novo Activity Log
```

A operação deverá ser segura sob concorrência e depender da unicidade `(organization_id, year, month)`.

Retorna o UUID da meta criada ou encontrada.

Não existe RPC de delete ou archive de meta.

---

# Activity Logs

Utilizar exclusivamente:

```text
activity_logs
```

## Mapeamento

| Entidade | Operação | `entity_type` | `action` |
|---|---|---|---|
| Movimentação | Criar | `FINANCIAL_ENTRY` | `CREATED` |
| Movimentação | Atualizar campos | `FINANCIAL_ENTRY` | `UPDATED` |
| Movimentação | Alterar Status/data efetiva | `FINANCIAL_ENTRY` | `STATUS_CHANGED` |
| Movimentação | Arquivar | `FINANCIAL_ENTRY` | `ARCHIVED` |
| Meta | Criar | `FINANCIAL_GOAL` | `CREATED` |
| Meta | Atualizar valor | `FINANCIAL_GOAL` | `UPDATED` |

## Metadata

`CREATED`, `UPDATED` e `ARCHIVED` de movimentações utilizam metadata `NULL`. `CREATED` e `UPDATED` de metas também utilizam metadata `NULL`.

`STATUS_CHANGED` registra somente:

```text
old_status
new_status
old_realized_date
new_realized_date
```

Não armazenar descrição, notas, Cliente, categoria, amount, meta ou snapshots completos em metadata.

## Atomicidade

Mutação e Activity Log fazem parte da mesma RPC e transação. Se o log falhar, a mutação também falha.

---

# Resumo Financeiro Autorizado

## Fronteira

Congelar a RPC de leitura:

```text
get_financial_summary(p_year integer, p_month integer)
```

A função é `STABLE` e `SECURITY DEFINER` para formar uma fronteira agregada eficiente sem revelar linhas ou totais não autorizados.

Ela aplica o mesmo hardening das RPCs privilegiadas, valida OWNER internamente e não recebe `organization_id`.

`p_year` deve ser positivo e `p_month` deve ficar entre `1` e `12`, inclusive.

## Retorno

```text
monthly_income   numeric
monthly_expense  numeric
cash_balance     numeric
goal_target      numeric NULL
goal_progress    numeric NULL
```

Na ausência de movimentos, os três totais retornam zero.

## `monthly_income`

Soma de `amount` quando:

```text
type = INCOME
status = REALIZED
realized_date pertence ao mês e ano solicitados
```

## `monthly_expense`

Soma de `amount` quando:

```text
type = EXPENSE
status = REALIZED
realized_date pertence ao mês e ano solicitados
```

## `cash_balance`

Saldo cumulativo até o último dia do mês selecionado:

```text
SUM(INCOME REALIZED)
-
SUM(EXPENSE REALIZED)
```

Inclui todo movimento com `realized_date` anterior ou igual ao fim do mês, sem limitar o início do período.

## `goal_target`

Valor de `financial_goals.target_amount` da mesma Organization, ano e mês. Retorna `NULL` quando a meta não existe.

## `goal_progress`

Retorna razão decimal derivada:

```text
monthly_income / goal_target
```

Semântica:

```text
0    = 0%
1    = 100%
1.25 = 125%
```

O valor pode ultrapassar `1`. A UI é responsável apenas pela formatação percentual, sem recalcular a regra de negócio.

Quando não existir meta, `goal_target` e `goal_progress` retornam `NULL`. Não há divisão por zero porque `target_amount > 0`.

## Arquivados e Cancelados

Todos os cálculos:

- incluem movimentos arquivados quando `status = REALIZED`;
- excluem `CANCELED`, mesmo com `realized_date` preenchida;
- excluem `PENDING`;
- não filtram por Client Assignment;
- limitam dados à Organization do OWNER autenticado.

ADMIN, MEMBER, outra Organization e `anon` não obtêm linhas nem totais.

---

# Queries de Movimentações

Leitura normal utiliza Query sobre `public.financial_entries` protegida por RLS.

Não criar RPC para listagem ou detalhe comum.

## Listagem Padrão

```text
archived_at IS NULL
```

Pesquisa, filtros, ordenação e paginação executam no banco após a autorização da RLS. A aplicação não busca todos os registros para filtrar em memória.

## Pesquisa

A pesquisa inicial é case-insensitive sobre:

```text
description
```

Categoria não integra a pesquisa textual geral; possui filtro próprio.

## Filtros

Filtros físicos suportados:

- `type`;
- `status`;
- `payment_nature`;
- `client_id`;
- `category`;
- intervalo inclusivo de `reference_date`;
- intervalo inclusivo de `due_date`;
- intervalo inclusivo de `realized_date`.

Cada filtro é opcional. Valores de domínios fechados são validados antes da Query. `client_id` não influencia autorização.

## Ordenação

Whitelist física:

```text
reference_date
due_date
realized_date
amount
created_at
updated_at
description
```

Direções permitidas:

```text
asc
desc
```

Default determinístico:

```text
reference_date DESC
id DESC
```

Strings arbitrárias da interface não podem ser usadas como coluna.

## Paginação

Tamanhos permitidos:

```text
10
20
50
100
```

Default:

```text
20
```

Paginação e contagem acontecem no banco sobre o conjunto autorizado.

## Detalhe

A consulta por ID recebe somente `entry_id`, depende de RLS e retorna `NULL` quando a movimentação não existe ou não está visível. Ela não recebe Organization, role ou identidade do caller.

Movimentações arquivadas continuam visíveis no detalhe para OWNER autorizado quando consultadas explicitamente.

---

# Query de Meta

A leitura da meta mensal poderá consultar `public.financial_goals` por `year + month` sob RLS.

Para os cards e cálculos oficiais, `get_financial_summary` é a fonte agregada e evita reconstruir regras financeiras no cliente.

---

# Índices Congelados

## `financial_entries`

1. Listagem operacional padrão:

```text
(organization_id, reference_date DESC, id DESC)
WHERE archived_at IS NULL
```

2. Filtro operacional por Status:

```text
(organization_id, status, reference_date DESC, id DESC)
WHERE archived_at IS NULL
```

3. Filtro operacional por Cliente:

```text
(organization_id, client_id, reference_date DESC, id DESC)
WHERE archived_at IS NULL AND client_id IS NOT NULL
```

4. Agregados realizados, incluindo arquivados:

```text
(organization_id, realized_date, type)
WHERE status = REALIZED
```

Não criar inicialmente índices isolados para `payment_nature`, `category`, `due_date`, `amount`, `created_at`, `updated_at` ou `description`. Eles deverão ser justificados por plano de execução ou volume real antes de ampliar a migration.

A pesquisa contém termo parcial e não introduzirá extensão ou índice textual especulativo nesta Sprint.

## `financial_goals`

A constraint única:

```text
(organization_id, year, month)
```

fornece o índice necessário para leitura e `set_financial_goal`. Não criar índice duplicado.

---

# Erros e Segurança

As fronteiras deverão utilizar códigos estáveis e seguros, incluindo conforme aplicável:

```text
AUTHENTICATION_REQUIRED
AUTHORIZATION_DENIED
FINANCIAL_ENTRY_NOT_FOUND_OR_FORBIDDEN
FINANCIAL_TYPE_INVALID
FINANCIAL_STATUS_INVALID
FINANCIAL_PAYMENT_NATURE_INVALID
FINANCIAL_DESCRIPTION_REQUIRED
FINANCIAL_AMOUNT_INVALID
FINANCIAL_REALIZED_DATE_REQUIRED
FINANCIAL_REALIZED_DATE_NOT_ALLOWED
FINANCIAL_CLIENT_INVALID
FINANCIAL_GOAL_PERIOD_INVALID
FINANCIAL_GOAL_AMOUNT_INVALID
```

Não retornar SQL, detalhes de Policy, stack trace ou indicação que diferencie entidade inexistente de não autorizada.

Não confiar em totais, progresso, booleano `realized`, Organization, role, autoria ou timestamps enviados pelo browser.

---

# Testes Físicos Planejados

## Schema

- existência das duas tabelas;
- colunas, tipos, nulabilidade e defaults;
- UUIDs e timestamps;
- domínios de tipo, Status e natureza;
- `NUMERIC(12,2)` e valores positivos;
- datas civis;
- Foreign Keys e índices;
- unicidade de meta;
- ausência das colunas e tabelas fora do escopo.

## Integridade

- descrição obrigatória e normalizada;
- categoria vazia convertida em `NULL`;
- Cliente opcional da mesma Organization;
- Cliente cross-Organization negado;
- edição autorizada de `client_id` em movimento não arquivado;
- campos imutáveis protegidos;
- `PENDING` com `realized_date = NULL`;
- `REALIZED` com data obrigatória;
- `CANCELED` com data nula ou preservada;
- mês entre 1 e 12, ano e meta positivos;
- arquivamento sem alteração de Status ou data efetiva.

## RLS e Grants

- OWNER autorizado na própria Organization;
- ADMIN negado;
- MEMBER com e sem Client Assignment negado;
- Membership inativa negada;
- Profile inativo negado;
- Organization inativa ou arquivada negada;
- outra Organization negada;
- `anon` negado;
- SELECT permitido somente conforme RLS;
- INSERT, UPDATE e DELETE diretos negados.

## RPCs

- criar, atualizar, alterar Status e arquivar movimentação;
- criar e atualizar meta;
- chamadas idempotentes sem logs duplicados quando definido;
- spoofing de Organization, autoria, role e timestamps impossível;
- funções com `PUBLIC` e `anon` revogados;
- `authenticated` com `EXECUTE` somente nas RPCs públicas aprovadas;
- helpers privados sem exposição indevida;
- autorização interna independente da RLS;
- rollback integral quando o Activity Log falhar.

## Agregados

- receita realizada do mês;
- despesa realizada do mês;
- saldo cumulativo até o fim do mês;
- movimento realizado arquivado incluído;
- movimento cancelado excluído;
- movimento pendente excluído;
- progresso como razão decimal;
- progresso acima de `1`;
- ausência de meta com valores nulos;
- zero quando não houver movimentos;
- OWNER autorizado e demais atores negados;
- isolamento de totais entre Organizations.

## Activity Logs

- entity types e Actions corretos;
- ator, Organization e entidade corretos;
- metadata mínima de Status;
- ausência de snapshots financeiros completos;
- atomicidade e rollback;
- INSERT direto negado;
- imutabilidade preservada.

## Queries

- exclusão padrão de arquivados;
- pesquisa no banco por descrição;
- filtros aprovados;
- whitelist de ordenação;
- desempate determinístico;
- tamanhos de página permitidos;
- paginação e contagem no banco;
- nenhuma inferência de registros não autorizados.

---

# Decisões Físicas Congeladas

- tabelas `financial_entries` e `financial_goals`;
- colunas, tipos, nulabilidade e defaults;
- UUIDs, autoria e timestamps;
- tipo `INCOME/EXPENSE` sem default;
- Status `PENDING/REALIZED/CANCELED` com default `PENDING`;
- natureza `ONE_TIME/RECURRING` com default `ONE_TIME`;
- `NUMERIC(12,2)` e valor positivo;
- EUR como regra organizacional sem coluna;
- integridade de `status + realized_date`;
- descrição obrigatória e categoria opcional normalizada;
- Cliente opcional com Foreign Key composta e editável antes do arquivamento;
- arquivamento lógico que não altera agregados históricos realizados;
- meta única por Organization, ano e mês;
- autorização OWNER-only;
- RLS de leitura e escrita direta negada;
- cinco RPCs transacionais de escrita;
- `get_financial_summary` como RPC de leitura agregada;
- Actions e metadata de Activity Logs;
- semântica de receita, despesa, saldo cumulativo e progresso;
- pesquisa por descrição, filtros, ordenação e paginação;
- índices mínimos deste contrato;
- cobertura física futura.

---

# Decisões Deliberadamente Fora da Sprint

- Documents físicos;
- relação com Demanda ou Contrato;
- categoria estruturada;
- moeda persistida e multi-currency;
- câmbio;
- recorrência automática;
- cobrança e integração bancária;
- restore e delete físico;
- relatórios avançados;
- Dashboard consolidado.

---

# Decisões Remanescentes

Não permanece decisão física bloqueadora para criar a migration da Sprint 04.

A implementação ainda deverá escolher apenas detalhes SQL mecânicos — nomes de constraints, organização interna das funções e expressões equivalentes — sem alterar o comportamento congelado neste contrato.

---

# Definition of Done do Contrato

Este contrato está pronto quando a futura migration puder ser implementada sem decidir novamente:

- schema;
- defaults;
- domínios;
- representação monetária;
- realização;
- arquivamento;
- relação com Cliente;
- meta mensal;
- autorização;
- RLS e Grants;
- fronteiras RPC;
- auditoria;
- agregados;
- Queries;
- índices;
- cobertura de testes.

O estado atual atende esses critérios documentalmente, sem iniciar a implementação técnica da Sprint 04.
