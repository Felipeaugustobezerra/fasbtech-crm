# Layout

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

Este documento define a estrutura oficial de layout do FASBtech CRM.

Todas as páginas autenticadas deverão seguir este padrão para garantir:

- consistência visual;
- previsibilidade;
- acessibilidade;
- produtividade;
- reutilização;
- adaptação aos diferentes módulos do CRM.

Em caso de conflito com outros documentos do Design System, este documento prevalece exclusivamente na definição da estrutura das páginas.

---

# Fonte da Verdade

Este documento define a estrutura das interfaces do sistema.

Os componentes individuais são definidos em:

```text
Components
```

Os padrões visuais são definidos em:

```text
Design Tokens
Color Palette
Typography
Spacing
```

As regras funcionais permanecem definidas em:

```text
PRD v3.0
Functional Requirements v3.0
Business Rules v3.0
User Stories v3.0
```

A arquitetura técnica permanece definida em:

```text
System Architecture v3.0
Module Architecture v3.0
```

---

# Filosofia

O layout deverá transmitir:

- organização;
- clareza;
- rapidez;
- produtividade;
- consistência;
- hierarquia visual.

O utilizador deverá conseguir identificar rapidamente:

```text
Onde estou?

O que estou vendo?

Qual é a ação principal?

Qual informação exige atenção?
```

As páginas deverão manter uma hierarquia previsível sem impedir adaptações necessárias a cada módulo.

---

# Escopo

Este documento aplica-se às áreas autenticadas do CRM.

Exemplos:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

Telas públicas ou de autenticação, como:

```text
Login
Recuperação de acesso
```

não são obrigadas a utilizar o AppShell completo.

---

# Estrutura Oficial — AppShell

Toda área autenticada deverá utilizar a estrutura base:

```text
┌────────────────────────────────────────────────────────────┐
│ Sidebar │ Header                                           │
│         ├──────────────────────────────────────────────────┤
│         │ Page Header                                      │
│         ├──────────────────────────────────────────────────┤
│         │ Toolbar (quando aplicável)                       │
│         ├──────────────────────────────────────────────────┤
│         │                                                  │
│         │ Content                                          │
│         │                                                  │
│         │                                                  │
│         ├──────────────────────────────────────────────────┤
│         │ Pagination (quando aplicável)                    │
└─────────┴──────────────────────────────────────────────────┘
```

A estrutura poderá omitir blocos opcionais quando não forem necessários.

Exemplo:

```text
Toolbar
Pagination
```

não são obrigatórios em todas as páginas.

---

# Hierarquia

A hierarquia principal será:

```text
AppShell

├── Sidebar
├── Header
└── Main
    ├── Page Header
    ├── Toolbar quando aplicável
    └── Content
```

---

# Sidebar

A Sidebar representa a navegação principal da aplicação.

Responsável por:

- identidade visual;
- navegação principal;
- navegação secundária quando necessária;
- acesso às áreas autorizadas;
- acesso ao contexto do utilizador quando previsto.

Nunca deverá conter:

- tabelas;
- dashboards completos;
- formulários;
- métricas operacionais extensas.

---

# Menu Principal

A navegação principal oficial do MVP v3.0 será apresentada nesta ordem:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

A ordem deverá permanecer consistente entre sessões e dispositivos.

---

# Permissões na Navegação

A existência de um item no modelo de navegação não substitui autorização.

Quando um utilizador não possuir acesso a determinada área, a interface deverá seguir o comportamento definido pelo sistema de permissões.

Independentemente do comportamento visual:

```text
ocultar item
ou
indicar indisponibilidade
```

a segurança real deverá continuar sendo aplicada no backend e banco.

Nunca utilizar a Sidebar como fronteira de segurança.

---

# Módulos ainda não implementados

Durante o desenvolvimento incremental, um item do menu poderá corresponder a um módulo ainda não concluído.

A interface não deverá apresentar funcionalidades falsas ou dados simulados como se o módulo estivesse operacional.

Quando necessário, utilizar estado informativo consistente com o estágio real de implementação.

