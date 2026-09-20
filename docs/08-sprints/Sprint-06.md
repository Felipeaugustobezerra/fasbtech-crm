# Sprint 06 — Dashboard consolidado

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

Planejada e tecnicamente não iniciada

---

## Última atualização

Setembro de 2026

---

# Estado da Sprint

Este documento planeja exclusivamente a Sprint 06 — Dashboard consolidado.

Não autoriza antecipação de Agenda, reuniões, notificações externas, forecasting, inteligência artificial, relatórios avançados, BI, exportações, contabilidade ou redesign geral do sistema.

---

# Objetivo

Substituir a mensagem inicial do Dashboard por uma visão executiva consolidada, derivada exclusivamente de dados reais e autorizados dos módulos concluídos:

```text
Clientes
Demandas
Financeiro
Contratos
Activity Logs
```

O Dashboard não terá tabelas próprias de totais, snapshots de indicadores ou qualquer manutenção manual de agregados.

---

# Dependências

```text
Sprint 01 — Foundation
Status: Concluída

Sprint 02 — Clientes & Acessos
Status: Concluída

Sprint 03 — Demandas
Status: Concluída

Sprint 04 — Financeiro
Status: Concluída

Sprint 05 — Contratos
Status: Concluída
```

A Sprint reutilizará autenticação, contexto de Profile/Membership/Organization, RLS, Queries server-side, `get_financial_summary`, Activity Logs centralizados, AppShell, Design System e infraestrutura de testes existentes.

---

# Fontes Consultadas

- AGENTS.md e Project Index;
- PRD, MVP Scope e Roadmap;
- Functional Requirements e Business Rules;
- Sprints 02 a 05;
- contratos físicos de Clientes, Demandas, Financeiro, Contratos e Activity Logs;
- migrations e Policies atualmente implementadas;
- Dashboard inicial existente em `app/(private)/page.tsx`.

---

# Princípios Obrigatórios

- utilizar apenas dados reais persistidos pelos módulos oficiais;
- calcular indicadores nas fontes responsáveis, sem duplicar totais;
- executar leituras no servidor;
- manter RLS e autorização do banco como autoridade;
- nunca buscar toda a base para filtrar ou agregar no React;
- nunca apresentar zero quando o resultado real for “sem autorização” ou “erro”;
- omitir seções de módulos aos quais o utilizador não possui acesso;
- não usar Client Assignment para conceder Financeiro ou Contratos;
- não registrar Activity Log apenas pela visualização do Dashboard;
- não expor existência, contagem ou atividade de recursos não autorizados.

---

# Matriz de Dashboard por Role

## OWNER

Recebe a visão executiva completa da própria Organization ativa:

- resumo financeiro;
- Clientes ativos;
- Demandas e prazos;
- Contratos por Status;
- alertas objetivos aprovados;
- atividades recentes autorizadas.

## ADMIN

As Sprints 02 a 05 não concederam ao `ADMIN` acesso operacional a Clientes, Demandas, Financeiro, Contratos ou aos respectivos Logs.

Nesta Sprint, `ADMIN` não receberá indicadores desses módulos. O Dashboard apresentará somente uma mensagem segura de ausência de módulos autorizados, sem contagens, nomes, alertas ou atividades que revelem dados.

A Sprint 06 não ampliará permissões de `ADMIN` por inferência.

## MEMBER

Recebe somente informações operacionais já autorizadas:

- total de Clientes ativos aos quais possui Client Assignment atual;
- indicadores de Demandas pertencentes a esses Clientes;
- atividades recentes de Clientes e Demandas que as Policies atuais permitem consultar.

Não recebe:

- Financeiro;
- Contratos;
- metas financeiras;
- Logs administrativos da Organization;
- dados de Clientes ou Demandas sem Assignment atual.

Ser responsável por uma Demanda sem Client Assignment atual não concede acesso ao Dashboard nem à Demanda.

---

# Período e Datas

## Financeiro

O período padrão será o mês civil atual:

```text
year + month atuais em Europe/Lisbon
```

O Dashboard utilizará `get_financial_summary(year, month)`, preservando a semântica já implementada:

- entradas e saídas do mês usam `realized_date` dentro do mês solicitado;
- saldo em caixa é cumulativo até o fim desse mês;
- meta pertence ao mesmo ano e mês;
- progresso é calculado no banco;
- valores monetários permanecem decimal-safe até a apresentação em EUR.

Não haverá seletor de período nesta primeira versão. Relatórios históricos e filtros complexos estão fora do escopo.

## Demandas

`due_date` é uma data civil sem horário. A timezone operacional do MVP é `Europe/Lisbon`.

Regras congeladas:

- a data civil atual é determinada em `Europe/Lisbon`;
- o mês financeiro atual utiliza `year` e `month` de `Europe/Lisbon`;
- uma Demanda está atrasada quando `due_date` é anterior à data civil atual, observadas as demais regras de Status e arquivamento;
- campos `DATE` permanecem datas civis e não são convertidos para timestamp para comparação;
- a timezone do browser não é autoridade;
- não será criada coluna de timezone nem migration para esta decisão;
- suporte multi-timezone permanece fora do MVP.

---

# Indicadores Confirmados

## Resumo executivo

O topo do Dashboard apresentará somente indicadores compatíveis com a role atual. Para `OWNER`, o resumo poderá destacar:

- saldo em caixa;
- entradas realizadas no mês;
- Demandas ativas;
- Contratos que ainda não estão em estado terminal;
- Clientes ativos.

Para `MEMBER`, o resumo será limitado a Clientes e Demandas autorizados. Para `ADMIN`, não haverá resumo operacional.

## Financeiro

Exclusivo para `OWNER`:

- entradas realizadas do mês;
- saídas realizadas do mês;
- saldo em caixa;
- meta mensal;
- progresso da meta mensal.

Fonte oficial: RPC existente `get_financial_summary`.

Regras preservadas:

- somente `REALIZED` participa dos agregados;
- `PENDING` e `CANCELED` não participam;
- movimento `REALIZED` arquivado continua nos agregados;
- saldo e progresso não são recalculados em TypeScript ou React;
- ausência de meta é apresentada como “meta não definida”, não como zero.

## Demandas

Disponível para `OWNER` e `MEMBER`, sempre sobre o conjunto autorizado pela RLS.

Status oficiais:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

Definição aprovada de Demanda ativa para o Dashboard:

```text
archived_at IS NULL

+

status NOT IN (COMPLETED, CANCELED)
```

Indicadores:

- total de Demandas ativas;
- contagem por cada Status oficial entre as Demandas não arquivadas;
- Demandas atrasadas;
- lista curta de prazos vencidos, quando houver acesso atual.

Regra de atraso:

```text
archived_at IS NULL

+

due_date anterior à data civil atual

+

status NOT IN (COMPLETED, CANCELED)
```

Atraso permanece derivado e não será persistido.

“Próxima do prazo” não entra na implementação enquanto o limiar temporal não for aprovado. Nenhuma janela de dias será inventada.

## Contratos

Exclusivo para `OWNER`.

O Dashboard apresentará contagens reais de Contracts nos cinco Status oficiais:

```text
DRAFT
GENERATED
SENT
SIGNED
CANCELED
```

Também poderá apresentar um total não terminal derivado de:

```text
DRAFT + GENERATED + SENT
```

Os Status serão apresentados como distribuição operacional, não como scoring. Sem regra temporal aprovada, `DRAFT`, `GENERATED` ou `SENT` não serão classificados automaticamente como atrasados ou problemáticos.

## Clientes

Disponível para `OWNER` e `MEMBER` sobre o conjunto autorizado.

Cliente ativo no Dashboard significa exclusivamente:

```text
archived_at IS NULL
```

Indicador confirmado:

- total de Clientes ativos autorizados.

Não serão criados conceitos de cliente saudável, churn, risco, valor, engajamento ou scoring.

## Atividade recente

O Dashboard exibirá no máximo as 10 Activity Logs mais recentes que o caller já pode visualizar pelas Policies atuais.

Projeção mínima planejada:

- `entity_type`;
- `entity_id` somente para construir link quando a entidade continuar autorizada;
- `action`;
- `created_at`;
- identificação mínima do ator somente se puder ser obtida sem ampliar Policies de Profiles.

Ordenação:

```text
created_at DESC
id DESC
```

Não carregar todo o histórico. A Query utilizará limite no banco. Metadata completa, payloads sensíveis e conteúdo de snapshots/documentos não serão enviados ao Dashboard.

