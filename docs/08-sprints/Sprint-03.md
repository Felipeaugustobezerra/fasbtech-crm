# Sprint 03 — Demandas

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟡 Planejada — contrato físico aprovado

---

## Última atualização

Setembro de 2026

---

# Estado do Planejamento

Este documento formaliza o planejamento funcional e o contrato físico da Sprint 03.

O contrato físico está aprovado em `docs/04-database/Demands.md`. A Sprint permanece tecnicamente não iniciada; nenhum código, migration ou teste foi implementado por este planejamento.

Este documento não implementa:

- código;
- migration;
- Types;
- Schemas Zod;
- Queries;
- Services;
- Server Actions;
- componentes;
- testes.

---

# Objetivo

Implementar o módulo de Demandas do FASBtech CRM v3.0.

Uma Demanda representa uma unidade operacional de trabalho ou serviço executado para um Cliente.

Esta Sprint deverá entregar:

- cadastro, listagem, pesquisa, filtros, ordenação e paginação de Demandas;
- detalhes, edição e arquivamento;
- associação obrigatória a Cliente;
- suporte a `0..N` responsáveis internos;
- Status, Prioridade e Tags como conceitos separados;
- datas, prazos e identificação de atraso;
- observações ou notas operacionais;
- Activity Logs aplicáveis;
- alertas e notificações internas de prazo conforme o contrato aprovado;
- integração conceitual com a infraestrutura central de documentos;
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
13. As notificações desta Sprint são somente internas.
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
- consultar histórico autorizado de atividades;
- identificar prazos normais, próximos e atrasados;
- produzir notificações internas de prazo conforme mecanismo aprovado.

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
        ├── Documents, conceitualmente
        ├── Internal Deadline Alerts, como comportamento funcional
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

As duas leituras serão RPCs mínimas endurecidas porque as Policies globais de Profiles e Memberships não serão ampliadas para alimentar seletores. Nenhuma delas aceitará consulta arbitrária por `membership_id`, listará outras Organizations ou concederá acesso ao responsável histórico.

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

O comportamento de avisos internos relacionados a prazos faz parte do escopo funcional por determinação do PRD, de FR-428, de FR-429 e da história de utilizador “Receber alerta de prazo”.

Regras funcionais:

- a verificação de prazo ocorre no backend;
- a detecção não depende exclusivamente do navegador aberto;
- o destinatário pertence à Organization e deve estar autorizado ao contexto da Demanda;
- o aviso interno não pode revelar Cliente ou Demanda não autorizados;
- notificações externas não fazem parte do escopo.

Este planejamento não cria scheduler, cron, worker ou integração externa.

O requisito funcional não congela a criação de uma tabela `notifications` nem de outra infraestrutura persistente. O mecanismo backend de detecção, a cadência, o limiar, a eventual persistência, a deduplicação, o ciclo de leitura e o destinatário exato são decisões a confirmar antes da implementação.

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
- `list_demand_assignees(demand_id)` retorna somente responsáveis vinculados à Demanda acessível, incluindo o estado derivado de elegibilidade atual.

Essas RPCs evitam abrir leitura geral de Profiles e Memberships. Ambas deverão recalcular autorização internamente, impedir enumeração arbitrária e retornar somente os campos congelados no contrato `Demands`.

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

# Planejamento do Banco de Dados

Nenhum SQL será criado nesta etapa.

A futura migration deverá introduzir somente a infraestrutura aprovada para Demandas.

Estruturas físicas congeladas em `Demands`:

```text
demands
demand_assignees
demand_tags
demand_tag_assignments
```

Nenhuma tabela `notifications` ou Documents integra a migration da Sprint 03. Persistência e mecanismo de avisos internos permanecem separados até contrato específico.

---

# Constraints a Planejar

A migration deverá implementar conforme o contrato `Demands`:

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

# Índices a Planejar

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
- acesso autorizado a Activity Logs e, se houver persistência aprovada, aos avisos internos de prazo.

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
- candidatos e responsáveis vinculados são expostos somente pelas duas RPCs mínimas aprovadas, sem ampliar Policies globais;
- Tags pertencem à Organization e usam unicidade por nome normalizado;
- `set_demand_tags` aceita Tags existentes e novos nomes, reutiliza ou cria dentro da Organization e substitui associações atomicamente;
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

# Migration

A numeração concreta deverá seguir o documento Migrations e a ordem cronológica real do repositório.

O planejamento global identifica conceitualmente a Migration 003 — Demandas, mas nenhum arquivo de migration será criado nesta tarefa.

A migration poderá começar seguindo integralmente `docs/04-database/Demands.md`, pois estão congelados:

- schema e relações;
- matriz de operações de OWNER, ADMIN e MEMBER;
- integridade e Policies;
- operações auditáveis e fronteiras transacionais;
- Queries, ordenação, paginação e índices mínimos;
- exclusão física de Notifications e Documents desta migration.

A convenção local de comparação de prazo deverá ser decidida antes da implementação do helper temporal. O mecanismo funcional de avisos internos e Documents permanece separado e não bloqueia a migration física de Demandas.

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

Esta Sprint implementará somente a entrada já existente de Demandas e não alterará a ordem ou o escopo dos demais módulos.

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

A Toolbar deverá planejar:

- pesquisa;
- filtros aprovados;
- ordenação;
- ação “Nova Demanda” quando autorizada.

A pesquisa deverá ocorrer no banco, utilizar debounce e preservar filtros, ordenação e paginação quando aplicável.

Filtros funcionalmente previstos:

- Cliente;
- Status;
- Prioridade;
- responsável;
- Tags;
- prazo.

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
- documentos, apenas quando a infraestrutura central estiver aprovada;
- histórico autorizado de Activity Logs;
- avisos internos de prazo aplicáveis, sem pressupor uma tabela específica.

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

