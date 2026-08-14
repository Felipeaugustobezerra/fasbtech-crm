# Module Architecture

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟢 Ativo

---

# Objetivo

Este documento define a arquitetura oficial utilizada por todos os módulos do FASBtech CRM.

Seu objetivo é garantir:

- consistência;
- escalabilidade;
- reutilização;
- previsibilidade;
- segurança;
- facilidade de manutenção;
- separação clara de responsabilidades.

Nenhum módulo deverá ser implementado fora deste padrão sem uma decisão arquitetural formal aprovada.

As decisões de persistência transacional seguem:

```text
ADR-002 — Estratégia de Persistência e Transações
```

---

# Fonte da Verdade

Este documento implementa tecnicamente a direção definida por:

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

System Architecture v3.0
```

Quando houver conflito:

- produto define o comportamento;
- arquitetura define a organização técnica;
- ADRs definem decisões arquiteturais específicas.

---

# Princípios

A arquitetura segue o princípio de separação de responsabilidades.

Cada camada possui responsabilidade específica.

Nenhuma camada deverá assumir responsabilidades pertencentes a outra.

Princípios obrigatórios:

- Server-first;
- regras de negócio fora da interface;
- autorização no backend e banco;
- frontend considerado não confiável para autorização;
- Queries somente para leitura;
- Mutations somente para escritas simples;
- RPCs para operações transacionais quando exigidas;
- Services como camada de coordenação de negócio;
- RLS como proteção para acesso direto às tabelas;
- autorização por Cliente quando aplicável;
- Activity Logs atômicos quando exigidos;
- modularidade;
- baixo acoplamento.

---

# Arquitetura Geral

A arquitetura dos módulos deverá seguir três fluxos principais:

```text
Leitura

Escrita Simples

Escrita Transacional
```

---

# Fluxo de Leitura

O fluxo padrão de leitura será:

```text
Server Component

↓

Service quando houver regra ou coordenação necessária

↓

Query

↓

Supabase

↓

RLS + Policies

↓

PostgreSQL

↓

Resultado autorizado

↓

Renderização
```

Uma Server Action não deverá ser utilizada apenas para executar leitura quando não houver necessidade arquitetural.

---

# Fluxo de Escrita Simples

Operações de escrita simples poderão utilizar Mutation quando:

- modificarem uma operação simples;
- não exigirem múltiplas alterações atômicas;
- não exigirem Activity Log na mesma transação;
- forem permitidas pela arquitetura e pelas Policies.

Fluxo:

```text
Client Component

↓

React Hook Form

↓

Zod

↓

Server Action

↓

Service

↓

Mutation

↓

Supabase

↓

RLS + Policies

↓

PostgreSQL

↓

Resposta

↓

Feedback
```

---

# Fluxo de Escrita Transacional

Operações que exigirem:

- múltiplas alterações;
- Activity Log atômico;
- autorização privilegiada controlada;
- commit ou rollback conjunto;

deverão utilizar RPC.

Fluxo:

```text
Client Component

↓

React Hook Form

↓

Zod

↓

Server Action

↓

Service

↓

RPC PostgreSQL

↓

Validação interna de autorização

↓

BEGIN

↓

Operação Principal

+

Activity Log

↓

COMMIT
```

Em caso de erro:

```text
ROLLBACK
```

Toda RPC transacional deverá seguir a ADR-002 e as regras de segurança definidas no documento de RLS.

---

# Estrutura Modular

Cada domínio deverá seguir a mesma organização conceitual.

Exemplo utilizando o módulo de Clientes:

```text
app/
└── (private)/
    └── clientes/
        ├── page.tsx
        ├── novo/
        │   └── page.tsx
        ├── [id]/
        │   ├── page.tsx
        │   └── editar/
        │       └── page.tsx
        └── actions.ts
```

---

# Components

```text
components/
└── clients/
    ├── client-form.tsx
    ├── client-table.tsx
    ├── client-card.tsx
    ├── client-filters.tsx
    ├── client-search.tsx
    ├── client-access-list.tsx
    └── index.ts
```

Os nomes físicos poderão seguir as convenções oficiais do projeto.

O objetivo deste documento é definir responsabilidades, não obrigar nomes exatos quando outro documento oficial de estrutura possuir convenção específica.

---

# Services

```text
services/
└── client.service.ts
```

Cada domínio deverá possuir Services apenas quando existirem regras ou coordenação de negócio correspondentes.

---

# Persistência do Módulo

```text
lib/
└── clients/
    ├── queries.ts
    ├── mutations.ts
    ├── rpc.ts
    └── mapper.ts
