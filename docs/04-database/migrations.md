# Migrations

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

Este documento define a estratégia oficial de versionamento e evolução das migrations do banco de dados do FASBtech CRM.

As migrations representam alterações persistentes na estrutura e segurança do banco.

Cada migration deverá possuir responsabilidade clara e acompanhar a evolução real do produto.

Nenhuma migration deverá antecipar estruturas de módulos ainda não implementados.

---

# Fonte da Verdade

Este documento é a fonte oficial para:

- ordem das migrations;
- numeração das migrations;
- responsabilidade de cada migration;
- dependências entre migrations;
- evolução estrutural do banco.

Ele deverá permanecer alinhado com:

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

Data Model v3.0
```

E com os documentos técnicos:

```text
System Architecture v3.0

Module Architecture v3.0

Organization and User Model v3.0

RLS v3.0

Activity Logs v3.0

ADR-002
```

---

# Princípios

As migrations seguem os seguintes princípios:

- responsabilidade clara;
- evolução incremental;
- ordem cronológica;
- compatibilidade com o Roadmap;
- alinhamento com o PRD;
- preservação de dados;
- integridade referencial;
- segurança;
- compatibilidade com RLS;
- menor privilégio;
- nenhuma antecipação de funcionalidades futuras.

---

# Regra Principal

Uma migration deverá existir porque o banco realmente precisa mudar.

Não criar migration apenas porque uma nova Sprint começou.

Fluxo correto:

```text
Nova necessidade persistente

↓

Alteração de banco necessária?

├── Não → nenhuma migration
└── Sim → criar próxima migration
```

---

# Numeração

As migrations utilizarão sequência crescente.

Exemplo:

```text
001
002
003
004
005
...
```

Uma migration já aplicada em ambiente compartilhado ou de produção não deverá ser renumerada.

---

# Imutabilidade das Migrations Aplicadas

Após uma migration ter sido aplicada em ambiente compartilhado relevante, ela deverá ser considerada histórica.

Não editar uma migration antiga para alterar o banco já existente.

Utilizar:

```text
nova migration
```

para realizar a correção.

Exemplo:

```text
001_foundation
002_clients_access
003_demands
004_fix_client_constraint
```

é válido caso essa seja a ordem real em que as alterações ocorreram.

---

# Planejamento versus Execução

Este documento poderá indicar migrations planejadas.

Entretanto, a numeração física definitiva deverá respeitar a ordem real de criação e aplicação.

As migrations planejadas abaixo representam o caminho atualmente aprovado do MVP.

---

# Migration 001 — Foundation

## Status

🟡 Em implementação / sincronização com Foundation v3.0

---

## Sprint

```text
Sprint 01 — Foundation
```

---

## Objetivo

Criar a infraestrutura persistente fundamental do FASBtech CRM.

---

## Estruturas Principais

```text
profiles

organizations

organization_members

activity_logs
```

---

## Infraestrutura

Também poderá incluir:

- constraints;
- índices;
- funções auxiliares;
- triggers;
- Bootstrap;
- RPCs necessárias exclusivamente à Foundation;
- Row Level Security;
- Policies;
- Grants;
- configuração mínima de Storage privado quando gerida por migration.

---

## Não Inclui

```text
leads
clients
client_assignments
demands
financial_entries
contracts
```

---

## Referência

```text
Migration 001 — Foundation
```

O documento específico da Migration 001 define seus detalhes completos.

---

# Migration 002 — Clientes & Acessos

## Status

🟡 Planejada

---

## Sprint

```text
Sprint 02 — Clientes & Acessos
```

---

## Objetivo

Criar a infraestrutura persistente necessária para Clientes e autorização operacional por Cliente.

---

## Estruturas Principais

Planejadas:

```text
clients

client_assignments
```

---

# Clients

A tabela deverá representar a entidade operacional central do CRM.

Relacionamento principal:

```text
organizations

1

↓

N

clients
```

---

# Client Assignments

Deverá representar:

```text
organization_members

