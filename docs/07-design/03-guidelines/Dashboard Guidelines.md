# Dashboard Guidelines

## Projeto

FASBtech CRM

---

## Status

🟢 Ativo

---

## Versão

3.0

---

# Objetivo

Este documento define os padrões oficiais para implementação do Dashboard no FASBtech CRM.

O Dashboard representa a principal visão executiva e operacional do sistema.

Seu objetivo é permitir que o utilizador compreenda rapidamente:

- a situação financeira atual;
- o estado das Demandas;
- quais prazos exigem atenção;
- quais alertas operacionais existem;
- quais atividades recentes são relevantes;
- para onde deve navegar para agir.

O Dashboard não deverá funcionar como relatório completo.

Ele deverá funcionar como:

```text
Resumo

+

Priorização

+

Ação
```

---

# Fonte da Verdade

A implementação do Dashboard deverá respeitar a seguinte hierarquia:

```text
PRD v3.0

↓

MVP Scope v3.0

↓

Functional Requirements v3.0

↓

Business Rules v3.0

↓

Layout v3.0

↓

Dashboard Guidelines v3.0

↓

Components v3.0

↓

Design Tokens

↓

Pages
```

Nenhum Dashboard poderá contrariar documentos de prioridade superior.

---

# Momento de Implementação

O Dashboard possui dois momentos distintos no Roadmap.

---

## Sprint 01 — Foundation

Na Foundation, deverá existir apenas o Dashboard inicial.

Ele poderá conter:

```text
Page Header

↓

Mensagem inicial / estado informativo
```

Não deverá apresentar dados fictícios.

---

## Sprint 06 — Dashboard Consolidado

O Dashboard operacional completo será implementado na:

```text
Sprint 06 — Dashboard
```

Somente depois da implementação de:

```text
Clientes & Acessos

Demandas

Financeiro

Contratos
```

Isso garante que seus indicadores sejam derivados de dados reais.

---

# Filosofia

Dashboard não é um relatório.

Dashboard é uma central de decisão.

Toda informação apresentada deverá ajudar a responder:

- O que aconteceu?
- Qual é a situação atual?
- O que exige atenção?
- Existe algum prazo em risco?
- Como está a situação financeira?
- O que devo abrir para agir?

Caso uma informação não ajude na tomada de decisão, ela não deverá ocupar espaço no Dashboard principal.

---

# Princípios

## Prioridade

As informações mais importantes deverão aparecer primeiro.

Priorizar:

- situação financeira;
- riscos;
- Demandas atrasadas;
- prazos próximos;
- alertas relevantes;
- atividades recentes úteis.

---

## Clareza

O Dashboard deverá possuir poucos elementos por tela.

Evitar:

- excesso de Cards;
- dezenas de métricas;
- gráficos redundantes;
- tabelas extensas;
- informações repetidas.

---

## Hierarquia Visual

A ordem dos blocos deverá representar sua importância.

O utilizador deve conseguir identificar em poucos segundos:

```text
Situação geral

↓

Problemas

↓

Próximas ações
```

---

## Contexto

Nenhum indicador deverá apresentar apenas um número sem contexto.

Errado:

```text
12
```

Correto:

```text
12 Demandas em andamento
```

ou:

```text
4 Demandas atrasadas
```

---

## Ação

Sempre que fizer sentido, o indicador deverá permitir navegação para o módulo correspondente.

Exemplo:

```text
4 Demandas atrasadas

[Ver Demandas]
```

---

# Princípio de Dados Reais

O Dashboard deverá utilizar apenas fontes oficialmente implementadas.

Nunca apresentar:

- valores fictícios;
- dados mockados como se fossem reais;
- reuniões sem fonte oficial;
- Leads inexistentes;
- Pipeline Comercial inexistente;
- Próximos Contatos de Leads;
- métricas provenientes de módulos não implementados.

---

# Arquitetura de Dados

O Dashboard deverá seguir a arquitetura oficial de leitura.

Fluxo:

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

↓

Dados autorizados

↓