```

Arquivos que não forem necessários não deverão ser criados apenas para preencher uma estrutura.

Exemplo:

Se um módulo não possuir nenhuma Mutation simples:

```text
mutations.ts
```

não precisa existir.

---

# Schemas

```text
schemas/
└── client.ts
```

---

# Types

```text
types/
└── client.ts
```

---

# Responsabilidades

# Pages

Pages serão preferencialmente Server Components.

Responsáveis por:

- compor a página;
- solicitar dados;
- preparar dados necessários à renderização;
- renderizar componentes;
- aplicar estrutura de Layout.

Não devem:

- conter regras de negócio;
- executar persistência diretamente;
- acessar Supabase diretamente quando existir camada Query;
- decidir autorização de forma isolada.

---

# Server Components

Server Components devem ser utilizados sempre que a interatividade do navegador não for necessária.

Responsáveis por:

- leitura server-side;
- composição de telas;
- carregamento de dados;
- renderização inicial;
- redução de JavaScript enviado ao cliente.

---

# Client Components

Responsáveis pela interação do utilizador.

Exemplos:

- formulários;
- campos interativos;
- filtros;
- dialogs;
- drawers;
- menus;
- ações de interface;
- componentes que dependam de estado do navegador.

Nunca deverão:

- acessar diretamente o banco;
- possuir credenciais privilegiadas;
- determinar autorização;
- implementar regras de negócio;
- confiar em permissões calculadas exclusivamente no cliente.

---

# Schemas

Responsáveis pela validação utilizando Zod.

Exemplos:

```text
createClientSchema

updateClientSchema

assignClientUserSchema
```

Schemas validam:

- formato;
- tipo;
- campos obrigatórios;
- limites de entrada.

Schemas não substituem regras de negócio.

---

# Types

Responsáveis pelos tipos TypeScript utilizados pela aplicação.

Exemplos:

```text
Client

ClientListItem

ClientFormInput

ClientAssignment
```

Types não possuem lógica de negócio.

---

# Server Actions

Responsáveis por servir como entrada server-side para operações iniciadas pela interface.

Responsabilidades:

- validar sessão;
- validar input;
- utilizar Schema Zod;
- chamar Service;
- tratar retorno;
- converter erros internos em resposta segura;
- executar revalidação ou redirecionamento quando necessário.

Server Actions não deverão:

- conter regras de negócio complexas;
- acessar diretamente tabelas;
- implementar autorização apenas por código de interface;
- confiar em `organization_id`, role ou permissões enviadas pelo cliente.

---

# Services

Services são responsáveis por coordenar regras de negócio.

Exemplos:

```text
createClient()

updateClient()

archiveClient()

assignUserToClient()

removeUserFromClient()
```

Responsabilidades:

- aplicar Business Rules;
- coordenar autorização lógica;
- coordenar operações;
- decidir qual mecanismo de persistência utilizar;
- chamar Queries;
- chamar Mutations;
- chamar RPCs;
- evitar duplicação de regra entre Server Actions.

Services nunca deverão acessar Supabase diretamente quando existir a camada correspondente de persistência.

---

# Queries

Queries são responsáveis exclusivamente por leitura.

Exemplos:

```text
getClient()

listClients()

searchClients()

listClientUsers()

listUserClients()
```

Queries:

- executam SELECT;
- não modificam dados;
- não registram Activity Logs;
- não implementam regras de negócio;
- devem respeitar RLS e autorização aplicável.

---

# Queries e Autorização por Cliente

Queries relacionadas a dados restritos deverão retornar somente registros autorizados.

Exemplo:

```text
MEMBER
    │
    ▼
listClients()
    │
    ▼
somente Clientes associados
```

Uma Query não deverá retornar todos os Clientes para depois filtrar no frontend.

---

# Mutations

Mutations são responsáveis por escritas simples.

Exemplos conceituais:

```text
updateSimplePreference()

updateNonAuditedSetting()
```

Mutations:

- executam uma escrita simples;
- não abrem transações;
- não criam Activity Logs;
- não implementam regras de negócio;
- permanecem protegidas por RLS e Policies.

Uma Mutation não deverá ser utilizada quando a operação exigir Activity Log atômico.

---

# RPCs

RPCs são responsáveis por operações transacionais quando exigidas pela arquitetura.

Devem ser utilizadas quando houver necessidade de:

- múltiplas escritas atômicas;
- Activity Log na mesma transação;
- autorização privilegiada controlada;
- criação ou alteração de relações que precisem de commit conjunto;
- rollback completo em caso de erro.

Exemplos conceituais para Sprint 02:

```text
createClient()

updateClient()

archiveClient()

assignUserToClient()