N

↕

N

clients
```

permitindo controlar quais Clientes um MEMBER pode acessar.

---

## Segurança

A Migration 002 deverá adicionar:

- RLS de Clients;
- Policies de Clients;
- RLS de Client Assignments;
- Policies de Client Assignments;
- índices necessários;
- constraints;
- operações transacionais quando necessárias;
- auditoria correspondente.

---

## Activity Logs

Operações auditáveis deverão utilizar a infraestrutura criada na Migration 001.

Não criar:

```text
client_activities
```

---

## RPCs

Criar somente RPCs realmente necessárias para operações transacionais da Sprint 02.

Exemplos conceituais:

```text
criar Cliente

editar Cliente

arquivar Cliente

associar utilizador a Cliente

remover associação
```

Os nomes físicos das RPCs serão definidos pela implementação.

---

## Não Inclui

```text
demands
financial_entries
contracts
```

---

# Migration 003 — Demandas

## Status

🟡 Planejada

---

## Sprint

```text
Sprint 03 — Demandas
```

---

## Objetivo

Criar a infraestrutura persistente necessária ao gerenciamento operacional de Demandas.

---

## Estruturas Conceituais

Planejadas:

```text
demands

demand_assignees

demand_tags

demand_tag_assignments
```

A estrutura definitiva está congelada em `Demands`.

Nenhuma tabela `notifications` integra a Migration 003.

---

# Demands

Relacionamento principal:

```text
clients

1

↓

N

demands
```

---

# Demand Assignees

Relacionamento:

```text
organization_members

N

↕

N

demands
```

---

# Demand Tags

Relacionamento:

```text
demands

N

↕

N

demand_tags
```

---

# Status

Status deverá permanecer separado de Tags.

Domínio inicial:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

---

# Prioridade

Domínio inicial:

```text
LOW
MEDIUM
HIGH
URGENT
```

---

# Notifications

O comportamento funcional de avisos internos permanece na Sprint 03, mas a Migration 003 não cria infraestrutura persistente de Notifications.

Persistência e mecanismo de entrega exigem contrato específico separado.

Não implementar nesta migration:

- tabela `notifications`;
- cron, scheduler, worker ou trigger temporal;
- WhatsApp;
- SMS;
- push externo.

---

## Segurança

A Migration deverá implementar autorização considerando:

```text
Organization

+

Cliente

+

Client Assignment quando aplicável
```

---

# Migration 004 — Financeiro

## Status

🟡 Planejada

---

## Sprint

```text
Sprint 04 — Financeiro
```

---

## Objetivo

Criar a infraestrutura persistente para gestão financeira operacional da FASBtech.

---

## Estruturas Conceituais

Planejadas:

```text
financial_entries

financial_goals
```

Estruturas auxiliares adicionais somente deverão ser criadas quando houver necessidade real.

---

# Financial Entries

Representará:

```text
Entradas

+

Saídas
```

Cada movimentação pertencerá à Organization.

A relação com Cliente será opcional quando permitida pelo domínio.

---

## Relação

```text
Organization

1

↓

N

Financial Entries
```

e opcionalmente:

```text
Client

1

↓

N

Financial Entries
```

---

# Payment Nature

Deverá suportar inicialmente:

```text
ONE_TIME

RECURRING
```

No MVP:

```text
RECURRING
```

é informativo.

Não representa cobrança automática.

---

# Financial Goals

Deverá representar metas mensais de receita.

Relacionamento:

```text
Organization

1

↓

N

Financial Goals
```

---

# Saldo

Não criar tabela apenas para armazenar:

```text
saldo em caixa
```

O saldo deverá ser calculado a partir das movimentações realizadas.

---

# Status Financeiro

O domínio exato de Status das movimentações financeiras ainda não está definido.

Portanto:

```text
não congelar enum de status financeiro
```

antes da decisão formal correspondente.

---

# Segurança Financeira

Client Assignment não concede automaticamente acesso ao Financeiro.

As Policies deverão considerar as permissões específicas desse módulo.

---

# Migration 005 — Contratos

## Status

🟡 Planejada

---

## Sprint

```text
Sprint 05 — Contratos
```

---

## Objetivo

Criar a infraestrutura persistente necessária para geração e gestão de Contratos.

---

## Estruturas Conceituais

Planejadas:

```text
contract_templates