Renderização
```

Client Components não deverão acessar diretamente o banco.

---

# Dashboard Derivado

O Dashboard não deverá possuir cópias manuais dos dados dos módulos.

Exemplo correto:

```text
financial_entries

↓

Query

↓

Saldo em caixa
```

Exemplo incorreto:

```text
financial_entries

+

dashboard_balance armazenado manualmente
```

---

# Estrutura Oficial

A estrutura conceitual do Dashboard consolidado será:

```text
Page Header

↓

Resumo Executivo

↓

Situação Financeira

↓

Resumo de Demandas

↓

Prazos e Alertas

↓

Atividades Recentes

↓

Informações Complementares quando realmente úteis
```

Nem todo bloco precisa existir para todos os utilizadores.

A visibilidade deverá respeitar permissões.

---

# Page Header

O Dashboard deverá possuir Page Header conforme Layout.

Exemplo:

```text
Dashboard

Resumo geral da operação da FASBtech.
```

Breadcrumb não é obrigatório quando for redundante.

---

# Resumo Executivo

O primeiro bloco deverá apresentar uma visão rápida da operação.

Ele não deverá ser uma coleção arbitrária de KPIs.

Os indicadores disponíveis dependerão de:

- dados reais;
- permissões;
- valor operacional.

---

# Indicadores Financeiros

Quando o utilizador possuir autorização ao Financeiro, poderão ser apresentados:

```text
Saldo em caixa

Entradas do mês

Saídas do mês

Progresso da meta mensal
```

---

# Indicadores de Demandas

Poderão ser apresentados:

```text
Demandas abertas

Demandas em andamento

Demandas atrasadas

Demandas próximas do prazo

Demandas concluídas
```

Não é obrigatório apresentar todos simultaneamente.

Priorizar os mais úteis para decisão.

---

# Contratos

Indicadores de Contratos poderão ser adicionados apenas quando trouxerem valor real.

Exemplos possíveis:

```text
Contratos aguardando ação

Contratos enviados

Contratos aguardando cópia assinada
```

Não incluir métricas contratuais apenas porque o módulo existe.

---

# Clientes

Indicadores de Clientes poderão existir quando forem úteis.

Exemplo:

```text
Clientes ativos
```

Porém, quantidade total de Clientes não deverá ocupar espaço prioritário se não representar uma decisão relevante.

---

# Quantidade de Cards

Não existe quantidade fixa obrigatória.

Como orientação:

## Desktop

Até:

```text
4 Cards por linha
```

quando isso preservar legibilidade.

---

## Tablet

Preferencialmente:

```text
2 Cards por linha
```

---

## Mobile

Preferencialmente:

```text
1 Card por linha
```

---

# Limite de Indicadores

Evitar mais de:

```text
6 a 8 indicadores principais
```

no primeiro nível do Dashboard.

Se existirem mais métricas, elas provavelmente pertencem aos módulos ou relatórios específicos.

---

# MetricCard

O componente oficial para indicadores resumidos é:

```text
MetricCard
```

Pode conter:

- título;
- valor;
- ícone;
- contexto;
- comparação quando realmente disponível;
- link para módulo relacionado.

---

# Variação

Não é obrigatório exibir:

```text
+12%
-5%
```

em todos os indicadores.

Variação somente deverá aparecer quando:

- houver período de comparação definido;
- existir dado real;
- a comparação tiver valor de negócio.

---

# Situação Financeira

Quando o utilizador possuir permissão, o Dashboard poderá apresentar um bloco financeiro consolidado.

Exemplo:

```text
Financeiro

Saldo em caixa
€ 12.450

Entradas do mês
€ 6.200

Saídas do mês
€ 2.800

Meta mensal
62%
```

---

# Fonte Financeira

Os valores deverão vir de:

```text
financial_entries

+

financial_goals
```

conforme regras oficiais do Financeiro.

---

# Saldo em Caixa

O saldo deverá considerar apenas movimentações realizadas.

Conceitualmente:

```text
Entradas realizadas

-

