# Sprint 04 — Financeiro

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟡 Planejada e tecnicamente não iniciada

---

## Última atualização

Setembro de 2026

---

# Estado do Planejamento

Este documento registra o planejamento funcional e o contrato técnico aprovado da Sprint 04.

O schema físico está congelado em `docs/04-database/Financial.md`. Nenhum código, migration, SQL, Type, Schema Zod, Query, Service, Server Action, componente ou teste foi implementado.

Não permanece decisão física bloqueadora antes da criação da migration do Financeiro.

---

# Objetivo

Implementar a gestão financeira operacional interna da FASBtech.

O módulo deverá permitir registrar e acompanhar entradas, saídas e metas mensais, oferecendo dados autorizados para indicadores financeiros derivados.

O Financeiro não substitui sistema contábil ou fiscal e não automatiza cobrança, faturação ou movimentação bancária.

---

# Dependências

```text
Sprint 01 — Foundation
Status: Concluída

Sprint 02 — Clientes & Acessos
Status: Concluída

Sprint 03 — Demandas
Status: Concluída
```

A Sprint reutilizará autenticação, Profiles, Organizations, Memberships, roles, Clients, RLS base, Activity Logs, Error Handling, AppShell e infraestrutura de testes já existentes.

---

# Fontes Consultadas

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
- Financial;
- Migrations;
- RLS;
- Activity Logs;
- ADR-001;
- ADR-002 — Estratégia de Persistência e Transações;
- Error Handling.

## Desenvolvimento e Interface

- Testing Strategy;
- Conventions;
- Implementation Guide;
- DataTable Guidelines;
- Sprint 03.

---

# Escopo Funcional Confirmado

O produto e os requisitos confirmam:

- gestão financeira operacional;
- registro de entradas;
- registro de saídas;
- descrição;
- categoria;
- valor maior que zero;
- data da movimentação;
- vencimento quando aplicável;
- registro de quando a movimentação foi efetivamente paga ou recebida;
- distinção entre movimentos realizados e pendentes ou previstos;
- natureza de pagamento `ONE_TIME` ou `RECURRING`;
- observações;
- associação opcional com Cliente;
- totais de entradas e saídas realizadas por período;
- saldo em caixa derivado;
- meta mensal de receita;
- progresso derivado da meta;
- Activity Logs para operações relevantes.

O escopo físico exato está definido no contrato `Financial`.

---

# Fora do Escopo

Esta Sprint não deverá implementar:

- contabilidade oficial;
- escrituração ou emissão fiscal;
- ERP contábil;
- conciliação bancária;
- integração bancária ou open banking;
- gateway de pagamento;
- cobrança automática;
- contas a pagar ou receber automáticas;
- faturação recorrente automática;
- geração automática mensal de movimentos;
- scheduler, cron ou worker;
- Stripe Billing;
- relatórios financeiros avançados;
- Documents físicos;
- lucro, margem, EBITDA, MRR ou ARR;
- impostos ou payroll;
- Dashboard consolidado;
- Contratos físicos;
- SaaS multi-Organization;
- aplicativo nativo;
- API pública.

Esses itens não são pendências técnicas da Sprint 04.

---

# Entidades Conceituais Encontradas

O Data Model e Migrations utilizam os nomes conceituais:

```text
financial_entries
financial_goals
```

Esses nomes, tabelas, colunas, constraints e fronteiras RPC estão congelados no contrato `Financial`.

Modelo conceitual:

```text
Organization
├── 0..N Financial Entries
└── 0..N Financial Goals

Client
└── 0..N Financial Entries, quando aplicável
```

---

# Movimentação Financeira

Uma movimentação representa uma entrada ou uma saída operacional.

Regras congeladas:

- pertence à Organization;
- possui valor maior que zero;
- suporta descrição;
- suporta categoria;
- suporta data da movimentação;
- poderá possuir vencimento;
- poderá registrar quando foi paga ou recebida;
- distingue realizado de pendente ou previsto;
- poderá possuir observações;
- poderá relacionar-se opcionalmente a Cliente;
- utiliza valor positivo; o tipo da movimentação distingue entrada de saída.

