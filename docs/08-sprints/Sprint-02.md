# Sprint 02 — Clientes & Acessos

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟢 Concluída

---

## Última atualização

Setembro de 2026

---

# Objetivo

Implementar o primeiro módulo de negócio do FASBtech CRM v3.0.

Esta Sprint deverá entregar:

- gestão de Clientes;
    
- gestão operacional de utilizadores;
    
- associação entre utilizadores e Clientes;
    
- autorização por Cliente;
    
- isolamento de informações;
    
- base de segurança necessária para os módulos seguintes.
    

Clientes serão a entidade operacional central do CRM.

A Sprint 02 não deverá implementar Demandas, Financeiro, Contratos ou Dashboard consolidado.

---

# Dependência Principal

A Sprint 02 somente poderá iniciar após a conclusão da:

```
Sprint 01 — Foundation
```

A Foundation deverá fornecer:

- autenticação;
    
- Profile;
    
- Organization;
    
- Membership;
    
- roles base;
    
- Bootstrap;
    
- RLS base;
    
- Activity Logs base;
    
- Storage privado;
    
- AppShell;
    
- menu principal;
    
- Error Handling;
    
- infraestrutura de testes.
    

---

# Documentos de Referência

Antes de iniciar esta Sprint, deverão ser consultados os documentos diretamente aplicáveis.

## Produto

- PRD v3.0;
    
- MVP Scope v3.0;
    
- Product Roadmap v3.0;
    
- Functional Requirements v3.0;
    
- Business Rules v3.0;
    
- User Stories v3.0.
    

---

## Arquitetura

- System Architecture;
    
- Module Architecture;
    
- RLS;
    
- Organization User Model;
    
- Activity Logs;
    
- Error Handling;
    
- ADRs aprovadas.
    

---

## Desenvolvimento

- Setup;
    
- Conventions;
    
- Testing Strategy;
    
- Implementation Guide.
    

---

## Design

- Layout;
    
- Components;
    
- DataTable Guidelines;
    
- CRM UI Guidelines;
    
- Accessibility;
    
- Design Tokens.
    

---

# Escopo da Sprint

A Sprint 02 será dividida em dois domínios principais:

```
Clientes

+

Acessos
```

Além desses domínios, a Sprint poderá utilizar:

- Activity Logs;
    
- infraestrutura de documentos privados criada na Foundation;
    
- infraestrutura de autorização existente.
    

---

# Clientes

# Objetivo

Permitir que a FASBtech centralize e gerencie os dados de seus Clientes.

Cliente será a principal entidade operacional do sistema.

---

## Funcionalidades

Implementar:

- cadastro;
    
- listagem;
    
- visualização;
    
- edição;
    
- arquivamento;
    
- pesquisa;
    
- filtros;
    
- ordenação;
    
- paginação;
    
- observações;
    
- histórico de atividades;
    
- dados de contato;
    
- dados empresariais;
    
- dados fiscais quando necessários;
    
- endereço quando necessário;
    
- utilizadores associados.
    

---

# Cadastro de Cliente

O sistema deverá permitir cadastrar um Cliente diretamente.

Não existe dependência de Lead.

---

## Dados

O cadastro deverá permitir armazenar os dados oficialmente definidos para Cliente.

Os campos concretos estão definidos e congelados na seção `Schema Físico Congelado — Sprint 02` deste documento.

O modelo deverá suportar informações como:

- identificação;
    
- nome;
    
- empresa quando aplicável;
    
- e-mail;
    
- telefone;
    
- dados fiscais quando necessários;
    
- tipo de identificação fiscal;
    
- endereço quando necessário;
    
- observações.
    

---

## Identificação Fiscal

O modelo não deverá ser limitado exclusivamente a:

```
CPF
```

Deverá permitir diferentes tipos.

Exemplos:

```
CPF
CNPJ
NIF
VAT
```

---

# Listagem de Clientes

A listagem deverá possuir:

- pesquisa;
    
- filtros quando aplicáveis;
    
- ordenação;
    
- paginação;
    
- DataTable responsiva;
    
- Empty State;
    
- Loading;
    
- Error State.
    

---

# Pesquisa

A pesquisa deverá ocorrer apenas dentro do conjunto de Clientes que o utilizador possui autorização para visualizar.

Nenhuma pesquisa poderá revelar Clientes não autorizados.

---

# Filtros

Os filtros deverão respeitar os campos realmente definidos no schema de Cliente.

Não deverão ser criados filtros para dados inexistentes.

---

# Ordenação

A ordenação deverá ocorrer somente por campos oficialmente suportados.

---

# Paginação

A listagem deverá utilizar paginação conforme:

```
DataTable Guidelines
```

---

# Detalhes do Cliente

A página de detalhes deverá funcionar como ponto central do Cliente.

Estrutura prevista:

```
Visão Geral

Acessos

Atividades
```

As seguintes áreas poderão aparecer futuramente quando os módulos correspondentes forem implementados:

