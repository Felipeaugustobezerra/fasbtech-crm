# Sprint 03 — Demandas

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟢 Concluída

---

## Última atualização

Setembro de 2026

---

# Estado Final

Este documento registra o planejamento aprovado e o resultado técnico final da Sprint 03.

O contrato físico está implementado e validado conforme `docs/04-database/Demands.md`. A Sprint entregou banco, aplicação, interface, testes e fechamento de segurança do módulo de Demandas.

---

# Objetivo

Implementar o módulo de Demandas do FASBtech CRM v3.0.

Uma Demanda representa uma unidade operacional de trabalho ou serviço executado para um Cliente.

Esta Sprint entregou:

- cadastro, listagem, pesquisa, filtros, ordenação e paginação de Demandas;
- detalhes, edição e arquivamento;
- associação obrigatória a Cliente;
- suporte a `0..N` responsáveis internos;
- Status, Prioridade e Tags como conceitos separados;
- datas e prazos;
- observações ou notas operacionais;
- Activity Logs aplicáveis;
- autorização baseada em Organization, Membership, role e Client Assignment;
- interface responsiva e acessível;
- testes proporcionais ao risco.

Demandas substituem completamente Projects como unidade operacional de trabalho no MVP.

Não existe módulo Projects no MVP v3.0.

---

# Dependência Principal

A Sprint 03 depende de:

```text
Sprint 01 — Foundation
Status: Concluída

Sprint 02 — Clientes & Acessos
Status: Concluída
```

A Sprint 02 fornece:

- autenticação;
- Profile;
- Organization;
- Memberships internas;
- roles `OWNER`, `ADMIN` e `MEMBER`;
- Clients;
- Client Assignments;
- autorização por Cliente;
- RLS e Policies existentes;
- RPCs endurecidas;
- Activity Logs centralizados;
- infraestrutura privada de Storage;
- Error Handling;
- infraestrutura de testes.

---

# Documentos de Referência

Antes do início técnico da Sprint, deverão ser consultados somente os documentos diretamente aplicáveis.

## Produto e Requisitos

- PRD v3.0;
- MVP Scope v3.0;
- Product Roadmap v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- User Stories v3.0.

## Arquitetura e Banco

- System Architecture;
- Module Architecture;
- Data Model;
- Demands;
- Organization User Model;
- RLS;
- Activity Logs;
- Migrations;
- ADR-002 — Estratégia de Persistência e Transações;
- Error Handling.

## Desenvolvimento e Design

- Conventions;
- Testing Strategy;
- Implementation Guide;
- DataTable Guidelines;
- CRM UI Guidelines;
- Accessibility;
- Design Tokens.

---

# Contrato Funcional Congelado

A Sprint deverá preservar os seguintes invariantes:

1. Toda Demanda pertence a um Cliente.
2. A Demanda pertence à mesma Organization do Cliente.
3. Uma Demanda suporta `0..N` responsáveis internos.
4. Responsáveis pertencem à Organization da Demanda e devem estar autorizados conforme as regras do módulo.
5. Ser responsável por uma Demanda não concede acesso ao Cliente.
6. Client Assignment continua sendo a base de autorização de `MEMBER` por Cliente.
7. Status, Prioridade e Tags são conceitos independentes.
8. Tags não determinam o workflow operacional.
9. O arquivamento é lógico e preserva histórico.
10. Listagens, pesquisas, filtros, ordenação, paginação e contagens retornam somente dados autorizados.
11. Activity Logs utilizam a infraestrutura central `activity_logs`.
12. Documentos utilizam a infraestrutura central e privada; não haverá sistema de arquivos específico para Demandas.
13. Notifications persistentes e seu mecanismo de entrega permanecem fora da Sprint.
14. O Dashboard consolidado permanece na Sprint 06.

---

# Escopo da Sprint

## Gestão de Demandas

- cadastrar;
- listar;
- pesquisar;
- filtrar;
- ordenar;
- paginar;
- visualizar detalhes;
- editar;
- arquivar sem exclusão física;
- gerir responsáveis;
- gerir Status;
- gerir Prioridade;
- gerir Tags;
- gerir data de início e prazo;
- registrar observações ou notas;
- armazenar data de início e prazo como datas civis.

## Segurança

- isolamento por Organization;
- autorização por Cliente;
- RLS e Policies das estruturas introduzidas;
- proteção contra acesso direto por identificador ou URL;
- proteção contra Data Leakage;
- validação interna de RPCs privilegiadas quando existirem;
- Activity Logs imutáveis e autorizados.

## Interface

- lista de Demandas;
- cadastro;
- detalhes;
- edição;
- gestão de responsáveis;
- atualização de Status;
- arquivamento;
- estados Loading, Empty, Error e Success;
- responsividade em Desktop, Tablet e Mobile;
- WCAG 2.2 AA.

---

# Fora do Escopo

Esta Sprint não deverá implementar:

- Financeiro;
- Contratos;
- Dashboard consolidado;
- métricas materializadas exclusivamente para o Dashboard;
- Leads;
- Projects;
- Product Registry operacional;
- Agenda;
- reuniões;
- assinatura eletrônica integrada;
- billing;
- fiscalidade ou contabilidade;
- SaaS multi-Organization de produção;
- tenant switching;
- aplicativo mobile nativo;
- API pública;
- marketplace;
- inteligência artificial generativa;
- e-mail automático;
- WhatsApp;
- SMS;
- push externo;
- integrações ou automações externas;
- scheduler, cron ou worker sem decisão arquitetural aprovada.

Não antecipar as Sprints 04, 05 ou 06.

---

# Modelo Conceitual

```text
Organization
│
├── Members
│
└── Clients
    │
    └── Demands
        ├── Assignees
        ├── Tags
        └── Activity Logs
```

A existência de uma relação estrutural nunca substitui autorização.

---

# Demanda

Cada Demanda deverá possuir fisicamente:

- `id` UUID;
- `organization_id` UUID derivado do Cliente;
- `client_id` UUID obrigatório e imutável;
- `title` TEXT obrigatório e não vazio após trim;
- `description` TEXT opcional;
- `status` obrigatório, com default `OPEN`;
- `priority` obrigatória, com default `MEDIUM`;
- `start_date` DATE opcional;
- `due_date` DATE opcional;
- `notes` TEXT opcional;
- `created_by` e `updated_by` vinculados a Profiles e determinados no backend;
- `created_at` e `updated_at` como TIMESTAMPTZ;
- `archived_at` como TIMESTAMPTZ opcional.

A Demanda também poderá possuir `0..N` responsáveis internos e `0..N` Tags por meio das relações físicas congeladas em `Demands`.