contracts
```

Estruturas auxiliares somente deverão ser adicionadas conforme necessidade real.

---

# Contract Templates

Representará modelos reutilizáveis de contrato.

---

# Contracts

Cada Contrato deverá estar associado a:

```text
1 Cliente
```

e pertencer à Organization correspondente.

---

## Relação

```text
clients

1

↓

N

contracts
```

---

# Snapshot

A estrutura deverá preservar os dados utilizados no momento da geração.

Fluxo:

```text
Dados atuais do Cliente

↓

Geração do Contrato

↓

Snapshot persistido
```

Alterações futuras do Cliente não poderão alterar retroativamente o Contrato gerado.

---

# Status de Contrato

Domínio inicial:

```text
DRAFT
GENERATED
SENT
SIGNED
CANCELED
```

---

# Segurança Contratual

Client Assignment não deverá conceder automaticamente acesso completo ao módulo de Contratos.

As Policies deverão respeitar as permissões específicas do domínio.

---

# Documentos

O MVP utiliza infraestrutura centralizada de documentos.

Arquivos físicos serão armazenados através de:

```text
Supabase Storage
```

Quando houver necessidade de persistir metadados estruturados dos documentos em banco, a tabela correspondente deverá ser criada pela migration da Sprint em que essa necessidade for efetivamente implementada.

---

# Regra para Documents

Não criar antecipadamente múltiplas tabelas como:

```text
client_documents
demand_documents
contract_documents
financial_documents
```

A arquitetura deverá priorizar uma infraestrutura centralizada.

A estrutura física definitiva será congelada antes da primeira migration que precisar persistir os metadados.

---

# Sprint 06 — Dashboard

## Migration obrigatória?

```text
Não.
```

O Dashboard não exige uma migration própria por padrão.

---

# Objetivo do Dashboard

O Dashboard deverá consultar e agregar dados existentes.

Exemplos:

```text
financial_entries
        ↓
Entradas / Saídas / Saldo
```

```text
demands
        ↓
Demandas por Status
```

```text
contracts
        ↓
Indicadores Contratuais
```

---

# Regra

Não criar por padrão:

```text
dashboard_metrics

dashboard_totals

dashboard_balance

dashboard_stats
```

para duplicar informações existentes.

---

# Views

Views ou outras estruturas de consulta poderão ser introduzidas futuramente apenas quando houver necessidade concreta de:

- performance;
- simplificação de consultas;
- agregações complexas.

Se isso ocorrer, deverá ser criada uma nova migration utilizando o próximo número disponível.

---

# Materialized Views

Não criar Materialized Views antecipadamente.

Só utilizar se métricas reais demonstrarem necessidade.

---

# Ordem Planejada do MVP

O plano atual é:

```text
001 — Foundation
        │
        ▼
002 — Clientes & Acessos
        │
        ▼
003 — Demandas
        │
        ▼
004 — Financeiro
        │
        ▼
005 — Contratos
```

A:

```text
Sprint 06 — Dashboard
```

não possui migration obrigatória.

---

# Importante sobre a Numeração

A sequência:

```text
001
002
003
004
005
```

representa o planejamento atual.

Se durante a implementação surgir necessidade legítima de uma migration intermediária ou corretiva, a sequência deverá seguir a ordem cronológica real.

Não reescrever migrations já aplicadas apenas para preservar artificialmente este desenho.

---

# Exemplo

Se `001` e `002` já tiverem sido aplicadas e a Sprint 02 necessitar de uma correção estrutural antes da Sprint 03:

```text
001 Foundation
002 Clients & Access
003 Client Authorization Fix
004 Demands
005 Finance
006 Contracts
```

é preferível a editar uma migration histórica já aplicada.

A documentação deverá então ser sincronizada com a sequência real.

---

# Novas Migrations

Toda nova migration deverá possuir:

- número;
- nome;
- objetivo;
- dependência;
- responsabilidade clara;
- alterações realizadas;
- impacto em segurança;
- impacto em RLS quando aplicável;
- estratégia de validação.

---

# Convenção de Nome

Utilizar nomes descritivos.

Exemplo:

```text
001_foundation.sql