```
Demandas
Financeiro
Contratos
Documentos
```

Essas áreas não deverão apresentar funcionalidades falsas nesta Sprint.

---

# Edição de Cliente

O sistema deverá permitir editar os campos autorizados.

Toda edição deverá:

- validar os dados;
    
- respeitar autorização;
    
- preservar dados históricos;
    
- gerar Activity Log quando aplicável.
    

---

# Arquivamento de Cliente

O sistema deverá utilizar arquivamento lógico.

Não realizar exclusão física pelo fluxo normal da aplicação.

Clientes arquivados:

- não aparecem na listagem padrão;
    
- permanecem no histórico;
    
- não perdem Activity Logs;
    
- não apagam dados relacionados.
    

---

# Acessos

# Objetivo

Permitir controlar quem pode acessar os Clientes da FASBtech.

Esta Sprint estabelecerá o modelo operacional de autorização por Cliente.

---

# Utilizadores

O sistema deverá permitir visualizar utilizadores internos vinculados à Organization.

Os utilizadores continuam vinculados à Organization através de:

```
Membership
```

---

# Roles

Os papéis oficiais do MVP são:

```
OWNER
ADMIN
MEMBER
```

---

## OWNER

Possui acesso administrativo completo à Organization.

---

## ADMIN

Possui acesso administrativo conforme as regras de negócio.

---

## MEMBER

Possui acesso operacional limitado.

A principal restrição do MEMBER nesta Sprint será a autorização por Cliente.

---

# Associação Utilizador ↔ Cliente

O sistema deverá permitir criar associação entre:

```
Utilizador

↕

Cliente
```

Essa relação deverá permitir:

```
1 utilizador
→ vários Clientes

1 Cliente
→ vários utilizadores
```

---

# Autorizar Utilizador em Cliente

Utilizadores administrativos autorizados deverão poder adicionar um utilizador à lista de Clientes permitidos.

A associação deverá ser persistida e auditada.

---

# Remover Autorização

Utilizadores administrativos autorizados deverão poder remover a associação entre utilizador e Cliente.

A remoção da associação não deverá:

- excluir o utilizador;
    
- excluir o Cliente;
    
- apagar Activity Logs.
    

Após a remoção, o utilizador deverá perder acesso ao Cliente conforme as regras de autorização.

---

# Regra Principal de MEMBER

Um MEMBER somente poderá acessar Clientes aos quais estiver explicitamente associado.

Exemplo:

```
MEMBER João

├── Cliente A     ✅
├── Cliente B     ✅
└── Cliente C     ❌
```

O Cliente C não poderá ser acessado por João.

---

# Restrição por URL

A segurança não deverá depender apenas da Sidebar ou da interface.

Se um MEMBER tentar acessar diretamente:

```
/clientes/<cliente-nao-autorizado>
```

o acesso deverá ser negado.

---

# Restrição nas Queries

Queries deverão retornar somente dados permitidos ao utilizador.

Um MEMBER não deverá receber registros de Clientes não associados.

---

# Restrição nas Escritas

O utilizador não deverá conseguir:

- editar;
    
- arquivar;
    
- alterar;
    
- associar documentos;
    

em Clientes aos quais não possui acesso ou permissão apropriada.

---

# OWNER

O OWNER deverá possuir acesso a todos os Clientes da Organization.

---

# ADMIN

O comportamento de ADMIN deverá seguir as regras de autorização definidas oficialmente.

A Sprint não deverá inventar permissões adicionais além das documentadas.

---

# MEMBER

MEMBER deverá ser tratado como utilizador operacional restrito.

A associação a Cliente não deverá conceder automaticamente:

- acesso administrativo;
    
- acesso global ao Financeiro;
    
- acesso global a Contratos;
    
- gestão de utilizadores;
    
- alteração da Organization.
    

---

# Financeiro e Contratos

Os módulos:

```
Financeiro
Contratos
```

ainda não serão implementados nesta Sprint.

Entretanto, o modelo de autorização deverá estar preparado para não conceder esses acessos automaticamente a MEMBER apenas por associação a Cliente.

A definição concreta das permissões desses módulos será aplicada quando eles forem implementados.

---

# Documentos de Cliente

A Sprint poderá utilizar a infraestrutura de Storage privado criada na Foundation para documentos diretamente associados a Clientes.

Se essa funcionalidade for utilizada nesta Sprint, deverá respeitar a autorização por Cliente.

Fluxo:

```
Utilizador autenticado

↓

Cliente autorizado?

├── Sim → continuar
└── Não → negar acesso
```

---

# Histórico de Atividades

A página de Cliente deverá permitir apresentar Activity Logs relacionados quando aplicável.

O histórico deverá respeitar as permissões do utilizador.

---

# Activity Logs

Operações relevantes desta Sprint deverão ser auditadas.

Incluindo, quando aplicável:

## Clientes

- criação;
    
- atualização;
    
- arquivamento.
    

## Acessos

- alteração de role;
    
- criação de associação utilizador ↔ Cliente;
    
