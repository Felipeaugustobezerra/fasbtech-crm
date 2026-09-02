# Sprint 03 — Demandas

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟡 Planejada

---

## Última atualização

Setembro de 2026

---

# Estado do Planejamento

Este documento formaliza o contrato inicial da Sprint 03.

A Sprint permanece tecnicamente não iniciada até a aprovação deste planejamento e a resolução das decisões marcadas como obrigatórias antes da migration.

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

Cada Demanda deverá suportar conceitualmente:

- identificador;
- Organization proprietária;
- Cliente;
- título;
- descrição;
- `0..N` responsáveis internos;
- data de início;
- prazo;
- Prioridade;
- Status;
- Tags;
- observações ou notas;
- documentos relacionados, conceitualmente;
- timestamps;
- arquivamento lógico.

Título e Cliente são obrigatórios pelo contrato funcional específico de Demandas.

A associação de responsáveis é opcional e possui cardinalidade `0..N`. O contrato garante suporte a múltiplos responsáveis, mas não exige que uma Demanda possua ao menos um responsável.

Existe uma ambiguidade normativa a resolver antes da migration: o PRD apresenta descrição, data de início, prazo, Prioridade, Status, Tags, documentos e observações na lista mínima da Demanda, enquanto Functional Requirements determina explicitamente apenas que a Demanda deve permitir esses dados e o próprio PRD afirma depois que Demandas poderão possuir prazo.

Por isso, a obrigatoriedade e nulabilidade desses campos não são resolvidas silenciosamente neste planejamento. Nomes físicos, tipos, limites e defaults também deverão ser confirmados antes da migration.

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
- a alteração posterior do Cliente da Demanda não está autorizada por este planejamento até decisão explícita.

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

Regras obrigatórias:

- o responsável deve possuir Membership válida na Organization da Demanda;
- um `MEMBER` responsável deve continuar sujeito ao Client Assignment do Cliente;
- atribuir responsabilidade não cria Client Assignment;
- atribuir responsabilidade não altera role ou ownership;
- ser responsável não contorna RLS, Policies ou autorização por Cliente;
- remover o Client Assignment retira imediatamente o acesso do `MEMBER`, mesmo que exista uma associação de responsável;
- alterações no conjunto de responsáveis são auditáveis;
- a atualização composta do conjunto de responsáveis deverá ser atômica quando puder deixar estado parcial.

O comportamento persistente da associação de responsável após a remoção do Client Assignment deverá ser confirmado antes da migration. Em qualquer alternativa, a relação nunca poderá manter o acesso do `MEMBER`.

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

O Status inicial padrão deverá ser confirmado antes da migration.

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

A Prioridade inicial padrão deverá ser confirmada antes da migration.

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

Escopo, normalização, unicidade, criação livre ou catálogo controlado de Tags são decisões físicas e funcionais a confirmar antes da migration.

---

# Datas e Prazos

A Demanda deverá permitir:

- data de início;
- prazo de entrega.

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

A fronteira temporal exata da expiração, o timezone de comparação e a semântica civil ou temporal dos campos deverão ser confirmados antes da implementação da regra.

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

As fontes normativas definem `ADMIN` apenas como administrativo conforme permissões oficiais do módulo.

Este planejamento não concede a `ADMIN` acesso global, Client Assignment implícito ou operações novas por inferência.

A matriz concreta de leitura, criação, edição, Status, responsáveis e arquivamento de `ADMIN` deverá ser aprovada antes da implementação.

---

# MEMBER

`MEMBER` possui acesso operacional restrito.

O Client Assignment autoriza o contexto do Cliente, mas não define sozinho quais operações de escrita o `MEMBER` poderá executar.

Este planejamento congela:

- leitura apenas das Demandas de Clientes autorizados;
- negação de Clientes não atribuídos;
- negação após remoção do Client Assignment;
- impossibilidade de obter acesso apenas por ser responsável.

A matriz concreta de criação, edição, Status, Prioridade, responsáveis e arquivamento de `MEMBER` deverá ser aprovada antes da implementação.

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