002_clients_access.sql

003_demands.sql

004_finance.sql

005_contracts.sql
```

Caso existam migrations adicionais:

```text
006_add_document_metadata.sql

007_update_client_policies.sql
```

A nomenclatura concreta deverá seguir a convenção técnica adotada pelo repositório e pelas ferramentas de migration utilizadas.

---

# Dependências

Uma migration poderá depender somente de estruturas já existentes.

Exemplo correto:

```text
Migration 002

clients
↓
organizations já existe na 001
```

Exemplo incorreto:

```text
Migration 002

↓

depende de tabela criada na Migration 004
```

---

# Foreign Keys

Toda Foreign Key deverá referenciar uma estrutura existente no momento da execução da migration.

---

# UUID

Entidades do domínio utilizarão UUID conforme o Data Model.

Não utilizar:

```text
SERIAL
```

como padrão para entidades principais.

---

# Datas

Eventos temporais deverão utilizar:

```text
TIMESTAMPTZ
```

quando representarem um instante.

Isso não significa que todo campo de data obrigatoriamente use TIMESTAMPTZ.

Datas puramente civis, como uma data sem horário, poderão utilizar:

```text
DATE
```

quando apropriado ao domínio.

---

# Soft Delete

Não existe regra de:

```text
toda tabela deve possuir archived_at
```

Soft Delete será utilizado somente quando o domínio exigir preservação do registro com estado arquivado.

Exemplos:

```text
clients
demands
```

quando definido.

Activity Logs, por exemplo, são imutáveis e não utilizam Soft Delete no modelo atual.

---

# Constraints

Migrations deverão utilizar o banco para proteger invariantes importantes.

Utilizar conforme necessidade:

- Primary Keys;
- Foreign Keys;
- NOT NULL;
- UNIQUE;
- CHECK;
- Defaults.

---

# Índices

Criar índices baseados em padrões reais de:

- autorização;
- relacionamentos;
- consulta;
- pesquisa;
- filtros;
- ordenação;
- paginação.

Evitar índices especulativos.

---

# Row Level Security

Toda tabela protegida deverá possuir RLS antes de ser utilizada pela aplicação.

Fluxo:

```text
Criar tabela

↓

Criar constraints

↓

Criar índices necessários

↓

Ativar RLS

↓

Criar Policies

↓

Validar segurança

↓

Liberar utilização
```

---

# Policies

Cada migration deverá criar ou alterar apenas as Policies necessárias às estruturas que ela introduz ou modifica.

Não criar Policies para tabelas futuras.

---

# RPCs

RPC não é obrigatória para toda escrita.

Utilizar:

```text
Query
```

para leitura.

Utilizar:

```text
Mutation
```

para escrita simples quando permitida pela arquitetura.

Utilizar:

```text
RPC
```

quando a operação exigir:

- múltiplas alterações atômicas;
- Activity Log na mesma transação;
- autorização privilegiada controlada;
- commit/rollback conjunto.

---

# SECURITY DEFINER

Toda RPC `SECURITY DEFINER` deverá seguir:

```text
ADR-002

+

