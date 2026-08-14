# Testing Strategy

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

Definir a estratégia oficial de testes do FASBtech CRM.

Todo código deverá possuir testes compatíveis com:

- sua responsabilidade;
- seu risco;
- sua camada;
- sua criticidade;
- a Sprint correspondente.

A estratégia de testes existe para garantir:

- qualidade;
- segurança;
- regressão controlada;
- autorização correta;
- consistência de dados;
- evolução segura do sistema.

---

# Princípio

Nem todo código exige todos os tipos de teste.

O tipo de teste deverá ser escolhido conforme a responsabilidade da funcionalidade.

Exemplo:

```text
Helper puro
    ↓
Unitário

Service + banco
    ↓
Integração

Fluxo crítico do utilizador
    ↓
E2E
```

---

# Pirâmide de Testes

O projeto utiliza:

```text
             E2E
              ▲
        Integração
              ▲
         Unitários
```

A maior parte dos testes deverá permanecer nas camadas mais rápidas.

---

# Stack Oficial

Os testes utilizarão:

- Vitest;
- React Testing Library;
- Playwright.

Outras ferramentas poderão ser adicionadas somente quando houver necessidade real e documentação correspondente.

---

# Scripts Oficiais

Os scripts atualmente existentes no projeto são:

```json
{
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

A fonte real dos scripts continua sendo:

```text
package.json
```

Nunca assumir que um script existe apenas porque aparece em documentação antiga.

---

# npm run test

O contrato atual é:

```bash
npm run test
```

executando o conjunto de testes configurado no Vitest.

Esse conjunto poderá conter:

```text
tests/unit/

+

tests/integration/
```

conforme os testes forem implementados.

---

# test:integration

Atualmente não existe script dedicado:

```bash
npm run test:integration
```

Portanto, ele não deverá ser utilizado como requisito oficial.

Caso futuramente exista benefício real em separar a execução dos testes de integração, o script poderá ser criado e esta documentação deverá ser atualizada.

---

# Testes Unitários

Validam comportamento isolado.

Exemplos:

- Schemas Zod;
- helpers;
- formatters;
- mappers;
- validators;
- funções utilitárias;
- regras puras de domínio;
- transformações determinísticas.

---

# Características dos Unitários

Deverão ser:

- rápidos;
- determinísticos;
- isolados;
- independentes de rede;
- independentes de banco real.

---

# Banco nos Testes Unitários

Testes unitários não deverão acessar PostgreSQL ou Supabase real.

Quando uma dependência externa for necessária para isolar a unidade testada, utilizar mock apenas na fronteira apropriada.

---

# Testes de Componentes

React Testing Library poderá ser utilizada para validar componentes e interações de interface.

Exemplos:

- renderização;
- campos;
- validação visual;
- estados;
- ações;
- acessibilidade;
- interação por teclado.

Priorizar comportamento observável pelo utilizador.

Evitar testes excessivamente acoplados à implementação interna do componente.

---

# Testes de Integração

Validam a integração entre camadas e infraestrutura real ou equivalente.

Exemplos:

- Queries;
- Mutations;
- Services;
- Server Actions quando apropriado;
- RPCs;
- Bootstrap;
- PostgreSQL;
- RLS;
- Policies;
- Grants;
- Activity Logs;
- constraints;
- autorização.

---

# Banco de Testes

Testes que validem comportamento real do PostgreSQL deverão utilizar ambiente isolado.

Nunca executar testes destrutivos contra:

```text
produção
```

ou contra um banco compartilhado que possa conter dados reais da operação.

---

# Contrato do Ambiente de Integração

O fluxo deverá seguir conceitualmente:

```text
Ambiente isolado

↓

Banco limpo

↓

Aplicar migrations

↓

Criar fixtures

↓

Executar testes

↓

Validar resultados

↓

Cleanup
```

---

# Provisionamento

A tecnologia concreta de provisionamento do banco de integração ainda deverá ser definida durante a implementação da Foundation.

Pode futuramente utilizar uma estratégia compatível com Supabase/PostgreSQL que permita:

- isolamento;
- repetibilidade;
- execução local;
- execução em CI;
- aplicação das migrations reais.

Não congelar uma solução sem necessidade antes da implementação.

---

# Migrations nos Testes

Testes de banco deverão executar sobre o schema produzido pelas migrations reais do projeto.

Não manter um schema paralelo apenas para testes.

Fluxo:

```text
Migration 001

