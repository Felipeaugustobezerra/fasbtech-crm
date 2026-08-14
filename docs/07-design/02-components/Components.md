# Components

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

Este documento define os componentes oficiais da interface do FASBtech CRM.

Todos os módulos deverão reutilizar estes componentes sempre que aplicável.

Nenhum componente novo deverá ser criado sem necessidade real.

O objetivo é garantir:

- consistência;
- reutilização;
- acessibilidade;
- responsividade;
- performance;
- manutenção previsível;
- coerência entre os módulos do MVP v3.0.

---

# Fonte da Verdade

A estrutura da interface é definida por:

```text
Layout

↓

Components

↓

Features

↓

Pages
```

Este documento define como os componentes funcionam.

Ele não poderá alterar a estrutura definida em:

```text
Layout
```

Os valores visuais utilizados pelos componentes deverão vir exclusivamente de:

```text
Design Tokens
Color Palette
Typography
Spacing
Icons
Animations
```

As regras funcionais permanecem definidas em:

```text
PRD v3.0
Functional Requirements v3.0
Business Rules v3.0
User Stories v3.0
```

---

# Filosofia

Os componentes deverão ser:

- simples;
- reutilizáveis;
- acessíveis;
- responsivos;
- performáticos;
- consistentes;
- componíveis.

Sempre preferir composição em vez de duplicação.

Também evitar abstrações prematuras quando ainda não existir necessidade real de reutilização.

---

# Biblioteca Base

Utilizar:

- shadcn/ui;
- Radix UI;
- Tailwind CSS;
- Lucide React.

Evitar criar componentes do zero quando existir um componente oficial adequado.

---

# Organização

A estrutura recomendada é:

```text
components/
│
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   └── ...
│
├── layout/
│   ├── app-shell.tsx
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── page-header.tsx
│   └── container.tsx
│
├── dashboard/
│   ├── metric-card.tsx
│   ├── demand-summary.tsx
│   ├── operational-alert.tsx
│   ├── deadline-list.tsx
│   └── recent-activity.tsx
│
├── clients/
│   ├── client-form.tsx
│   ├── client-table.tsx
│   ├── client-card.tsx
│   ├── client-filters.tsx
│   ├── client-search.tsx
│   └── client-access-list.tsx
│
├── access/
│   ├── member-list.tsx
│   ├── role-badge.tsx
│   ├── client-assignment-list.tsx
│   └── access-form.tsx
│
├── demands/
│
├── finance/
│
├── contracts/
│
├── shared/
│
└── index.ts
```

Não criar diretórios vazios apenas para antecipar Sprints futuras.

---

# Categorias

Os componentes são divididos em três categorias principais.

## UI Components

Componentes genéricos e reutilizáveis.

Exemplos:

- Button;
- Input;
- Textarea;
- Select;
- Checkbox;
- Switch;
- Dialog;
- Sheet;
- Badge;
- Card;
- Tabs;
- Tooltip;
- Dropdown;
- Table;
- Pagination;
- Skeleton;
- Toast;
- Alert;
- Separator;
- Avatar;
- Breadcrumb;
- Scroll Area.

---

## Feature Components

Componentes específicos de domínio.

Exemplos:

```text
ClientForm
ClientTable
ClientFilters
ClientAccessList
MemberList
RoleBadge
DemandForm
DemandStatusBadge
DemandPriorityBadge
FinancialEntryForm
ContractForm
ContractStatusBadge
```

Feature Components deverão reutilizar UI Components.

---

## Layout Components

Responsáveis exclusivamente pela estrutura da aplicação.

Componentes oficiais:

```text
AppShell
Sidebar
Header
PageHeader
Container
Section
```

A estrutura deverá seguir obrigatoriamente:

```text
Layout
```

---

# AppShell

Responsável por compor a estrutura autenticada da aplicação.

Conceitualmente:

```text
Sidebar

+

Header

+

Main
    ├── Page Header
    ├── Toolbar quando aplicável
    └── Content
```

O AppShell não deverá conter regras de negócio.

---

# Sidebar

A estrutura oficial deverá suportar:

```text
Logo

↓

Navegação Principal

↓

Navegação Secundária quando existir

↓

Contexto do Utilizador
```

A navegação principal do MVP será:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

A Sidebar nunca deverá conter:

- tabelas;
- formulários;
- dashboards;
- métricas extensas;
- regras de autorização.

---

# Sidebar e Permissões

A Sidebar poderá ocultar ou adaptar itens conforme as permissões do utilizador.