Não utilizar valor negativo para representar saída.

---

# Tipo da Movimentação

Domínio oficial:

```text
INCOME
EXPENSE
```

Semântica:

```text
INCOME
→ entrada financeira

EXPENSE
→ saída financeira
```

O valor permanece sempre positivo. Nunca utilizar valor negativo para determinar o tipo.

---

# Natureza do Pagamento

Domínio funcional congelado:

```text
ONE_TIME
RECURRING
```

`ONE_TIME` representa movimento pontual.

`RECURRING` identifica somente a natureza recorrente da obrigação ou receita no MVP. Não cria agendamento, cobrança, duplicação nem novo movimento automaticamente.

Cada novo período deverá ser registrado por um movimento explícito do utilizador autorizado.

O contrato físico utiliza `payment_nature` em `TEXT` com constraint de domínio.

---

# Status Financeiro

Domínio oficial:

```text
PENDING
REALIZED
CANCELED
```

Labels futuras de UI:

```text
PENDING  → Pendente
REALIZED → Realizado
CANCELED → Cancelado
```

O mesmo domínio atende `INCOME` e `EXPENSE`.

Não criar `PAID`, `RECEIVED`, `OVERDUE`, `SETTLED` ou `OPEN`. Nenhuma máquina rígida de transições está congelada nesta etapa.

---

# Realização e Saldo

Realização utiliza:

```text
status
+
realized_date
```

Regras congeladas:

```text
PENDING
→ realized_date = NULL

REALIZED
→ realized_date obrigatória

CANCELED
→ não participa dos agregados realizados
```

Somente movimentos com `status = REALIZED` participam de entradas realizadas, saídas realizadas, saldo e progresso da meta.

A constraint física definida em `Financial` deverá impedir combinações incoerentes entre Status e `realized_date`.

Saldo:

```text
Saldo em caixa
=
Entradas realizadas
-
Saídas realizadas
```

Movimentos `PENDING` ou `CANCELED` não alteram o saldo realizado.

O saldo utiliza todos os movimentos realizados dentro do escopo temporal definido pela Query de caixa.

Não armazenar `monthly_income_total`, `monthly_expense_total`, `cash_balance` ou `goal_progress` como colunas agregadas duplicadas.

---

# Datas

Campos conceituais congelados:

```text
reference_date DATE NOT NULL
due_date       DATE NULL
realized_date  DATE NULL
```

`reference_date` representa a data operacional ou de referência do lançamento.

`due_date` representa o vencimento quando aplicável.

`realized_date` representa a data efetiva de pagamento ou recebimento.

Não utilizar `TIMESTAMPTZ` nesses três campos nem inventar horário financeiro.

Timestamps técnicos permanecem separados:

```text
created_at
updated_at
archived_at
```

---

# Valores Monetários e Moeda

Decisão física planejada:

```text
amount numeric(12,2)
```

Regras:

- valor obrigatório;
- valor maior que zero;
- entrada ou saída é determinada pelo tipo, não pelo sinal;
- JavaScript `float` não será fonte de verdade monetária.

Moeda operacional da Sprint:

```text
EUR
```

Não haverá multi-currency, conversão ou câmbio. `EUR` permanecerá regra organizacional do MVP e não será persistido em coluna nesta Sprint.

---

# Relação com Cliente

As fontes permitem que uma entrada esteja associada a Cliente e determinam que uma saída não exija essa associação.

O modelo conceitual suporta:

```text
financial_entry
→ 0..1 Client
```

`client_id` será opcional para permitir movimentos internos sem Cliente. Quando informado, Cliente e movimentação deverão pertencer à mesma Organization.

Conhecer ou enviar `client_id` não concede autorização financeira.

---

# Relação com Demanda

As fontes consultadas não definem relação direta entre movimentação financeira e Demanda.