---

# Largura da Sidebar

Expandida:

```text
sidebar.width.expanded
```

Recolhida:

```text
sidebar.width.collapsed
```

---

# Comportamento da Sidebar

## Desktop

Preferencialmente visível.

Pode possuir modo recolhido conforme o comportamento oficial do componente.

---

## Tablet

Recolhível.

---

## Mobile

Utilizar Drawer.

---

# Header

Altura:

```text
header.height
```

O Header representa ações globais da aplicação.

Poderá conter:

- botão do menu no Mobile;
- contexto do utilizador;
- perfil;
- logout;
- notificações quando implementadas;
- ações verdadeiramente globais quando implementadas.

---

# Header não contém

O Header não deverá ser utilizado para:

- título principal da página;
- descrição da página;
- conteúdo operacional específico;
- Breadcrumb principal.

Essas responsabilidades pertencem ao:

```text
Page Header
```

---

# Busca Global

Busca global não faz parte obrigatoriamente da Foundation.

Caso seja implementada futuramente, deverá existir somente quando houver uma fonte funcional real para pesquisa transversal.

Não criar busca global decorativa ou sem comportamento definido.

---

# Notificações

O Header poderá receber acesso às notificações internas quando o módulo correspondente estiver implementado.

Na Sprint 03, notificações poderão ser introduzidas para eventos como prazos de Demandas.

Até lá, não apresentar notificações fictícias.

---

# Page Header

Páginas funcionais autenticadas deverão possuir um Page Header quando houver contexto de página que precise ser comunicado ao utilizador.

Responsabilidades:

- Breadcrumb quando necessário;
- título;
- descrição;
- ação principal;
- ações secundárias quando aplicáveis.

---

# Exemplo — Clientes

```text
Clientes

Gerencie os Clientes da FASBtech.

[Novo Cliente]
```

---

# Exemplo — Novo Cliente

```text
Clientes
    ↓
Novo Cliente

Cadastre um novo Cliente no CRM.
```

---

# Exemplo — Demandas

```text
Demandas

Acompanhe os trabalhos em andamento e seus prazos.

[Nova Demanda]
```

---

# Breadcrumb

Breadcrumb deverá representar a hierarquia real da navegação.

Exemplo:

```text
Clientes
    ↓
Empresa ABC
    ↓
Editar
```

Não utilizar Breadcrumb artificial em páginas sem hierarquia útil.

Exemplo:

```text
Dashboard
```

não precisa obrigatoriamente de Breadcrumb redundante apenas para cumprir estrutura.

---

# Ação Principal

Quando existir uma ação principal clara, ela deverá permanecer no Page Header.

Exemplos:

```text
Novo Cliente
Nova Demanda
Novo Contrato
Nova Movimentação
```

Não duplicar a mesma ação principal sem necessidade na Toolbar.

---

# Toolbar

A Toolbar é opcional.

Deverá ser utilizada quando a página possuir controles relacionados à coleção ou conteúdo exibido.

Pode conter:

- pesquisa;
- filtros;
- ordenação;
- ações em lote quando implementadas;
- controles auxiliares;
- exportação quando fizer parte do produto.

---

# Toolbar não deve conter

- navegação principal;
- título da página;
- descrição institucional;
- informações globais da aplicação.

---

# Exemplo — Listagem de Clientes

```text
Page Header

↓

Toolbar
├── Pesquisa
├── Filtros
└── Ordenação

↓

DataTable

↓

Paginação
```

---

# Área Principal

Padding:

```text
spacing.3xl
```

Largura máxima:

```text
container.2xl
```

O conteúdo deverá permanecer dentro do container oficial da aplicação.

Não posicionar componentes operacionais diretamente sobre a estrutura externa do AppShell.

---

# Conteúdo

O conteúdo deverá utilizar adequadamente a largura disponível.

Evitar:

- containers excessivamente estreitos;
- margens arbitrárias;
- alinhamentos diferentes entre páginas equivalentes;
- nesting visual desnecessário;
- Cards dentro de Cards sem necessidade.