Primary Keys congeladas:

```text
demands
→ id UUID

demand_assignees
→ id UUID

demand_tags
→ id UUID

demand_tag_assignments
→ (demand_id, tag_id)
→ sem UUID próprio
```

Título e Cliente são os campos funcionais obrigatórios do payload.

A associação de responsáveis é opcional e possui cardinalidade `0..N`. O contrato garante suporte a múltiplos responsáveis, mas não exige que uma Demanda possua ao menos um responsável.

Descrição, data de início, prazo e notas são opcionais. Status e Prioridade são obrigatórios e recebem os defaults congelados. Tags e responsáveis são relações opcionais. Documents permanecem apenas como integração conceitual fora do contrato físico desta Sprint.

---

# Relação com Cliente

Relacionamento conceitual:

```text
clients

1

↓

N

demands
```

Regras:

- toda Demanda pertence a exatamente um Cliente;
- Cliente e Demanda pertencem à mesma Organization;
- conhecer `client_id` ou `demand_id` não concede autorização;
- a existência da Demanda não concede acesso ao Cliente;
- `client_id` e `organization_id` são imutáveis após a criação;
- uma Demanda criada para o Cliente incorreto deverá ser arquivada e recriada corretamente, inclusive por OWNER.

---

# Responsáveis

Uma Demanda poderá possuir múltiplos responsáveis, com cardinalidade:

```text
Demanda
→ 0..N responsáveis internos
```

Relacionamento conceitual aprovado:

```text
organization_members

N

↕

N

demands
```

O Data Model utiliza conceitualmente:

```text
demand_assignees
```

Estrutura física congelada:

```text
demand_assignees

id
demand_id
membership_id
created_by
created_at
```

A relação deverá possuir unicidade de `(demand_id, membership_id)`.

Regras obrigatórias:

- o responsável deve possuir Membership válida na Organization da Demanda;
- um `MEMBER` responsável deve continuar sujeito ao Client Assignment do Cliente;
- atribuir responsabilidade não cria Client Assignment;
- atribuir responsabilidade não altera role ou ownership;
- ser responsável não contorna RLS, Policies ou autorização por Cliente;
- remover o Client Assignment retira imediatamente o acesso do `MEMBER`, mesmo que exista uma associação de responsável;
- alterações no conjunto de responsáveis são auditáveis;
- a atualização composta do conjunto de responsáveis deverá ser atômica quando puder deixar estado parcial.

A associação física será preservada após a remoção posterior do Client Assignment para manter o histórico operacional. Ela nunca será utilizada como autorização. O `MEMBER` perde o acesso imediatamente porque RLS, Queries e RPCs dependem sempre do Client Assignment atual. A associação preservada poderá ser removida depois por uma operação autorizada de gestão de responsáveis.

No momento da atribuição:

- OWNER ativo da mesma Organization é elegível sem Client Assignment;
- MEMBER ativo da mesma Organization exige Client Assignment atual para o Cliente;
- ADMIN não é elegível nesta Sprint.

`list_eligible_demand_assignees` fornecerá somente candidatos atualmente válidos para o Cliente, com a projeção mínima:

```text
membership_id
full_name
role
```

Para exibir responsáveis já vinculados, inclusive históricos, `list_demand_assignees` receberá somente `demand_id`, exigirá acesso atual do chamador à Demanda e retornará apenas:

```text
membership_id
full_name
role
is_currently_eligible
```

Para a listagem paginada, `list_demand_assignees_bulk(p_demand_ids uuid[])` receberá somente IDs retornados na página e acrescentará `demand_id` à mesma projeção mínima. A autorização será recalculada para cada Demanda: OWNER ativo seguirá o acesso da própria Organization; MEMBER ativo exigirá Client Assignment atual; MEMBER sem Assignment, assignee histórico sem Assignment, ADMIN, outra Organization e `anon` não receberão dados. Arrays mistos retornarão silenciosamente apenas os IDs autorizados, sem distinguir inexistência de falta de acesso. Responsáveis históricos poderão aparecer com `is_currently_eligible = false` somente quando o chamador mantiver acesso atual à Demanda.

As três leituras serão RPCs mínimas endurecidas porque as Policies globais de Profiles e Memberships não serão ampliadas para alimentar seletores. Serão `SECURITY DEFINER`, utilizarão `SET search_path = ''`, `auth.uid()` interno, schemas explícitos e `EXECUTE` somente para `authenticated`; a bulk será também `STABLE`. Nenhuma aceitará consulta arbitrária por `membership_id`, listará outras Organizations ou utilizará assignee como autorização.

---

# Status

Domínio oficial:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

Regras:

- somente valores do domínio oficial são permitidos;
- Status pertence à Demanda;
- Status não será modelado como Tag;
- Tags não substituem Status;
- a alteração de Status é auditável;
- nenhuma máquina rígida de transições é criada por este planejamento.

O Status inicial padrão é:

```text
OPEN
```

---

# Prioridade

Domínio oficial:

```text
LOW
MEDIUM
HIGH
URGENT
```

Regras:

- somente valores do domínio oficial são permitidos;
- Prioridade pertence à Demanda;
- Prioridade é independente de Status e Tags;
- alterações de Prioridade são auditáveis.

A Prioridade inicial padrão é:

```text
MEDIUM
```

---

# Tags

Tags representam classificação complementar.

Relacionamento conceitual existente no Data Model:

```text
demands

N

↕

N

demand_tags

através de demand_tag_assignments
```

Tags:

- não representam Status;
- não representam Prioridade;
- não controlam regras essenciais de workflow;
- poderão participar de filtros quando implementadas;
- deverão respeitar Organization e autorização da Demanda.

Estruturas físicas congeladas:

```text
demand_tags

id
organization_id
name
created_by
created_at
```

e:

```text
demand_tag_assignments

demand_id
tag_id
created_at
```

`demand_tag_assignments` utiliza Primary Key composta `(demand_id, tag_id)` e não possui UUID próprio.

Tags formam um catálogo livre por Organization. O nome é armazenado com trim e a capitalização de exibição preservada. A unicidade utiliza `Organization + lower(trim(name))`, impedindo duplicatas conceituais sem proibir uma Tag chamada “Urgente”.

`set_demand_tags` é a fronteira transacional para gerir o conjunto completo de Tags de uma Demanda. Seu contrato conceitual aceita referências a Tags existentes e novos nomes, sem congelar ainda a assinatura SQL.

A operação deverá:

- resolver a Organization pela Demanda autorizada;
- validar Tags existentes na mesma Organization;
- normalizar novos nomes com trim e comparar por `lower(trim(name))`;
- reutilizar a Tag correspondente ou criar uma Tag inexistente na Organization;
- substituir os `demand_tag_assignments` atomicamente;
- impedir relações cross-Organization;
- registrar `DEMAND / UPDATED` com metadata mínima;
- nunca utilizar Tags como autorização.

Nesta Sprint:

```text
criação inline de Tag
→ permitida por set_demand_tags

rename global de Tag
→ fora do escopo

delete global de Tag
→ fora do escopo

administração independente do catálogo
→ fora do escopo
```

Remover a última associação não excluirá automaticamente uma Tag órfã.

Não existe `listDemandTags()` global nem catálogo organizacional de Tags exposto ao MEMBER nesta Sprint. A interface poderá mostrar e remover Tags já associadas à Demanda, reutilizar IDs conhecidos no contexto e enviar novos nomes; `set_demand_tags` continuará responsável por normalizar, reutilizar ou criar Tags.

---

# Datas e Prazos

A Demanda deverá permitir:

- `start_date` opcional como `DATE`;
- `due_date` opcional como `DATE`.

Esses campos representam datas civis. Nenhum horário de prazo será persistido ou inferido.

Atraso é um estado derivado dos dados da Demanda, não um campo duplicado armazenado.

BR-309, BR-310, BR-311 e FR-426 sustentam a seguinte regra funcional:

```text
prazo expirado

+

Status diferente de COMPLETED e CANCELED
```

Demandas `COMPLETED` ou `CANCELED` não são atrasadas.

Demandas arquivadas não aparecem nas listagens operacionais padrão.

As classificações de prazo deverão ser derivadas dos dados da Demanda e não armazenadas como métricas duplicadas para o Dashboard.

A convenção única de data local da aplicação usada na comparação deverá ser confirmada antes da implementação do helper de prazo. Essa decisão não altera o schema físico congelado.

“Próxima do prazo” também é uma classificação derivada. Seu limiar temporal não está congelado e deverá ser aprovado antes da implementação.

---

# Arquivamento

O fluxo operacional deverá utilizar arquivamento lógico.

Arquivar uma Demanda:

- remove-a das listagens padrão;
- não realiza delete físico;
- preserva histórico;
- preserva Activity Logs;
- não apaga automaticamente documentos ou relações históricas;
- deve gerar auditoria.

Não haverá operação normal de exclusão física de Demanda.

---

# Notificações Internas

Notifications persistentes e o mecanismo de avisos internos não foram implementados na Sprint 03.

A Sprint entregou `due_date`, Status, Cliente e responsáveis como dados suficientes para uma evolução futura, sem criar tabela `notifications`, scheduler, cron, worker, trigger temporal ou integração externa.

Essa decisão é deliberadamente externa à entrega concluída e não representa pendência técnica da Sprint 03.

---

# Documentos

Demandas relacionam-se conceitualmente com a infraestrutura central de documentos privados.

Regras:

- não criar sistema de documentos específico para Demandas;
- reutilizar Supabase Storage privado;
- o acesso ao documento segue a autorização da Demanda e do Cliente;
- conhecer o caminho ou a URL não concede acesso;
- um `MEMBER` sem Client Assignment não pode acessar documentos da Demanda;
- a interface não deverá simular upload ou gestão documental antes do contrato físico correspondente.

O schema físico de metadata de documentos ainda não está congelado.

Esta Sprint não deverá inventar `demand_documents` ou outra tabela específica.

A integração permanece conceitual até a aprovação do modelo centralizado de documentos.

---

# Autorização

A autorização deverá preservar o modelo estabelecido na Sprint 02.

```text
auth.uid()

↓

Profile válido

↓

Membership ACTIVE

↓

Organization permitida

↓

role

↓

Cliente da Demanda

↓

Client Assignment quando o utilizador for MEMBER
```

---

# Matriz de Acesso Base

```text
OWNER
→ Demanda de Cliente da própria Organization
→ acesso administrativo permitido dentro do escopo da Sprint
```

```text
MEMBER com Client Assignment válido
→ Demanda daquele Cliente
→ acesso operacional permitido conforme a operação autorizada
```

```text
MEMBER sem Client Assignment
→ Demanda daquele Cliente
→ acesso negado
```

```text
MEMBER autorizado no Cliente A
→ Demanda do Cliente B
→ acesso negado
```

```text
MEMBER responsável sem Client Assignment
→ Demanda
→ acesso negado
```

```text
Utilizador de outra Organization
→ Demanda
→ acesso negado
```

```text
Membership não ACTIVE
→ Demanda
→ acesso negado
```

```text
Não autenticado
→ Demanda
→ acesso negado
```

---

# OWNER

`OWNER` possui acesso administrativo completo à própria Organization dentro do escopo do MVP.

Para Demandas de Clientes da própria Organization, o planejamento prevê acesso às operações administrativas da Sprint, sem depender de Client Assignment individual.

---

# ADMIN

`ADMIN` não participa do módulo de Demandas nesta Sprint.

Não poderá listar, visualizar, criar, editar, alterar Status/Prioridade/datas, gerir Tags ou responsáveis, trocar Cliente ou arquivar Demandas.

Esta negação não concede acesso global nem Client Assignment implícito e não redefine permissões de Sprints futuras.

---

# MEMBER

`MEMBER` possui acesso operacional restrito às Demandas de Clientes para os quais mantenha Client Assignment válido.

Nesse contexto, poderá:

- listar e visualizar;
- criar;
- editar título, descrição e notas;
- alterar Status e Prioridade;
- alterar data de início e prazo;
- gerir Tags;
- gerir responsáveis.

Não poderá trocar o Cliente nem arquivar a Demanda.

Sem Client Assignment atual, todas essas operações são negadas, ainda que o MEMBER permaneça fisicamente associado como responsável.

---

# Dados Não Confiáveis

Nunca confiar em valores enviados pelo browser como fonte de autorização.

Incluindo:

```text
organization_id
client_id
demand_id
user_id
membership_id
role
permissions
created_by
updated_by
```

IDs poderão identificar recursos solicitados, mas a autorização deverá ser recalculada no servidor e no banco.

---

# Acesso Direto e Data Leakage

A URL direta nunca poderá contornar autorização.

Para leitura não autorizada, o Error Handling deverá evitar revelar se a Demanda existe ou pertence a outra Organization.

Queries deverão aplicar autorização antes de retornar dados.

Não será permitido carregar todas as Demandas e filtrar no frontend.

Também deverão permanecer autorizados:

- resultados de pesquisa;
- opções de filtros;
- ordenação;
- paginação;
- totais e contagens;
- indicadores derivados;
- responsáveis exibidos;
- Tags exibidas;
- prazos e notificações;
- Activity Logs;
- documentos relacionados.

---

# Activity Logs

Todas as operações relevantes definidas por Functional Requirements e Business Rules deverão gerar Activity Log.

Representação principal:

```text
entity_type = DEMAND
entity_id   = <identificador da Demanda>
```

Actions planejadas com base no domínio já existente:

```text
CREATED
UPDATED
STATUS_CHANGED
ARCHIVED
```

Mapeamento:

| Operação | Action |
|---|---|
| Criação da Demanda | `CREATED` |
| Edição de conteúdo | `UPDATED` |
| Alteração de Prioridade | `UPDATED` |
| Alteração de prazo | `UPDATED` |
| Alteração de Tags | `UPDATED` |
| Adição ou remoção de responsáveis | `UPDATED` |
| Alteração de Status | `STATUS_CHANGED` |
| Arquivamento | `ARCHIVED` |

Alterações de responsáveis permanecem ancoradas em `DEMAND`.

Não criar:

```text
DEMAND_ASSIGNMENT
```

nem Actions específicas de responsáveis sem nova decisão arquitetural fundamentada.

Metadata poderá registrar diferenças mínimas necessárias, sem snapshots completos, credenciais, tokens ou dados sensíveis desnecessários.

`organization_id`, ator, entidade e Action deverão ser determinados ou validados pelo mecanismo autorizado, nunca aceitos livremente do browser.

Quando a auditoria for obrigatória e inseparável da mutação, ambas deverão ocorrer na mesma transação.

---

# Arquitetura de Implementação

## Leituras

Fluxo esperado:

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

Queries serão responsáveis por:

- listagem;
- detalhes;
- pesquisa;
- filtros;
- ordenação;
- paginação;
- contagens autorizadas quando necessárias.

Pesquisa, filtros, ordenação e paginação deverão ocorrer no banco.

RPC não será utilizada por padrão para leitura simples.

Exceções aprovadas:

- `list_eligible_demand_assignees(client_id)` retorna candidatos elegíveis com projeção mínima;
- `list_demand_assignees(demand_id)` retorna somente responsáveis vinculados à Demanda acessível no detalhe, incluindo o estado derivado de elegibilidade atual;
- `list_demand_assignees_bulk(demand_ids)` retorna, para a listagem, somente responsáveis de Demandas atualmente autorizadas entre os IDs da página.

Essas RPCs evitam abrir leitura geral de Profiles e Memberships. As três deverão recalcular autorização internamente, impedir enumeração arbitrária e retornar somente os campos congelados no contrato `Demands`.

A listagem utilizará exatamente uma Query paginada de Demandas e, quando houver resultados, uma única chamada bulk somente com os IDs retornados nessa página. Não haverá chamada individual por linha nem chamada bulk para página vazia. O detalhe de uma única Demanda continuará utilizando `list_demand_assignees(demand_id)`.

## Escritas

Fluxo de entrada esperado:

```text
Form / interação

↓

validação no cliente para UX

↓

Server Action

↓

validação server-side

↓

Service

↓

RPC transacional aprovada
```

Todas as escritas de Demandas desta Sprint utilizarão RPC, pois cada operação relevante exige autorização, mutação e Activity Log na mesma transação e as relações podem exigir múltiplas escritas.

Fronteiras operacionais congeladas:

- criar Demanda e responsáveis iniciais opcionais;
- atualizar conteúdo, Prioridade e datas;
- alterar Status separadamente;
- substituir o conjunto de responsáveis;
- substituir o conjunto de Tags;
- arquivar Demanda.

Os nomes propostos, consistentes com a Sprint 02, são `create_demand`, `update_demand`, `change_demand_status`, `set_demand_assignees`, `set_demand_tags` e `archive_demand`. A migration poderá ajustar nomes às convenções reais, mas não alterar essas fronteiras.

Toda RPC `SECURITY DEFINER`, se necessária, deverá validar internamente o contrato completo de RLS e ADR-002, usar `SET search_path = ''`, schemas explícitos e `EXECUTE` restrito.

---

# Error Handling

Toda Server Action deverá utilizar o contrato oficial `ActionResult`.

Erros deverão ser mapeados para códigos seguros, incluindo quando aplicável:

- `VALIDATION_ERROR`;
- `AUTHENTICATION_REQUIRED`;
- `AUTHORIZATION_DENIED`;
- `NOT_FOUND`;
- `CONFLICT`;
- `DATABASE_ERROR`;
- `UNEXPECTED_ERROR`.

Para leitura de uma Demanda inexistente ou não autorizada, preferir resposta que não revele a existência do recurso.

A interface deverá:

- associar erros aos campos;
- preservar dados preenchidos em falhas recuperáveis;
- apresentar feedback seguro;
- oferecer tentativa novamente em Error States quando aplicável;
- nunca expor SQL, RLS, stack traces, tokens ou detalhes internos.

---

# Banco de Dados Implementado

As migrations da Sprint 03 implementaram somente a infraestrutura aprovada para Demandas.

Estruturas físicas implementadas conforme `Demands`:

```text
demands
demand_assignees
demand_tags
demand_tag_assignments
```

Nenhuma tabela `notifications` ou Documents integra as migrations da Sprint 03.

---

# Constraints Implementadas

As migrations implementaram conforme o contrato `Demands`:

- UUID Primary Key em `demands.id`;
- UUID Primary Key em `demand_assignees.id`;
- UUID Primary Key em `demand_tags.id`;
- Primary Key composta `(demand_id, tag_id)` em `demand_tag_assignments`, sem UUID próprio;
- Foreign Keys para estruturas já existentes;
- pertencimento da Demanda ao Cliente e à Organization correta;
- responsáveis vinculados à mesma Organization;
- integridade das relações de Tags;
- domínios controlados de Status e Prioridade;
- obrigatoriedade de título e Cliente;
- cardinalidade opcional `0..N` para responsáveis;
- unicidade necessária nas relações N:N;
- integridade de timestamps e arquivamento;
- proteção contra relações cross-Organization.

Foreign Key não substitui autorização.

---

# Índices Implementados

Os índices mínimos congelados em `Demands` atendem aos padrões reais de:

- autorização por Organization e Cliente;
- Client Assignment para `MEMBER`;
- listagem padrão de Demandas ativas;
- relacionamento Demanda ↔ responsáveis;
- relacionamento Demanda ↔ Tags;
- pesquisa aprovada;
- filtros por Cliente, Status, Prioridade, responsável, Tags e prazo;
- ordenação e paginação;
- identificação de prazos;
- consultas autorizadas de Activity Logs.

