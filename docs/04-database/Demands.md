# Demands

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟢 Contrato físico aprovado para a Sprint 03

---

## Última atualização

Setembro de 2026

---

# Objetivo

Este documento congela o contrato físico do módulo de Demandas antes da migration da Sprint 03.

Ele define:

- tabelas e colunas;
- obrigatoriedade e defaults;
- constraints e relações;
- integridade entre Organizations;
- arquivamento;
- autoria;
- autorização;
- RLS e Grants;
- fronteiras de Query e RPC;
- Activity Logs;
- pesquisa, filtros, ordenação e paginação;
- índices mínimos;
- testes físicos obrigatórios;
- itens deliberadamente fora da migration.

Este documento não implementa SQL.

---

# Fontes Normativas

Este contrato permanece subordinado a:

- PRD v3.0;
- MVP Scope v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- System Architecture;
- Module Architecture;
- Organization and User Model;
- RLS;
- Activity Logs;
- Migrations;
- ADR-002;
- Sprint 03.

Em caso de conflito futuro, a implementação deverá parar para sincronizar a documentação, sem escolher silenciosamente uma interpretação.

---

# Escopo Físico da Migration

A migration da Sprint 03 deverá criar:

```text
demands
demand_assignees
demand_tags
demand_tag_assignments
```

Também deverá:

- adicionar a constraint de suporte necessária em `clients` para a Foreign Key composta de Demandas;
- criar constraints e índices deste contrato;
- criar triggers privados de integridade quando constraints declarativas não forem suficientes;
- ativar RLS nas quatro novas tabelas;
- criar Policies e Grants de menor privilégio;
- criar helpers privados de autorização quando necessários;
- criar as RPCs transacionais aprovadas;
- ampliar a leitura autorizada de `activity_logs` para `entity_type = DEMAND`;
- ampliar os domínios físicos de auditoria somente se a constraint atual exigir.

---

# Fora do Escopo Físico

A migration não deverá criar:

```text
notifications
documents
demand_documents
projects
```

Também não deverá criar:

- cron;
- scheduler;
- worker;
- trigger temporal;
- polling obrigatório;
- e-mail;
- SMS;
- WhatsApp;
- push externo;
- tabela de métricas do Dashboard;
- tabela de Activity Log específica para Demandas.

---

# Modelo Relacional

```text
organizations
    │
    ├── clients
    │     │
    │     └── demands
    │           ├── demand_assignees ── organization_members
    │           └── demand_tag_assignments ── demand_tags
    │
    └── activity_logs, por relação polimórfica
```

A existência de uma relação nunca concede autorização.

---

# Convenções Físicas

- entidades com identificador próprio utilizam UUID;
- timestamps de instante utilizam `TIMESTAMPTZ`;
- datas civis de início e prazo utilizam `DATE`;
- Status e Priority utilizam texto com constraints de domínio, seguindo o padrão atual;
- timestamps de criação possuem default do banco;
- `updated_at` é atualizado pelo mecanismo privado já utilizado pelo projeto;
- campos de autoria referenciam `profiles`;
- valores vazios de campos opcionais são normalizados para `NULL` na fronteira autorizada;
- nomes de objetos físicos permanecem em inglês e `snake_case`.

## Primary Keys Congeladas

| Tabela | Primary Key |
|---|---|
| `demands` | `id` UUID |
| `demand_assignees` | `id` UUID |
| `demand_tags` | `id` UUID |
| `demand_tag_assignments` | Composta por `(demand_id, tag_id)`, sem UUID próprio |

Não existe regra genérica exigindo UUID para tabelas de associação sem identidade própria.

---

# Tabela `demands`

## Responsabilidade

Representar uma unidade operacional de trabalho vinculada obrigatoriamente a um Cliente.

## Colunas

| Coluna | Tipo | Obrigatória | Default | Responsabilidade |
|---|---|---:|---|---|
| `id` | UUID | Sim | UUID gerado pelo banco | Identificador da Demanda |
| `organization_id` | UUID | Sim | Nenhum | Organization proprietária, derivada do Cliente |
| `client_id` | UUID | Sim | Nenhum | Cliente imutável da Demanda |
| `title` | TEXT | Sim | Nenhum | Título operacional |
| `description` | TEXT | Não | `NULL` | Descrição do trabalho |
| `status` | TEXT | Sim | `OPEN` | Status oficial |
| `priority` | TEXT | Sim | `MEDIUM` | Prioridade oficial |
| `start_date` | DATE | Não | `NULL` | Data civil de início |
| `due_date` | DATE | Não | `NULL` | Data civil de prazo |
| `notes` | TEXT | Não | `NULL` | Notas operacionais |
| `created_by` | UUID | Sim | Determinado pela RPC | Profile que criou a Demanda |
| `updated_by` | UUID | Sim | Determinado pela RPC | Profile da última alteração |
| `created_at` | TIMESTAMPTZ | Sim | Instante atual do banco | Criação |
| `updated_at` | TIMESTAMPTZ | Sim | Instante atual do banco | Última alteração |
| `archived_at` | TIMESTAMPTZ | Não | `NULL` | Arquivamento lógico |

## Campos Obrigatórios

No payload funcional, são obrigatórios:

```text
client_id
title
```