- remoção de associação utilizador ↔ Cliente.
    

Activity Logs deverão seguir a arquitetura oficial.

---

# Estrutura Esperada

Criar somente as estruturas necessárias aos domínios desta Sprint.

A organização deverá seguir o Module Architecture oficial.

Estruturas aplicáveis podem incluir:

```
Pages
Components
Server Actions
Services
Queries
Mutations
RPCs quando arquiteturalmente necessárias
Schemas
Types
Forms
DataTables
```

---

# Separação de Responsabilidades

## Queries

Responsáveis por leitura.

Exemplos:

- listar Clientes permitidos;
    
- obter Cliente por ID;
    
- listar utilizadores associados;
    
- listar Clientes de um utilizador.
    

---

## Mutations

Somente deverão ser utilizadas para escritas simples quando permitidas pela arquitetura.

---

## RPCs

Deverão ser utilizadas quando a operação exigir:

- atomicidade;
    
- Activity Log na mesma transação;
    
- autorização privilegiada controlada;
    
- múltiplas alterações que precisem de commit ou rollback conjunto.
    

A escolha entre Mutation e RPC deverá seguir a arquitetura oficial e ADR-002.

---

## Services

Responsáveis por:

- regras de negócio;
    
- coordenação das operações;
    
- validação de permissões;
    
- escolha do mecanismo de persistência apropriado.
    

---

## Server Actions

Responsáveis por:

- validar dados de entrada;
    
- validar sessão;
    
- chamar o Service correspondente;
    
- retornar resultado seguro para a interface.
    

---

# Interface

A Sprint deverá implementar as interfaces necessárias para Clientes e Acessos.

---

# Clientes — Listagem

Deverá possuir:

- Page Header;
    
- pesquisa;
    
- filtros quando aplicáveis;
    
- ordenação;
    
- DataTable;
    
- paginação;
    
- botão de Novo Cliente;
    
- estados de interface.
    

---

# Clientes — Cadastro

Deverá possuir:

- formulário;
    
- validação;
    
- feedback de erro;
    
- feedback de sucesso.
    

---

# Clientes — Detalhes

Deverá exibir:

- informações gerais;
    
- observações;
    
- utilizadores autorizados;
    
- Activity Logs quando aplicável.
    

Também deverá permitir, conforme permissão:

- editar;
    
- arquivar;
    
- gerir Acessos.
    

---

# Clientes — Edição

Deverá permitir alterar os campos editáveis de Cliente.

A edição deverá respeitar:

- validação;
    
- autorização;
    
- auditoria;
    
- Error Handling.
    

---

# Acessos — Utilizadores

Deverá permitir visualizar os utilizadores internos conforme as permissões do utilizador atual.

---

# Acessos — Cliente

A interface deverá permitir visualizar e gerir, quando autorizado:

```
Cliente
    ↓
Utilizadores com acesso
```

---

# Acessos — Utilizador

Quando aplicável, deverá ser possível visualizar:

```
Utilizador
    ↓
Clientes permitidos
```

---

# Estados da Interface

Todas as telas assíncronas deverão possuir os estados aplicáveis:

- Loading;
    
- Empty State;
    
- Error State;
    
- Success Feedback.
    

Os estados deverão seguir o Design System oficial.

---

# Responsividade

As interfaces deverão funcionar corretamente em:

- Desktop;
    
- Tablet;
    
- Mobile.
    

Nenhuma funcionalidade essencial poderá desaparecer no Mobile.

---

# Acessibilidade

As telas deverão cumprir WCAG 2.2 AA.

Validar:

- navegação por teclado;
    
- Focus visível;
    
- labels;
    
- mensagens de erro;
    
- contraste;
    
- estrutura semântica;
    
- DataTable acessível quando aplicável.
    

---

# Segurança

Toda operação da Sprint deverá:

- exigir autenticação válida;
    
- validar Membership;
    
- respeitar Organization;
    
- validar role quando aplicável;
    
- validar autorização por Cliente;
    
- impedir acesso entre Organizations;
    
- impedir acesso a Clientes não autorizados;
    
- impedir confiança em dados de autorização enviados pela interface.
    

---

# Organization

O utilizador não deverá definir arbitrariamente:

```
organization_id
```

para acessar dados.

A Organization deverá ser resolvida conforme a arquitetura oficial.

---

# Cliente

O utilizador não deverá conseguir obter autorização simplesmente enviando:

```
client_id
```

na interface.

O `client_id` identifica o recurso solicitado.

Ele não representa prova de autorização.

A autorização deverá ser validada separadamente.

---

# Dados de Auditoria

A interface não deverá controlar diretamente campos administrativos como:

```
created_by
updated_by
organization_id
```

quando esses campos forem responsabilidade do sistema.

---

# Storage

Quando documentos privados forem utilizados:

- arquivos não deverão ser públicos por padrão;
    
- acesso deverá exigir autorização;
    
- autorização deverá considerar o Cliente relacionado;
    