↓

estado real da Foundation

↓

testes
```

Posteriormente:

```text
Migration 001

↓

Migration 002

↓

...

↓

testes da Sprint correspondente
```

---

# Fixtures

Fixtures deverão representar apenas os dados mínimos necessários para cada cenário.

Exemplos futuros:

```text
Organization

OWNER

ADMIN

MEMBER

Membership ACTIVE

Membership inativa
```

A partir da Sprint 02:

```text
Client

Client Assignment
```

---

# Isolamento entre Testes

Um teste não deverá depender do estado deixado por outro.

Cada cenário deverá:

- preparar seu próprio estado;
- executar;
- validar;
- limpar ou restaurar o ambiente conforme a estratégia adotada.

---

# Dados Determinísticos

Evitar depender de:

- registros existentes manualmente;
- IDs fixos de ambientes pessoais;
- ordem de testes;
- horário externo sem controle;
- dados de produção.

---

# Testes da Foundation

A Sprint 01 deverá possuir testes compatíveis com:

```text
Auth

Profile

Organization

Membership

Roles

Bootstrap

RLS

Policies

Activity Logs

Storage privado base
```

quando cada parte for implementada.

---

# Bootstrap

Os testes deverão validar, conforme o contrato oficial:

- utilizador autenticado;
- utilizador não autenticado;
- criação de Profile;
- criação da Organization inicial;
- criação de Membership OWNER ACTIVE;
- atomicidade;
- idempotência;
- chamadas repetidas;
- concorrência quando aplicável;
- tentativa de spoofing de `user_id`;
- tentativa de spoofing de `organization_id`.

---

# Row Level Security

Os testes de RLS deverão validar tanto:

```text
acesso permitido
```

quanto:

```text
acesso negado
```

---

# Foundation — Cenários de RLS

Conforme a tabela testada, deverão ser considerados cenários como:

- utilizador não autenticado;
- utilizador autenticado;
- Profile válido;
- Membership `ACTIVE`;
- Membership inativa;
- Organization correta;
- Organization diferente;
- Organization arquivada/inativa quando a regra correspondente existir;
- OWNER;
- ADMIN;
- MEMBER.

---

# Sprint 02 — Autorização por Cliente

Quando Clientes forem implementados, deverão existir testes para:

```text
OWNER
→ acesso aos Clientes da própria Organization

MEMBER com Client Assignment
→ acesso permitido

MEMBER sem Client Assignment
→ acesso negado
```

Também deverão validar acesso direto por:

- ID;
- URL;
- Query;
- relacionamento;
- Activity Logs;
- documentos relacionados.

---

# ADMIN

Os testes de ADMIN deverão seguir exatamente as permissões definidas nos documentos oficiais.

Não inventar restrições ou privilégios durante os testes.

---

# Isolamento entre Organizations

Mesmo que o MVP operacional utilize inicialmente uma Organization da FASBtech, os testes de segurança deverão validar que registros pertencentes a outra Organization não sejam acessíveis quando o modelo exigir isolamento.

Isso protege o contrato arquitetural sem transformar o MVP em SaaS multiempresa.

---

# RPCs

RPCs deverão possuir testes de integração quando forem utilizadas.

---

# RPC SECURITY DEFINER

Conforme aplicável, validar:

- autenticação;
- Profile;
- Membership;
- Organization;
- Role;
- Client Assignment;
- tentativa de spoofing;
- operação autorizada;
- operação não autorizada;
- atomicidade;
- rollback;
- Activity Log;
- Grants.

---

# Grants

Funções privilegiadas deverão possuir testes ou verificações adequadas para garantir que:

```text
PUBLIC
```

e:

```text
anon
```

não possuam `EXECUTE` quando isso for proibido pelo contrato.

Também deverá ser validado o acesso de:

```text
authenticated
```

quando permitido.

---

# Activity Logs

A infraestrutura central:

```text
activity_logs
```

deverá possuir testes específicos.

---

# Activity Logs — Permissões

Validar:

- INSERT direto negado para utilizador autenticado;
- UPDATE negado;
- DELETE negado;
- leitura apenas conforme autorização;
- ausência de Data Leakage.

---

# Activity Logs — Operações Auditadas

Quando determinada operação exigir auditoria atômica, validar:

```text
Mutação