O banco também exige os campos estruturais resolvidos internamente:

```text
id
organization_id
status
priority
created_by
updated_by
created_at
updated_at
```

Responsáveis possuem cardinalidade `0..N` e não são condição para criar uma Demanda.

## Constraints

A tabela deverá garantir:

- Primary Key em `id`;
- Foreign Key de `created_by` para `profiles.id`;
- Foreign Key de `updated_by` para `profiles.id`;
- título não vazio após trim;
- Status dentro do domínio oficial;
- Priority dentro do domínio oficial;
- integridade composta entre Cliente e Organization;
- `client_id` imutável após a criação.

Não será criada constraint entre `start_date` e `due_date`, pois nenhuma regra normativa define essa ordenação.

---

# Status

Domínio congelado:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

Default:

```text
OPEN
```

Não existe máquina rígida de transições nesta Sprint.

---

# Priority

Domínio congelado:

```text
LOW
MEDIUM
HIGH
URGENT
```

Default:

```text
MEDIUM
```

Priority permanece independente de Status e Tags.

---

# Datas e Atraso

Campos congelados:

```text
start_date = DATE NULL
due_date   = DATE NULL
```

Os campos representam datas civis. Nenhum horário de prazo será inventado.

Atraso é um estado derivado, nunca uma coluna persistida.

Não criar:

```text
is_overdue
overdue
late
```

A regra funcional considera prazo expirado quando o Status é diferente de:

```text
COMPLETED
CANCELED
```

A implementação deverá congelar uma convenção única de data local da aplicação para comparar `due_date` com a data corrente. Essa decisão não altera o schema.

O conceito de “próxima do prazo” também será derivado. Nenhum threshold temporal é definido neste contrato.

---

# Cliente e Organization

Toda Demanda pertence a exatamente um Cliente.

Deverá ser verdadeiro:

```text
demands.organization_id
=
clients.organization_id
```

O browser poderá enviar `client_id` como identificador do recurso escolhido, mas nunca enviará `organization_id` como fonte de ownership.

A RPC de criação deverá:

1. validar o Cliente;
2. validar a autorização do ator sobre o Cliente;
3. obter `organization_id` do próprio Cliente;
4. persistir ambos dentro da mesma operação.

## Integridade Declarativa

A migration deverá adicionar uma chave candidata composta em:

```text
clients (id, organization_id)
```

e referenciá-la a partir de:

```text
demands (client_id, organization_id)
```

Essa Foreign Key composta impede declarativamente uma Demanda de apontar para um Cliente de outra Organization.

## Cliente Imutável

Depois da criação, `client_id` e o ownership correspondente não poderão ser alterados pelo fluxo normal.

A proteção será composta por:

- ausência de `client_id` e `organization_id` na RPC de atualização;
- ausência de Grants de UPDATE direto;
- validação defensiva do banco contra alteração desses campos.

Quando o Cliente estiver incorreto:

```text
arquivar a Demanda incorreta
+
criar uma nova Demanda para o Cliente correto
```

Nem OWNER poderá mover uma Demanda entre Clientes pelo fluxo normal.

---

# Autoria

`created_by` e `updated_by` representam Profiles internos.

Eles nunca serão aceitos livremente do browser.

Na criação:

```text
created_by = auth.uid()
updated_by = auth.uid()
```

Nas alterações:

```text
updated_by = auth.uid()
```

As RPCs deverão confirmar que o Profile autenticado está `ACTIVE` antes de persistir a autoria.

---

# Arquivamento

O arquivamento utiliza:

```text
archived_at
```

Regras:

- não existe delete físico no fluxo normal;
- não existe Status `ARCHIVED`;
- arquivamento é independente de Status;
- listagens operacionais excluem `archived_at` não nulo por padrão;
- a Demanda, responsáveis, Tags e Activity Logs permanecem armazenados;
- a leitura histórica continua sujeita à autorização atual;
- somente OWNER pode arquivar nesta Sprint.

---

# Tabela `demand_assignees`

## Responsabilidade

Representar a relação opcional entre Demandas e responsáveis internos.

Cardinalidade:

```text
Demand
→ 0..N responsáveis
```

## Colunas

| Coluna | Tipo | Obrigatória | Default | Responsabilidade |
|---|---|---:|---|---|
| `id` | UUID | Sim | UUID gerado pelo banco | Identificador da associação |
| `demand_id` | UUID | Sim | Nenhum | Demanda |
| `membership_id` | UUID | Sim | Nenhum | Membership responsável |
| `created_by` | UUID | Sim | Determinado pela RPC | Profile que realizou a atribuição |
| `created_at` | TIMESTAMPTZ | Sim | Instante atual do banco | Criação da associação |

## Constraints

- Primary Key em `id`;
- Foreign Key de `demand_id` para `demands.id`;
- Foreign Key de `membership_id` para `organization_members.id`;
- Foreign Key de `created_by` para `profiles.id`;
- unicidade de `(demand_id, membership_id)`.

## Elegibilidade no Momento da Atribuição

O Membership selecionado deverá:

- pertencer à mesma Organization da Demanda;
- possuir estado `ACTIVE` e não estar arquivado;
- possuir Profile `ACTIVE`;
- ser `OWNER`; ou
- ser `MEMBER` com Client Assignment atual para o Cliente da Demanda.