Porém:

```text
item oculto
≠
segurança
```

A autorização real deverá permanecer no backend e banco.

---

# Comportamento da Sidebar

```text
Desktop → expandida / recolhível
Tablet  → recolhível
Mobile  → Drawer
```

Utilizar exclusivamente os Design Tokens correspondentes.

---

# Header

O Header global deverá seguir o contrato definido no Layout.

Pode conter:

- botão de menu no Mobile;
- contexto do utilizador;
- notificações quando implementadas;
- perfil;
- logout;
- ações verdadeiramente globais.

---

# Header não deve conter

- Breadcrumb;
- título da página;
- descrição da página;
- dados operacionais específicos.

Esses elementos pertencem ao:

```text
PageHeader
```

---

# PageHeader

Responsável por:

- Breadcrumb quando necessário;
- título;
- descrição;
- ação principal;
- ações secundárias quando aplicáveis.

Exemplo:

```text
Clientes

Gerencie os Clientes da FASBtech.

[Novo Cliente]
```

Outro exemplo:

```text
Demandas

Acompanhe trabalhos, responsáveis e prazos.

[Nova Demanda]
```

---

# Breadcrumb

Breadcrumb deverá ser utilizado apenas quando houver hierarquia real.

Exemplo:

```text
Clientes
    ↓
Empresa ABC
    ↓
Editar
```

Não criar Breadcrumb redundante apenas para preencher espaço.

---

# Button

## Variantes

Variantes oficiais devem seguir o Design System.

Podem incluir:

- Primary;
- Secondary;
- Outline;
- Ghost;
- Danger;
- Success;
- Link.

A nomenclatura concreta deverá permanecer consistente com os componentes base adotados.

---

## Estados

Todo Button deverá suportar, quando aplicável:

- Default;
- Hover;
- Active;
- Focus;
- Disabled;
- Loading.

---

## Tokens

Utilizar:

```text
button.*
```

e tokens oficiais de:

- Color;
- Radius;
- Focus;
- Motion.

---

## Ícones

Utilizar:

```text
Lucide React
```

Quando houver ícone com texto:

- ícone à esquerda por padrão;
- ícone à direita quando semanticamente apropriado.

---

# Input

Todo Input deverá possuir suporte para:

- Label;
- Placeholder;
- Helper Text;
- Error Message;
- Disabled;
- Focus;
- Required.

Utilizar os tokens:

```text
input.*
```

---

# Textarea

Segue o mesmo contrato do Input.

Deverá permitir crescimento quando apropriado.

---

# Select

Utilizar o componente oficial baseado em:

```text
shadcn/ui
+
Radix UI
```

Nunca criar Select customizado sem necessidade comprovada.

---

# Checkbox

Utilizar componente acessível baseado em Radix UI.

Deverá possuir:

- Label;
- Focus visível;
- estado Disabled;
- navegação por teclado.

---

# Switch

Utilizar Radix UI quando aplicável.

Sempre possuir Label acessível.

---

# Badge

Utilizado para representar informações compactas como:

- Status;
- Prioridade;
- Role;
- Categoria;
- Tipo;
- Tags quando apropriado.

Nunca utilizar cores arbitrárias.

---

# RoleBadge

Componente oficial para representar:

```text
OWNER
ADMIN
MEMBER
```

A aparência deverá usar os tokens de Status/Badge existentes.

Não utilizar HEX diretamente.

---

# DemandStatusBadge

Componente oficial para os Status de Demandas.

Status válidos:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

O componente deverá receber apenas valores oficiais do domínio.

Tags não deverão ser representadas como Status.

---

# DemandPriorityBadge

Componente oficial para prioridade de Demandas.

Valores:

```text
LOW
MEDIUM
HIGH
URGENT
```

Prioridade deverá ser visualmente distinta do Status.

---

# ContractStatusBadge

Quando o módulo Contratos for implementado, deverá representar:

```text
DRAFT
GENERATED
SENT
SIGNED
CANCELED
```

---

# Financial Status Badge

Não congelar ainda um componente com enum fechado de Status financeiro.

O domínio exato de Status financeiro ainda não foi formalmente definido.

Quando definido, o componente deverá seguir a fonte oficial correspondente.

---

# Card

Todo Card deverá utilizar:

```text
card.padding
card.radius
card.shadow
card.border
```

Pode possuir:

- Header;
- Título;
- Descrição;
- Conteúdo;
- Footer;
- Hover opcional.