Saídas realizadas
```

Valores pendentes ou previstos não deverão alterar o saldo realizado.

---

# Meta Mensal

O progresso da meta deverá utilizar apenas receitas efetivamente recebidas no período.

Exemplo:

```text
Receita recebida no mês

÷

Meta mensal

=

Progresso
```

---

# Permissão Financeira

Se o utilizador não possuir acesso ao módulo Financeiro:

```text
dados financeiros não deverão ser exibidos
```

Ocultar o Card não substitui a segurança da Query.

A Query também deverá impedir acesso.

---

# Resumo de Demandas

O Dashboard deverá destacar a situação operacional das Demandas.

Indicadores possíveis:

```text
Abertas

Em andamento

Atrasadas

Próximas do prazo

Concluídas
```

---

# Demandas Atrasadas

Demandas atrasadas possuem alta prioridade visual.

Uma Demanda é considerada atrasada conforme as regras de negócio oficiais.

Demandas:

```text
COMPLETED
CANCELED
```

não deverão ser consideradas atrasadas.

---

# Próximas do Prazo

O Dashboard poderá destacar Demandas cujo prazo esteja próximo.

O intervalo concreto utilizado para definir:

```text
próxima do prazo
```

deverá ser definido pela regra oficial correspondente.

O componente visual não deverá criar essa regra sozinho.

---

# DemandSummary

O componente oficial será:

```text
DemandSummary
```

Ele poderá apresentar vários estados de Demandas de forma compacta.

---

# Prazos e Alertas

Este bloco deverá apresentar somente situações que exigem atenção.

Exemplos:

```text
Demanda atrasada

Demanda próxima do prazo

Prazo crítico

Situação operacional que exige intervenção
```

---

# OperationalAlert

Componente oficial:

```text
OperationalAlert
```

Cada alerta deverá indicar:

- o problema;
- a entidade relacionada;
- gravidade quando aplicável;
- ação recomendada;
- navegação para o contexto correspondente.

---

# Exemplo

```text
Demanda atrasada

Landing Page — Cliente XPTO

Prazo vencido há 2 dias.

[Ver Demanda]
```

---

# Alertas não são Informações Gerais

Não utilizar Alert para apresentar informações neutras.

Errado:

```text
Existem 15 Clientes cadastrados.
```

Correto:

```text
3 Demandas estão atrasadas.
```

---

# Deadline List

Quando houver múltiplos prazos relevantes, poderá ser utilizado:

```text
DeadlineList
```

Cada item poderá exibir:

- Demanda;
- Cliente;
- responsável;
- prazo;
- estado temporal;
- ação.

---

# Ordenação dos Prazos

Priorizar:

```text
Atrasados

↓

Mais próximos

↓

Mais distantes
```

quando essa ordenação representar melhor a urgência operacional.

---

# Atividades Recentes

Responsável por apresentar eventos recentes provenientes de:

```text
activity_logs
```

O Dashboard nunca deverá acessar diretamente a tabela.

Os dados deverão ser obtidos pela Query oficial.

---

# RecentActivity

Componente oficial:

```text
RecentActivity
```

Cada item poderá apresentar:

- utilizador;
- ação;
- entidade;
- contexto;
- data relativa ou absoluta.

---

# Exemplo

```text
João Silva

Atualizou Cliente

Empresa XPTO

Há 5 minutos
```

---

# Permissões de Activity Logs

As atividades exibidas deverão respeitar:

- Organization;
- role;
- Client Assignment quando aplicável;
- autorização do módulo.

Um MEMBER não deverá descobrir informações de Clientes não autorizados através do Dashboard.

---

# Quantidade de Atividades

Como padrão inicial:

```text
até 10 registros
```

Ordenados:

```text
mais recente

↓

mais antigo
```

---

# Informações Complementares

O Dashboard poderá apresentar informações adicionais quando elas realmente ajudarem na decisão.

Exemplos possíveis:

- Contratos aguardando ação;
- Clientes com atividade relevante;
- tendências financeiras;
- distribuição de Demandas;
- desempenho operacional.

Nenhum desses blocos é obrigatório.

---

# Dashboard Tables

Listas resumidas poderão ser utilizadas quando forem mais adequadas do que Cards.

Exemplos:

```text
Demandas atrasadas