`ADMIN` não é elegível como responsável nesta Sprint.

Como `demand_assignees` não duplica `organization_id` nem `client_id`, uma Foreign Key simples não prova todas essas condições. A migration deverá utilizar uma validação privada por trigger para proteger a integridade em INSERT e UPDATE, além das validações da RPC.

O trigger protege integridade; não substitui autorização.

## Assignee não é Autorização

A tabela `demand_assignees` nunca será consultada como prova de acesso.

Para MEMBER:

```text
Membership ACTIVE
+
Client Assignment atual
=
acesso à Demanda do Cliente
```

Ser responsável não cria Client Assignment, não altera role e não concede acesso.

---

# Remoção Posterior do Client Assignment

## Estratégia Congelada

Será utilizada a estratégia:

```text
B) preservar a associação histórica
sem utilizá-la como autorização
```

Fluxo:

```text
MEMBER possui Client Assignment
↓
é associado como responsável
↓
Client Assignment é removido
↓
demand_assignees permanece armazenado
↓
MEMBER perde imediatamente o acesso à Demanda
```

## Justificativa

Esta opção:

- preserva o histórico operacional;
- evita apagar relações de Demandas como efeito colateral da remoção de acesso;
- evita acoplar a RPC `remove_client_access` a mutações e Logs de várias Demandas;
- reduz a complexidade transacional;
- não deixa acesso residual, pois RLS e RPCs consultam o Client Assignment atual.

## Comportamento da Associação Preservada

- permanece disponível para histórico autorizado;
- não torna o MEMBER elegível em novas seleções enquanto faltar Client Assignment;
- não concede leitura ou escrita;
- pode ser removida explicitamente por uma gestão autorizada de responsáveis;
- qualquer exibição operacional deverá distingui-la como responsável sem acesso atual, sem revelar dados a quem não acessa a Demanda.

O evento de remoção do Client Assignment continua auditado no Cliente. Nenhum Activity Log falso de alteração da Demanda será criado, pois a relação de responsável não foi modificada.

---

# Tabela `demand_tags`

## Responsabilidade

Representar o catálogo de Tags da Organization.

## Colunas

| Coluna | Tipo | Obrigatória | Default | Responsabilidade |
|---|---|---:|---|---|
| `id` | UUID | Sim | UUID gerado pelo banco | Identificador da Tag |
| `organization_id` | UUID | Sim | Nenhum | Organization proprietária |
| `name` | TEXT | Sim | Nenhum | Nome exibido |
| `created_by` | UUID | Sim | Determinado pela RPC | Profile que criou a Tag |
| `created_at` | TIMESTAMPTZ | Sim | Instante atual do banco | Criação |

## Constraints

- Primary Key em `id`;
- Foreign Key de `organization_id` para `organizations.id`;
- Foreign Key de `created_by` para `profiles.id`;
- nome não vazio após trim;
- unicidade nominal normalizada dentro da Organization.

## Normalização

O nome será armazenado com trim, preservando a capitalização escolhida para exibição.

A unicidade física utilizará:

```text
Organization + lower(trim(name))
```

por meio de índice único de expressão no PostgreSQL.

Assim:

```text
Urgente
urgente
URGENTE
```

representam o mesmo nome de Tag dentro da mesma Organization.

Uma Tag chamada “Urgente” continua permitida. A normalização evita apenas duplicidade nominal e não confunde Tag com Priority.

Tags não concedem autorização.

## Ciclo de Vida na Sprint 03

`set_demand_tags` é a única fronteira pública desta Sprint para associar Tags e criar uma Tag inline durante a gestão de uma Demanda.

O contrato conceitual de entrada representa o conjunto completo desejado de Tags da Demanda. Cada item poderá referenciar:

- uma Tag existente; ou
- um novo nome de Tag.

A assinatura SQL concreta não é congelada neste documento.

Para cada item, a operação deverá:

1. validar a autorização atual sobre a Demanda;
2. resolver a Organization a partir da própria Demanda;
3. validar que qualquer Tag existente pertence à mesma Organization;
4. aplicar trim ao nome para armazenamento e comparação;
5. comparar por `lower(trim(name))` dentro da Organization;
6. reutilizar a Tag existente quando houver correspondência normalizada;
7. criar a Tag na mesma Organization quando não houver correspondência;
8. resolver o conjunto final de IDs sem duplicatas;
9. substituir atomicamente os `demand_tag_assignments`;
10. registrar `DEMAND / UPDATED` com metadata mínima de IDs adicionados e removidos.

Uma referência a Tag de outra Organization deverá ser negada sem revelar dados daquele tenant.

Remover uma associação não remove a Tag do catálogo. Tags sem Demandas associadas poderão permanecer armazenadas; remoção automática de Tags órfãs não é requisito desta Sprint.

Permanecem fora do escopo:

- rename global de Tag;
- delete global de Tag;
- administração independente do catálogo.

---

# Tabela `demand_tag_assignments`

## Responsabilidade

Representar a relação N:N entre Demandas e Tags.

## Colunas