---

# Uso de Card

Cards deverão agrupar informação real.

Evitar transformar cada elemento da interface em Card sem necessidade.

---

# DataTable

Todas as tabelas operacionais deverão reutilizar o padrão oficial.

A implementação deverá seguir:

```text
DataTable Guidelines
```

A DataTable deverá suportar, quando aplicável:

- Pesquisa;
- Filtros;
- Ordenação;
- Paginação;
- Loading;
- Empty State;
- Error State;
- Hover;
- Seleção;
- Responsividade.

---

# Table

A tabela base representa apenas estrutura visual e semântica.

Funcionalidades como:

- pesquisa;
- filtros;
- paginação;
- ordenação;

pertencem à camada DataTable e à arquitetura de leitura correspondente.

---

# Pagination

Padrão inicial:

```text
20 registros por página
```

quando outro requisito não definir valor diferente.

Deverá suportar:

- página anterior;
- próxima página;
- página atual;
- estado Disabled;
- tamanho da página quando realmente necessário.

---

# Search

Componente visual reutilizável.

Deverá suportar:

- Placeholder;
- ícone;
- limpar pesquisa;
- Disabled;
- Focus.

A lógica de pesquisa deverá ocorrer no banco conforme Module Architecture.

---

# Filters

Todos os módulos deverão reutilizar uma estrutura visual consistente de filtros.

Pode utilizar:

- Select;
- Date Picker;
- Checkbox;
- Input;
- Sheet no Mobile.

Os filtros concretos dependem do domínio.

---

# Sorting

Componentes de ordenação deverão apenas controlar a intenção da interface.

A ordenação real deverá ser aplicada na Query correspondente.

---

# Dialog

Utilizar:

```text
shadcn/ui
+
Radix UI
```

Deverá respeitar os Design Tokens oficiais de Modal.

---

# ConfirmDialog

Operações sensíveis deverão solicitar confirmação quando aplicável.

Exemplos:

- arquivar Cliente;
- arquivar Demanda;
- remover acesso de utilizador;
- cancelar Contrato.

O texto deverá explicar claramente a consequência da ação.

---

# Sheet

Utilizar para:

- menu Mobile;
- filtros;
- informações contextuais;
- ações rápidas;
- formulários curtos.

Nunca utilizar Sheet para substituir indiscriminadamente uma página completa.

---

# Toast

Tipos poderão incluir:

- Success;
- Warning;
- Error;
- Info.

Utilizar para feedback transitório de operações.

---

# Alert

Utilizado para:

- avisos persistentes;
- problemas críticos;
- mensagens importantes;
- alertas operacionais.

Não utilizar Alert quando um Toast simples for suficiente.

---

# Loading

Skeleton será o padrão preferencial quando representar bem a estrutura final.

Não existe proibição absoluta de Spinner.

Spinner poderá ser utilizado em:

- Button Loading;
- pequenas ações locais;
- operações onde Skeleton não faça sentido.

Evitar Spinner como única representação para carregamento estrutural de páginas completas.

---

# Skeletons

Componentes reutilizáveis poderão incluir:

```text
SkeletonCard
SkeletonTable
SkeletonForm
SkeletonDashboard
```

Criar somente os que forem realmente reutilizados.

O Skeleton deverá aproximar-se da estrutura final para reduzir Layout Shift.

---

# Empty State

Toda coleção sem registros deverá possuir Empty State adequado.

Estrutura:

- ícone opcional;
- título;
- descrição;
- CTA quando aplicável.

Exemplo:

```text
Ainda não existem Clientes cadastrados.

[Novo Cliente]
```

---

# Error State

Telas ou seções assíncronas deverão possuir Error State quando aplicável.

Estrutura mínima:

- título;
- descrição;
- ação para tentar novamente quando fizer sentido.

---

# Success Feedback

Operações bem-sucedidas poderão utilizar:

- Toast;
- mensagem inline;
- atualização visual;
- redirecionamento com feedback.

Não duplicar feedback sem necessidade.

---

# Toolbar

Componente opcional utilizado principalmente em listagens.

Pode conter:

- Search;
- Filters;
- Sorting;
- Export quando implementado;
- ações em lote quando implementadas;
- controles contextuais.

Sua posição é definida pelo Layout.

---

# Form

Os formulários interativos deverão utilizar:

```text
React Hook Form

+

Zod
```

com validação server-side adicional.

Fluxo:

```text
Form

↓

Zod

↓

Server Action

↓

Service
```