- conhecimento da URL não deverá conceder acesso.
    

---

# Fora do Escopo

Não implementar nesta Sprint:

- Leads;
    
- pipeline comercial;
    
- conversão Lead → Cliente;
    
- Demandas;
    
- responsáveis de Demandas;
    
- tags de Demandas;
    
- notificações de prazo;
    
- Financeiro;
    
- entradas;
    
- saídas;
    
- metas;
    
- Contratos;
    
- templates de contrato;
    
- PDF de contrato;
    
- envio de contrato;
    
- Dashboard consolidado;
    
- Projetos;
    
- Product Registry;
    
- Agenda;
    
- gestão de reuniões;
    
- assinatura eletrônica;
    
- IA;
    
- automações externas;
    
- SaaS multiempresa.
    

---

# Banco de Dados

A Sprint 02 deverá possuir Migration própria.

A Foundation não deverá ser modificada para antecipar tabelas de Cliente, salvo necessidade de correção da própria Foundation.

A Migration da Sprint 02 deverá implementar somente as entidades e mecanismos necessários para:

- Clientes;
    
- associação utilizador ↔ Cliente;
    
- índices;
    
- constraints;
    
- RLS;
    
- Policies;
    
- funções/RPCs necessárias;
    
- mecanismos de auditoria aplicáveis.
    

---

# Schema Físico Congelado — Sprint 02

O schema físico de `clients` e `client_assignments` fica congelado nesta Sprint antes da implementação da Migration.

Alterações posteriores nesses schemas deverão ocorrer somente mediante necessidade técnica ou regra de negócio oficialmente aprovada.

---

# Tabela `public.clients`

Representa o Cliente como entidade operacional central do CRM.

## Colunas

|Coluna|Tipo|Obrigatório|Regra|
|---|---|---|---|
|`id`|`uuid`|Sim|Primary Key. Gerado pelo banco.|
|`organization_id`|`uuid`|Sim|FK para `public.organizations(id)`. Definido pelo sistema, nunca confiado da interface.|
|`name`|`text`|Sim|Nome principal do Cliente. Não poderá ser vazio.|
|`company_name`|`text`|Não|Empresa ou razão social quando aplicável.|
|`email`|`text`|Não|E-mail principal de contato.|
|`phone`|`text`|Não|Telefone principal de contato.|
|`tax_id`|`text`|Não|Identificação fiscal quando aplicável.|
|`tax_id_type`|`text`|Não|Tipo da identificação fiscal, por exemplo CPF, CNPJ, NIF ou VAT. Não será limitado a uma enumeração fechada nesta Sprint.|
|`address_line_1`|`text`|Não|Endereço principal.|
|`address_line_2`|`text`|Não|Complemento do endereço.|
|`city`|`text`|Não|Cidade.|
|`region`|`text`|Não|Estado, distrito, província ou região equivalente.|
|`postal_code`|`text`|Não|Código postal.|
|`country_code`|`text`|Não|Código do país quando o endereço for informado.|
|`notes`|`text`|Não|Observações operacionais sobre o Cliente.|
|`created_by`|`uuid`|Sim|Profile responsável pela criação. Definido pelo sistema.|
|`updated_by`|`uuid`|Sim|Profile responsável pela última alteração. Definido pelo sistema.|
|`created_at`|`timestamptz`|Sim|Data de criação.|
|`updated_at`|`timestamptz`|Sim|Data da última alteração.|
|`archived_at`|`timestamptz`|Não|Arquivamento lógico. `NULL` representa Cliente ativo na listagem operacional.|

---

## Primary Key

```
clients.id
```

Tipo:

```
uuid
```

O valor deverá ser gerado pelo banco.

---

## Organization

Todo Cliente pertence exatamente a uma Organization.

Relação:

```
organizations
      │
      └── clients
```

`organization_id` deverá possuir FK para:

```
public.organizations(id)
```

O Cliente não poderá trocar arbitrariamente de Organization.

A interface não poderá fornecer `organization_id` como prova de autorização.

A Organization deverá ser resolvida a partir do utilizador autenticado e de sua Membership.

---

## Nome

`name` é obrigatório.

Deverá existir constraint que impeça:

```
NULL
string vazia
string contendo somente espaços
```

---

## Empresa

`company_name` é opcional.

Isso permite representar tanto:

```
Pessoa
```

quanto:

```
Empresa
```

sem exigir tipos adicionais de Cliente nesta Sprint.

---

## Identificação Fiscal

Os campos:

```
tax_id
tax_id_type
```

são opcionais.

Entretanto, quando utilizados, deverão ser informados em conjunto.

Não deverá existir enum fechada de tipos fiscais nesta Sprint.

Exemplos válidos incluem:

```
CPF
CNPJ
NIF
VAT
```

sem limitar o sistema exclusivamente a esses valores.

---

## Endereço

O endereço será armazenado diretamente em `clients` nesta Sprint.

Campos:

```
address_line_1
address_line_2
city
region
postal_code
country_code
```