| Coluna | Tipo | Obrigatória | Default | Responsabilidade |
|---|---|---:|---|---|
| `demand_id` | UUID | Sim | Nenhum | Demanda |
| `tag_id` | UUID | Sim | Nenhum | Tag |
| `created_at` | TIMESTAMPTZ | Sim | Instante atual do banco | Criação da associação |

## Identificador

Não haverá `id` próprio nesta tabela.

A Primary Key composta será:

```text
(demand_id, tag_id)
```

Justificativa:

- a associação não possui identidade de domínio independente;
- a chave composta já impede duplicidade;
- alterações são auditadas na Demanda, não na linha de associação;
- nenhum fluxo atual precisa referenciar essa relação por UUID.

## Integridade de Organization

A Tag deverá pertencer à mesma Organization da Demanda.

Como a tabela de associação não duplica `organization_id`, a migration deverá utilizar validação privada por trigger em INSERT e UPDATE para comparar:

```text
demand.organization_id
=
tag.organization_id
```

A RPC de Tags deverá realizar a mesma validação antes da mutação.

---

# Integridade Cross-Organization

## Demand ↔ Client

Mecanismo principal:

```text
Foreign Key composta
```

## Demand ↔ Assignee

Mecanismo:

```text
Foreign Keys simples
+
trigger privado de integridade
+
validação da RPC
```

O trigger valida a mesma Organization e a elegibilidade no momento da atribuição.

## Demand ↔ Tag

Mecanismo:

```text
Foreign Keys simples
+
trigger privado de integridade
+
validação da RPC
```

## Princípio

Constraints e triggers protegem integridade persistente.

RLS e RPCs protegem autorização.

Nenhuma dessas responsabilidades substitui a outra.

---

# Matriz de Autorização

| Operação | OWNER | ADMIN | MEMBER com Client Assignment |
|---|---:|---:|---:|
| Listar/ver Demandas | Sim | Não | Sim |
| Criar Demanda | Sim | Não | Sim |
| Editar título/descrição/notas | Sim | Não | Sim |
| Alterar Status | Sim | Não | Sim |
| Alterar Priority | Sim | Não | Sim |
| Alterar início/prazo | Sim | Não | Sim |
| Gerir Tags | Sim | Não | Sim |
| Gerir responsáveis | Sim | Não | Sim |
| Trocar Cliente | Não | Não | Não |
| Arquivar Demanda | Sim | Não | Não |

Todas as permissões exigem:

- utilizador autenticado;
- Profile `ACTIVE`;
- Membership `ACTIVE` e não arquivado;
- Organization `ACTIVE` e não arquivada;
- entidade pertencente à Organization correta;
- Client Assignment atual quando o ator for MEMBER.

ADMIN não recebe acesso global nem participa do módulo nesta Sprint.

---

# Row Level Security

RLS deverá estar ativa antes da liberação das tabelas para a aplicação.

## Helper de Acesso à Demanda

A migration deverá criar helper privado equivalente a `can_access_demand(demand_id)` para reutilizar o predicado completo.

Ele deverá verificar:

1. `auth.uid()`;
2. Profile `ACTIVE`;
3. Membership `ACTIVE` e não arquivado;
4. Organization `ACTIVE` e não arquivada;
5. Demanda e Cliente pertencentes à Organization;
6. role `OWNER`; ou
7. role `MEMBER` com Client Assignment atual para o Cliente.

`ADMIN` e `demand_assignees` não entram como caminhos de autorização.

Helpers privados deverão usar schema explícito, `SET search_path = ''` quando privilegiados e EXECUTE restrito ao uso necessário pelas Policies.

## `demands` — SELECT

Permitido:

- OWNER ativo para Demandas de Clientes da própria Organization;
- MEMBER ativo para Demandas cujo Cliente possua Client Assignment atual para seu Membership.

Negado:

- ADMIN;
- MEMBER sem Client Assignment;
- MEMBER que seja apenas responsável;
- utilizador de outra Organization;
- Profile ou Membership inativo;
- Organization inativa ou arquivada;
- não autenticado.

RLS não deve ocultar `archived_at` por si só. A exclusão de arquivados é o padrão da Query operacional, permitindo leitura histórica autorizada quando existir fluxo explícito.

## `demand_assignees` — SELECT

Permitido somente quando o chamador puder acessar a Demanda pai pelo helper oficial.

A Policy nunca utilizará o próprio `membership_id` da associação para conceder acesso.

## `demand_tag_assignments` — SELECT

Permitido somente quando o chamador puder acessar a Demanda pai.

## `demand_tags` — SELECT

- OWNER pode visualizar o catálogo da própria Organization;
- MEMBER pode visualizar Tags relacionadas a Demandas que ele já pode acessar;
- ADMIN não possui acesso nesta Sprint.

Tags não utilizadas em Demandas acessíveis não serão expostas ao MEMBER pela leitura direta.

## Escritas Diretas

Não existirão Policies diretas de INSERT, UPDATE ou DELETE para as quatro tabelas.

O papel PostgreSQL `authenticated` receberá somente SELECT necessário.

`anon` não receberá acesso.

As escritas ocorrerão exclusivamente pelas RPCs autorizadas deste contrato porque todas as alterações relevantes exigem Activity Log atômico e algumas envolvem múltiplas tabelas.

## Activity Logs de Demandas