Os testes deverão ser implementados somente durante a execução técnica da Sprint.

## Unitários e Componentes

Planejar cobertura para:

- Schemas de entrada;
- domínio de Status;
- domínio de Prioridade;
- independência entre Status, Prioridade e Tags;
- cálculo derivado de atraso após aprovação da semântica temporal;
- cálculo derivado de proximidade do prazo após aprovação do limiar;
- Services e regras puras de domínio;
- mappers, formatters e helpers relevantes;
- validação de responsáveis;
- tratamento de ActionResult e erros;
- formulário e estados da interface;
- Status Badge e apresentação acessível de Prioridade/prazo;
- interações por teclado quando aplicável.

Testes unitários não deverão acessar PostgreSQL ou Supabase real.

## Integração e Banco

Planejar cobertura real para:

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
- RPCs reais das seis fronteiras de escrita congeladas;
- `SECURITY DEFINER`, hardening e Grants quando aplicáveis;
- tentativa de spoofing de IDs e campos administrativos;
- Activity Logs e atomicidade;
- rollback completo em falha de auditoria;
- comportamento e autorização dos avisos internos de prazo conforme o mecanismo aprovado;
- documentos privados quando a integração física existir.

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

Planejar com Playwright:

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
- validar estados críticos de Loading/Error quando proporcionais ao risco.

Lifecycles stateful poderão executar em série mesmo com `fullyParallel` habilitado.

Fixtures destrutivas deverão possuir guard explícito `LOCAL ONLY` antes de reset ou mutations privilegiadas.

Não criar backdoors de teste.

Não criar E2E para cada detalhe cosmético.

---

# Critérios de Aceite

A Sprint 03 somente poderá ser declarada concluída quando:

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
- atraso permanecer derivado e seguir a regra oficial com semântica temporal aprovada;
- prazos próximos seguirem o limiar aprovado;
- notificações internas de prazo respeitarem o mecanismo backend e a autorização aprovados;
- integração documental, quando fisicamente implementada, reutilizar a infraestrutura central e privada;
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

Nenhum item desta seção está concluído no momento do planejamento.

---

# Entregáveis Esperados

Ao final da execução técnica da Sprint deverão existir, conforme o contrato aprovado:

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
- prazos e comportamento de avisos internos, sem presumir infraestrutura persistente específica;
- Activity Logs;
- integração documental no limite aprovado;
- testes obrigatórios;
- documentação sincronizada.

---

# Checklist Antes de Iniciar a Implementação

- [x] Planejamento funcional e contrato físico aprovados.
- [x] Matriz de operações de `ADMIN` aprovada.
- [x] Matriz de escritas de `MEMBER` aprovada.
- [x] Schema físico de `demands` congelado.
- [x] Schema de responsáveis congelado.
- [x] Schema de Tags congelado.
- [x] Tipos físicos de datas e derivação de atraso congelados.
- [ ] Convenção local de comparação de prazo aprovada antes do helper temporal.
- [ ] Mecanismo backend de avisos internos aprovado antes de implementar os alertas, sem bloquear a migration de Demandas.
- [x] Documents excluídos do contrato físico desta Sprint.
- [x] Campos de pesquisa e ordenação confirmados.
- [x] RLS e Policies planejadas por operação.
- [x] Fronteiras de RPC definidas.
- [x] Actions de Activity Logs confirmadas.
- [x] Estratégia e matriz de testes físicos aprovadas.

---

# Checklist Técnico da Execução Futura

## Banco

- [ ] Criar migration somente após congelamento físico.
- [ ] Criar constraints e Foreign Keys.
- [ ] Criar índices necessários.
- [ ] Aplicar RLS.
- [ ] Criar Policies.
- [ ] Implementar as seis fronteiras RPC congeladas.
- [ ] Endurecer RPCs privilegiadas.
- [ ] Reutilizar Activity Logs centralizados.

## Aplicação

- [ ] Criar Types e Schemas após o contrato físico.
- [ ] Implementar Queries autorizadas.
- [ ] Implementar persistência conforme ADR-002.
- [ ] Implementar Services e Server Actions.
- [ ] Implementar lista, cadastro, detalhes e edição.
- [ ] Implementar responsáveis, Status, Prioridade e Tags.
- [ ] Implementar arquivamento.
- [ ] Implementar o comportamento de avisos internos no limite aprovado, sem presumir tabela específica.
- [ ] Implementar Error Handling.

## Qualidade

- [ ] Implementar testes unitários e de componentes.
- [ ] Implementar testes de integração e banco.
- [ ] Implementar testes de RLS, Policies e RPCs.
- [ ] Implementar testes de Activity Logs e atomicidade.
- [ ] Implementar E2E críticos.
- [ ] Validar responsividade.
- [ ] Validar WCAG 2.2 AA.
- [ ] Executar lint, typecheck, testes e build.
- [ ] Sincronizar somente a documentação afetada.

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
- utilizar a infraestrutura central e privada de documentos quando aplicável;
- limitar notificações ao escopo interno aprovado;
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

> Preencher ao final da Sprint. Nenhuma funcionalidade foi declarada concluída neste planejamento.

---

# Lições Aprendidas

> Preencher ao final da Sprint com fatos reais da implementação.

---

# Fonte da Verdade

Esta Sprint planeja:

```text
Sprint 03 — Demandas
Status: Planejada, com contrato físico aprovado e tecnicamente não iniciada
```

O documento deve permanecer sincronizado com as fontes normativas listadas, sem alterar silenciosamente produto, arquitetura, autorização ou persistência.