Próximos prazos

Contratos que exigem ação
```

---

# Regra das Dashboard Tables

Nunca deverão substituir as páginas completas dos módulos.

Devem apresentar apenas uma amostra relevante.

Estrutura:

```text
Título

Descrição opcional

Lista resumida

[Ver todos]
```

---

# Quantidade de Registros

Quantidade recomendada:

```text
5 a 10 registros
```

Evitar paginação completa dentro do Dashboard.

Se a coleção exige paginação:

```text
provavelmente pertence ao módulo correspondente
```

---

# DataTable no Dashboard

Não é obrigatório utilizar a DataTable completa.

Quando não forem necessários:

- filtros;
- ordenação complexa;
- paginação;

preferir uma lista ou tabela simplificada.

---

# Dashboard Charts

Gráficos são opcionais.

Não existe obrigação de possuir gráficos no Dashboard.

---

# Critério para Gráfico

Um gráfico somente deverá existir quando responder claramente a uma pergunta.

Exemplos:

```text
Como evoluíram as entradas e saídas?

Como estão distribuídas as Demandas por Status?

Como evoluiu a receita recebida?
```

---

# Gráficos Permitidos

Quando apropriado:

- Linha;
- Barras;
- Área;
- Donut/Pizza apenas quando representar proporção de forma clara.

---

# Não Utilizar

- gráficos 3D;
- animações excessivas;
- gráficos decorativos;
- múltiplos gráficos com a mesma informação;
- gradientes complexos apenas por estética.

---

# Exemplo — Receita

Pergunta:

```text
Como evoluíram as entradas recebidas nos últimos meses?
```

Possível representação:

```text
Line Chart
```

---

# Exemplo — Demandas

Pergunta:

```text
Como estão distribuídas as Demandas por Status?
```

Possível representação:

```text
Bar Chart
```

ou outra visualização apropriada.

---

# Sem Pipeline Comercial

O Dashboard v3.0 não possui:

```text
Pipeline Comercial
```

porque Leads não fazem parte do MVP atual.

Também não possuir:

```text
PipelineCard
```

como componente oficial.

---

# Sem Próximos Contatos

O Dashboard v3.0 não possui bloco oficial de:

```text
Próximos Contatos
```

porque o modelo atual não possui agenda ou follow-up comercial estruturado.

Essa funcionalidade só poderá retornar após existir uma fonte de dados oficial.

---

# Sem Reuniões Inventadas

Não apresentar:

```text
Próximas reuniões
```

até existir módulo ou integração oficial responsável por esse dado.

---

# Componentes Oficiais

Os componentes conceituais do Dashboard consolidado são:

```text
MetricCard

FinancialSummary

DemandSummary

OperationalAlert

DeadlineList

RecentActivity

DashboardChart
```

Outros componentes poderão ser introduzidos quando houver necessidade real.

Não criar versões paralelas sem justificativa.

---

# Estados

Todo Dashboard deverá possuir estados adequados.

---

# Loading

Preferir Skeletons.

Componentes possíveis:

```text
SkeletonDashboard
SkeletonCard
SkeletonTable
SkeletonChart
```

Criar somente os Skeletons realmente necessários.

---

# Empty State

Empty State deverá considerar que o Dashboard agrega vários módulos.

Não é necessário transformar toda a página em Empty State quando apenas um bloco não possuir dados.

Exemplo:

```text
Demandas

Ainda não existem Demandas cadastradas.

[Criar primeira Demanda]
```

---

# Dashboard Inicial sem Dados

Em uma instalação nova, o Dashboard deverá orientar sem inventar dados.

Exemplo:

```text
Bem-vindo ao FASBtech CRM.

