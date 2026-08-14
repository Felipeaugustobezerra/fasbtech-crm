# Sprint 02 — Clientes & Acessos

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟡 Planejada

---

## Última atualização

Agosto de 2026

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

```text
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

```text
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

Os campos concretos deverão ser definidos no schema correspondente antes da implementação.

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

```text
CPF
```

Deverá permitir diferentes tipos.

Exemplos:

```text
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

```text
DataTable Guidelines
```

---

# Detalhes do Cliente

A página de detalhes deverá funcionar como ponto central do Cliente.

Estrutura prevista:

```text
Visão Geral

Acessos

Atividades
```

As seguintes áreas poderão aparecer futuramente quando os módulos correspondentes forem implementados:

```text
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

```text
Membership
```

---

# Roles

Os papéis oficiais do MVP são:

```text
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

```text
Utilizador

↕

Cliente
```

Essa relação deverá permitir:

```text
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

```text
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

```text
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

```text
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

```text
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

```text
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

```text
Cliente
    ↓
Utilizadores com acesso
```

---

# Acessos — Utilizador

Quando aplicável, deverá ser possível visualizar:

```text
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

```text
organization_id
```

para acessar dados.

A Organization deverá ser resolvida conforme a arquitetura oficial.

---

# Cliente

O utilizador não deverá conseguir obter autorização simplesmente enviando:

```text
client_id
```

na interface.

O `client_id` identifica o recurso solicitado.

Ele não representa prova de autorização.

A autorização deverá ser validada separadamente.

---

# Dados de Auditoria

A interface não deverá controlar diretamente campos administrativos como:

```text
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

A Migration da Sprint 02 deverá implementar apenas as entidades necessárias para:

- Clientes;
- associação utilizador ↔ Cliente;
- índices;
- constraints;
- RLS;
- Policies;
- funções/RPCs necessárias;
- mecanismos de auditoria aplicáveis.

---

# Migration

A numeração concreta deverá seguir o documento:

```text
Migrations
```

A Sprint não deverá inventar ou duplicar a sequência de migrations fora da fonte oficial.

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

```text
OWNER
→ Cliente da Organization
→ acesso permitido
```

```text
MEMBER associado
→ Cliente autorizado
→ acesso permitido
```

```text
MEMBER não associado
→ Cliente não autorizado
→ acesso negado
```

```text
MEMBER
→ Cliente de outra Organization
→ acesso negado
```

```text
Utilizador não autenticado
→ Cliente
→ acesso negado
```

---

# Acesso Direto

Deverá existir teste que tente acessar diretamente um Cliente não autorizado utilizando seu identificador.

Resultado esperado:

```text
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

```text
Cliente autorizado
→ documento permitido
```

```text
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

```text
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

- [ ] Definir schema de Clientes.
- [ ] Definir schema da associação utilizador ↔ Cliente.
- [ ] Criar Migration da Sprint 02.
- [ ] Criar constraints.
- [ ] Criar índices.
- [ ] Aplicar RLS.
- [ ] Criar Policies.
- [ ] Implementar RPCs somente quando exigidas pela arquitetura.
- [ ] Validar Activity Logs.

---

## Types e Validation

- [ ] Criar Types de Cliente.
- [ ] Criar Schemas de validação.
- [ ] Criar Types de associação.
- [ ] Garantir que campos de autorização não sejam aceitos indevidamente.

---

## Queries

- [ ] Listar Clientes autorizados.
- [ ] Pesquisar Clientes autorizados.
- [ ] Filtrar Clientes autorizados.
- [ ] Ordenar Clientes autorizados.
- [ ] Paginar Clientes autorizados.
- [ ] Obter Cliente autorizado por ID.
- [ ] Listar utilizadores associados ao Cliente.
- [ ] Listar Clientes associados ao utilizador quando necessário.

---

## Persistência

- [ ] Implementar escrita de Cliente conforme arquitetura.
- [ ] Implementar edição.
- [ ] Implementar arquivamento.
- [ ] Implementar associação utilizador ↔ Cliente.
- [ ] Implementar remoção de associação.
- [ ] Garantir atomicidade quando exigida.
- [ ] Garantir Activity Logs quando exigidos.

---

## Services

- [ ] Implementar regras de Clientes.
- [ ] Implementar regras de Acessos.
- [ ] Validar autorização.
- [ ] Validar associação MEMBER ↔ Cliente.

---

## Server Actions

- [ ] Criar Cliente.
- [ ] Editar Cliente.
- [ ] Arquivar Cliente.
- [ ] Associar utilizador.
- [ ] Remover associação.

---

## Interface

- [ ] Criar listagem de Clientes.
- [ ] Criar formulário.
- [ ] Criar página de detalhes.
- [ ] Criar edição.
- [ ] Criar interface de Acessos.
- [ ] Criar estados Loading.
- [ ] Criar Empty States.
- [ ] Criar Error States.
- [ ] Criar Success Feedback.
- [ ] Validar responsividade.
- [ ] Validar acessibilidade.

---

## Segurança

- [ ] OWNER acessa Cliente.
- [ ] MEMBER associado acessa Cliente.
- [ ] MEMBER não associado não acessa Cliente.
- [ ] Outra Organization não acessa Cliente.
- [ ] Utilizador não autenticado não acessa Cliente.
- [ ] URL direta não contorna autorização.
- [ ] Queries não vazam registros.
- [ ] Pesquisa não vaza registros.
- [ ] Storage não vaza documentos.

---

## Testes

- [ ] Testes unitários.
- [ ] Testes de integração.
- [ ] Testes de RLS.
- [ ] Testes de Policies.
- [ ] Testes de Activity Logs.
- [ ] Testes de autorização por Cliente.
- [ ] Testes E2E críticos.
- [ ] Lint.
- [ ] Typecheck.
- [ ] Build.

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

> Preencher ao final da Sprint.

---

# Lições Aprendidas

> Preencher ao final da Sprint.

---

# Fonte da Verdade

Esta Sprint implementa:

```text
Sprint 02 — Clientes & Acessos
```

conforme definido em:

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

User Stories v3.0
```

Clientes são a entidade operacional central.

Acessos estabelecem a autorização por Cliente necessária para os módulos posteriores.

Após a conclusão desta Sprint, o próximo módulo será:

```text
Sprint 03 — Demandas
```