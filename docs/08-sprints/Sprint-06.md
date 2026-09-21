# Sprint 06 — Dashboard consolidado

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

Concluída

---

## Última atualização

Setembro de 2026

---

# Estado da Sprint

Este documento registra o planejamento e a conclusão da Sprint 06 — Dashboard consolidado.

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

A Sprint reutilizou autenticação, contexto de Profile/Membership/Organization, RLS, Queries server-side, `get_financial_summary`, Activity Logs centralizados, AppShell, Design System e infraestrutura de testes existentes.

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

O período padrão é o mês civil atual:

```text
year + month atuais em Europe/Lisbon
```

O Dashboard utiliza `get_financial_summary(year, month)`, preservando a semântica já implementada:

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
- não foi criada coluna de timezone nem migration para esta decisão;
- suporte multi-timezone permanece fora do MVP.

---

# Indicadores Confirmados

## Resumo executivo

O topo do Dashboard apresenta somente indicadores compatíveis com a role atual. Para `OWNER`, o resumo destaca:

- saldo em caixa;
- Demandas ativas;
- Contratos que ainda não estão em estado terminal;
- Clientes ativos.

Para `MEMBER`, o resumo é limitado a Clientes e Demandas autorizados. Para `ADMIN`, não há resumo operacional.

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
- Demandas atrasadas.

Regra de atraso:

```text
archived_at IS NULL

+

due_date anterior à data civil atual

+

status NOT IN (COMPLETED, CANCELED)
```

Atraso permanece derivado e não é persistido.

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

Também apresenta um total não terminal derivado de:

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

O Dashboard exibe no máximo as 10 Activity Logs mais recentes que o caller pode visualizar pelas Policies atuais.

Projeção mínima implementada:

- `entity_type`;
- `entity_id` somente para construir link quando a entidade continuar autorizada;
- `action`;
- `created_at`.

Ordenação:

```text
created_at DESC
id DESC
```

O histórico completo não é carregado. A Query aplica o limite no banco. Metadata completa, payloads sensíveis e conteúdo de snapshots/documentos não são enviados ao Dashboard.

`OWNER` vê os Logs autorizados da Organization. `MEMBER` recebe apenas eventos de Cliente e Demanda já permitidos pelas Policies atuais. `ADMIN` não recebe atividades nesta Sprint.

---

# Alertas Confirmados

O bloco de alertas é derivado e não persistido.

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

A Sprint manteve o AppShell e o Design System existentes, sem redesign geral.

Ordem conceitual:

1. resumo executivo compatível com a role;
2. Financeiro, quando autorizado;
3. Demandas, quando autorizadas;
4. Contratos, quando autorizados;
5. Clientes, quando autorizados;
6. alertas objetivos;
7. atividade recente autorizada.

Cada bloco é responsivo, acessível e possui título explícito. Cards mantêm links para os módulos de origem quando o utilizador possui acesso.

---

# Estratégia de Leitura Implementada

Fluxo implementado:

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

As Queries independentes são executadas em paralelo no servidor somente para os módulos permitidos pela role:

- Financeiro: RPC existente `get_financial_summary`;
- Clientes: count no banco sob RLS e `archived_at IS NULL`;
- Demandas: counts no banco sob RLS, Status e prazo;
- Contratos: counts no banco sob RLS e Status;
- Activity Logs: Query limitada, ordenada e protegida pelas Policies existentes.

Não reutilizar APIs de listagem paginada para baixar registros e somar em memória.

Falhas são isoladas por seção. Uma falha não é convertida em zero nem revela detalhes internos. O Dashboard renderiza as demais seções autorizadas e apresenta erro seguro apenas no bloco afetado.

---

# RPCs e Migration

## RPCs existentes

`get_financial_summary` fornece o resumo financeiro autorizado e foi reutilizada.

## Novas RPCs

Nenhuma nova RPC foi necessária. Counts simples utilizam Queries agregadas no banco sob as Policies atuais.

Qualquer eventual RPC agregada futura somente poderá ser criada após congelar seu contrato de retorno e testar ausência de Data Leakage. Ela deverá recalcular autorização internamente, usar schemas explícitos, `SET search_path = ''` e `EXECUTE` restrito. Essa possibilidade não autoriza antecipadamente uma RPC nem `SECURITY DEFINER`.

## Migration

Nenhuma nova tabela, coluna, índice ou migration foi necessária. A Sprint não persiste agregados.

Uma migration futura somente poderá ser aberta mediante necessidade real de nova RPC ou índice, sustentada por evidência de segurança ou desempenho e sem alterar o escopo funcional.

---

# Estados da Interface

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

# Estrutura Técnica Implementada

Estrutura efetivamente utilizada:

```text
app/(private)/page.tsx

lib/dashboard/dashboard.ts
lib/dashboard/queries.ts
types/dashboard.ts

components/dashboard/
  dashboard-card.tsx
  dashboard-view.tsx
  demand-summary.tsx
  contract-summary.tsx
  recent-activity.tsx
```

Não criar Server Actions, Services de escrita ou mutations, pois o Dashboard é somente leitura.

---

# Testes Implementados

## Unitários e UI