Comece cadastrando seus Clientes e organizando sua operação.
```

---

# Error State

Falhas deverão ser tratadas no nível adequado.

Se apenas um bloco falhar, preferir que os demais continuem utilizáveis quando tecnicamente possível.

Nunca expor erros internos do banco.

---

# Success

Representa o estado normal de operação.

Os dados deverão estar:

- autorizados;
- atualizados conforme estratégia oficial;
- consistentes com os módulos de origem.

---

# Responsividade

O Dashboard deverá funcionar em:

- Desktop;
- Tablet;
- Mobile.

---

# Desktop

Permitir:

- Cards em múltiplas colunas;
- blocos lado a lado;
- uso eficiente da largura.

---

# Tablet

Reorganizar:

- Cards;
- listas;
- gráficos;

para preservar leitura.

---

# Mobile

Priorizar:

- informação crítica;
- Cards empilhados;
- listas compactas;
- ações claras;
- toque.

Gráficos poderão ser simplificados ou reorganizados.

---

# Prioridade no Mobile

A ordem de conteúdo deverá preservar a prioridade do Dashboard.

Exemplo:

```text
Resumo Executivo

↓

Alertas

↓

Prazos

↓

Atividades
```

Evitar que visualizações menos importantes empurrem alertas críticos para muito abaixo da página.

---

# Performance

O Dashboard agrega dados de múltiplos módulos e deverá evitar consultas redundantes.

Priorizar:

- Server Components;
- Queries agregadas quando apropriadas;
- paralelização segura de leituras independentes;
- reutilização de dados quando fizer sentido;
- Suspense/Streaming quando trouxer benefício;
- Client Components apenas para interatividade.

---

# Queries

Não reutilizar automaticamente Queries de listagem completas apenas para obter métricas simples.

Exemplo incorreto:

```text
buscar todas as Demandas

↓

contar no JavaScript
```

Preferir Query específica:

```text
COUNT autorizado no banco
```

quando apropriado.

---

# Agregações

Agregações deverão ocorrer preferencialmente no banco quando isso reduzir:

- transferência;
- processamento desnecessário;
- complexidade no cliente.

---

# Dashboard sem Tabelas de Agregação

A primeira implementação deverá preferir Queries sobre os dados reais.

Não criar automaticamente:

```text
dashboard_metrics
dashboard_stats
dashboard_totals
```

---

# Views e Materialized Views

Views ou Materialized Views poderão ser consideradas futuramente somente se:

- houver problema real de performance;
- consultas se tornarem complexas;
- medições justificarem a alteração.

Não antecipar otimizações.

---

# Revalidação

Os dados deverão utilizar as estratégias oficiais de atualização do Next.js e da aplicação.

Após uma mutação relevante:

```text
revalidar somente o necessário
```

quando possível.

Evitar recarregar toda a aplicação sem necessidade.

---

# Navegação

Todo bloco acionável deverá direcionar para o módulo correto.

Exemplos:

```text
Demandas atrasadas

↓

/demandas
```

```text
Financeiro

↓

/financeiro
```

```text
Contrato que exige ação

↓

/contratos/<id>
```

A rota concreta deverá seguir as convenções oficiais do projeto.

---

# Dashboard e Permissões

Cada bloco deverá ser exibido somente quando o utilizador possuir acesso aos dados correspondentes.

Exemplo:

```text
MEMBER sem acesso financeiro
```

não deverá receber:

- saldo;
- entradas;
- saídas;
- meta.

---

# Segurança

A interface deverá receber apenas dados já autorizados.

O Dashboard não deverá buscar dados completos para depois ocultar visualmente informações proibidas.

Exemplo incorreto:

```text
Query retorna Financeiro

↓

React esconde o Card
```

Exemplo correto:

```text
Permissão validada

↓

Query autorizada

↓