`OWNER` vê os Logs autorizados da Organization. `MEMBER` recebe apenas eventos de Cliente e Demanda já permitidos pelas Policies atuais. `ADMIN` não recebe atividades nesta Sprint.

---

# Alertas Confirmados

O bloco de alertas será derivado e não persistido.

Nesta Sprint, o único alerta operacional confirmado é:

- Demandas atrasadas segundo a regra oficial, limitadas ao conjunto autorizado.

Não entram sem nova regra objetiva:

- Demandas próximas do prazo;
- Contratos “parados” ou “exigindo ação” por tempo;
- meta financeira “abaixo do esperado”;
- risco, saúde, churn ou scoring;
- notificações externas.

Contagens de Contracts por Status pertencem ao resumo de Contratos e não serão apresentadas como alertas subjetivos.

---

# Layout Funcional

A Sprint manterá o AppShell e o Design System existentes, sem redesign geral.

Ordem conceitual:

1. resumo executivo compatível com a role;
2. Financeiro, quando autorizado;
3. Demandas, quando autorizadas;
4. Contratos, quando autorizados;
5. Clientes, quando autorizados;
6. alertas objetivos;
7. atividade recente autorizada.

Cada bloco deverá ser responsivo, acessível e possuir título explícito. Cards não substituem links para os módulos de origem quando o utilizador possuir acesso.

---

# Estratégia de Leitura

Fluxo planejado:

```text
Server Component

↓

contexto autenticado da Foundation

↓

Dashboard Queries server-only por domínio

↓

Supabase

↓

RLS / RPC autorizada

↓

PostgreSQL
```

As Queries independentes serão executadas em paralelo no servidor somente para os módulos permitidos pela role:

- Financeiro: RPC existente `get_financial_summary`;
- Clientes: count no banco sob RLS e `archived_at IS NULL`;
- Demandas: counts no banco sob RLS, Status e prazo;
- Contratos: counts no banco sob RLS e Status;
- Activity Logs: Query limitada, ordenada e protegida pelas Policies existentes.

Não reutilizar APIs de listagem paginada para baixar registros e somar em memória.

Falhas serão isoladas por seção. Uma falha não será convertida em zero e não deverá revelar detalhes internos. O Dashboard poderá renderizar as demais seções autorizadas e apresentar erro seguro apenas no bloco afetado.

---

# RPCs e Migration

## RPCs existentes

`get_financial_summary` já fornece o resumo financeiro autorizado e deverá ser reutilizada.

## Novas RPCs

Nenhuma nova RPC é obrigatória para o escopo planejado. Counts simples podem utilizar Queries agregadas no banco sob as Policies atuais.

Se a implementação demonstrar que múltiplos round-trips comprometem materialmente a página, uma RPC agregada dedicada somente poderá ser criada após congelar seu contrato de retorno e testar ausência de Data Leakage. Ela deverá recalcular autorização internamente, usar schemas explícitos, `SET search_path = ''` e `EXECUTE` restrito. Essa possibilidade não autoriza antecipadamente uma RPC nem `SECURITY DEFINER`.

## Migration

Nenhuma nova tabela, coluna, índice ou migration é necessária com o estado atual. A Sprint não persistirá agregados.

Uma migration somente será aberta se a implementação provar necessidade real de nova RPC ou índice por evidência de segurança/desempenho, sem alterar o escopo funcional.

---

# Estados da Interface

## Loading

Usar loading do Dashboard sem apresentar valores fictícios.

## Empty

- módulo autorizado sem registros: mensagem específica e valor real zero;
- meta mensal ausente: “Meta não definida”;
- atividade autorizada inexistente: “Nenhuma atividade recente”;
- `ADMIN`: mensagem segura informando ausência de módulos operacionais autorizados.

## Error

Erro seguro por seção, sem SQLSTATE, mensagens da Supabase, stack, IDs internos ou dados parciais incorretos.

## Acesso parcial

Seção não autorizada não é renderizada. Não utilizar card bloqueado com total oculto, pois a própria existência ou contagem pode causar Data Leakage.

---

# Estrutura Técnica Planejada

Estrutura conceitual mínima, sujeita aos padrões já existentes no momento da implementação:

```text
app/(private)/page.tsx
app/(private)/loading.tsx
app/(private)/error.tsx

lib/dashboard/queries.ts
types/dashboard.ts

components/dashboard/
  executive-summary.tsx
  financial-summary.tsx
  demand-summary.tsx
  contract-summary.tsx
  client-summary.tsx
  dashboard-alerts.tsx
  recent-activity.tsx
```

Não criar Server Actions, Services de escrita ou mutations, pois o Dashboard é somente leitura.

---

# Testes Planejados

## Unitários e UI

- mapeamento dos indicadores sem conversão monetária insegura;
- matriz visual por role;
- ausência de módulos não autorizados;
- estados loading, empty e error;
- ausência de dados simulados;
- links somente para recursos autorizados.

## Banco e segurança

- counts respeitam RLS e Organization;
- MEMBER vê somente Clientes e Demandas atribuídos;
- remoção de Client Assignment remove imediatamente os indicadores relacionados;
- ADMIN não recebe dados operacionais;
- Financeiro e Contratos permanecem OWNER-only;
- Activity Logs não revelam entidades não autorizadas;
- cross-Organization negado;
- nenhuma Query distingue “não existe” de “não autorizado” de forma explorável.

## E2E

- OWNER recebe Dashboard completo com dados reais;
- MEMBER recebe somente recorte autorizado;
- ADMIN recebe estado seguro sem métricas operacionais;
- indicadores mudam após operações reais nos módulos de origem;
- refresh preserva resultados derivados;
- empty/error states não exibem números fictícios.

---

# Fora do Escopo

- Agenda e reuniões;
- notificações externas;
- tabela `notifications`;
- cron, scheduler ou worker;
- forecasting;
- inteligência artificial;
- scoring;
- relatórios avançados ou BI;
- exportações;
- contabilidade;
- integração bancária;
- filtros históricos complexos;
- persistência de totais ou progresso;
- redesign completo do sistema.

---

# Decisões Confirmadas

1. Cards do MVP: Financeiro, Demandas, Contratos, Clientes e atividade recente, sempre conforme autorização.
2. OWNER recebe visão completa; MEMBER recebe somente Clientes/Demandas/Logs autorizados; ADMIN não recebe métricas operacionais.
3. Financeiro utiliza o mês civil atual de `Europe/Lisbon`, sem seletor de período nesta versão.
4. Demanda ativa exclui `COMPLETED`, `CANCELED` e arquivadas.
5. Atraso é derivado de `due_date` expirada e Status não terminal.
6. “Próxima do prazo” fica excluída enquanto não houver limiar aprovado.
7. Contratos exibem os cinco Status oficiais; não terminais são `DRAFT`, `GENERATED` e `SENT`.
8. Atividade recente usa no máximo 10 Logs autorizados, ordenados no banco e com projeção mínima.
9. A RPC financeira existente será reutilizada; nenhuma nova RPC está aprovada neste planejamento.
10. Não há necessidade atual de nova migration.
11. Queries independentes serão paralelas no servidor e condicionadas pela role.
12. Empty e error states serão específicos por seção e nunca simularão zero em falha ou falta de autorização.

---

# Blockers Antes da Implementação

## Decisão não bloqueadora

O limiar de “próxima do prazo” não está definido. Esse indicador permanecerá fora da Sprint 06 enquanto não houver aprovação explícita; sua ausência não bloqueia os demais indicadores.

Não existem blockers funcionais ou físicos identificados.

---

# Definition of Done Planejada

A Sprint poderá ser concluída quando:

- o Dashboard utilizar somente dados reais;
- a timezone oficial estiver congelada e aplicada de modo consistente;
- OWNER, ADMIN e MEMBER receberem somente seções autorizadas;
- Financeiro reutilizar `get_financial_summary`;
- Clientes, Demandas, Contratos e Logs forem agregados no banco;
- atraso seguir a regra oficial e não for persistido;
- nenhuma seção causar Data Leakage;
- não existirem totais duplicados;
- loading, empty e error states estiverem implementados;
- a interface for responsiva e acessível;
- testes unitários, de banco/segurança e E2E críticos forem aprovados;
- lint, typecheck e build forem aprovados;
- documentação diretamente afetada estiver sincronizada.