Form Components não implementam regras de negócio.

---

# FormField

Todo campo deverá possuir, quando aplicável:

- Label;
- Control;
- Description;
- Error Message;
- estado Required;
- estado Disabled.

---

# Client Components

## ClientForm

Responsável pela interface de criação e edição de Cliente.

Não deverá:

- resolver Organization;
- determinar autorização;
- persistir diretamente no Supabase;
- decidir regras de negócio.

---

## ClientTable

Responsável pela apresentação da coleção de Clientes.

Deverá reutilizar DataTable.

---

## ClientSearch

Responsável apenas pela interação visual de pesquisa.

A Query real permanece no servidor.

---

## ClientFilters

Responsável pelos filtros disponíveis no domínio de Cliente.

Não criar filtros para campos inexistentes.

---

## ClientAccessList

Responsável por apresentar utilizadores associados a determinado Cliente.

Não deverá decidir autorização.

Recebe dados já autorizados pela camada correspondente.

---

# Access Components

## MemberList

Responsável por apresentar utilizadores internos disponíveis no contexto autorizado.

Pode exibir:

- nome;
- role;
- estado;
- informações operacionais necessárias.

Não deverá expor dados não autorizados.

---

## RoleBadge

Representa visualmente:

```text
OWNER
ADMIN
MEMBER
```

---

## ClientAssignmentList

Responsável por apresentar:

```text
Utilizador
↕
Clientes associados
```

ou:

```text
Cliente
↕
Utilizadores associados
```

conforme a tela.

---

## AccessForm

Responsável por operações de interface relacionadas à associação de utilizadores a Clientes.

A autorização real pertence ao backend.

---

# Demand Components

Os componentes de Demandas serão introduzidos na Sprint 03.

Podem incluir, conforme necessidade:

```text
DemandForm
DemandTable
DemandFilters
DemandStatusBadge
DemandPriorityBadge
DemandAssigneeList
DemandTagList
DeadlineIndicator
```

Não criar antes da Sprint correspondente sem necessidade real.

---

# DeadlineIndicator

Quando Demandas forem implementadas, poderá representar visualmente:

- prazo normal;
- próximo do prazo;
- atrasado.

O cálculo funcional deverá vir dos dados oficiais do domínio.

O componente não deverá inventar regras próprias de atraso.

---

# Finance Components

Serão introduzidos na Sprint 04.

Podem incluir:

```text
FinancialEntryForm
FinancialEntryTable
FinancialSummary
FinancialGoalProgress
FinancialDocumentList
```

Não congelar componentes baseados em Status financeiro ainda não definido.

---

# FinancialSummary

Poderá apresentar:

```text
Entradas do mês
Saídas do mês
Saldo em caixa
```

Os valores deverão ser recebidos de Queries oficiais.

O componente não calcula nem persiste saldo manualmente.

---

# FinancialGoalProgress

Representa visualmente o progresso da meta mensal.

Recebe dados calculados pela camada oficial de leitura.

---

# Contract Components

Serão introduzidos na Sprint 05.

Podem incluir:

```text
ContractForm
ContractTemplateSelect
ContractReview
ContractStatusBadge
ContractDocument
SignedContractUpload
```

---

# ContractReview

Responsável por apresentar os dados antes da geração final do Contrato.

Não deverá alterar o snapshot após o Contrato ter sido oficialmente gerado.

---

# Dashboard Components

O Dashboard consolidado será implementado na Sprint 06.

Os componentes deverão refletir o modelo atual do produto.

Componentes conceituais:

```text
MetricCard
FinancialSummary
DemandSummary
OperationalAlert
DeadlineList
RecentActivity
DashboardChart quando necessário
```

---

# MetricCard

Representa um indicador resumido.

Pode conter:

- título;
- valor;
- ícone;
- informação auxiliar;
- tendência quando existir fonte real.

Não exigir variação percentual se não houver dado confiável para comparação.

---

# FinancialSummary

No Dashboard poderá apresentar:

```text
Saldo em caixa
Entradas do mês
Saídas do mês
Progresso da meta
```

somente para utilizadores autorizados.

---

# DemandSummary

Poderá apresentar:

```text
Demandas abertas
Demandas em andamento
Demandas atrasadas
Demandas próximas do prazo
Demandas concluídas
```

---

# OperationalAlert

Responsável por alertas operacionais reais.

Exemplos:

- Demanda atrasada;
- prazo próximo;
- situação que exige ação.

