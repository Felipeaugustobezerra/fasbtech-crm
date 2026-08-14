# DataTable Guidelines

## Projeto

FASBtech CRM

---

## Status

🟢 Ativo

---

## Versão

2.0

---

# Objetivo

Este documento define o padrão oficial para todas as DataTables do FASBtech CRM.

Toda listagem operacional deverá reutilizar a mesma estrutura, comportamento e componentes para garantir:

- consistência;
- reutilização;
- acessibilidade;
- performance;
- previsibilidade;
- escalabilidade.

A DataTable representa o principal componente de produtividade do CRM.

---

# Fonte da Verdade

A implementação deverá respeitar obrigatoriamente a seguinte hierarquia:

```text
PRD

↓

Functional Requirements

↓

Layout

↓

Components

↓

DataTable Guidelines

↓

Implementation Guide

↓

Pages
```

Nenhuma DataTable poderá contrariar documentos de prioridade superior.

---

# Filosofia

Uma DataTable não é apenas uma tabela.

Ela representa a principal interface operacional do CRM.

O utilizador deverá conseguir:

- localizar registros;
- pesquisar;
- filtrar;
- ordenar;
- navegar;
- executar ações;

com o menor número possível de interações.

---

# Arquitetura

Toda DataTable deverá seguir a arquitetura oficial.

Fluxo de leitura:

```text
Server Component

↓

Query

↓

Supabase

↓

PostgreSQL

↓

Renderização
```

Nunca acessar o banco diretamente a partir da interface.

Toda leitura deverá utilizar exclusivamente Queries.

---

# Responsabilidades

## Server Component

Responsável por:

- obter parâmetros da URL;
- executar Queries;
- renderizar a DataTable.

---

## Query

Responsável por:

- pesquisa;
- filtros;
- ordenação;
- paginação.

Nunca modifica dados.

---

## DataTable

Responsável apenas pela apresentação.

Nunca implementa regras de negócio.

Nunca acessa o banco.

Nunca realiza autenticação.

---

# Estrutura Oficial

Toda página de listagem deverá seguir exatamente esta estrutura.

```text
Page Header

↓

Toolbar

↓

DataTable

↓

Pagination
```

Esta estrutura é definida por `Layout.md`.

---

# Toolbar

A Toolbar representa a principal área de interação da tabela.

Pode conter:

- Search;
- Filters;
- Sorting;
- Export (futuro);
- Bulk Actions (futuro);
- Botão Principal.

Exemplo:

```text
Pesquisar...

↓

Status

↓

Origem

↓

[Novo Lead]
```

Nem toda página utilizará todos os elementos.

---

# Search

A pesquisa deverá aparecer sempre à esquerda da Toolbar.

Placeholder recomendado:

```text
Pesquisar por nome, empresa ou e-mail...
```

---

## Comportamento

A pesquisa deverá:

- utilizar debounce;
- preservar filtros;
- preservar ordenação;
- preservar paginação quando aplicável.

A pesquisa sempre será executada no banco de dados.

Nunca pesquisar grandes coleções no navegador.

---

# Filters

Os filtros aparecem imediatamente após a pesquisa.

Podem utilizar:

- Select;
- Multi Select;
- Date Range;
- Checkbox;
- Toggle;
- Drawer (Mobile).

---

## Responsabilidade

Os filtros representam parâmetros da Query.

Nunca filtram dados já carregados em memória.

---

# Sorting

Toda coluna ordenável deverá possuir indicador visual.

Estados:

```text
Sem ordenação

↓

Ascendente

↓

Descendente
```

A ordenação deverá ocorrer exclusivamente no banco de dados.

---

# Estrutura das Colunas

Cada módulo define suas colunas.

A DataTable apenas renderiza.

Nunca hardcode colunas dentro do componente.

---

## Ordem

As colunas deverão seguir a importância da informação.

Exemplo:

Lead

↓

Empresa

↓

Status

↓

Próximo Contato

↓

Valor

↓

Ações

---