Mutation ou RPC conforme necessidade real
```

Mutations somente poderão ser utilizadas quando a operação for simples, autorizável por RLS e não exigir auditoria atômica ou múltiplas escritas.

RPCs deverão ser utilizadas quando houver:

- múltiplas escritas atômicas;
- atualização composta de responsáveis ou Tags;
- Activity Log obrigatório na mesma operação;
- autorização privilegiada controlada;
- necessidade de rollback conjunto.

Este planejamento não define nomes nem assinaturas de RPCs.

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

Estruturas conceituais já presentes no Data Model e em Migrations:

```text
demands
demand_assignees
demand_tags
demand_tag_assignments
```

Esses nomes representam o modelo conceitual atual, não um schema físico congelado por este documento.

Nenhuma tabela `notifications` é presumida pelo planejamento físico. A persistência de avisos internos somente poderá ser incluída se for necessária ao mecanismo backend posteriormente aprovado.

---

# Constraints a Planejar

A migration deverá avaliar e implementar, conforme o schema aprovado:

- Primary Keys com UUID;
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

Índices deverão ser definidos a partir de padrões reais de:

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

Não criar índices especulativos antes de definir Queries e planos de execução esperados.

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

As Policies concretas de Demandas ainda não existem no documento RLS e deverão ser congeladas antes da migration.

---

# Decisões Físicas a Confirmar Antes da Migration

Cada item desta seção é um bloqueio explícito para o início da migration.

## Schema de `demands`

**Decisão física a confirmar antes da migration:** nomes de colunas, tipos, nulabilidade, limites, defaults, timestamps e representação do arquivamento.

## Ownership

**Decisão física a confirmar antes da migration:** como `organization_id` e `client_id` serão persistidos e protegidos contra divergência.

## Responsáveis

**Decisão física a confirmar antes da migration:** schema de `demand_assignees`, chaves, unicidade, estados válidos do Membership e tratamento da associação após remoção de Client Assignment.

## Tags

**Decisão física a confirmar antes da migration:** schemas de `demand_tags` e `demand_tag_assignments`, escopo por Organization, normalização, unicidade e ciclo de vida.

## Campos Funcionais

**Decisão física a confirmar antes da migration:** obrigatoriedade e representação de descrição, data de início, prazo e observações/notas.

## Defaults

**Decisão física a confirmar antes da migration:** Status e Prioridade iniciais.

## Prazos

**Decisão física a confirmar antes da migration:** `DATE` ou `TIMESTAMPTZ`, timezone e limiar de “próxima do prazo”.

## Avisos Internos de Prazo

**Decisão física a confirmar antes da migration:** mecanismo backend necessário para cumprir o comportamento funcional, incluindo se haverá persistência, deduplicação, destinatários e ciclo de leitura. Não pressupor tabela `notifications`, scheduler, cron ou worker.

## Documentos

**Decisão física a confirmar antes da migration:** modelo centralizado de metadata e relação com Demandas. Não criar tabela específica antes dessa decisão.

## Pesquisa e Ordenação

**Decisão física a confirmar antes da migration:** campos pesquisáveis, campos ordenáveis e estratégia de índice correspondente.

## RPCs

**Decisão física a confirmar antes da migration:** fronteiras transacionais, nomes, assinaturas, retorno, Grants e necessidade de `SECURITY DEFINER` para cada operação.

## Matriz de Operações

**Decisão funcional obrigatória antes da implementação:** permissões concretas de `ADMIN` e de escrita de `MEMBER` para criar, editar, alterar Status/Prioridade, gerir responsáveis e arquivar.

---

# Migration

A numeração concreta deverá seguir o documento Migrations e a ordem cronológica real do repositório.

O planejamento global identifica conceitualmente a Migration 003 — Demandas, mas nenhum arquivo de migration será criado nesta tarefa.

A migration somente poderá começar após:

- aprovação deste planejamento;
- resolução das decisões físicas abertas;
- aprovação da matriz de operações de `ADMIN` e `MEMBER`;
- congelamento do schema;
- congelamento das Policies;
- confirmação das operações auditáveis e fronteiras transacionais;
- confirmação do mecanismo dos avisos internos, inclusive se exigir persistência, e do escopo físico de documentos.

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

Campos de pesquisa e ordenação deverão ser confirmados antes das Queries. Não criar filtro para campo inexistente.

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
- Status conforme decisão de default;
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

A troca do Cliente de uma Demanda existente não será implementada sem decisão explícita de domínio, autorização, auditoria e integridade.

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
- RPCs reais quando existirem;
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

Os testes de `ADMIN` deverão seguir somente a matriz aprovada, sem inventar privilégios ou restrições.

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
- persistência por Mutation ou RPC conforme necessidade;
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

- [ ] Planejamento aprovado.
- [ ] Matriz de operações de `ADMIN` aprovada.
- [ ] Matriz de escritas de `MEMBER` aprovada.
- [ ] Schema físico de `demands` congelado.
- [ ] Schema de responsáveis congelado.
- [ ] Schema de Tags congelado.
- [ ] Regras de prazo e timezone congeladas.
- [ ] Mecanismo backend de avisos internos aprovado, inclusive a decisão sobre eventual persistência.
- [ ] Escopo físico de documentos confirmado.
- [ ] Campos de pesquisa e ordenação confirmados.
- [ ] RLS e Policies planejadas por operação.
- [ ] Fronteiras de Mutation e RPC definidas.
- [ ] Actions de Activity Logs confirmadas.
- [ ] Estratégia e matriz de testes aprovadas.

---

# Checklist Técnico da Execução Futura

## Banco

- [ ] Criar migration somente após congelamento físico.
- [ ] Criar constraints e Foreign Keys.
- [ ] Criar índices necessários.
- [ ] Aplicar RLS.
- [ ] Criar Policies.
- [ ] Implementar RPCs somente quando necessárias.
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
Status: Planejada e tecnicamente não iniciada
```

O documento deve permanecer sincronizado com as fontes normativas listadas, sem alterar silenciosamente produto, arquitetura, autorização ou persistência.