---

# Grid

## Desktop

```text
12 colunas
```

---

## Tablet

```text
8 colunas
```

---

## Mobile

```text
4 colunas
```

---

# Responsividade

| Dispositivo | Sidebar | Grid |
|---|---|---|
| Desktop | Expandida / recolhível | 12 colunas |
| Tablet | Recolhível | 8 colunas |
| Mobile | Drawer | 4 colunas |

No Mobile deverão ser priorizados:

- leitura;
- toque;
- clareza;
- ações essenciais;
- ausência de overflow desnecessário.

---

# Cards

Cards deverão utilizar exclusivamente os Design Tokens oficiais.

Padding:

```text
card.padding
```

Radius:

```text
card.radius
```

Shadow:

```text
card.shadow
```

Border:

```text
card.border
```

---

# Uso de Cards

Cards deverão representar grupos reais de informação.

Não utilizar Cards apenas para criar contornos em todos os elementos da interface.

Exemplos apropriados:

- resumo de indicador;
- bloco de informações gerais;
- alerta operacional;
- agrupamento de dados relacionados.

---

# Tabelas

Tabelas deverão ocupar adequadamente a largura disponível.

Nunca utilizar largura fixa arbitrária como padrão.

---

## Desktop

Utilizar tabela tradicional quando o conjunto de dados for tabular.

---

## Tablet

Scroll horizontal controlado poderá ser utilizado quando necessário.

---

## Mobile

A apresentação poderá adaptar-se para:

- Cards;
- listas;
- visualização simplificada;
- tabela com scroll quando essa for a alternativa mais adequada.

A informação e as ações essenciais deverão permanecer disponíveis.

---

# DataTable

Páginas de coleções persistidas deverão seguir:

```text
DataTable Guidelines
```

quando utilizarem DataTable.

A interface não deverá carregar toda a base de dados apenas para:

- pesquisar;
- filtrar;
- ordenar;
- paginar.

Essas operações deverão seguir a arquitetura oficial.

---

# Paginação

Quando uma listagem possuir paginação, ela deverá aparecer associada diretamente à coleção correspondente.

Estrutura:

```text
Toolbar

↓

Tabela / Lista

↓

Paginação
```

Não utilizar paginação global da página.

---

# Formulários

Largura máxima inicial:

```text
800px
```

quando apropriado ao tipo de formulário.

Formulários deverão manter:

- hierarquia clara;
- labels;
- mensagens de erro;
- agrupamento lógico;
- ações previsíveis.

---

# Formulários Complexos

Formulários que necessitem mais espaço não deverão ser artificialmente limitados a `800px`.

Exemplos futuros:

```text
Contrato
Configuração complexa
Formulário com múltiplas seções
```

A largura deverá respeitar a necessidade real da interface e os tokens oficiais.

---

# Campos

Campos relacionados poderão ser organizados através do Grid.

Exemplo:

```text
Nome
Empresa

E-mail
Telefone

Identificação fiscal
Tipo de identificação
```

No Mobile, os campos deverão reorganizar-se verticalmente quando necessário.

---

# Ações de Formulário

Formulários de criação ou edição deverão possuir ações claras.

Padrão mínimo:

```text
Salvar
Cancelar
```

A nomenclatura poderá ser mais específica quando isso melhorar a clareza.

Exemplos:

```text
Criar Cliente
Gerar Contrato
Registrar Entrada
```

---

# Página de Listagem

Estrutura padrão:

```text
Page Header

↓

Toolbar quando aplicável

↓

Tabela / Lista

↓

Paginação quando aplicável
```

---

# Página de Cadastro

Estrutura padrão:

```text
Page Header

↓

Formulário

↓

Ações
```

---

# Página de Edição

Estrutura:

```text
Page Header

↓

Formulário preenchido

↓

Ações
```

---

# Página de Detalhes

A página de detalhes deverá priorizar:

```text
Page Header

↓

Visão principal da entidade

↓

Relacionamentos e seções disponíveis

↓

Atividade / Histórico quando aplicável
```