Todos são opcionais.

Não será criada tabela separada de endereços no MVP desta Sprint.

---

## Arquivamento

Clientes utilizarão arquivamento lógico por:

```
archived_at
```

Estado operacional:

```
archived_at IS NULL
→ Cliente não arquivado
```

```
archived_at IS NOT NULL
→ Cliente arquivado
```

Não será criada coluna de status redundante apenas para representar arquivamento.

Clientes não deverão ser excluídos fisicamente pelo fluxo normal da aplicação.

---

## Auditoria

Os campos:

```
created_by
updated_by
created_at
updated_at
```

são administrativos.

A interface não deverá escolher arbitrariamente:

```
created_by
updated_by
organization_id
```

As operações de criação, atualização e arquivamento deverão registrar Activity Log conforme arquitetura oficial.

---

# Índices de `clients`

A Migration deverá criar pelo menos índices adequados para:

```
organization_id
organization_id + archived_at
organization_id + name
```

Objetivos:

- isolamento por Organization;
    
- listagem padrão de Clientes não arquivados;
    
- ordenação e pesquisa operacional por nome.
    

Não deverão ser adicionados índices especulativos sem uso concreto nesta Sprint.

---

# Unicidade de Cliente

Esta Sprint não deverá impor unicidade global para:

```
name
email
phone
tax_id
```

porque o documento de negócio atual não define essas propriedades como identificadores globalmente únicos.

Qualquer regra futura de unicidade deverá ser introduzida somente quando oficialmente definida.

---

# Tabela `public.client_assignments`

Representa a associação explícita entre um utilizador interno da Organization e um Cliente.

A associação deverá utilizar a Membership como vínculo organizacional do utilizador.

Relação:

```
Organization
│
├── Clients
│
└── Memberships
      │
      └── Client Assignments
             │
             └── Client
```

---

## Colunas

|   |   |   |   |
|---|---|---|---|
|Coluna|Tipo|Obrigatório|Regra|
|`id`|`uuid`|Sim|Primary Key. Gerado pelo banco.|
|`client_id`|`uuid`|Sim|FK para `public.clients(id)`.|
|`membership_id`|`uuid`|Sim|FK para `public.organization_members(id)`.|
|`created_by`|`uuid`|Sim|Profile que criou a associação. Definido pelo sistema.|
|`created_at`|`timestamptz`|Sim|Data de criação da associação.|

---

## Primary Key

```
client_assignments.id
```

Tipo:

```
uuid
```

O valor deverá ser gerado pelo banco.

---

## Relação com Membership

A associação deverá apontar para:

```
organization_members.id
```

e não diretamente para dados enviados pela interface como prova de autorização.

A Membership representa o vínculo entre:

```
Profile
↕
Organization
```

A partir dela será possível determinar o utilizador associado ao Cliente.

---

## Restrição de mesma Organization

Uma associação somente será válida quando:

```
Client.organization_id
=
Membership.organization_id
```

A Migration deverá garantir essa regra no banco.

Essa garantia poderá utilizar função/trigger ou outro mecanismo transacional apropriado sem alterar semanticamente a Foundation.

Não será suficiente validar essa regra apenas na interface.

---

## Membership válida

Ao criar uma nova associação, a Membership alvo deverá pertencer à mesma Organization do Cliente.

O acesso operacional decorrente da associação somente poderá ser considerado quando a Membership estiver:

```
ACTIVE
```

Se posteriormente a Membership for suspensa ou deixar de ser ativa, a existência da associação não poderá manter acesso ao Cliente.

---

## Unicidade de Associação

Não poderá existir mais de uma associação para o mesmo par:

```
client_id
+
membership_id
```

Deverá existir constraint:

```
UNIQUE (client_id, membership_id)
```

---

## Remoção de Associação

A remoção de acesso poderá remover fisicamente o registro de `client_assignments`.

Isso não representa exclusão:

- do Cliente;
    
- do Profile;
    
- da Membership;
    
- dos Activity Logs.
    

O histórico da concessão e remoção deverá ser preservado por Activity Logs.

Não será introduzido `archived_at` em `client_assignments` nesta Sprint sem necessidade de negócio oficialmente definida.

---

## Auditoria da Associação

`created_by` deverá ser definido pelo sistema.

A interface não poderá escolher arbitrariamente o autor da associação.

As operações:

```
associar utilizador
remover associação
```

deverão gerar Activity Log conforme a arquitetura oficial.

---

# Índices de `client_assignments`

A Migration deverá possuir pelo menos índices para:

```
client_id
membership_id
```

além da constraint:

```
UNIQUE (client_id, membership_id)
```

Esses índices suportarão:

- listar utilizadores autorizados em um Cliente;
    
- listar Clientes autorizados para uma Membership;
    
- verificar autorização por Cliente.
    

---

# Contrato de Autorização por Cliente

A existência de um `client_id` não representa autorização.

A autorização deverá ser determinada no backend/banco.

---

## OWNER

Membership:

```
role = OWNER
status = ACTIVE
```

deverá permitir acesso a todos os Clientes da mesma Organization.

Nenhum `client_assignment` será necessário para OWNER.

---

## MEMBER

Membership:

```
role = MEMBER
status = ACTIVE
```

somente poderá acessar um Cliente quando existir associação explícita:

```
client_assignments
```

para sua Membership e para aquele Cliente.

Regra:

```
MEMBER
+
Membership ACTIVE
+
Client Assignment
+
mesma Organization
=
Cliente autorizado
```

Sem associação:

```
ACESSO NEGADO
```

---

## ADMIN

O schema físico não concederá acesso global automaticamente apenas pela existência do role:

```
ADMIN
```

O comportamento de ADMIN deverá seguir exclusivamente as regras oficiais de autorização existentes.

Esta Sprint não deverá inventar permissões administrativas adicionais.

Caso nenhuma regra adicional esteja oficialmente definida, nenhuma Policy deverá ampliar acesso de ADMIN por inferência.

---

# RLS — Regras Obrigatórias

RLS deverá ser habilitado em:

```
public.clients
public.client_assignments
```

Nenhuma autorização deverá depender exclusivamente da interface.

---

## Clientes — SELECT

A Policy deverá garantir:

```
OWNER ACTIVE
→ Clientes da própria Organization
```

e:

```
MEMBER ACTIVE + client_assignment
→ Cliente associado
```

Um MEMBER sem associação não deverá receber o registro.

---

## Clientes — acesso direto

Uma consulta por ID:

```
/clientes/<client_id>
```

não deverá contornar a RLS.

Resultado para Cliente não autorizado:

```
nenhum registro autorizado
```

---

## Listagem e pesquisa

RLS deverá ser aplicada antes de:

```
pesquisa
filtros
ordenação
paginação
contagens
```

Um Cliente não autorizado não poderá ser descoberto por qualquer um desses mecanismos.

---

## Escritas

Criação, edição e arquivamento deverão exigir autorização administrativa oficialmente definida.

MEMBER não receberá permissão administrativa apenas por possuir `client_assignment`.

---

## Client Assignments

A gestão das associações deverá exigir autorização administrativa oficialmente definida.

MEMBER não poderá conceder ou remover sua própria autorização.

---

# Funções e RPCs

RPC deverá ser utilizada quando a operação exigir:

- autorização centralizada;
    
- múltiplas validações relacionadas;
    
- Activity Log na mesma transação;
    
- commit/rollback conjunto;
    
- definição segura de campos administrativos.
    

Nesta Sprint, são candidatas naturais a operações transacionais:

```
criar Cliente + Activity Log
editar Cliente + Activity Log
arquivar Cliente + Activity Log
associar utilizador + Activity Log
remover associação + Activity Log
```

A implementação concreta deverá seguir ADR-002 e o Implementation Guide.

---

# Dados controlados pelo sistema

Os seguintes valores não deverão ser confiados diretamente da interface:

```
organization_id
created_by
updated_by
role
membership status
```

O sistema deverá derivá-los ou validá-los no backend/banco.

---

# Integridade entre Organizations

Será obrigatório impedir situações como:

```
Cliente da Organization A
+
Membership da Organization B
=
ASSOCIAÇÃO INVÁLIDA
```

Essa proteção deverá existir no banco e possuir teste específico.

---

# Exclusões intencionais do schema desta Sprint

Não criar nesta Migration:

```
demands
demand_assignees
financial_entries
financial_goals
contracts
contract_templates
documents
meetings
leads
projects
```

Também não criar tabela física de:

```
client_status
client_categories
addresses
tax_id_types
```

sem requisito oficial adicional.

---

# Migration

A numeração concreta deverá seguir o documento:

```
Migrations
```

A Sprint não deverá inventar ou duplicar a sequência de migrations fora da fonte oficial.

A Migration deverá ser criada somente após este schema físico estar congelado.

---

# Testes

A Sprint deverá implementar testes compatíveis com o risco de Clientes & Acessos.

---

# Testes Unitários

Validar, quando aplicável:

- Schemas;
    
- Services;
    
- regras de autorização;
    
- helpers;
    
- regras de domínio.
    

---

# Testes de Integração

Validar pelo menos:

- Queries;
    
- Server Actions quando aplicável;
    
- Mutations quando utilizadas;
    
- RPCs quando utilizadas;
    
- RLS;
    
- Policies;
    
- Activity Logs;
    
- autorização por Cliente;
    
- isolamento entre utilizadores;
    
- isolamento entre Organizations.
    

---

# Matriz de Segurança Obrigatória

Os testes deverão cobrir pelo menos:

```
OWNER
→ Cliente da Organization
→ acesso permitido
```

```
MEMBER associado
→ Cliente autorizado
→ acesso permitido
```

```
MEMBER não associado
→ Cliente não autorizado
→ acesso negado
```

```
MEMBER
→ Cliente de outra Organization
→ acesso negado
```