A leitura de `activity_logs` para `entity_type = DEMAND` deverá usar predicado equivalente ao acesso atual à Demanda.

- OWNER visualiza Logs de Demandas da própria Organization;
- MEMBER visualiza somente Logs de Demandas de Clientes para os quais ainda possui Client Assignment;
- ADMIN não visualiza Logs de Demandas nesta Sprint;
- um Log nunca revela a existência de Demanda inacessível.

---

# RPCs Transacionais

## Motivo

Functional Requirements e Business Rules tornam as alterações relevantes de Demandas auditáveis.

Cada escrita deste escopo deverá manter:

```text
autorização
+
mutação
+
Activity Log
```

na mesma transação.

## Operações Congeladas

| Operação | Proposta de nome | Justificativa |
|---|---|---|
| Criar Demanda e responsáveis iniciais opcionais | `create_demand` | Criação, responsáveis opcionais e Log atômicos |
| Atualizar conteúdo, Priority e datas | `update_demand` | UPDATE e Log `UPDATED` atômicos; Cliente permanece imutável |
| Alterar Status | `change_demand_status` | Action `STATUS_CHANGED` e delta próprio |
| Substituir conjunto de responsáveis | `set_demand_assignees` | Validação integral, diff, múltiplas escritas e Log único |
| Substituir conjunto de Tags | `set_demand_tags` | Resolver/criar Tags, atualizar relações e registrar Log atomicamente |
| Arquivar Demanda | `archive_demand` | OWNER, arquivamento e Log `ARCHIVED` atômicos |

Os nomes são propostas consistentes com a Sprint 02. A migration poderá ajustar nomes para manter as convenções reais do repositório, mas não poderá alterar essas fronteiras operacionais. As assinaturas deverão aceitar somente identificadores de recursos e dados funcionais editáveis; Organization, ator, role e autoria serão sempre resolvidos internamente.

## Criação

`create_demand` poderá receber:

- `client_id`;
- `title`;
- `description`, `priority`, `start_date`, `due_date` e `notes` opcionais;
- conjunto opcional de `membership_id` de responsáveis.

A RPC não receberá Status inicial: o banco aplicará `OPEN`. Priority omitida utilizará `MEDIUM`.

A RPC deverá validar todos os elementos antes de persistir. Demanda, relações iniciais e Log `CREATED` formarão uma única transação.

## Atualização

`update_demand` poderá alterar somente:

```text
title
description
priority
start_date
due_date
notes
```

Não receberá `client_id`, `organization_id`, autoria ou Status.

## Status

`change_demand_status` recebe somente a Demanda e o novo Status funcional.

Não será criada máquina de transições. A operação atualizará `updated_by` e `updated_at`.

## Responsáveis

`set_demand_assignees` recebe a Demanda e o conjunto completo desejado de Membership IDs.

O conjunto poderá ser vazio.

A RPC deverá:

- validar todos os candidatos antes de alterar;
- calcular adicionados e removidos;
- impedir duplicatas;
- aplicar a substituição atomicamente;
- atualizar `updated_by` e `updated_at` da Demanda;
- registrar um Log `UPDATED` com delta mínimo.

## Tags

`set_demand_tags` recebe a Demanda e o conjunto completo desejado, composto conceitualmente por referências a Tags existentes e/ou novos nomes. A assinatura SQL permanece aberta até a migration.

A RPC deverá:

- validar que Tags existentes pertencem à Organization da Demanda;
- normalizar nomes com trim e comparar por `lower(trim(name))` na Organization;
- reutilizar Tags equivalentes da Organization;
- criar Tags ausentes somente na Organization autorizada;
- rejeitar nomes vazios e duplicatas após normalização;
- substituir relações atomicamente;
- atualizar `updated_by` e `updated_at` da Demanda;
- registrar um Log `DEMAND / UPDATED` com delta mínimo de IDs adicionados e removidos;
- nunca utilizar Tags como autorização.

Remover a última associação de uma Tag não excluirá automaticamente o registro de `demand_tags`.

## Arquivamento

`archive_demand` será executável funcionalmente somente por OWNER.

MEMBER, ADMIN e `anon` serão negados.

A operação preencherá `archived_at` e atualizará `updated_by` e `updated_at`, preservando todas as relações e dados históricos.

## Hardening Obrigatório

Se implementadas com `SECURITY DEFINER`, todas as RPCs deverão:

- resolver ator com `auth.uid()`;
- validar Profile;
- validar Membership;
- validar Organization e seu estado;
- validar role por operação;
- validar ownership da Demanda;
- validar Client Assignment atual para MEMBER;
- ignorar `demand_assignees` como autorização;
- utilizar `SET search_path = ''`;
- utilizar schemas explícitos;
- revogar EXECUTE de `PUBLIC` e `anon`;
- conceder EXECUTE somente a `authenticated`;
- não utilizar Service Role;
- retornar apenas o identificador ou resultado mínimo necessário;
- falhar sem revelar a existência de entidade não autorizada.

---

# Leitura de Candidatos a Responsável

MEMBER autorizado pode gerir responsáveis, mas as Policies atuais de Membership/Profile não expõem indiscriminadamente outros utilizadores.