dados permitidos
```

---

# Design Tokens

Todos os componentes deverão utilizar exclusivamente:

- Color Palette;
- Design Tokens;
- Typography;
- Spacing;
- Icons;
- Animations.

Nunca utilizar:

- HEX arbitrário;
- espaçamentos improvisados;
- sombras fora do sistema;
- animações definidas sem token quando existir padrão oficial.

---

# Motion

As transições deverão utilizar os tokens oficiais.

Evitar animações que dificultem:

- leitura;
- percepção de dados;
- acessibilidade.

Respeitar:

```text
prefers-reduced-motion
```

---

# Acessibilidade

Todos os componentes deverão cumprir:

```text
WCAG 2.2 AA
```

Garantir:

- navegação por teclado;
- foco visível;
- contraste adequado;
- semântica HTML;
- labels acessíveis;
- suporte a leitores de tela;
- informação não dependente apenas de cor.

---

# Indicadores e Cor

Estados como:

```text
atrasado
urgente
concluído
```

não deverão depender exclusivamente da cor.

Utilizar também:

- texto;
- ícone;
- Label;
- contexto visual.

---

# Gráficos e Acessibilidade

Gráficos deverão possuir alternativa textual adequada.

As informações essenciais não deverão existir apenas visualmente no gráfico.

---

# Regras

Nunca:

- apresentar informações duplicadas;
- apresentar Leads;
- apresentar Pipeline Comercial;
- apresentar Próximos Contatos sem fonte;
- apresentar reuniões sem fonte;
- utilizar componentes não documentados sem necessidade;
- acessar banco diretamente de Client Components;
- criar gráficos sem propósito;
- armazenar métricas duplicadas sem necessidade;
- utilizar valores hardcoded;
- apresentar dados simulados como reais.

Sempre:

- utilizar dados reais;
- respeitar autorização;
- reutilizar Components;
- utilizar Design Tokens;
- seguir Layout;
- utilizar Queries para leitura;
- priorizar ação;
- manter clareza.

---

# Fora do Escopo

Este documento não define:

- relatórios completos;
- Business Intelligence;
- exportação analítica avançada;
- Forecasting;
- IA;
- reuniões;
- Agenda;
- Pipeline de Leads;
- métricas comerciais de Leads;
- dashboards customizáveis por utilizador;
- widgets arrastáveis;
- dashboards por Organization.

Essas funcionalidades não fazem parte do MVP atual.

---

# Referências

Este documento deverá permanecer sincronizado com:

- PRD v3.0;
- MVP Scope v3.0;
- Product Roadmap v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- Layout v3.0;
- Components v3.0;
- Design Tokens;
- Color Palette;
- Module Architecture v3.0;
- Activity Logs v3.0;
- Accessibility;
- Implementation Guide;
- DataTable Guidelines.

---

# Fonte da Verdade Final

A estrutura conceitual oficial é:

```text
Dashboard

├── Resumo Executivo
│   ├── Financeiro quando autorizado
│   └── Demandas
│
├── Prazos e Alertas
│
├── Atividades Recentes
│
└── Informações Complementares
    somente quando úteis
```

As fontes principais serão:

```text
financial_entries
financial_goals
demands
contracts
clients
activity_logs
```

conforme os módulos forem implementados.

O Dashboard:

```text
consulta

agrega

resume

direciona
```

Ele não deverá duplicar o estado oficial dos módulos.

---

# Definition of Done

O Dashboard consolidado será considerado concluído quando:

- utilizar apenas dados reais;
- respeitar as permissões do utilizador;
- apresentar resumo executivo claro;
- apresentar informações financeiras somente quando autorizadas;
- apresentar resumo operacional de Demandas;
- destacar atrasos e prazos relevantes;
- apresentar Activity Logs somente quando autorizados;
- não possuir Leads ou Pipeline Comercial;
- não possuir Próximos Contatos sem fonte oficial;
- não apresentar reuniões sem fonte oficial;
- utilizar Queries oficiais;
- não acessar diretamente o banco em Client Components;
- não manter métricas duplicadas sem necessidade;
- possuir estados de Loading, Empty, Error e Success;
- funcionar em Desktop, Tablet e Mobile;
- cumprir WCAG 2.2 AA;
- utilizar os Components oficiais;
- utilizar Design Tokens;
- seguir o Layout v3.0;
- apresentar apenas informações relevantes para tomada de decisão;
- permanecer alinhado ao MVP v3.0.