Não criar índices adicionais sem Query e plano de execução que os justifiquem.

---

# RLS e Policies

Todas as tabelas protegidas introduzidas deverão possuir RLS antes de uso pela aplicação.

As Policies deverão garantir:

- autenticação válida;
- Profile válido;
- Membership `ACTIVE`;
- Organization ativa e correta;
- role permitida pela operação;
- pertencimento da Demanda ao Cliente;
- Client Assignment válido para `MEMBER`;
- isolamento de responsáveis e Tags;
- negação de outra Organization;
- negação de acesso anônimo;
- ausência de delete físico pelo fluxo normal;
- acesso autorizado a Activity Logs.

As Policies concretas estão congeladas no contrato `Demands`: SELECT depende da autorização atual por Organization e Client Assignment; `demand_assignees` nunca concede acesso; ADMIN é negado; e não haverá escrita direta nas quatro tabelas. Escritas serão feitas somente pelas RPCs autorizadas.

---

# Decisões Físicas Congeladas Antes da Migration

O contrato completo está em `docs/04-database/Demands.md`.

## Schema e Ownership

- schemas, tipos, nulabilidade, defaults, timestamps e arquivamento das quatro tabelas estão congelados;
- `organization_id` da Demanda é derivado do Cliente;
- integridade Demand/Client/Organization usa Foreign Key composta;
- `client_id` e `organization_id` são imutáveis.

## Responsáveis e Tags

- `demands`, `demand_assignees` e `demand_tags` usam UUID PK;
- `demand_tag_assignments` usa Primary Key composta e não possui UUID;
- `demand_assignees` possui unicidade por Demanda e Membership;
- a associação é preservada após a remoção do Client Assignment, sem conceder autorização;
- candidatos, responsáveis no detalhe e responsáveis em lote são expostos somente pelas três RPCs mínimas aprovadas, sem ampliar Policies globais;
- Tags pertencem à Organization e usam unicidade por nome normalizado;
- `set_demand_tags` aceita Tags existentes e novos nomes, reutiliza ou cria dentro da Organization e substitui associações atomicamente;
- não existe `listDemandTags()` global nem catálogo organizacional exposto ao MEMBER nesta Sprint;
- rename, delete, administração independente e limpeza automática de Tags órfãs não integram a Sprint;
- relações cross-Organization não demonstráveis por FK usam trigger privado e validação da RPC.

## Campos, Defaults e Prazos

- Cliente e título são obrigatórios no payload funcional;
- descrição, datas e notas são opcionais;
- Status inicia em `OPEN`;
- Prioridade inicia em `MEDIUM`;
- início e prazo usam `DATE`;
- atraso permanece derivado;
- a convenção local de comparação deverá ser confirmada antes do helper de prazo;
- nenhum limiar de “próxima do prazo” está congelado.

## Pesquisa, Ordenação e Paginação

- pesquisa inicial em título e descrição;
- filtros por Cliente, Status, Prioridade, responsável, Tags e prazo;
- ordenação por whitelist de `created_at`, `updated_at`, `title`, `start_date`, `due_date`, `status` e `priority`;
- paginação no banco com 10, 20, 50 ou 100 registros e default 20.

## RLS, Escritas e Auditoria

- OWNER acessa Demandas da própria Organization;
- MEMBER exige Client Assignment atual e segue a matriz congelada;
- ADMIN é negado nesta Sprint;
- leitura normal usa Query + RLS;
- escrita direta é negada;
- as seis fronteiras de escrita usam RPC com Activity Log atômico;
- Actions permanecem `CREATED`, `UPDATED`, `STATUS_CHANGED` e `ARCHIVED` em `entity_type = DEMAND`.

## Itens Fora do Contrato Físico

- `notifications`, scheduler, cron, worker ou trigger temporal;
- Documents ou metadata específica de Demandas;
- threshold de “próxima do prazo”;
- Full Text Search;
- troca de Cliente, restauração ou delete físico.

---

# Migrations

A numeração concreta deverá seguir o documento Migrations e a ordem cronológica real do repositório.

As migrations da Sprint 03 foram implementadas seguindo integralmente `docs/04-database/Demands.md`:

- schema e relações;
- matriz de operações de OWNER, ADMIN e MEMBER;
- integridade e Policies;
- operações auditáveis e fronteiras transacionais;
- Queries, ordenação, paginação e índices mínimos;
- exclusão física de Notifications e Documents desta migration.

A convenção local de comparação de prazo, Notifications e Documents permanecem fora desta entrega e não bloquearam o banco de Demandas.

Não editar migrations históricas da Foundation ou da Sprint 02.

---

# Interface

A ordem da navegação principal permanece inalterada:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

Esta Sprint implementou somente a entrada já existente de Demandas e não alterou a ordem ou o escopo dos demais módulos.

Rotas entregues:

```text
/demandas
/demandas/nova
/demandas/[id]
/demandas/[id]/editar
```

A interface final inclui listagem, pesquisa, filtros, ordenação, paginação, criação, detalhe, edição, Status, responsáveis, Tags, arquivamento e estados de loading, error, empty e not-found seguro. A apresentação é responsiva para Desktop e Mobile.

## Lista de Demandas

Estrutura:

```text
Page Header

↓

Toolbar

↓

DataTable / Cards no Mobile

↓

Pagination
```

O Page Header deverá apresentar o contexto de Demandas e a ação principal somente quando o utilizador puder executá-la.

A Toolbar entregue possui:

- pesquisa;
- filtros aprovados;
- ordenação;
- ação “Nova Demanda” quando autorizada.

A pesquisa deverá ocorrer no banco, utilizar debounce e preservar filtros, ordenação e paginação quando aplicável.

Filtros efetivamente expostos na interface:

- Status;
- Prioridade;
- prazo exato.

As Queries suportam filtros adicionais internamente, mas eles não são apresentados como entregas da interface desta Sprint.

A pesquisa inicial utiliza título e descrição. A ordenação utiliza somente a whitelist `created_at`, `updated_at`, `title`, `start_date`, `due_date`, `status` e `priority`, com padrão `updated_at` descendente e desempate por `id` descendente.

Colunas ou informações prioritárias:

- Demanda ou título;
- Cliente;
- Status;
- Prioridade;
- responsáveis;
- prazo;
- ações.

Status deverá utilizar o componente oficial de Status Badge.

Prioridade e Tags deverão possuir tratamentos visuais distintos de Status.

A linha poderá levar aos detalhes sem conflitar com links, botões ou menus internos.