# Coluna Principal

A primeira coluna representa sempre a entidade principal.

Exemplos:

- Lead;
- Cliente;
- Projeto;
- Produto.

Ela poderá conter:

- avatar;
- nome;
- subtítulo.

---

# Coluna de Status

Sempre utilizar o componente oficial:

```text
StatusBadge
```

Nunca utilizar texto puro.

Nunca utilizar HEX diretamente.

Os Status deverão utilizar exclusivamente os Design Tokens oficiais.

---

# Coluna de Datas

Formato oficial:

```text
dd/MM/yyyy
```

Com horário:

```text
dd/MM/yyyy HH:mm
```

Sempre respeitar:

- timezone do utilizador;
- localização futura da aplicação.

---

# Coluna de Valores

Valores monetários deverão utilizar formatação oficial.

Exemplo:

```text
€ 1.500,00
```

Nunca concatenar strings manualmente.

Utilizar os utilitários oficiais de formatação.

---

# Coluna de Ações

A última coluna deverá ser reservada para ações.

Utilizar:

```text
Dropdown Menu
```

Nunca apresentar diversos botões diretamente na linha.

Exemplos:

- Editar;
- Arquivar;
- Duplicar (futuro);
- Mais opções.

---

# Linhas

Cada linha representa uma única entidade.

A linha poderá ser clicável quando existir página de detalhes.

O clique na linha nunca poderá ser disparado ao clicar:

- Dropdown;
- Checkbox;
- Links;
- Botões.

---

# Hover

Toda linha deverá possuir Hover.

Utilizar exclusivamente os tokens oficiais.

Nunca utilizar cores fortes.

---

# Seleção

No MVP não haverá seleção múltipla.

A arquitetura deverá permanecer preparada para futura implementação de:

- seleção em lote;
- ações em lote.

# Pagination

A Paginação deverá aparecer sempre abaixo da DataTable.

Sua função é limitar a quantidade de registros carregados por consulta e facilitar a navegação.

---

## Informações Obrigatórias

A paginação deverá apresentar:

- página atual;
- total de páginas;
- total de registros;
- intervalo atualmente exibido;
- quantidade de registros por página.

Exemplo:

```text
1–20 de 134 registros
```

---

## Quantidade por Página

Valores oficiais:

- 10
- 20
- 50
- 100

Valor padrão:

```text
20
```

---

## Navegação

A Paginação deverá permitir:

- primeira página;
- página anterior;
- próxima página;
- última página.

Os botões deverão respeitar corretamente os estados Disabled.

---

# URL State

O estado da DataTable deverá ser refletido na URL.

Exemplos:

```text
/leads?page=2

/leads?search=felipe

/leads?status=NEW

/leads?origin=INDICATION

/leads?sort=name

/leads?direction=asc
```

---

## Objetivos

A sincronização da URL permite:

- compartilhar links;
- manter estado após atualização da página;
- navegação pelo histórico do navegador;
- integração com Server Components.

---

# Estados

Toda DataTable deverá implementar os seguintes estados.

---

## Loading

Enquanto os dados estiverem sendo carregados, utilizar Skeletons.

Componentes previstos:

- SkeletonTable;
- SkeletonRow;
- SkeletonToolbar.

Nunca apresentar uma tabela vazia durante o carregamento.

Nunca utilizar Spinner para substituir toda a tabela.

---

## Empty State

Quando não existirem registros.

Estrutura obrigatória:

- Ícone;
- Título;
- Descrição;
- CTA principal.

Exemplo:

```text
Ainda não existem Leads cadastrados.

[Novo Lead]
```

---

## Error State

Quando ocorrer falha durante a leitura.

Estrutura mínima:

- título;
- descrição;
- botão "Tentar novamente".

Nunca apresentar mensagens técnicas ao utilizador.

---

## Success

Representa o funcionamento normal da DataTable.

Todos os recursos deverão permanecer disponíveis:

- pesquisa;
- filtros;
- ordenação;
- paginação;
- ações.