+

Activity Log
```

na mesma operação.

---

# Falha de Auditoria

Quando o Activity Log for obrigatório e a operação de auditoria falhar:

```text
Mutação principal também deverá falhar
```

Nenhum estado parcial deverá permanecer.

---

# Operações sem Auditoria Obrigatória

Nem toda escrita necessita Activity Log.

Os testes deverão seguir a regra definida em:

- Business Rules;
- Functional Requirements;
- Activity Logs;
- Sprint correspondente.

Não criar testes que obriguem auditoria onde o domínio não exige.

---

# Mutations

Escritas simples protegidas por RLS deverão possuir testes de integração quando forem críticas para:

- autorização;
- isolamento;
- integridade;
- constraints.

---

# Queries

Queries críticas deverão validar:

- filtros;
- ordenação;
- paginação;
- autorização;
- ausência de Data Leakage;
- comportamento com coleção vazia.

---

# Server Actions

Não é necessário testar todas as Server Actions isoladamente se seu comportamento já estiver adequadamente coberto por:

```text
Service

+

Integração

+

E2E
```

Criar testes específicos quando a Action possuir comportamento próprio relevante, como:

- validação de entrada;
- transformação;
- tratamento de erro;
- redirecionamento.

---

# Services

Services deverão possuir testes quando concentrarem:

- regras de negócio;
- decisões entre Mutation e RPC;
- validações de domínio;
- coordenação de operações.

---

# Testes E2E

Validam fluxos completos do ponto de vista do utilizador.

Deverão ser reservados principalmente para fluxos críticos.

---

# Foundation — E2E

Exemplos atuais:

- Login;
- sessão persistida;
- acesso a rota protegida;
- Logout;
- redirecionamento de utilizador não autenticado;
- Dashboard inicial.

---

# Sprint 02 — E2E

Quando Clientes & Acessos forem implementados, poderão incluir:

- criar Cliente;
- visualizar Cliente;
- editar Cliente;
- arquivar Cliente;
- pesquisar;
- filtrar;
- ordenar;
- paginar;
- associar utilizador ao Cliente;
- remover associação;
- negar acesso direto de MEMBER não associado.

---

# Sprint 03 — E2E

Quando Demandas forem implementadas, poderão incluir:

- criar Demanda;
- editar Demanda;
- alterar Status;
- alterar Prioridade;
- gerir responsáveis;
- visualizar prazo;
- validar acesso conforme Cliente.

---

# Sprint 04 — E2E

Quando Financeiro for implementado, priorizar fluxos críticos como:

- registrar Entrada;
- registrar Saída;
- visualizar saldo;
- validar meta;
- impedir acesso não autorizado.

---

# Sprint 05 — E2E

Quando Contratos forem implementados:

- criar a partir de Template;
- selecionar Cliente;
- revisar;
- gerar;
- preservar snapshot;
- enviar quando aplicável;
- upload de cópia assinada;
- marcar `SIGNED`.

---

# Sprint 06 — E2E

Quando o Dashboard consolidado for implementado:

- carregar indicadores autorizados;
- ocultar informações financeiras sem autorização;
- navegar a partir de alertas;
- não apresentar dados de Clientes não autorizados.

---

# E2E não é Obrigatório para Toda Alteração

Uma alteração pequena não precisa necessariamente adicionar novo teste E2E.

Exemplo:

```text
ajuste visual local sem alteração de comportamento
```

poderá ser validado por:

- teste de componente quando necessário;
- lint;
- typecheck;
- revisão visual.

---

# Testes E2E Determinísticos

E2E não deverá depender de dados pré-existentes manualmente.

Sempre que possível:

```text
preparar estado

↓

executar fluxo

↓

validar

↓

limpar
```

---

# Cobertura

O objetivo inicial é manter boa cobertura principalmente nas partes críticas do domínio.

---

# Meta Inicial

Referência:

```text
Unitários → objetivo de 80%