```text
demand_id
→ não integra o escopo confirmado da Sprint 04
```

Não será criado campo ou Foreign Key por antecipação. Qualquer relação futura deverá preservar Demand, Client e Organization consistentes.

---

# Relação com Contrato

As fontes não congelam `contract_id` em movimentações financeiras.

Contratos pertencem à Sprint 05 e ainda não existem fisicamente. A Sprint 04 não criará campo sem Foreign Key, tabela simulada ou dependência física antecipada.

Uma eventual integração futura exigirá contrato e migration próprios.

---

# Categorias

Categoria é requisito funcional explícito para entradas e saídas e deverá permitir organização e consolidação financeira.

Contrato do MVP:

```text
category TEXT NULL
```

Regras conceituais:

```text
trim
vazio → NULL
```

Categoria é uma classificação operacional livre. Não criar tabela, enum ou administração de catálogo.

Categoria não substitui `type`, `payment_nature` ou `status`.

---

# Meta Mensal

Entidade conceitual encontrada:

```text
financial_goals
```

Modelo conceitual congelado:

```text
financial_goals

id
organization_id
year
month
target_amount
created_by
updated_by
created_at
updated_at
```

Regras:

- pertence à Organization;
- representa meta mensal de receita;
- possui mês;
- possui ano;
- possui valor;
- não é duplicada por Cliente;
- progresso considera somente entradas efetivamente recebidas no período;
- existe exatamente uma meta por combinação de Organization, ano e mês;
- `target_amount > 0`;
- progresso é derivado.

Unicidade conceitual:

```text
UNIQUE (organization_id, year, month)
```

Não criar `status`, `active`, `archived_at`, `client_id`, `current_amount` ou `progress_percentage` em `financial_goals`.
A meta pertence ao Financeiro e não depende da implementação do Dashboard consolidado.

---

# Indicadores Derivados

O módulo deverá fornecer dados autorizados para derivar:

- entradas `INCOME + REALIZED` pelo mês e ano de `realized_date`;
- saídas `EXPENSE + REALIZED` pelo mês e ano de `realized_date`;
- saldo em caixa realizado;
- meta mensal;
- progresso da meta mensal calculado por entradas `INCOME + REALIZED` do mês/ano de `realized_date` dividido pela meta do mesmo mês.

O Dashboard consolidado consumirá esses dados somente na Sprint 06.

Movimentos `PENDING` e `CANCELED` não participam desses agregados.

Somatórios, contagens e progresso deverão ser calculados sobre o mesmo conjunto autorizado das listagens e detalhes.

---

# Arquivamento e Histórico

Movimentos financeiros utilizam arquivamento lógico por:

```text
archived_at
```

Não existe delete físico operacional. Movimentos arquivados não aparecem na listagem padrão.

`CANCELED` é estado financeiro. `archived_at` controla visibilidade e preservação histórica. Arquivar não significa cancelar.

Arquivamento nunca deverá apagar Activity Logs.

---

# Documentos Financeiros

Documents físicos ficaram fora da Sprint 04.

Uma integração futura deverá reutilizar a infraestrutura central e privada, sem criar sistema de arquivos específico para Financeiro. Nenhum campo sem integridade ou tabela específica será antecipado.

---

# Autorização

## OWNER

Pode administrar o Financeiro da própria Organization dentro do escopo do MVP.

## ADMIN

Sem acesso ao Financeiro nesta Sprint.

## MEMBER

Client Assignment não concede automaticamente acesso ao Financeiro.

```text
MEMBER associado a Cliente
≠
acesso financeiro automático
```

Sem acesso ao Financeiro nesta Sprint.

Não reutilizar `private.can_access_client()` isoladamente como autorização financeira.

## Matriz congelada

OWNER `ACTIVE` poderá listar, visualizar, criar, editar, alterar Status, arquivar, gerir meta mensal e visualizar indicadores dentro da própria Organization.