removeUserFromClient()
```

A necessidade concreta de RPC para cada operação deverá ser determinada pelo contrato de persistência e auditoria.

Não criar RPC apenas porque uma operação possui um nome de Service correspondente.

Toda RPC privilegiada deverá seguir:

```text
ADR-002

+

RLS
```

---

# Mapper

Mapper é responsável por transformar dados entre:

- banco;
- DTOs;
- tipos da aplicação.

Exemplo:

```text
Database Row

↓

Mapper

↓

Client
```

Mapper não implementa regras de negócio.

Mapper não decide autorização.

---

# Activity Logs

Toda operação definida como auditável deverá gerar Activity Log.

Quando uma operação exigir atomicidade entre:

```text
Alteração principal

+

Activity Log
```

ambas deverão ocorrer dentro da mesma RPC transacional.

Não é permitido:

```text
Mutation

↓

Commit

↓

Outra chamada

↓

Activity Log
```

para operações que exigem atomicidade.

---

# Autenticação

Autenticação responde:

```text
Quem é o utilizador?
```

A identidade autenticada deverá ser validada no servidor.

---

# Autorização

Autorização responde:

```text
O que esse utilizador pode fazer?
```

A autorização poderá considerar:

- Profile;
- Membership;
- Organization;
- role;
- Cliente associado;
- entidade relacionada;
- estado da entidade;
- regras específicas do módulo.

---

# Segurança

Toda operação protegida deverá:

- validar autenticação;
- validar Membership;
- resolver Organization de forma confiável;
- respeitar RLS;
- respeitar Policies;
- validar role quando aplicável;
- validar autorização por Cliente quando aplicável.

Nenhuma informação enviada pelo cliente poderá ser considerada prova de autorização.

---

# Organization

Nunca confiar em:

```text
organization_id
```

enviado pela interface.

A Organization deverá ser obtida ou validada conforme o contexto autenticado.

---

# Identificadores de Recursos

Campos como:

```text
client_id
demand_id
contract_id
financial_entry_id
```

podem ser enviados para identificar o recurso solicitado.

Porém:

```text
ID do recurso
≠
autorização
```

O sistema deverá validar separadamente se o utilizador possui acesso ao recurso.

---

# Autorização por Cliente

A partir da Sprint 02, Clientes passam a participar diretamente do modelo de autorização.

Exemplo:

```text
MEMBER
    │
    ▼
Client Assignment
    │
    ▼
Cliente autorizado
```

Um MEMBER não associado ao Cliente deverá receber acesso negado.

Essa restrição deverá ser aplicada em:

- Queries;
- Services;
- Server Actions quando aplicável;
- RPCs;
- RLS/Policies;
- Storage relacionado.

---

# Storage

Documentos privados deverão utilizar a infraestrutura central de Storage.

Os módulos não deverão implementar sistemas separados de arquivos.

Fluxo conceitual:

```text
Módulo

↓

Documento

↓

Entidade relacionada

↓

Cliente quando aplicável

↓

Autorização
```

---

# Validação

Toda entrada originada do utilizador deverá seguir:

```text
React Hook Form

↓

Zod no cliente quando aplicável

↓

Server Action

↓

Zod no servidor

↓

Service
```

A validação do cliente existe para experiência do utilizador.

A validação server-side é obrigatória para dados não confiáveis.

---

# Formulários

Formulários deverão utilizar:

```text
React Hook Form

+

Zod
```

quando forem formulários interativos no cliente.

Server Components não deverão ser transformados em Client Components apenas para seguir esse padrão se não houver necessidade de interação.

---

# Paginação

Paginação deverá ocorrer no banco.

Nunca carregar toda a coleção para paginar no navegador.

Padrão inicial:

```text
20 registros por página
```

quando outro documento funcional não definir comportamento diferente.

---

# Pesquisa

Pesquisa deverá ocorrer no banco.

Nunca:

```text
carregar todos os registros

↓