Pesquisa, filtros, ordenação, paginação e estado deverão ser refletidos na URL conforme DataTable Guidelines.

A paginação deverá ocorrer no banco e apresentar:

- página atual;
- total de páginas;
- total de registros autorizados;
- intervalo exibido;
- quantidade de registros por página;
- primeira página, página anterior, próxima página e última página, com estados Disabled corretos.

As quantidades oficiais por página são `10`, `20`, `50` e `100`, com padrão `20`.

## Cadastro

O formulário deverá suportar:

- Cliente;
- título;
- descrição;
- zero ou mais responsáveis;
- data de início;
- prazo;
- Prioridade;
- Status inicial `OPEN`;
- Tags;
- observações ou notas.

Documentos somente poderão aparecer como integração funcional quando o contrato central de metadata estiver aprovado.

Campos obrigatórios deverão ser identificados com labels e mensagens acessíveis.

Após criação, preferir navegação para os detalhes da Demanda quando isso preservar a continuidade do trabalho.

## Detalhes

A página deverá atuar como visão operacional da Demanda.

Estrutura mínima:

- Page Header com título, Cliente e ações autorizadas;
- Status, Prioridade e prazo;
- responsáveis;
- descrição;
- datas;
- Tags;
- observações ou notas;
- ações autorizadas para Status, responsáveis, Tags e arquivamento.

Não incluir áreas de Financeiro, Contratos ou Dashboard consolidado.

## Edição

A edição deverá suportar somente campos autorizados pelo contrato físico e pela matriz de operações.

A troca do Cliente não será implementada. Uma Demanda associada ao Cliente incorreto deverá ser arquivada e recriada corretamente.

Falhas recuperáveis deverão preservar os valores preenchidos.

## Responsáveis

A interface deverá permitir gerir múltiplos responsáveis autorizados.

Ela não deverá:

- listar utilizadores de outra Organization;
- apresentar `MEMBER` sem autorização ao Cliente como opção válida;
- criar acesso implícito ao Cliente;
- tratar a associação visual como mecanismo de segurança.

## Status

A interface deverá apresentar somente os seis Status oficiais.

Não criar transições rígidas não previstas nas fontes normativas.

Toda alteração deverá produzir feedback e auditoria conforme o contrato.

## Arquivamento

Arquivar deverá utilizar confirmação explícita com a consequência descrita:

- a Demanda deixa a listagem operacional padrão;
- o histórico é preservado;
- não ocorre delete físico.

Após o arquivamento, preferir retorno à listagem.

---

# Estados da Interface

## Loading

Utilizar Skeleton para páginas e tabelas com estrutura previsível.

Spinner poderá ser utilizado apenas em ações locais, como botões.

## Empty

A lista vazia deverá possuir título, descrição e CTA somente quando o utilizador possuir permissão de criação.

## Error

Falhas de página deverão apresentar mensagem segura e ação “Tentar novamente” quando aplicável.

## Success

Ações relevantes deverão apresentar feedback claro sem depender exclusivamente de Toast.

---

# Responsividade e Acessibilidade

A interface deverá funcionar em:

```text
Desktop
Tablet
Mobile
```

No Mobile, a lista poderá usar Cards e filtros em Drawer, sem perda de informações ou ações essenciais.

Todas as telas deverão cumprir WCAG 2.2 AA, incluindo:

- navegação por teclado;
- Focus Ring visível;
- labels acessíveis;
- mensagens de erro associadas aos campos;
- semântica HTML correta;
- suporte a leitores de tela quando aplicável;
- gestão de foco em Dialogs e Drawers;
- contraste adequado;
- informação de Status, Prioridade, atraso e erro que não dependa somente de cor;
- suporte a zoom e diferentes orientações;
- respeito a `prefers-reduced-motion`.

Toda interface deverá utilizar os Design Tokens e componentes oficiais.

---

# Matriz de Testes

Os testes foram implementados proporcionalmente às responsabilidades e aos riscos da Sprint.

Resultados finais:

```text
Banco
12 arquivos pgTAP
429 testes
0 falhas

Unit/integration da aplicação
27 arquivos
361 testes
0 falhas

E2E
14 testes totais
10 cenários novos de Demandas
4 testes existentes
E2E run 1 → 14 passed
E2E run 2 → 14 passed
```

Também foram aprovados `db reset`, `db lint`, bootstrap concurrency, OWNER role concurrency, typecheck, lint, build e `git diff --check`.

## Unitários e Componentes

Cobertura implementada quando aplicável:

- Schemas de entrada;
- domínio de Status;
- domínio de Prioridade;
- independência entre Status, Prioridade e Tags;
- Services e regras puras de domínio;
- mappers, formatters e helpers relevantes;
- validação de responsáveis;
- tratamento de ActionResult e erros;
- formulário e estados da interface;
- Status Badge e apresentação acessível de Prioridade/prazo;
- interações por teclado quando aplicável.

Testes unitários não deverão acessar PostgreSQL ou Supabase real.

## Integração e Banco

Cobertura real implementada:

- aplicação da migration em banco limpo e banco com histórico;
- schema, constraints, Foreign Keys e índices;
- domínios de Status e Prioridade;
- relações com Cliente, responsáveis e Tags;
- prevenção de relações cross-Organization;
- arquivamento sem delete físico;
- Queries de lista e detalhe;
- pesquisa, filtros, ordenação e paginação no banco;
- coleção vazia;
- RLS e Policies de todas as estruturas protegidas;
- isolamento por Organization;
- isolamento por Client Assignment;
- responsável sem Client Assignment sem acesso;
- perda de acesso após remoção do Client Assignment;
- leitura bulk de responsáveis para OWNER e MEMBER autorizado, incluindo histórico e projeção mínima;
- negação da bulk para MEMBER sem Assignment, assignee histórico sem Assignment, ADMIN, outra Organization e `anon`;
- arrays bulk autorizados e mistos sem Data Leakage, com hardening e Grants restritos;
- uma única chamada bulk por página e nenhuma chamada para página vazia, sem N+1;
- RPCs reais das seis fronteiras de escrita congeladas;
- `SECURITY DEFINER`, hardening e Grants quando aplicáveis;
- tentativa de spoofing de IDs e campos administrativos;
- Activity Logs e atomicidade;
- rollback completo em falha de auditoria;

Não mockar RLS em teste de RLS nem RPC em teste de RPC.

## Segurança Obrigatória

```text
OWNER
→ Demanda de Cliente da própria Organization
→ permitido conforme operação
```

```text
MEMBER autorizado no Cliente
→ Demanda do Cliente
→ permitido conforme operação
```