RLS v3.0
```

Incluindo:

- autorização interna;
- `auth.uid()`;
- Membership;
- Organization;
- role quando aplicável;
- Client Assignment quando aplicável;
- `SET search_path = ''`;
- schemas explícitos;
- EXECUTE restrito;
- testes.

---

# Activity Logs

Migrations de novos módulos deverão reutilizar:

```text
activity_logs
```

criada na Foundation.

Nunca criar uma tabela de auditoria específica para cada módulo.

---

# Alteração do Domínio de Activity Logs

Quando uma nova entidade ou Action entrar no produto, a migration correspondente deverá ampliar a estratégia de validação de:

```text
entity_type
```

ou:

```text
action
```

caso o mecanismo físico adotado exija alteração no banco.

A evolução deverá ocorrer sem recriar a infraestrutura de auditoria.

---

# Storage

Mudanças estruturais relacionadas ao Supabase Storage que forem geridas via SQL deverão ser versionadas quando aplicável.

Incluindo:

- buckets;
- Policies de `storage.objects`;
- alterações relevantes de autorização.

---

# Service Role

Migrations não deverão criar arquitetura que dependa da Service Role para o funcionamento normal do CRM.

Service Role permanece reservada para tarefas administrativas explicitamente controladas.

---

# Dados de Produção

Migrations estruturais não deverão inserir arbitrariamente dados de negócio de produção.

Exceções de inicialização deverão possuir mecanismo explícito.

Exemplo:

```text
Bootstrap da Organization inicial
```

---

# Seed

Dados de:

- desenvolvimento;
- demonstração;
- teste;

não deverão ser misturados indiscriminadamente às migrations estruturais.

Quando necessários, deverão utilizar o mecanismo oficial de seed/teste do projeto.

---

# Rollback

Toda migration deverá possuir uma estratégia de recuperação documentada.

Isso não significa que toda migration precise possuir automaticamente um:

```text
DROP TABLE
```

como rollback de produção.

---

# Ambientes Locais

Em desenvolvimento local e ambientes descartáveis, rollback destrutivo poderá ser utilizado quando seguro.

---

# Ambientes com Dados Reais

Em ambiente com dados persistentes, a estratégia preferencial para alterações já aplicadas será:

```text
nova migration corretiva
```

em vez de reverter destrutivamente a migration antiga.

---

# Preservação de Dados

Antes de alterar:

- coluna;
- constraint;
- relação;
- tipo;
- Policy;
- função;

deverá ser avaliado o impacto sobre dados já existentes.

---

# Alterações Destrutivas

Operações como:

```text
DROP COLUMN
DROP TABLE
ALTER TYPE destrutivo
```

deverão ser utilizadas apenas quando:

- realmente necessárias;
- impacto conhecido;
- dados preservados quando necessário;
- estratégia de recuperação definida.

---

# Transactional DDL

Quando suportado e apropriado, alterações relacionadas deverão ser executadas de forma transacional.

O objetivo é evitar estado parcialmente migrado.

---

# Validação Pós-Migration

Após executar uma migration, validar:

- estrutura criada;
- constraints;
- Foreign Keys;
- índices;
- funções;
- triggers;
- RLS;
- Policies;
- Grants;
- RPCs;
- comportamento de autorização;
- integridade dos dados.

---

# Testes de Migration

Quando aplicável, testar:

```text
Banco limpo
→ aplicar migration
→ sucesso
```

```text
Banco na versão anterior
→ aplicar migration
→ sucesso
```

```text
estrutura final
→ corresponde ao contrato
```

---

# Testes de Segurança

Migrations que alterem segurança deverão possuir testes para:

- acesso permitido;
- acesso negado;
- isolamento por Organization;
- Client Assignment quando aplicável;
- role;
- Membership Status;
- Data Leakage;
- RPCs privilegiadas;
- Storage quando aplicável.

---

# Ambientes

As migrations deverão produzir estrutura consistente entre:

```text
Local

Test

Staging quando utilizado