filtrar no navegador
```

como estratégia padrão para entidades persistidas.

A pesquisa deverá respeitar as mesmas regras de autorização da listagem.

---

# Filtros

Filtros deverão ser aplicados na Query correspondente.

Não deverão revelar valores ou registros aos quais o utilizador não possui acesso.

---

# Ordenação

Ordenação deverá ocorrer no banco sempre que aplicada a coleções persistidas.

Apenas campos oficialmente suportados deverão ser utilizados.

---

# DataTable

Módulos que utilizarem DataTable deverão seguir:

```text
DataTable Guidelines
```

A DataTable é responsável pela apresentação e interação.

Ela não deverá implementar:

- Query de negócio;
- autorização;
- regras de persistência.

---

# Componentes

Todos os componentes deverão seguir o Design System.

Priorizar:

- reutilização;
- composição;
- baixo acoplamento;
- APIs consistentes.

Evitar componentes específicos demais quando existir possibilidade real de reutilização.

Também evitar abstrações prematuras para funcionalidades que existem em apenas um caso.

---

# Performance

Priorizar:

- Server Components;
- execução server-side;
- Queries eficientes;
- paginação no banco;
- pesquisa no banco;
- índices adequados;
- Client Components somente quando necessários;
- carregamento progressivo quando aplicável;
- evitar chamadas duplicadas.

---

# Escalabilidade

A arquitetura deverá permitir evolução para:

- novos campos;
- novos filtros;
- novos relacionamentos;
- novos módulos;
- novos roles;
- novas regras de autorização.

Porém, escalabilidade não significa implementar funcionalidades futuras antecipadamente.

---

# Módulos do MVP

A arquitetura modular deverá suportar progressivamente:

```text
Foundation

↓

Clientes & Acessos

↓

Demandas

↓

Financeiro

↓

Contratos

↓

Dashboard
```

---

# Clientes & Acessos

Sprint 02 deverá aplicar esta arquitetura para:

```text
Clients

Client Assignments

Access Management
```

---

# Demandas

Sprint 03 reutilizará o mesmo padrão para:

```text
Demandas

Responsáveis

Tags

Documentos

Notificações
```

---

# Financeiro

Sprint 04 reutilizará o padrão para:

```text
Entradas

Saídas

Metas

Documentos Financeiros
```

---

# Contratos

Sprint 05 reutilizará o padrão para:

```text
Templates

Contratos

Snapshots

Documentos

Envio
```

---

# Dashboard

Sprint 06 utilizará principalmente:

```text
Queries

↓

Agregações

↓

Componentes de Dashboard
```

O Dashboard não deverá possuir regras de negócio duplicadas dos módulos de origem.

---

# Fora do Escopo Atual

A arquitetura do MVP não deverá antecipar módulos para:

- Leads;
- Projetos;
- Product Registry operacional;
- Agenda;
- reuniões;
- assinatura eletrônica;
- gateway de pagamento;
- SaaS multiempresa em produção;
- IA;
- API pública.

Esses módulos só deverão entrar na arquitetura ativa quando forem aprovados no PRD.

---

# Checklist de Implementação

Antes de iniciar um módulo verificar se são realmente necessários:

- Schema;
- Types;
- Queries;
- Mutations;
- RPCs;
- Services;
- Server Actions;
- Components;
- Pages;
- Forms;
- DataTable;
- Mapper;
- Activity Logs;
- RLS;
- Policies;
- testes.

Não criar uma camada vazia apenas para cumprir checklist.

---

# Checklist de Segurança

Antes de concluir um módulo verificar:

- autenticação validada;
- Membership validado;
- Organization resolvida corretamente;
- role validada quando aplicável;
- autorização por Cliente validada quando aplicável;
- RLS ativa;
- Policies corretas;
- dados administrativos não controláveis pela interface;
- Queries sem vazamento de dados;
- Storage protegido quando aplicável;
- Activity Logs protegidos;
- RPCs privilegiadas endurecidas conforme RLS e ADR-002.

---

# Checklist de Persistência

Para cada escrita perguntar:

```text
É somente leitura?
→ Query
```

```text
É uma escrita simples sem Activity Log atômico?
→ Mutation
```

```text
Exige atomicidade, múltiplas escritas ou Activity Log na mesma transação?
→ RPC
```

A escolha deverá ser feita pela necessidade real da operação.

---

# Definition of Done

Um módulo será considerado concluído quando:

- cumprir os requisitos da Sprint;
- respeitar este documento;
- respeitar o PRD;
- respeitar os Functional Requirements;
- respeitar as Business Rules;
- seguir a ADR-002 quando houver operações transacionais;
- utilizar Query somente para leitura;
- utilizar Mutation somente quando apropriado;
- utilizar RPC quando houver necessidade de atomicidade;
- manter regras de negócio nos Services;
- não acessar Supabase diretamente pela interface;
- respeitar RLS;
- respeitar autorização por Cliente quando aplicável;
- proteger documentos privados quando aplicável;
- utilizar Activity Logs quando exigidos;
- não possuir vazamento de dados;
- passar nos testes obrigatórios;
- passar em lint;
- passar em typecheck;
- passar no build;
- utilizar componentes reutilizáveis quando apropriado;
- manter separação de responsabilidades;
- não conter regras de negócio na interface;
- não implementar funcionalidades fora do escopo atual;
- possuir apenas documentação diretamente afetada atualizada.