```
Utilizador não autenticado
→ Cliente
→ acesso negado
```

---

# Acesso Direto

Deverá existir teste que tente acessar diretamente um Cliente não autorizado utilizando seu identificador.

Resultado esperado:

```
ACESSO NEGADO
```

---

# Data Leakage

Os testes deverão garantir que:

- listagens não retornem Clientes não autorizados;
    
- pesquisas não revelem Clientes não autorizados;
    
- filtros não revelem Clientes não autorizados;
    
- contagens não revelem informações indevidas quando aplicável.
    

---

# Activity Logs

Operações auditadas deverão possuir testes que validem:

- criação correta do Log;
    
- utilizador correto;
    
- Organization correta;
    
- entidade correta;
    
- ação correta;
    
- impossibilidade de alteração arbitrária.
    

Quando a arquitetura exigir atomicidade, os testes deverão validar commit/rollback conjunto.

---

# Storage

Se documentos de Cliente forem implementados nesta Sprint, os testes deverão validar:

```
Cliente autorizado
→ documento permitido
```

```
Cliente não autorizado
→ documento negado
```

---

# E2E

Os fluxos críticos deverão incluir, no mínimo:

## Clientes

- Login;
    
- abrir listagem;
    
- cadastrar Cliente;
    
- visualizar Cliente;
    
- editar Cliente;
    
- pesquisar Cliente;
    
- arquivar Cliente.
    

---

## Acessos

- visualizar utilizadores quando autorizado;
    
- associar utilizador a Cliente;
    
- confirmar acesso ao Cliente;
    
- remover associação;
    
- confirmar perda de acesso.
    

---

## Segurança

Fluxo crítico:

```
MEMBER sem associação

↓

tentar acessar Cliente

↓

acesso negado
```

---

# Critérios de Aceite

A Sprint será considerada concluída quando:

- Clientes puderem ser cadastrados diretamente;
    
- Clientes puderem ser listados;
    
- pesquisa estiver operacional;
    
- filtros aplicáveis estiverem operacionais;
    
- ordenação estiver operacional;
    
- paginação estiver operacional;
    
- detalhes estiverem operacionais;
    
- edição estiver operacional;
    
- arquivamento estiver operacional;
    
- utilizadores internos puderem ser visualizados conforme permissão;
    
- utilizadores puderem ser associados a Clientes;
    
- associações puderem ser removidas;
    
- MEMBER visualizar apenas Clientes autorizados;
    
- acesso direto a Cliente não autorizado for bloqueado;
    
- RLS e Policies aplicáveis estiverem funcionando;
    
- Activity Logs aplicáveis estiverem funcionando;
    
- documentos privados, quando utilizados, respeitarem autorização;
    
- lint aprovado;
    
- typecheck aprovado;
    
- build aprovado;
    
- testes obrigatórios aprovados;
    
- acessibilidade obrigatória validada;
    
- documentação diretamente afetada sincronizada;
    
- revisão técnica sem bloqueadores.
    

---

# Entregáveis

Ao final da Sprint deverão existir:

- módulo de Clientes;
    
- listagem de Clientes;
    
- cadastro de Cliente;
    
- detalhes de Cliente;
    
- edição de Cliente;
    
- arquivamento;
    
- pesquisa;
    
- filtros aplicáveis;
    
- ordenação;
    
- paginação;
    
- módulo de Acessos;
    
- visualização de utilizadores;
    
- associação utilizador ↔ Cliente;
    
- remoção da associação;
    
- autorização por Cliente;
    
- RLS correspondente;
    
- Policies correspondentes;
    
- Activity Logs aplicáveis;
    
- Migration da Sprint;
    
- testes unitários aplicáveis;
    
- testes de integração;
    
- testes E2E críticos;
    
- interface responsiva e acessível.
    

---

# Checklist Técnico

## Banco

- Schema físico de `clients` definido e congelado.
    
- Schema físico de `client_assignments` definido e congelado.
    
- Criar Migration da Sprint 02.
    
- Criar constraints.
    
- Criar índices.
    
- Aplicar RLS.
    
- Criar Policies.
    
- Implementar RPCs somente quando exigidas pela arquitetura.
    
- Validar Activity Logs.
    

---

## Types e Validation

- Criar Types de Cliente.
    
- Criar Schemas de validação.
    
- Criar Types de associação.
    
- Garantir que campos de autorização não sejam aceitos indevidamente.
    

---

## Queries

- Listar Clientes autorizados.
    
- Pesquisar Clientes autorizados.
    
- Filtrar Clientes autorizados.
    
- Ordenar Clientes autorizados.
    
- Paginar Clientes autorizados.
    
- Obter Cliente autorizado por ID.
    
- Listar utilizadores associados ao Cliente.
    
- Listar Clientes associados ao utilizador quando necessário.
    

---

## Persistência

- Implementar escrita de Cliente conforme arquitetura.
    
- Implementar edição.
    
- Implementar arquivamento.
    
- Implementar associação utilizador ↔ Cliente.
    