Para evitar ampliar a leitura global dessas tabelas, a migration deverá prever a RPC de leitura `list_eligible_demand_assignees` para candidatos elegíveis de um Cliente.

Esta é uma exceção justificada ao padrão de Query simples, pois combina dados protegidos de Membership, Profile, role e Client Assignment.

A operação deverá:

- receber somente `client_id`;
- validar que o chamador é OWNER da Organization ou MEMBER com Client Assignment para o Cliente;
- negar ADMIN;
- retornar somente `membership_id`, `full_name` e `role`;
- incluir OWNER ativo da Organization;
- incluir MEMBER ativo com Client Assignment atual para o Cliente;
- excluir ADMIN, Profiles inativos e Memberships não ativos;
- não retornar e-mail, dados fiscais, dados administrativos, campos internos desnecessários ou Memberships de outras Organizations;
- aplicar o mesmo hardening de `SECURITY DEFINER`, schemas explícitos, `SET search_path = ''` e EXECUTE restrito definido para as RPCs transacionais.

Nenhuma Policy ampla de leitura de todos os Profiles ou Memberships será criada apenas para alimentar o seletor.

---

# Leitura de Responsáveis já Vinculados

Para renderizar os responsáveis de uma Demanda sem ampliar as Policies globais de Profile ou Membership, a migration deverá prever a RPC de leitura mínima `list_demand_assignees`.

Ela deverá:

- receber somente `demand_id`;
- exigir acesso atual do chamador à própria Demanda pelo helper oficial;
- localizar apenas `demand_assignees` vinculados à Demanda solicitada;
- retornar somente `membership_id`, `full_name`, `role` e o indicador derivado `is_currently_eligible`;
- marcar como não elegível o responsável histórico que deixou de cumprir as regras atuais de Profile, Membership, role ou Client Assignment;
- impedir consulta arbitrária por `membership_id`;
- impedir listagem geral de Profiles ou Memberships;
- não retornar e-mail, dados fiscais, dados administrativos ou campos internos desnecessários;
- aplicar `SECURITY DEFINER` somente com autorização interna completa, schemas explícitos, `SET search_path = ''` e EXECUTE restrito.

O indicador `is_currently_eligible` serve apenas para apresentação e gestão da associação. Ele não concede acesso ao responsável nem ao chamador.

Um responsável histórico sem Client Assignment:

```text
permanece relacionado
é retornado somente a quem acessa atualmente a Demanda
aparece como não elegível
não recebe acesso
pode ser removido por set_demand_assignees
```

Nem `list_eligible_demand_assignees` nem `list_demand_assignees` autorizam acesso a Cliente ou Demanda e nenhuma delas permite enumerar Memberships fora do recurso autorizado.

---

# Queries

Leituras normais utilizarão:

```text
Server Component
↓
Query
↓
Supabase
↓
RLS
↓
PostgreSQL
```

Não será utilizado Service Role.

## Listagem

A listagem deverá:

- excluir `archived_at` não nulo por padrão;
- pesquisar, filtrar, ordenar, contar e paginar no banco;
- depender de RLS para autorização;
- não receber `organization_id`, role ou identidade como filtro de segurança;
- usar desempate estável por `id`;
- retornar somente relações autorizadas.

## Pesquisa

Campos pesquisáveis no MVP:

```text
title
description
```

`notes` não participará da pesquisa inicial para evitar custo e exposição operacional desnecessários.

A pesquisa utilizará comparação case-insensitive no banco, com termo normalizado e caracteres de wildcard tratados de forma segura.

Não será introduzido Full Text Search nesta Sprint. Um índice textual especial somente poderá ser adicionado após volume real e plano de execução justificarem.

## Filtros

Filtros suportados:

- Cliente;
- Status;
- Priority;
- responsável;
- Tags;
- prazo.

Filtros por responsável e Tags utilizarão JOINs protegidos pelas relações autorizadas.

## Ordenação

Whitelist inicial:

```text
created_at
updated_at
title
start_date
due_date
status
priority
```

A direção será limitada a ascendente ou descendente.

Toda ordenação incluirá `id` como desempate determinístico.

A ordenação padrão será `updated_at` descendente e `id` descendente. Status e Priority serão ordenados pelo valor textual armazenado, sem inventar peso semântico adicional.

## Paginação

A paginação ocorrerá no banco com os tamanhos oficiais:

```text
10
20
50
100
```

O default será `20`.

O MVP manterá paginação por página/range porque a DataTable oficial exige página atual, total de páginas, primeira e última página. O acesso profundo deverá ser monitorado; paginação por cursor somente será considerada com necessidade real e revisão da UX.

## Detalhes

A Query por identificador receberá somente `demand_id` e dependerá de RLS.

Demanda inexistente e Demanda não autorizada não deverão produzir respostas que permitam distingui-las na interface.

---

# Índices Planejados

Os nomes físicos serão definidos na migration seguindo as convenções do repositório.

## `demands`

1. Índice completo em `(client_id, organization_id)`:
   - suporta a Foreign Key composta;
   - acelera JOIN com Cliente;
   - auxilia autorização e filtro por Cliente.

2. Índice parcial em `(organization_id, updated_at, id)` para `archived_at IS NULL`:
   - suporta a listagem operacional padrão do OWNER;
   - suporta ordenação padrão estável.