---

# Mobile Cards

Em dispositivos móveis a DataTable poderá ser apresentada como Cards.

Cada Card representa semanticamente uma linha da tabela.

---

## Estrutura Recomendada

Cada Card deverá apresentar:

- entidade principal;
- informações secundárias;
- Status Badge;
- informação prioritária;
- menu de ações.

Exemplo:

```text
João Silva

Empresa XPTO

Status

Próximo Contato

⋮
```

---

## Navegação

Os Cards deverão oferecer a mesma funcionalidade disponível na tabela Desktop.

Nenhuma funcionalidade poderá ser perdida na versão Mobile.

---

# Responsividade

## Desktop

- tabela completa;
- todas as colunas principais;
- Toolbar completa.

---

## Tablet

- ocultação opcional de colunas secundárias;
- scroll horizontal quando necessário;
- Toolbar reorganizada.

---

## Mobile

- apresentação em Cards;
- Drawer para filtros;
- ações agrupadas;
- foco na leitura.

---

# Performance

Toda DataTable deverá priorizar performance.

---

## Leitura

Nunca carregar todos os registros.

Utilizar:

- paginação no banco;
- filtros no banco;
- pesquisa no banco;
- ordenação no banco.

---

## Renderização

Sempre que possível:

- utilizar Server Components;
- evitar re-renderizações;
- reutilizar Queries;
- evitar consultas duplicadas.

---

# Segurança

Toda consulta deverá respeitar:

```text
Autenticação

↓

RLS

↓

Policies

↓

Organization Isolation
```

A DataTable nunca receberá `organization_id` pela interface.

Toda leitura deverá ocorrer através da camada oficial de Queries.

---

# Acessibilidade

Toda DataTable deverá cumprir WCAG 2.2 AA.

Obrigatório:

- `<caption>`;
- `<thead>`;
- `<tbody>`;
- `<th scope="col">`;
- navegação completa por teclado;
- foco visível;
- contraste adequado;
- leitores de tela;
- semântica HTML correta.

Nunca remover o Focus Ring oficial.

---

# Design Tokens

Toda implementação deverá utilizar exclusivamente:

- Design Tokens;
- Color Palette;
- Typography;
- Spacing;
- Motion;
- Icons.

Nunca utilizar:

- HEX diretamente;
- pixels arbitrários;
- sombras arbitrárias;
- animações personalizadas.

---

# Componentes Oficiais

A DataTable deverá reutilizar exclusivamente:

- Table;
- Search;
- Filters;
- Pagination;
- StatusBadge;
- DropdownMenu;
- Button;
- Skeleton;
- EmptyState;
- ErrorState.

Todos definidos em:

```text
Components.md
```

---

# Regras

Nunca:

- acessar o banco diretamente;
- implementar regras de negócio;
- duplicar DataTables;
- utilizar filtros locais para grandes volumes;
- utilizar valores hardcoded;
- ignorar estados de Loading ou Error.

Sempre:

- reutilizar componentes;
- utilizar Queries;
- utilizar Design Tokens;
- respeitar Layout.md;
- respeitar Module Architecture;
- sincronizar estado na URL.

---

# Referências

Este documento deverá permanecer sincronizado com:

- Layout
- Components
- Dashboard Guidelines
- Design Tokens
- Color Palette
- Module Architecture
- Functional Requirements
- Implementation Guide

---

# Definition of Done

Uma DataTable será considerada concluída quando:

- seguir a estrutura oficial definida neste documento;
- reutilizar exclusivamente os componentes oficiais;
- utilizar Design Tokens;
- utilizar Queries para leitura;
- não acessar diretamente o banco de dados;
- suportar pesquisa, filtros, ordenação e paginação;
- sincronizar seu estado com a URL;
- possuir estados de Loading, Empty, Error e Success;
- funcionar corretamente em Desktop, Tablet e Mobile;
- cumprir WCAG 2.2 AA;
- respeitar a arquitetura oficial do FASBtech CRM.