```text
MEMBER não autorizado no Cliente
→ Demanda
→ negado
```

```text
MEMBER autorizado no Cliente A
→ Demanda do Cliente B
→ negado
```

```text
MEMBER responsável sem Client Assignment
→ Demanda
→ negado
```

```text
MEMBER perde Client Assignment
→ acesso posterior à Demanda
→ negado
```

```text
Utilizador de outra Organization
→ Demanda
→ negado
```

```text
URL direta sem autorização
→ Demanda
→ negado sem Data Leakage
```

```text
Não autenticado ou Membership não ACTIVE
→ Demanda
→ negado
```

Os testes de `ADMIN` deverão comprovar a negação em todas as operações desta Sprint.

Toda operação protegida deverá possuir Happy Path e Denied Path.

## Activity Logs

Validar para cada operação auditável:

- `organization_id` correto;
- ator correto;
- `entity_type = DEMAND`;
- `entity_id` correto;
- Action correta;
- metadata mínima e segura;
- INSERT direto negado;
- UPDATE e DELETE negados;
- leitura autorizada sem Data Leakage;
- mutação e Log no mesmo commit quando a auditoria for inseparável;
- rollback da mutação quando o Log obrigatório falhar.

## E2E Críticos

Implementado com Playwright:

- login pela UI;
- abrir Demandas;
- criar e visualizar uma Demanda;
- editar os campos essenciais;
- pesquisar e aplicar filtros críticos;
- alterar Status;
- gerir múltiplos responsáveis;
- arquivar preservando o fluxo operacional;
- comprovar acesso de `MEMBER` autorizado no Cliente;
- negar acesso direto a `MEMBER` sem Client Assignment;
- negar acesso à Demanda do Cliente B para `MEMBER` autorizado apenas no Cliente A;
- comprovar perda de acesso após remoção do Client Assignment;
- validar estados críticos e tratamento seguro de not-found.

Lifecycles stateful poderão executar em série mesmo com `fullyParallel` habilitado.

Fixtures destrutivas deverão possuir guard explícito `LOCAL ONLY` antes de reset ou mutations privilegiadas.

Não criar backdoors de teste.

Não criar E2E para cada detalhe cosmético.

---

# Critérios de Aceite

Os critérios de aceite verificados foram:

- Demandas puderem ser criadas para um Cliente autorizado;
- toda Demanda pertencer a um Cliente e à Organization correta;
- a listagem retornar somente Demandas autorizadas;
- pesquisa estiver operacional sem Data Leakage;
- filtros aplicáveis estiverem operacionais;
- ordenação estiver operacional;
- paginação estiver operacional no banco;
- detalhes estiverem operacionais e protegidos contra URL direta;
- edição estiver operacional conforme a matriz de permissões;
- arquivamento lógico estiver operacional e preservar histórico;
- Demandas arquivadas não aparecerem por padrão;
- Status aceitar somente o domínio oficial;
- Prioridade aceitar somente o domínio oficial;
- Status, Prioridade e Tags permanecerem independentes;
- uma Demanda suportar `0..N` responsáveis autorizados;
- responsabilidade não conceder acesso ao Cliente;
- perda de Client Assignment retirar o acesso do `MEMBER`;
- atraso não foi persistido como campo duplicado;
- Notifications e Documents permaneceram fora do escopo físico e funcional entregue;
- RLS e Policies estiverem ativas e testadas;
- isolamento entre Organizations estiver comprovado;
- isolamento por Client Assignment estiver comprovado;
- Activity Logs utilizarem as Actions planejadas e atomicidade quando necessária;
- não existir permissão de `ADMIN` inferida;
- Queries, filtros, contagens e indicadores não causarem Data Leakage;
- Loading, Empty, Error e Success estiverem implementados quando aplicáveis;
- interface funcionar em Desktop, Tablet e Mobile;
- WCAG 2.2 AA estiver validada;
- testes unitários, de integração, banco, segurança e E2E críticos estiverem aprovados;
- lint estiver aprovado;
- typecheck estiver aprovado;
- build estiver aprovado;
- documentação diretamente afetada estiver sincronizada;
- não existirem blockers técnicos ou decisões obrigatórias abertas.

# Entregáveis Finais

A execução técnica entregou, conforme o contrato aprovado:

- módulo de Demandas;
- schema físico e migration da Sprint;
- relações de responsáveis e Tags;
- RLS e Policies;
- Queries autorizadas;
- persistência pelas RPCs transacionais congeladas;
- Services e Server Actions;
- lista, cadastro, detalhes e edição;
- gestão de responsáveis, Status, Prioridade e Tags;
- arquivamento;
- datas e prazos;
- Activity Logs;
- testes obrigatórios;
- documentação sincronizada.

---

# Checklist do Contrato

- [x] Planejamento funcional e contrato físico aprovados.
- [x] Matriz de operações de `ADMIN` aprovada.
- [x] Matriz de escritas de `MEMBER` aprovada.
- [x] Schema físico de `demands` congelado.
- [x] Schema de responsáveis congelado.
- [x] Schema de Tags congelado.
- [x] Tipos físicos de datas e derivação de atraso congelados.
- [x] Atraso mantido como estado derivado, sem campo físico duplicado ou helper temporal não aprovado.
- [x] Notifications persistentes e mecanismo de avisos mantidos fora da Sprint 03.
- [x] Documents excluídos do contrato físico desta Sprint.
- [x] Campos de pesquisa e ordenação confirmados.
- [x] RLS e Policies planejadas por operação.
- [x] Fronteiras de RPC definidas.
- [x] Actions de Activity Logs confirmadas.
- [x] Estratégia e matriz de testes físicos aprovadas.

---

# Checklist Técnico da Execução

## Banco

- [x] Criar migration somente após congelamento físico.
- [x] Criar constraints e Foreign Keys.
- [x] Criar índices necessários.
- [x] Aplicar RLS.
- [x] Criar Policies.
- [x] Implementar as seis fronteiras RPC congeladas.
- [x] Endurecer RPCs privilegiadas.
- [x] Reutilizar Activity Logs centralizados.

## Aplicação

- [x] Criar Types e Schemas após o contrato físico.
- [x] Implementar Queries autorizadas.
- [x] Implementar persistência conforme ADR-002.
- [x] Implementar Services e Server Actions.
- [x] Implementar lista, cadastro, detalhes e edição.
- [x] Implementar responsáveis, Status, Prioridade e Tags.
- [x] Implementar arquivamento.
- [x] Manter Notifications e mecanismo de avisos fora da entrega.
- [x] Implementar Error Handling.

## Qualidade