ADMIN e MEMBER serão negados. Backend e RLS permanecem como autoridade; guards de UI não substituem autorização no banco.

---

# RLS e Data Leakage

As tabelas expostas deverão possuir RLS antes de receber Grants de aplicação.

As Policies específicas implementarão o contrato OWNER-only definido em `Financial`.

Regras obrigatórias:

- resolver Organization pelo contexto autenticado;
- validar Profile, Membership `ACTIVE`, Organization ativa e role permitida;
- não aceitar `organization_id`, `user_id`, role, autoria ou realização como autorização do browser;
- não tratar `client_id` como prova de acesso financeiro;
- proteger movimentos com e sem Cliente;
- negar URL direta não autorizada sem revelar existência;
- impedir leitura cross-Organization;
- aplicar autorização antes de pesquisa, filtros, ordenação e paginação;
- impedir que totais, saldo e progresso incluam registros não autorizados;
- não buscar todos os movimentos para filtrar no React;
- conceder acesso do Data API somente com Grants mínimos e RLS correspondente.

Os predicados e a estrutura das Policies deverão seguir o contrato físico `Financial` e o helper OWNER já existente.

---

# Persistência e Fronteiras

## Leituras

Fluxo padrão:

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

Listagens, detalhes e indicadores deverão ser calculados no banco sobre dados autorizados.

## Escritas

ADR-002 não exige RPC para toda escrita.

RPC deverá ser utilizada quando a operação exigir atomicidade, múltiplas escritas, auditoria inseparável ou autorização privilegiada controlada.

As cinco escritas financeiras utilizarão as RPCs transacionais congeladas em `Financial`, garantindo mutação e Activity Log atômicos.

Toda RPC `SECURITY DEFINER`, se aprovada, deverá usar `auth.uid()` internamente, `SET search_path = ''`, schemas explícitos, validação completa de autorização e `EXECUTE` restrito. `PUBLIC` e `anon` não receberão execução privilegiada.

---

# Activity Logs

A infraestrutura central `activity_logs` será reutilizada. Não criar `financial_activities`.

Contrato de auditoria congelado:

```text
FINANCIAL_ENTRY / CREATED
FINANCIAL_ENTRY / UPDATED
FINANCIAL_ENTRY / STATUS_CHANGED
FINANCIAL_ENTRY / ARCHIVED

FINANCIAL_GOAL / CREATED
FINANCIAL_GOAL / UPDATED
```

Não criar Actions adicionais sem necessidade.

Quando auditoria e mutação forem inseparáveis, deverão ocorrer na mesma transação. Metadata deverá ser mínima e não expor dados financeiros sensíveis desnecessários.

---

# Error Handling

Server Actions deverão utilizar o contrato oficial `ActionResult`:

```text
{ success: true, data: T }

ou

{ success: false, error: { code, message, fieldErrors? } }
```

Erros de validação, autenticação, autorização, conflito, banco e falhas inesperadas deverão ser mapeados para códigos seguros.

Não expor SQL, RLS, valores internos, stack traces ou detalhes financeiros não autorizados ao browser.

---

# UI Planejada

Rotas conceituais coerentes com os módulos existentes:

```text
/financeiro
/financeiro/novo
/financeiro/[id]
/financeiro/[id]/editar
```

A rota `/financeiro` poderá conter:

- Page Header;
- cards derivados do período;
- lista de movimentos;
- pesquisa;
- filtros aprovados;
- ordenação;
- paginação;
- CTA de novo movimento quando autorizado;
- estados Loading, Empty, Error e Success.

Os cards previstos são entradas realizadas, saídas realizadas, saldo em caixa e meta mensal. Nenhum card será persistido como agregado nem integrado ao Dashboard consolidado nesta Sprint.

Detalhes, formulários e ações seguirão o contrato físico e a matriz OWNER-only aprovados.

---

# Listagem, Pesquisa, Filtros e Paginação

Pesquisa inicial será case-insensitive por descrição, conforme o contrato físico.

Filtros funcionalmente disponíveis para o planejamento físico:

- Cliente;
- tipo `INCOME/EXPENSE`;
- natureza `ONE_TIME/RECURRING`;
- Status `PENDING/REALIZED/CANCELED`;
- período;
- realizado/pendente derivado do Status;
- categoria livre.

Colunas candidatas:

- descrição;
- Cliente;
- tipo;
- valor;
- natureza;
- Status;
- data ou vencimento;
- realização;
- ações autorizadas.

Os campos físicos de search, filtros e sort estão congelados em `Financial`.

A ordenação usará a whitelist explícita definida em `Financial`.

Paginação seguirá o padrão oficial:

```text
10
20
50
100

default: 20
```

Pesquisa, filtros, ordenação, paginação e período deverão permanecer na URL e executar no banco.

---

# Estratégia de Testes Planejada

## Banco

Cobrir:

- schema, tipos, constraints, Foreign Keys e índices;
- valor monetário e valor maior que zero;
- isolamento por Organization;
- relação opcional e íntegra com Cliente;
- realização por `status + realized_date`;
- Status `PENDING/REALIZED/CANCELED`;
- natureza `ONE_TIME/RECURRING`;
- `category TEXT NULL`, trim e vazio convertido em `NULL`;
- metas mensais e unicidade;
- agregados autorizados;
- RLS, Policies e Grants;
- direct writes conforme estratégia aprovada;
- RPCs reais quando existirem;
- Activity Logs e atomicidade;
- negação cross-Organization;
- totais e indicadores sem Data Leakage.

## Unitários e Componentes

Cobrir:

- Schemas Zod;
- contratos tipados;
- cálculos e helpers puros realmente existentes;
- parâmetros de Query;
- Services;
- Server Actions e ActionResult;
- componentes, formulários e estados da interface;
- formatação monetária sem usar float como fonte de verdade.

## E2E

Lifecycle real planejado:

```text
OWNER autenticado
→ cria entrada
→ cria saída
→ registra realização conforme contrato aprovado
→ visualiza indicadores derivados
→ filtra período
→ edita
→ arquiva conforme regra aprovada
```

Denied paths deverão cobrir ADMIN e MEMBER conforme a matriz aprovada, URL direta, cross-Organization, totais não autorizados e Client Assignment sem permissão financeira automática.

Fixtures destrutivas deverão ser determinísticas e explicitamente `LOCAL ONLY`.

---

# Critérios de Aceite Planejados

A Sprint somente poderá ser concluída quando:

- entradas e saídas puderem ser registradas conforme contrato físico aprovado;
- valor maior que zero estiver protegido;
- movimentos realizados e pendentes estiverem distinguidos por `status + realized_date`;
- saldo utilizar somente movimentos `REALIZED`;
- natureza `ONE_TIME/RECURRING` for informativa e não gerar recorrência automática;
- relação opcional com Cliente mantiver integridade de Organization;
- categoria seguir `TEXT NULL`, trim e vazio convertido em `NULL`;
- meta mensal e progresso utilizarem somente entradas realizadas no período correto;
- indicadores forem derivados e autorizados;
- matriz OWNER-only estiver implementada no banco;
- Client Assignment não conceder acesso financeiro automático;
- RLS, Policies e Grants estiverem aprovados e testados;
- Actions de Activity Logs congeladas estiverem atômicas quando necessário e testadas;
- listagem, pesquisa, filtros, ordenação e paginação não causarem Data Leakage;
- interface for responsiva e acessível;
- testes unitários, de banco, segurança e E2E críticos estiverem aprovados;
- lint, typecheck e build estiverem aprovados;
- documentação diretamente afetada estiver sincronizada;
- não houver decisão obrigatória aberta.

---

# Decisões Funcionais Congeladas