Não criar alertas fictícios apenas para preencher Dashboard.

---

# DeadlineList

Responsável por exibir prazos relevantes.

Pode apresentar:

- Demanda;
- Cliente;
- prazo;
- responsável;
- estado temporal.

Não substitui a página completa de Demandas.

---

# RecentActivity

Responsável por apresentar Activity Logs recentes em formato legível.

Não acessa diretamente:

```text
activity_logs
```

Recebe dados pela camada de leitura oficial.

Deverá respeitar as permissões do utilizador.

---

# DashboardChart

Gráfico é opcional.

Deverá existir somente quando:

- possuir dados reais;
- melhorar entendimento;
- responder pergunta relevante.

Não criar gráfico decorativo.

---

# Componentes Removidos do MVP Atual

Não fazem parte da biblioteca ativa:

```text
LeadForm
LeadTable
LeadCard
LeadFilters
LeadStatusBadge
PipelineCard
UpcomingContacts
```

Esses componentes pertenciam ao modelo anterior de Leads.

Não deverão ser mantidos como componentes oficiais do MVP v3.0.

---

# Breadcrumb

Utilizado dentro do PageHeader quando houver hierarquia real.

Nunca utilizar Breadcrumb no Header global.

---

# Avatar

Utilizar os tokens:

```text
avatar.*
```

Deverá possuir fallback textual quando nenhuma imagem estiver disponível.

---

# Tooltip

Utilizar Radix UI.

Recomendado quando um ícone isolado não possuir significado evidente.

Tooltip não substitui Label acessível em controles que necessitam de nome acessível.

---

# Dropdown

Utilizar:

```text
Radix UI
/
shadcn/ui
```

Deverá ser navegável por teclado.

---

# Tabs

Utilizar para organizar conteúdo relacionado dentro da mesma entidade ou contexto.

Exemplo futuro em Cliente:

```text
Visão Geral
Demandas
Contratos
Financeiro
Documentos
Acessos
Atividades
```

Exibir apenas as Tabs realmente disponíveis e autorizadas.

Não utilizar Tabs para substituir a navegação principal entre módulos.

---

# Ícones

Biblioteca oficial:

```text
Lucide React
```

Não utilizar múltiplas bibliotecas sem necessidade arquitetural.

Os tamanhos deverão utilizar tokens:

```text
icon.*
```

---

# Estados

Todo componente interativo deverá possuir, quando aplicável:

- Default;
- Hover;
- Focus;
- Active;
- Disabled;
- Loading;
- Error;
- Success.

Nem todos os componentes precisam de todos os estados.

---

# Motion

Toda transição deverá utilizar:

```text
motion.*
ease.*
transition.*
```

conforme os tokens oficiais.

Evitar durações arbitrárias quando houver token correspondente.

---

# Responsividade

Todo componente deverá funcionar em:

- Desktop;
- Tablet;
- Mobile.

Nenhum componente poderá depender exclusivamente de mouse.

---

# Acessibilidade

Todos os componentes deverão seguir:

```text
WCAG 2.2 AA
```

e o documento oficial de Accessibility.

Garantir:

- Labels quando aplicável;
- ARIA quando necessário;
- navegação por teclado;
- Focus visível;
- contraste adequado;
- semântica HTML correta;
- gestão de foco em Dialog e Sheet;
- áreas de toque apropriadas.

Nunca remover `outline` sem aplicar o Focus Ring oficial.

---

# DataTable e Mobile

A adaptação para Mobile deverá preservar:

- contexto;
- labels;
- ações;
- semântica;
- acessibilidade.

A implementação pode usar:

- tabela com scroll;
- Cards;
- listas;

conforme a melhor solução para os dados apresentados.

---

# Performance

Preferir:

- Server Components quando possível;
- Client Components apenas quando necessário;
- Lazy Loading quando aplicável;
- composição;
- componentes leves;
- estado local apenas quando necessário.

Evitar:

- estado duplicado;
- chamadas de rede dentro de componentes puramente visuais;
- hidratação desnecessária;
- abstrações excessivas.

---

# Componentes e Dados

Componentes de apresentação deverão preferencialmente receber dados através de props.

Fluxo:

```text
Server Component / Feature Container

↓

dados autorizados

↓

UI / Feature Component
```

Componentes visuais não deverão acessar Supabase diretamente.

---

# Componentes e Autorização

Um componente poderá adaptar a interface com base em permissões já resolvidas.

Exemplo:

```text
canEdit = true
```

Porém:

```text
canEdit
```

na interface não substitui a autorização real no servidor e no banco.

---

# Componentes de Segurança

Não criar componentes como:

```text
SecureButton
ProtectedCard
AuthorizedTable
```

como substitutos de segurança de backend.

A interface pode refletir permissões.

A segurança pertence às camadas oficiais de autorização.

---

# Regras de Criação

Antes de criar um novo componente verificar:

1. O componente já existe em `ui/`?
2. Existe equivalente em shadcn/ui?
3. Existe equivalente em Radix UI?
4. Pode ser composto usando componentes existentes?
5. Existe necessidade real de reutilização?
6. Pertence à Sprint atual?
7. O domínio correspondente já está implementado?

Somente criar componente novo quando houver necessidade concreta.

---

# Regra de Feature Component

Feature Components deverão permanecer próximos ao domínio que representam.

Exemplo:

```text
ClientForm
```

pertence ao domínio:

```text
clients
```

Evitar mover componentes específicos para:

```text
shared/
```

apenas para aparentar reutilização.

---

# Shared Components

`shared/` deverá conter apenas componentes realmente reutilizados por múltiplos domínios.

Exemplos possíveis:

```text
EntityStatusBadge
DocumentList
ActivityList
SearchField
FilterBar
```

somente quando a reutilização real estiver comprovada.

---

# Não Criar Antecipadamente

Não criar componentes para:

- Leads;
- Projetos;
- Agenda;
- Product Registry;
- Domínios;
- Hospedagens;
- módulos futuros fora do MVP.

Também não criar componentes de Sprints futuras apenas para preparar estrutura.

---

# Regras

Nunca:

- duplicar componentes;
- copiar componentes com pequenas diferenças;
- utilizar cores arbitrárias;
- utilizar valores hardcoded quando houver token;
- implementar regras de negócio;
- acessar banco diretamente;
- substituir autorização de backend;
- alterar a estrutura definida pelo Layout;
- apresentar dados simulados como reais.

Sempre:

- reutilizar quando fizer sentido;
- compor;
- utilizar Design Tokens;
- seguir Accessibility;
- seguir Module Architecture;
- respeitar a Sprint atual;
- manter componentes focados.

---

# Checklist de Novo Componente

Antes de considerar um componente pronto:

- [ ] Possui responsabilidade clara?
- [ ] Já existe equivalente?
- [ ] Realmente precisa ser reutilizável?
- [ ] Está no diretório correto?
- [ ] Usa componentes base oficiais?
- [ ] Usa Design Tokens?
- [ ] Possui estados necessários?
- [ ] É responsivo?
- [ ] É acessível?
- [ ] Não contém regra de negócio?
- [ ] Não acessa Supabase diretamente?
- [ ] Não decide autorização sozinho?
- [ ] Está tipado?
- [ ] Pertence ao escopo atual?

---

# Referências

Este documento deverá permanecer sincronizado com:

- Layout v3.0;
- Design Tokens;
- Color Palette;
- Typography;
- Spacing;
- Icons;
- Animations;
- Accessibility;
- DataTable Guidelines;
- Implementation Guide;
- Module Architecture v3.0;
- Dashboard Guidelines;
- CRM UI Guidelines.

---

# Fonte da Verdade Final

A biblioteca de componentes do MVP deverá evoluir conforme:

```text
Foundation
    │
    ├── UI Components
    └── Layout Components

↓

Clientes & Acessos
    │
    ├── Client Components
    └── Access Components

↓

Demandas
    │
    └── Demand Components

↓

Financeiro
    │
    └── Finance Components

↓

Contratos
    │
    └── Contract Components

↓

Dashboard
    │
    └── Dashboard Components
```

A regra principal é:

```text
Criar somente o que o produto realmente precisa

+

Reutilizar somente quando existir reutilização real
```

---

# Definition of Done

Um componente será considerado concluído quando:

- possuir responsabilidade única;
- ser reutilizável quando houver necessidade real;
- utilizar Design Tokens;
- respeitar o Layout oficial;
- respeitar o Design System;
- utilizar componentes base oficiais quando adequados;
- possuir os estados necessários;
- funcionar em Desktop, Tablet e Mobile;
- atender WCAG 2.2 AA;
- possuir tipagem completa;
- não possuir regras de negócio;
- não acessar diretamente o banco;
- não substituir autorização de backend;
- não duplicar funcionalidades existentes;
- não antecipar módulos futuros;
- permanecer alinhado ao MVP v3.0.