- [x] Implementar testes unitários e de componentes.
- [x] Implementar testes de integração e banco.
- [x] Implementar testes de RLS, Policies e RPCs.
- [x] Implementar testes de Activity Logs e atomicidade.
- [x] Implementar E2E críticos.
- [x] Validar responsividade.
- [x] Validar acessibilidade aplicável conforme WCAG 2.2 AA.
- [x] Executar lint, typecheck, testes e build.
- [x] Sincronizar somente a documentação afetada.

---

# Definition of Done

A Sprint 03 somente estará concluída quando:

- implementar o contrato funcional aprovado de Demandas;
- respeitar PRD, MVP Scope, Roadmap, Functional Requirements, Business Rules e User Stories;
- manter Projects fora do MVP;
- respeitar System Architecture, Module Architecture e ADR-002;
- preservar o modelo de autorização por Cliente;
- não inferir permissões de `ADMIN`;
- aplicar RLS e Policies a todas as estruturas protegidas;
- impedir Data Leakage em todas as leituras e agregações;
- utilizar RPC somente quando houver necessidade arquitetural real;
- registrar Activity Logs obrigatórios com atomicidade quando aplicável;
- preservar histórico no arquivamento;
- manter Documents e Notifications fora da entrega desta Sprint;
- utilizar Error Handling, Design System e Design Tokens;
- seguir DataTable Guidelines;
- funcionar em Desktop, Tablet e Mobile;
- cumprir WCAG 2.2 AA;
- possuir Happy Path e Denied Path para operações protegidas;
- possuir todos os testes críticos aprovados;
- passar em lint, typecheck e build;
- manter documentação diretamente afetada sincronizada;
- não antecipar Financeiro, Contratos ou Dashboard consolidado;
- não possuir decisões obrigatórias ou blockers abertos.

---

# Resultado

A Sprint 03 entregou o módulo de Demandas completo dentro do escopo aprovado:

```text
Demandas
├── schema físico
├── RLS
├── RPCs
├── Activity Logs
├── Types + Validation
├── Queries
├── Services
├── Server Actions
├── Listagem
├── Criação
├── Detalhe
├── Edição
├── Status
├── Priority
├── Responsáveis
├── Tags
├── Arquivamento
└── E2E + segurança
```

Foram implementadas as tabelas `demands`, `demand_assignees`, `demand_tags` e `demand_tag_assignments`, com Status default `OPEN`, Priority default `MEDIUM`, datas civis em `DATE`, Cliente imutável e arquivamento lógico por `archived_at`.

As seis RPCs de escrita são `create_demand`, `update_demand`, `change_demand_status`, `set_demand_assignees`, `set_demand_tags` e `archive_demand`. As leituras privilegiadas mínimas são `list_eligible_demand_assignees`, `list_demand_assignees` e `list_demand_assignees_bulk`.

`list_demand_assignees_bulk` evita N+1 na listagem ao receber somente os IDs da página atual e retornar responsáveis apenas das Demandas que o chamador já pode acessar. Ela não concede autorização.

A autorização final permite ao `OWNER` listar, ver, criar, editar, alterar Status, Priority e datas, gerir Tags e responsáveis e arquivar na própria Organization. `MEMBER` possui as mesmas operações operacionais quando mantém Client Assignment atual, exceto arquivamento. `ADMIN` não possui acesso ao módulo nesta Sprint.

Responsáveis possuem cardinalidade `0..N`. OWNER é elegível sem Client Assignment individual; MEMBER exige Membership `ACTIVE` e Client Assignment atual; ADMIN não é elegível. Remover o Client Assignment preserva o vínculo histórico, mas retira imediatamente o acesso do MEMBER. Assignee nunca é mecanismo de autorização.

Tags formam catálogo livre por Organization, com comparação por `lower(trim(name))` e criação inline por `set_demand_tags`. Não foram implementados catálogo global para MEMBER, rename/delete global ou remoção automática de Tags órfãs.

As rotas finais são `/demandas`, `/demandas/nova`, `/demandas/[id]` e `/demandas/[id]/editar`. A listagem expõe pesquisa, filtros por Status, Priority e prazo exato, ordenação e paginação, com apresentação responsiva e estados seguros.

O fechamento E2E encontrou e corrigiu dois comportamentos: paginação fora do intervalo que retornava `PGRST103`, resolvida com recuperação segura da contagem autorizada sem bypass de RLS; e affordance indevida de Demandas para `ADMIN`, resolvida com menu ocultado e guard de rota sem alterar a autorização do backend.

A revisão final de segurança confirmou ausência de service role na aplicação, admin client na UI, campos de autorização confiados ao browser, bypass de RLS, escrita direta nas tabelas, SQL na UI, Cliente mutável, Status no cadastro ou delete físico. Também confirmou que assignee não concede acesso, MEMBER sem Assignment é negado, MEMBER não arquiva, ADMIN é negado e o isolamento cross-Organization permanece ativo.

Activity Logs foram implementados e testados como `DEMAND / CREATED`, `DEMAND / UPDATED`, `DEMAND / STATUS_CHANGED` e `DEMAND / ARCHIVED`, sem criação de interface de histórico nesta Sprint.

Permaneceram deliberadamente fora da Sprint: Notifications persistentes, cron, scheduler, worker, Documents, Dashboard consolidado, Financeiro, Contratos, restore, delete físico, troca de Cliente, catálogo global de Tags, rename/delete global de Tags, FTS/trigram e máquina rígida de transições.

---

# Lições Aprendidas

- A leitura bulk elimina N+1 sem ampliar Policies globais.
- RLS continua sendo a autoridade mesmo quando a interface possui guards adicionais.
- E2E real detecta paginação fora do intervalo que testes isolados podem não reproduzir.
- A navegação deve refletir a negação funcional de `ADMIN` sem substituir o backend.
- Histórico de assignee deve permanecer separado de autorização atual.

---

# Commits Principais

```text
49eb398 — contrato documental congelado
879ee60 — banco de Demandas
c2a895d — Types e Validation
e974675 — leitura bulk de responsáveis
0d0f7a0 — Queries
d95fcca — Services
5c25f7d — Server Actions
32151a7 — listagem e criação
86d0122 — detalhe e operações
b0bf2db — E2E e fechamento de segurança
```

---

# Fonte da Verdade

Esta Sprint entregou:

```text
Sprint 03 — Demandas
Status: Concluída

Próxima Sprint:
Sprint 04 — Financeiro
Status: Não iniciada
```

O documento deve permanecer sincronizado com as fontes normativas listadas, sem alterar silenciosamente produto, arquitetura, autorização ou persistência.