Integração → funcionalidades críticas

E2E → fluxos principais
```

---

# 80% não é Threshold Bloqueador Atual

O valor:

```text
80%
```

é atualmente uma meta de qualidade.

Não existe obrigação de falhar o comando:

```bash
npm run test:coverage
```

automaticamente abaixo desse valor enquanto o `vitest.config.ts` não possuir threshold oficial.

---

# Alteração para Threshold

Se futuramente os 80% passarem a ser requisito bloqueador:

1. atualizar esta documentação;
2. configurar o threshold no Vitest;
3. validar o impacto no CI.

Documentação e configuração deverão permanecer sincronizadas.

---

# Cobertura não Substitui Qualidade

Não criar testes apenas para aumentar percentagem.

Priorizar:

- regras de negócio;
- autorização;
- RLS;
- atomicidade;
- tratamento de erro;
- fluxos críticos.

---

# Organização

Estrutura atual prevista:

```text
tests/
├── unit/
├── integration/
├── e2e/
├── fixtures/
└── mocks/
```

A estrutura física deverá acompanhar o repositório real.

---

# Convenções de Nomes

Exemplos:

```text
profile.schema.test.ts

bootstrap.integration.test.ts

membership-authorization.integration.test.ts

login.e2e.spec.ts
```

A partir da Sprint 02:

```text
client.service.test.ts

client-access.integration.test.ts

create-client.e2e.spec.ts
```

---

# Mocks

Mocks deverão ser utilizados com cuidado.

Utilizar para:

- dependências externas;
- isolamento de unidades;
- APIs que não façam parte do comportamento que está sendo integrado.

---

# Não Mockar RLS

Um teste cujo objetivo seja validar RLS deverá utilizar PostgreSQL/Supabase real de teste.

Mockar a resposta esperada não valida segurança.

---

# Não Mockar RPC em Teste de RPC

Se o teste pretende validar:

- atomicidade;
- autorização;
- Grants;
- Activity Log;

deverá executar a função real contra o banco de integração.

---

# Acessibilidade

Componentes interativos deverão possuir testes proporcionais à sua complexidade.

Podem validar:

- navegação por teclado;
- Focus;
- Labels;
- nomes acessíveis;
- estados de erro;
- Dialogs;
- Sheets;
- formulários.

Testes automatizados não substituem completamente revisão de acessibilidade.

---

# Responsividade

Testes E2E poderão validar fluxos críticos em diferentes viewports quando houver risco real de regressão.

Não é necessário duplicar toda a suíte para cada resolução.

Priorizar:

```text
Desktop

+

Mobile
```

nos fluxos onde o comportamento realmente muda.

---

# Segurança

Testes de segurança possuem prioridade alta.

Nenhuma funcionalidade protegida deverá ser considerada concluída apenas porque funciona no cenário autorizado.

Também deverá existir validação do cenário negado.

Princípio:

```text
Happy Path

+

Denied Path
```

---

# Data Leakage

Testes deverão garantir que utilizadores não autorizados não recebam dados proibidos.

Não basta verificar que a UI esconde determinado elemento.

Validar também:

- Query;
- resposta;
- banco;
- acesso direto.

---

# CI

Fluxo esperado para alterações relevantes:

```text
npm run lint

↓

npm run typecheck

↓

npm run test

↓

npm run test:e2e quando aplicável

↓