3. Índice parcial em `(client_id, updated_at, id)` para `archived_at IS NULL`:
   - suporta listagens por Cliente e o caminho de MEMBER;
   - reduz o conjunto operacional ativo.

4. Índice parcial em `(organization_id, status, updated_at, id)` para `archived_at IS NULL`:
   - suporta filtro operacional por Status.

5. Índice parcial em `(organization_id, priority, updated_at, id)` para `archived_at IS NULL`:
   - suporta filtro operacional por Priority.

6. Índice parcial em `(organization_id, due_date, id)` para Demandas não arquivadas com prazo:
   - suporta filtro e varredura backend por prazo;
   - exclui linhas sem `due_date` do índice.

Não serão criados inicialmente índices separados para todas as opções de ordenação. `created_at`, `title` e `start_date` deverão ser avaliados com Queries e planos reais antes de novos índices.

## `demand_assignees`

- a UNIQUE `(demand_id, membership_id)` cobre buscas por Demanda e impede duplicatas;
- índice em `membership_id` suporta filtro por responsável, JOIN e verificações relacionadas ao Membership.

## `demand_tags`

- índice único de expressão em Organization e nome normalizado suporta ownership, RLS, lookup e evita duplicatas conceituais;
- nenhum índice simples adicional em `organization_id` será criado inicialmente, pois ele duplicaria o prefixo desse índice.

## `demand_tag_assignments`

- a Primary Key `(demand_id, tag_id)` cobre buscas por Demanda;
- índice em `tag_id` suporta filtro por Tag e JOIN inverso.

## Pesquisa Textual

Nenhum índice Full Text ou trigram será criado por presunção.

Se a pesquisa case-insensitive deixar de ser adequada ao volume real, a alteração deverá ser sustentada por plano de execução e nova migration.

---

# Activity Logs

Representação congelada:

```text
entity_type = DEMAND
entity_id   = demand.id
```

Actions:

```text
CREATED
UPDATED
STATUS_CHANGED
ARCHIVED
```

## Mapeamento

| Operação | Action |
|---|---|
| Criar | `CREATED` |
| Editar conteúdo | `UPDATED` |
| Alterar Priority | `UPDATED` |
| Alterar `start_date` ou `due_date` | `UPDATED` |
| Alterar Tags | `UPDATED` |
| Alterar responsáveis | `UPDATED` |
| Alterar Status | `STATUS_CHANGED` |
| Arquivar | `ARCHIVED` |

Não criar:

```text
DEMAND_ASSIGNMENT
ASSIGNEE_ADDED
ASSIGNEE_REMOVED
TAG_ADDED
TAG_REMOVED
```

## Metadata

Metadata conterá somente delta mínimo quando necessário.

Exemplo conceitual de Status:

```json
{
  "old_status": "OPEN",
  "new_status": "IN_PROGRESS"
}
```

Para responsáveis e Tags, poderá conter apenas os identificadores adicionados e removidos.

Não armazenar snapshots completos, descrição, notas, documentos, credenciais ou secrets sem necessidade de auditoria.

## Atomicidade

Mutação e Activity Log deverão pertencer à mesma RPC.

Se o Log obrigatório falhar, toda a mutação deverá sofrer rollback.

INSERT direto em `activity_logs` permanece negado. UPDATE e DELETE permanecem negados.

---

# Notifications

Nenhuma tabela `notifications` será criada nesta Sprint.

O requisito funcional de avisos internos permanece, mas o contrato físico desta migration apenas garante os dados necessários para sustentá-lo sem definir o mecanismo nesta etapa:

```text
due_date
status
client_id
demand_assignees
```

Persistência e mecanismo de entrega exigem contrato específico posterior.

---

# Documents

Nenhuma tabela de Documents ou metadata específica de Demandas será criada.

A futura relação Demand ↔ Document deverá reutilizar a infraestrutura central e privada quando seu contrato físico for aprovado.

---

# Testes Físicos a Implementar Posteriormente

Nenhum teste é criado neste planejamento.

## Schema

- quatro tabelas existentes após a migration;
- colunas, tipos e nulabilidade;
- UUID PK em `demands`, `demand_assignees` e `demand_tags`;
- Primary Key composta `(demand_id, tag_id)` e ausência de UUID em `demand_tag_assignments`;
- defaults;
- checks de Status e Priority;
- título vazio negado;
- unicidade de assignee;
- unicidade normalizada de Tag;
- `archived_at` independente de Status;
- ausência de colunas de atraso;
- nenhuma tabela de `notifications` ou Documents criada pela migration.

## Integridade

- Demand e Client da mesma Organization;
- divergência Demand/Client negada;
- `client_id` imutável;
- Assignee da mesma Organization;
- MEMBER sem Client Assignment inelegível como novo assignee;
- OWNER elegível sem Client Assignment;
- ADMIN inelegível como assignee;
- Tag da mesma Organization;
- Tag cross-Organization negada;
- associações duplicadas negadas;
- Tag existente reutilizada por correspondência normalizada;
- novo nome cria Tag somente na Organization autorizada;
- remoção da última associação não exclui automaticamente a Tag órfã;
- remoção de Client Assignment preserva o assignee físico sem preservar acesso.