- entidades conceituais `financial_entries` e `financial_goals`;
- Organization obrigatória;
- `type` com domínio `INCOME/EXPENSE`;
- valor positivo em `numeric(12,2)`;
- moeda operacional única `EUR`, sem multi-currency;
- `status` com domínio `PENDING/REALIZED/CANCELED`;
- realização definida por `status + realized_date`;
- `reference_date DATE NOT NULL`;
- `due_date DATE NULL`;
- `realized_date DATE NULL`;
- indicadores mensais calculados pelo mês/ano de `realized_date`;
- saldo composto somente por movimentos `REALIZED`;
- Cliente opcional e íntegro com a Organization;
- ausência de `demand_id` e `contract_id` nesta Sprint;
- `category TEXT NULL`, com trim e vazio normalizado para `NULL`;
- natureza `ONE_TIME/RECURRING` informativa;
- ausência de recorrência automática;
- arquivamento lógico por `archived_at`, distinto de `CANCELED`;
- acesso OWNER-only;
- Client Assignment sem permissão financeira automática;
- schema conceitual e unicidade mensal de `financial_goals`;
- Actions de Activity Logs definidas para movimentos e metas;
- agregados derivados, sem colunas de total ou progresso;
- Documents físicos fora da Sprint 04;
- Dashboard consolidado fora da Sprint 04.

---

# Decisões Físicas Antes da Migration

O contrato físico foi congelado em:

```text
docs/04-database/Financial.md
```

Estão definidos:

- tabelas, colunas, tipos, nulabilidade e defaults;
- constraints, Foreign Keys e integridade cross-Organization;
- EUR como regra organizacional sem coluna;
- índices mínimos;
- RLS e Grants OWNER-only;
- cinco RPCs transacionais de escrita;
- `get_financial_summary` para agregados autorizados;
- Activity Logs e metadata mínima;
- pesquisa, filtros, whitelist de ordenação e paginação;
- cobertura física futura.

Não permanece decisão física bloqueadora. Documents continuam deliberadamente fora da Sprint.

---

# Divergências e Lacunas Encontradas

Não foi encontrado conflito entre as decisões aprovadas e o objetivo operacional, entidades conceituais, natureza do pagamento, valor positivo, saldo realizado ou meta mensal.

As lacunas funcionais de tipo, Status, realização, datas, valor, moeda, categoria, arquivamento, autorização, metas e Actions foram resolvidas nesta etapa.

As fontes não definem relação direta de Financeiro com Demanda ou Contrato, coerentemente com a exclusão de `demand_id` e `contract_id`.

Documentos financeiros permanecem requisito futuro do produto, mas Documents físicos foram explicitamente retirados da Sprint 04 até existir contrato centralizado próprio.

---

# Checklist Antes da Implementação

- [x] Objetivo funcional identificado.
- [x] Escopo e itens fora da Sprint separados.
- [x] Entidades conceituais identificadas.
- [x] Regras de saldo e meta identificadas.
- [x] Natureza `ONE_TIME/RECURRING` confirmada.
- [x] Tipo `INCOME/EXPENSE` aprovado.
- [x] Status `PENDING/REALIZED/CANCELED` aprovado.
- [x] Realização e datas principais aprovadas.
- [x] `numeric(12,2)` e moeda operacional EUR aprovados.
- [x] `category TEXT NULL` aprovada.
- [x] Arquivamento lógico aprovado.
- [x] Matriz OWNER-only aprovada.
- [x] Actions de Activity Logs aprovadas.
- [x] Schema conceitual de meta mensal aprovado.
- [x] Índices e Queries aprovados.
- [x] RLS e Policies aprovadas.
- [x] Fronteiras de RPC aprovadas.
- [x] Agregados autorizados aprovados.
- [x] Documents físicos mantidos fora da Sprint 04.
- [x] Contrato físico consolidado antes da migration.

---

# Resultado deste Planejamento

```text
Sprint 04 — Financeiro
Status: Planejada e tecnicamente não iniciada
```

O escopo funcional e o contrato físico estão aprovados. A implementação técnica e a migration ainda não foram iniciadas.

Nenhuma funcionalidade foi implementada por esta tarefa.