npm run build
```

---

# E2E no CI

A execução de E2E depende de:

- ambiente configurado;
- aplicação disponível;
- banco de teste;
- fixtures necessárias.

A configuração concreta deverá permanecer sincronizada com Playwright e infraestrutura de CI.

---

# Alterações Pequenas

Nem toda alteração precisa executar toda a suíte localmente se ela não afetar determinadas camadas.

Antes do Merge, porém, os checks obrigatórios definidos pelo CI deverão estar aprovados.

---

# Build

Build deverá ser executado para alterações que possam afetar:

- compilação;
- rotas;
- Server Components;
- Server Actions;
- configuração;
- produção.

O CI poderá tratá-lo como verificação obrigatória global.

---

# Testes por Sprint

## Sprint 01

Prioridade:

```text
Auth
Session
Bootstrap
Membership
Roles
RLS
Activity Logs
Foundation
```

---

## Sprint 02

Prioridade:

```text
Clients
Client Assignments
MEMBER authorization
Isolation
Direct URL access
Activity Logs
```

---

## Sprint 03

Prioridade:

```text
Demands
Assignees
Status
Priority
Deadlines
Client authorization
```

---

## Sprint 04

Prioridade:

```text
Financial Entries
Balance
Goals
Sensitive permissions
```

---

## Sprint 05

Prioridade:

```text
Contracts
Snapshot
Status
Documents
Sensitive permissions
```

---

## Sprint 06

Prioridade:

```text
Authorized aggregations
Dashboard
Alerts
Deadlines
Activity visibility
```

---

# Funcionalidades Fora do MVP

Não criar testes funcionais para módulos inexistentes apenas para preparar o futuro.

Atualmente fora do MVP:

```text
Leads

Projects como módulo independente

Product Registry operacional

Agenda

Domínios

Hospedagens
```

---

# Checklist de Teste

Antes de concluir uma funcionalidade verificar:

- [ ] Existem regras puras que precisam de teste unitário?
- [ ] Existe integração com banco?
- [ ] Existe RLS?
- [ ] Existe cenário de acesso negado?
- [ ] Existe RPC?
- [ ] Existe auditoria obrigatória?
- [ ] Existe risco de estado parcial?
- [ ] Existe fluxo crítico que merece E2E?
- [ ] Existe comportamento acessível a validar?
- [ ] Os testes são determinísticos?
- [ ] O ambiente está isolado?
- [ ] Não existe dependência de dados de produção?

---

# Regras

Nunca:

- executar testes destrutivos em produção;
- utilizar banco pessoal compartilhado como ambiente determinístico de CI;
- depender de ordem entre testes;
- considerar UI escondida como segurança;
- mockar RLS em teste cujo objetivo seja validar RLS;
- mockar RPC em teste cujo objetivo seja validar RPC;
- utilizar `test:integration` sem o script existir;
- exigir Activity Log para toda escrita sem regra correspondente;
- criar testes de módulos futuros antecipadamente.

Sempre:

- validar Happy Path;
- validar Denied Path em operações protegidas;
- utilizar migrations reais;
- utilizar banco isolado para integração;
- manter fixtures controladas;
- limpar o estado entre cenários;
- seguir ADR-002;
- seguir RLS;
- seguir Activity Logs;
- verificar os scripts reais do projeto.

---

# Relação com Outros Documentos

Este documento deverá permanecer sincronizado com:

- AGENTS.md;
- Setup;
- PRD;
- Functional Requirements;
- Business Rules;
- Module Architecture;
- ADR-002;
- RLS;
- Activity Logs;
- Migration 001;
- Migrations;
- Sprint atual;
- Accessibility.

---

# Definition of Done

Uma funcionalidade somente será considerada adequadamente testada quando, conforme aplicável:

- possuir testes unitários para regras isoladas;
- possuir testes de integração para comportamento entre camadas;
- possuir testes reais de RLS quando houver autorização no banco;
- possuir testes de RPC quando houver RPC;
- validar Activity Logs quando obrigatórios;
- validar atomicidade quando necessária;
- possuir E2E para fluxo crítico quando aplicável;
- possuir cenário autorizado;
- possuir cenário negado;
- evitar Data Leakage;
- utilizar ambiente isolado para banco;
- utilizar migrations reais;
- possuir testes determinísticos;
- lint estiver aprovado;
- typecheck estiver aprovado;
- testes aplicáveis estiverem aprovados;
- build estiver aprovado quando aplicável;
- permanecer consistente com a Sprint correspondente.

---

# Fonte da Verdade Final

A estratégia oficial é:

```text
Unitário
    ↓
regra isolada

Integração
    ↓
camadas + banco + segurança

E2E
    ↓
fluxo crítico real
```

Para segurança:

```text
permitido

+

negado
```

Para banco:

```text
ambiente isolado

↓

migrations reais

↓

fixtures

↓

testes

↓

cleanup
```

E para cobertura:

```text
80%
→ meta atual

não threshold bloqueador
até existir configuração oficial correspondente
```