- Implementar remoção de associação.
    
- Garantir atomicidade quando exigida.
    
- Garantir Activity Logs quando exigidos.
    

---

## Services

- Implementar regras de Clientes.
    
- Implementar regras de Acessos.
    
- Validar autorização.
    
- Validar associação MEMBER ↔ Cliente.
    

---

## Server Actions

- Criar Cliente.
    
- Editar Cliente.
    
- Arquivar Cliente.
    
- Associar utilizador.
    
- Remover associação.
    

---

## Interface

- Criar listagem de Clientes.
    
- Criar formulário.
    
- Criar página de detalhes.
    
- Criar edição.
    
- Criar interface de Acessos.
    
- Criar estados Loading.
    
- Criar Empty States.
    
- Criar Error States.
    
- Criar Success Feedback.
    
- Validar responsividade.
    
- Validar acessibilidade.
    

---

## Segurança

- OWNER acessa Cliente.
    
- MEMBER associado acessa Cliente.
    
- MEMBER não associado não acessa Cliente.
    
- Outra Organization não acessa Cliente.
    
- Utilizador não autenticado não acessa Cliente.
    
- URL direta não contorna autorização.
    
- Queries não vazam registros.
    
- Pesquisa não vaza registros.
    
- Storage não vaza documentos.
    

---

## Testes

- Testes unitários.
    
- Testes de integração.
    
- Testes de RLS.
    
- Testes de Policies.
    
- Testes de Activity Logs.
    
- Testes de autorização por Cliente.
    
- Testes E2E críticos.
    
- Lint.
    
- Typecheck.
    
- Build.
    

---

# Definition of Done

Todo código desta Sprint deverá:

- seguir a arquitetura oficial;
    
- respeitar o PRD v3.0;
    
- respeitar o MVP Scope v3.0;
    
- respeitar o Product Roadmap v3.0;
    
- implementar os Functional Requirements de Clientes & Acessos;
    
- implementar as User Stories correspondentes;
    
- respeitar as Business Rules;
    
- utilizar o Design System;
    
- utilizar Design Tokens;
    
- seguir as DataTable Guidelines quando aplicável;
    
- respeitar RLS;
    
- respeitar autorização por Cliente;
    
- impedir Data Leakage;
    
- utilizar Activity Logs quando aplicável;
    
- utilizar Error Handling;
    
- seguir a Testing Strategy;
    
- cumprir WCAG 2.2 AA;
    
- respeitar isolamento entre Organizations;
    
- respeitar isolamento entre Clientes;
    
- não implementar funcionalidades das Sprints futuras;
    
- possuir todos os testes críticos aprovados.
    

---

# Resultado

A Sprint 02 foi concluída com o escopo de Clientes & Acessos entregue.

## Entregas Finais

- Clients com listagem, detalhe, criação, edição e archive, incluindo pesquisa, ordenação, paginação e estados de loading/error;
- gestão de Memberships internas com roles `OWNER`, `ADMIN` e `MEMBER`;
- administração e `/acessos` restritos a `OWNER`, sem inferir permissões globais para `ADMIN`;
- Client Assignments com grant e remove de acesso;
- acesso de `MEMBER` limitado aos Clientes atribuídos, com negação após a remoção do Assignment;
- Activity Logs, RLS e RPCs para as operações protegidas;
- proteção concorrente contra demotion do último `OWNER`;
- testes de concorrência e E2E crítico de Clientes & Acessos.

Client Assignment não concede automaticamente acesso a Financeiro ou Contratos.

Archive preserva o histórico do Cliente e não realiza delete físico.

## Validação Final

- Database: 8 arquivos pgTAP / 197 testes / 0 failures;
- integração `owner-role-concurrency`: aprovada;
- Unit: 18 arquivos / 158 testes aprovados;
- E2E: 2 specs / 4 testes aprovados / 0 skipped;
- E2E executado duas vezes consecutivas com sucesso;
- lint, typecheck, diff-check e build: aprovados.

---

# Lições Aprendidas

- A autorização deve existir no banco/backend; a UI apenas reflete as permissões efetivas.
- Guards administrativos devem ocorrer antes de queries sensíveis.
- O último `OWNER` exige proteção concorrente, não apenas uma contagem simples.
- Testes de segurança devem provar happy path e denied path.
- E2E destrutivo deve possuir guard explícito `LOCAL ONLY` antes de reset ou mutations privilegiadas.
- Lifecycle E2E stateful deve executar em série, mesmo com `fullyParallel` habilitado no Playwright.
- O acesso de `MEMBER` deve ser comprovado após grant e negado após remove.

---

# Fonte da Verdade

Esta Sprint implementa:

```
Sprint 02 — Clientes & Acessos
```

conforme definido em:

```
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

User Stories v3.0
```

Clientes são a entidade operacional central.

Acessos estabelecem a autorização por Cliente necessária para os módulos posteriores.

Próxima Sprint:

```
Sprint 03 — Demandas
Status: Não iniciada
```