## RLS

- OWNER autorizado na própria Organization;
- MEMBER autorizado pelo Client Assignment;
- MEMBER sem Client Assignment negado;
- MEMBER responsável sem Client Assignment negado;
- MEMBER do Cliente A negado na Demanda do Cliente B;
- ADMIN negado;
- outra Organization negada;
- Membership não `ACTIVE` negada;
- Profile não `ACTIVE` negado;
- Organization não `ACTIVE` negada;
- `anon` e não autenticado negados;
- listagem, detalhe, contagem e relações sem Data Leakage;
- Activity Logs sem Data Leakage;
- candidatos elegíveis retornam somente OWNER e MEMBER autorizados para o Cliente;
- responsáveis já vinculados retornam somente projeção mínima a quem acessa a Demanda;
- responsável histórico aparece como não elegível sem receber acesso;
- consulta arbitrária por `membership_id` e enumeração de Profiles/Memberships são negadas.

## Escritas e RPCs

- Happy Path de OWNER por operação;
- Happy Path de MEMBER autorizado por operação permitida;
- MEMBER sem Client Assignment negado;
- MEMBER arquivando negado;
- ADMIN negado em todas as operações;
- troca de Cliente negada;
- spoofing de `organization_id`, autoria, role e identidade negado ou impossível pela assinatura;
- conjunto vazio de responsáveis aceito;
- candidatos inválidos causam rollback integral;
- Tags cross-Organization causam rollback integral;
- conjunto de Tags existentes e novos nomes é resolvido e substituído atomicamente;
- alteração de Tags registra `DEMAND / UPDATED` com delta mínimo;
- EXECUTE de `PUBLIC` e `anon` negado;
- retorno mínimo e erros sem Data Leakage.

## Activity Logs

- `entity_type = DEMAND`;
- `entity_id` correto;
- Organization correta;
- ator igual ao utilizador autenticado;
- Action correta em cada operação;
- metadata mínima;
- INSERT direto negado;
- UPDATE e DELETE negados;
- mutação e Log atômicos;
- falha do Log causa rollback;
- falha da mutação não cria Log falso.

## Queries

- pesquisa por título e descrição;
- `notes` fora da pesquisa;
- filtros aprovados;
- whitelist de ordenação;
- desempate por `id`;
- paginação e total autorizados;
- arquivados excluídos por padrão;
- coleção vazia;
- nenhuma filtragem de autorização em memória.

---

# Decisões Congeladas

- quatro tabelas físicas de Demandas;
- schema principal de cada tabela;
- título e Cliente obrigatórios;
- responsáveis opcionais `0..N`;
- Status default `OPEN`;
- Priority default `MEDIUM`;
- datas civis opcionais;
- Cliente imutável;
- arquivamento lógico;
- preservação do assignee após remoção de acesso;
- leitura de candidatos e responsáveis vinculados por RPCs mínimas, sem ampliar Policies de Profiles ou Memberships;
- Tags por Organization com unicidade case-insensitive após trim;
- Tag Assignment sem UUID próprio;
- criação inline de Tag somente por `set_demand_tags`;
- rename, delete e administração independente de Tags fora do escopo;
- Tags órfãs não são removidas automaticamente;
- integridade Demand/Client por FK composta;
- integridade de Assignee e Tag por trigger privado e RPC;
- ADMIN negado nesta Sprint;
- MEMBER dependente de Client Assignment;
- escritas exclusivamente por RPC auditada;
- leituras normais por Query + RLS;
- pesquisa em título e descrição;
- ordenação por whitelist;
- atraso derivado;
- Activity Logs centralizados em `DEMAND`.

---

# Decisões Deliberadamente Fora desta Sprint

- tabela e mecanismo persistente de Notifications;
- threshold de “próxima do prazo”;
- scheduler, cron ou worker;
- Documents e metadata;
- Full Text Search;
- remoção física normal de Demandas;
- restauração de Demandas arquivadas;
- troca de Cliente;
- máquina rígida de Status;
- acesso de ADMIN ao módulo;
- rename global, delete global e administração independente do catálogo de Tags;
- Dashboard consolidado;
- Financeiro e Contratos.

A convenção de data local usada para interpretar a expiração deverá ser congelada antes da implementação do helper de prazo, sem exigir mudança no schema aprovado.

---

# Conformidade da Implementação Futura

A migration e sua validação estarão conformes a este contrato quando:

- nenhuma tabela fora do escopo for criada;
- as quatro tabelas seguirem exatamente as colunas aprovadas;
- constraints e índices seguirem os padrões reais de acesso;
- integridade cross-Organization estiver protegida;
- RLS estiver ativa antes dos Grants;
- OWNER, ADMIN e MEMBER seguirem a matriz congelada;
- assignee nunca for utilizado como autorização;
- responsáveis elegíveis e históricos forem projetados sem enumeração arbitrária ou Data Leakage;
- escritas e auditoria forem atômicas;
- `SECURITY DEFINER` estiver endurecido conforme RLS e ADR-002;
- Activity Logs permanecerem centralizados e imutáveis;
- Queries não causarem Data Leakage;
- Notifications e Documents não forem antecipados;
- todos os testes físicos deste documento forem implementados e aprovados na etapa correspondente.