Production
```

Alterações manuais no banco que não estejam representadas por migrations deverão ser evitadas.

---

# Supabase Dashboard

Alterações estruturais feitas manualmente através do Supabase Dashboard deverão ser refletidas em migration antes de serem consideradas parte oficial do projeto.

O banco versionado deverá permanecer reproduzível.

---

# Não Faz Parte do MVP Atual

Não existem migrations planejadas no MVP v3.0 para:

```text
leads
projects
products
domains
hosting_services
appointments
tasks
notes
```

Essas estruturas pertenciam ao modelo anterior.

Não deverão ser criadas enquanto não retornarem formalmente ao PRD.

---

# Leads

Não existe:

```text
Migration — Leads
```

no roadmap atual.

Clientes podem ser cadastrados diretamente.

---

# Projects

Não existe:

```text
Migration — Projects
```

no MVP atual.

Demandas representam a unidade operacional de trabalho.

---

# Product Registry

Não existe migration operacional de Product Registry no MVP atual.

---

# Agenda

Não existe migration de Agenda no MVP atual.

---

# Dashboard

Dashboard pertence ao MVP.

Porém:

```text
Dashboard
≠
necessidade automática de nova tabela
```

Ele deverá inicialmente utilizar Queries sobre os módulos existentes.

---

# Roadmap de Persistência

A evolução persistente atual é:

```text
Sprint 01
Foundation
    │
    ▼
Migration 001
```

```text
Sprint 02
Clientes & Acessos
    │
    ▼
Migration 002 planejada
```

```text
Sprint 03
Demandas
    │
    ▼
Migration 003 planejada
```

```text
Sprint 04
Financeiro
    │
    ▼
Migration 004 planejada
```

```text
Sprint 05
Contratos
    │
    ▼
Migration 005 planejada
```

```text
Sprint 06
Dashboard
    │
    ▼
sem migration obrigatória
```

---

# Checklist para Nova Migration

Antes de criar uma migration verificar:

- [ ] A alteração realmente precisa de banco?
- [ ] A funcionalidade pertence à Sprint atual?
- [ ] A migration possui responsabilidade clara?
- [ ] A numeração é a próxima disponível?
- [ ] As tabelas dependentes já existem?
- [ ] As Foreign Keys estão corretas?
- [ ] As constraints estão definidas?
- [ ] Os índices são realmente necessários?
- [ ] RLS é necessária?
- [ ] Policies foram definidas?
- [ ] Activity Logs são afetados?
- [ ] RPC é realmente necessária?
- [ ] Grants estão mínimos?
- [ ] Há risco de perda de dados?
- [ ] Existe estratégia de recuperação?
- [ ] Os testes necessários foram definidos?
- [ ] A documentação diretamente afetada foi atualizada?

---

# Definition of Done

Uma migration será considerada concluída quando:

- possuir responsabilidade clara;
- possuir número correto;
- executar sem erros;
- depender somente de estruturas anteriores;
- preservar integridade referencial;
- possuir constraints necessárias;
- possuir índices necessários;
- utilizar UUID conforme o Data Model;
- utilizar tipos temporais adequados;
- utilizar Soft Delete somente quando necessário;
- possuir RLS quando aplicável;
- possuir Policies corretas;
- não permitir acesso indevido;
- utilizar RPC somente quando necessária;
- endurecer RPCs privilegiadas;
- reutilizar Activity Logs centralizados;
- possuir estratégia de recuperação;
- preservar dados existentes quando necessário;
- possuir testes aplicáveis aprovados;
- estar sincronizada com o PRD;
- estar sincronizada com o Roadmap;
- estar sincronizada com o Data Model;
- não antecipar funcionalidades futuras.

---

# Fonte da Verdade Final

A sequência planejada atual é:

```text
001 — Foundation
002 — Clientes & Acessos
003 — Demandas
004 — Financeiro
005 — Contratos
```

O Dashboard não exige migration própria por padrão.

A regra definitiva é:

```text
Mudança real no banco
        ↓
Nova migration
        ↓
Próximo número disponível
        ↓
Aplicar
        ↓
Não reescrever histórico já aplicado
```

O roadmap funcional determina **quando um domínio entra no produto**.

Este documento determina **como as alterações persistentes desse domínio evoluem no banco**.