- agregações e filtros das Queries;
- cálculo determinístico do período em `Europe/Lisbon`;
- matriz de execução de Queries por role;
- ausência de chamadas de Financeiro e Contratos para `MEMBER` e de qualquer Query operacional para `ADMIN`;
- erros isolados por seção;
- matriz visual por role e ausência de módulos não autorizados;
- empty state de atividade e ausência de dados simulados.

## Banco e segurança

As Queries do Dashboard utilizam as tabelas, Policies e RPC financeira já cobertas pelos 18 arquivos pgTAP dos módulos concluídos. O fechamento não criou schema, Policy, RPC ou migration adicional.

## E2E

- OWNER recebe Dashboard completo com dados reais;
- MEMBER recebe somente recorte autorizado;
- ADMIN recebe estado seguro sem métricas operacionais;
- refresh preserva resultados derivados;
- timezone do browser não altera o mês financeiro nem a data civil oficial;
- métricas refletem fixtures reais e nenhuma seção proibida é exposta.

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
9. A RPC financeira existente foi reutilizada; nenhuma nova RPC foi necessária.
10. Não há necessidade atual de nova migration.
11. Queries independentes serão paralelas no servidor e condicionadas pela role.
12. Empty e error states serão específicos por seção e nunca simularão zero em falha ou falta de autorização.

---

# Blockers de Fechamento

## Decisão não bloqueadora

O limiar de “próxima do prazo” não está definido. Esse indicador permanecerá fora da Sprint 06 enquanto não houver aprovação explícita; sua ausência não bloqueia os demais indicadores.

Não existem blockers funcionais, técnicos ou documentais identificados.

---

# Definition of Done

Os critérios de conclusão foram:

- o Dashboard utilizar somente dados reais;
- a timezone oficial estiver congelada e aplicada de modo consistente;
- OWNER, ADMIN e MEMBER receberem somente seções autorizadas;
- Financeiro reutilizar `get_financial_summary`;
- Clientes, Demandas, Contratos e Logs forem agregados no banco;
- atraso seguir a regra oficial e não for persistido;
- nenhuma seção causar Data Leakage;
- não existirem totais duplicados;
- empty states e erros isolados por seção estiverem implementados;
- a interface for responsiva e acessível;
- testes unitários, de banco/segurança e E2E críticos forem aprovados;
- lint, typecheck e build forem aprovados;
- documentação diretamente afetada estiver sincronizada.

---

# Resultado

A Sprint 06 entregou o Dashboard consolidado usando exclusivamente dados reais dos módulos concluídos. Nenhuma métrica simulada, total duplicado, snapshot de indicador ou agregado manual foi persistido.

Entregas concluídas:

- Dashboard completo para `OWNER`;
- Dashboard de `MEMBER` limitado por RLS a Clientes atribuídos, respectivas Demandas e atividades autorizadas;
- estado seguro para `ADMIN`, sem métricas operacionais;
- total de Clientes ativos autorizados;
- Demandas ativas, distribuição por Status e Demandas atrasadas;
- Financeiro do mês civil atual com entradas, saídas, saldo, meta e progresso;
- Contratos por Status e total de Contratos não terminais;
- até 10 Activity Logs autorizados, com projeção mínima e ordenação no banco;
- timezone operacional `Europe/Lisbon` calculada no servidor;
- Queries independentes executadas em paralelo no servidor;
- erros isolados por seção, sem transformar falha ou falta de autorização em zero;
- E2E real para `OWNER`, `MEMBER`, `ADMIN`, refresh e timezone.

Regras finais confirmadas:

- `OWNER` recebe a visão executiva completa da própria Organization;
- `MEMBER` não recebe Financeiro nem Contratos;
- `ADMIN` não recebe métricas operacionais;
- Demandas atrasadas usam `due_date < data civil atual` em `Europe/Lisbon`, somente para Status não terminais e registros não arquivados;
- Financeiro utiliza o mês civil atual em `Europe/Lisbon` e reutiliza `get_financial_summary`;
- Agenda, reuniões e dados simulados não foram criados;
- “próxima do prazo” permanece fora do Dashboard enquanto não houver limiar aprovado.

---

# Validações Finais

```text
pgTAP
18 arquivos / 688 testes aprovados

Unitários e aplicação
46 arquivos / 688 testes aprovados

E2E
37 testes aprovados / 4 específicos do Dashboard

Supabase db reset
Aprovado

Supabase db lint
Aprovado

Typecheck
Aprovado

Lint
Aprovado

Build
Aprovado

git diff --check
Aprovado
```

Nenhum bug funcional foi encontrado no E2E do Dashboard. O helper de login recebeu somente a correção de uma expectativa textual obsoleta após a substituição da mensagem inicial pelo Dashboard consolidado.

O incidente observado em `.next`/Turbopack foi causado exclusivamente por cache local e não exigiu alteração de produto.

---

# Lições Aprendidas

- fixtures E2E isoladas por Organization mantêm métricas determinísticas mesmo com specs paralelas;
- autorização deve limitar a própria execução das Queries, e não apenas a renderização de componentes;
- `Europe/Lisbon` precisa permanecer explícita no servidor para que o browser não altere datas civis ou o mês financeiro;
- erros independentes por seção preservam dados válidos sem apresentar totais fictícios;
- Activity Logs devem ser filtrados pela RLS antes da aplicação do limite de 10 registros.