A ordem concreta poderá variar conforme o domínio.

---

# Cliente — Página de Detalhes

Cliente é a entidade operacional central do MVP.

Sua página deverá evoluir conforme os módulos forem implementados.

Estrutura conceitual final:

```text
Page Header

↓

Visão Geral

↓

Demandas

↓

Contratos

↓

Financeiro

↓

Documentos

↓

Acessos

↓

Atividades
```

Essa estrutura não significa que todas as áreas devam ser exibidas simultaneamente como blocos verticais.

Poderão ser utilizadas:

- Tabs;
- navegação interna;
- seções;
- combinações apropriadas.

---

# Cliente durante Sprint 02

Na Sprint 02, apenas as áreas realmente implementadas deverão ser apresentadas.

Inicialmente:

```text
Visão Geral

Acessos

Atividades
```

Não criar conteúdo fictício para:

```text
Demandas
Financeiro
Contratos
Documentos
```

antes dos módulos correspondentes existirem.

---

# Autorização na Página de Cliente

As áreas disponíveis deverão respeitar permissões.

Exemplo:

```text
MEMBER
```

pode possuir acesso ao Cliente sem possuir automaticamente acesso a:

```text
Financeiro
Contratos
```

A interface deverá refletir essa autorização.

A segurança real deverá permanecer no backend e banco.

---

# Dashboard

O Dashboard possui dois momentos distintos no roadmap.

---

# Dashboard — Foundation

Durante a Sprint 01, o Dashboard poderá permanecer simples.

Estrutura permitida:

```text
Page Header

↓

Mensagem inicial / estado informativo
```

Não criar métricas falsas para preencher espaço.

---

# Dashboard — Sprint 06

O Dashboard consolidado será implementado somente após os módulos que fornecem seus dados.

Sua estrutura deverá priorizar resumo executivo e informações acionáveis.

Estrutura conceitual:

```text
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

Informações complementares quando úteis
```

O detalhamento pertence ao:

```text
Dashboard Guidelines
```

---

# Resumo Executivo

Poderá apresentar, conforme autorização e disponibilidade real:

```text
Saldo em caixa
Entradas do mês
Saídas do mês
Progresso da meta mensal
```

---

# Resumo Operacional

Poderá apresentar:

```text
Demandas abertas
Demandas em andamento
Demandas atrasadas
Demandas próximas do prazo
Demandas concluídas
```

---

# Prazos e Alertas

Poderá apresentar:

- Demandas atrasadas;
- Demandas próximas do prazo;
- alertas operacionais reais;
- outros eventos relevantes provenientes dos módulos implementados.

---

# Atividades Recentes

Poderá utilizar:

```text
activity_logs
```

respeitando as permissões do utilizador.

---

# Dashboard não deve possuir

O Dashboard não deverá apresentar artificialmente:

- Pipeline Comercial;
- Leads;
- Próximos Contatos de Leads;
- reuniões sem fonte oficial;
- métricas fictícias;
- gráficos apenas decorativos;
- dados simulados apresentados como reais.

---

# Gráficos

Gráficos são opcionais.

Não existe obrigação de preencher o Dashboard com gráficos.

Um gráfico somente deverá existir quando:

- facilitar interpretação;
- possuir fonte real;
- responder uma pergunta relevante;
- acrescentar valor além de um número ou lista simples.

---

# Tabelas no Dashboard

Tabelas completas não deverão ser utilizadas como padrão no Dashboard.

Quando uma informação exigir exploração detalhada, preferir:

```text
resumo

+

link para o módulo correspondente
```

Exemplo:

```text
5 Demandas atrasadas

[Ver Demandas]
```

---

# Financeiro

Páginas do Financeiro deverão seguir o AppShell padrão.

Estrutura conceitual de listagem:

```text
Page Header

↓

Resumo quando necessário

↓

Toolbar

↓

Movimentações

↓

Paginação
```

O resumo financeiro não deverá substituir a listagem operacional.

---

# Demandas

Página de listagem:

```text
Page Header

↓

Toolbar

↓

Demandas

↓

Paginação
```

Filtros poderão incluir apenas campos realmente implementados, como:

- Status;
- Prioridade;
- Cliente;
- responsável;
- prazo;
- Tags.

---

# Contratos

Página de listagem:

```text
Page Header

↓

Toolbar quando aplicável

↓

Contratos

↓

Paginação
```

O fluxo de criação poderá possuir múltiplas etapas quando necessário:

```text
Selecionar Template

↓

Selecionar Cliente

↓

Completar Dados

↓

Revisar

↓

Gerar
```

A interface deverá manter clareza de progresso sem transformar o processo em etapas artificiais.

---

# Acessos

A área de Acessos deverá permitir administrar:

```text
Utilizadores

Roles

Client Assignments
```

conforme autorização.

Estrutura conceitual:

```text
Page Header

↓

Lista de Utilizadores

↓

Detalhes / Permissões / Clientes associados
```

A interface não deverá substituir as regras reais de autorização.

---

# Modais

Utilizar exclusivamente os Design Tokens.

Largura:

```text
modal.width
```

Padding:

```text
modal.padding
```

Radius:

```text
modal.radius
```

---

# Uso de Modal

Utilizar Modal para operações curtas e contextuais.

Exemplos:

- confirmação de arquivamento;
- confirmação de remoção de acesso;
- pequena ação contextual;
- edição simples quando apropriado.

---

# Modal não deve substituir

Evitar utilizar Modal para:

- páginas completas;
- formulários extensos;
- fluxos complexos;
- detalhes extensos de Cliente;
- geração completa de Contrato.

---

# Drawer

Drawer poderá ser utilizado para:

- menu Mobile;
- filtros;
- informações contextuais;
- ações rápidas;
- formulários curtos.

Não deverá substituir indiscriminadamente páginas completas.

---

# Confirmações Destrutivas ou Sensíveis

Ações como:

```text
Arquivar Cliente

Remover acesso de utilizador

Cancelar Contrato
```

deverão possuir confirmação adequada quando houver risco relevante de impacto.

A interface deverá indicar claramente a consequência da ação.

---

# Estados de Interface

Páginas assíncronas deverão implementar os estados aplicáveis:

```text
Loading

Empty

Error

Success Feedback
```

---

# Loading

Priorizar:

- Skeletons quando representarem adequadamente a estrutura;
- indicadores locais de loading;
- evitar bloquear toda a aplicação sem necessidade.

---

# Empty State

Empty States deverão explicar:

```text
Por que não há dados?

O que o utilizador pode fazer?
```

quando houver ação disponível.

Exemplo:

```text
Ainda não existem Clientes cadastrados.

[Novo Cliente]
```

---

# Error State

Erros deverão:

- utilizar linguagem compreensível;
- evitar detalhes técnicos internos;
- oferecer recuperação quando possível.

---

# Success Feedback

Operações concluídas poderão utilizar:

- Toast;
- mensagem inline;
- redirecionamento com feedback;
- atualização visual clara.

O padrão concreto pertence aos componentes oficiais.

---

# Espaçamento

Todo espaçamento deverá utilizar os Design Tokens definidos em:

```text
Spacing
```

Não utilizar valores arbitrários quando existir token correspondente.

---

# Alinhamento

Elementos equivalentes deverão manter alinhamento consistente entre páginas.

Exemplo:

```text
Page Header
Toolbar
Conteúdo
```

deverão compartilhar a mesma referência horizontal.

---

# Performance

Priorizar:

- Server Components;
- Streaming quando aplicável;
- Skeleton Loading;
- Lazy Loading quando necessário;
- Client Components apenas quando houver necessidade real.

Evitar:

- Layout Shift;
- scroll horizontal desnecessário;
- containers aninhados sem função;
- chamadas duplicadas;
- componentes pesados sem necessidade.

---

# Acessibilidade

Toda interface deverá cumprir:

```text
WCAG 2.2 AA
```

conforme o documento oficial de Accessibility.

Garantir:

- navegação por teclado;
- foco visível;
- contraste adequado;
- labels;
- mensagens de erro acessíveis;
- estrutura semântica;
- compatibilidade com leitores de tela;
- áreas de toque adequadas.

---

# Page Header e Acessibilidade

O título principal da página deverá possuir hierarquia semântica adequada.

Normalmente:

```text
h1
```

Não utilizar headings apenas pelo tamanho visual.

---

# Tabelas e Acessibilidade

Quando a informação continuar semanticamente tabular, manter estrutura acessível de tabela quando possível.

Ao adaptar para Mobile, não perder:

- identificação de campos;
- contexto da linha;
- ações;
- navegação por teclado.

---

# Foco

Modais, Drawers e elementos interativos deverão gerir foco corretamente.

Ao fechar:

```text
Modal / Drawer
```

o foco deverá retornar a uma posição lógica sempre que possível.

---

# Regras

As páginas deverão:

- utilizar AppShell quando autenticadas;
- utilizar Sidebar oficial;
- utilizar Header oficial;
- possuir Page Header quando houver contexto funcional correspondente;
- manter hierarquia consistente;
- utilizar Design Tokens;
- respeitar permissões;
- possuir estados de interface quando aplicáveis;
- funcionar em Desktop, Tablet e Mobile.

---

# Não é Obrigatório em Toda Página

Não exigir artificialmente em toda tela:

- Breadcrumb;
- Toolbar;
- paginação;
- tabela;
- descrição longa;
- Cards;
- gráficos.

Esses elementos deverão existir somente quando trouxerem valor real.

---

# Não Fazer

Evitar:

- páginas iniciando com dados sem contexto quando um Page Header for necessário;
- conteúdo fictício;
- métricas falsas;
- navegação de Leads;
- Pipeline Comercial;
- Próximos Contatos antigos;
- reuniões sem fonte oficial;
- containers duplicados;
- modais para fluxos completos;
- segurança baseada apenas em elementos ocultos da interface.

---

# Fora do Escopo

Este documento não define:

- cores;
- tipografia;
- tokens de espaçamento;
- regras de negócio;
- schema de banco;
- RLS;
- contratos de API;
- permissões concretas de backend.

Essas responsabilidades permanecem em seus documentos específicos.

---

# Referências

Este documento deverá permanecer sincronizado com:

- PRD v3.0;
- MVP Scope v3.0;
- Product Roadmap v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- User Stories v3.0;
- System Architecture v3.0;
- Module Architecture v3.0;
- Components;
- Dashboard Guidelines;
- CRM UI Guidelines;
- DataTable Guidelines;
- Design Tokens;
- Spacing;
- Accessibility;
- Implementation Guide.

---

# Fonte da Verdade Final

O AppShell oficial é:

```text
AppShell

├── Sidebar
│   ├── Dashboard
│   ├── Demandas
│   ├── Financeiro
│   ├── Contratos
│   ├── Clientes
│   └── Acessos
│
├── Header
│
└── Main
    ├── Page Header
    ├── Toolbar quando necessária
    └── Content
```

A entidade central da interface operacional é:

```text
Cliente
```

e sua evolução visual acompanha progressivamente:

```text
Clientes & Acessos
        ↓
Demandas
        ↓
Financeiro
        ↓
Contratos
        ↓
Dashboard consolidado
```

---

# Definition of Done

Uma tela será considerada concluída quando:

- seguir o AppShell oficial quando aplicável;
- possuir hierarquia visual clara;
- utilizar componentes oficiais;
- utilizar Design Tokens;
- respeitar o Design System;
- respeitar permissões do utilizador;
- não depender da interface como fronteira de segurança;
- apresentar somente funcionalidades realmente implementadas;
- não apresentar dados simulados como reais;
- possuir Loading, Empty, Error e Success Feedback quando aplicáveis;
- funcionar corretamente em Desktop, Tablet e Mobile;
- atender WCAG 2.2 AA;
- manter consistência com os demais módulos do CRM;
- permanecer alinhada ao MVP v3.0.