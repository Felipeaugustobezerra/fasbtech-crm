# Setup

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

Este documento descreve como configurar o ambiente de desenvolvimento do FASBtech CRM.

Todo novo desenvolvedor deverá conseguir executar o projeto localmente seguindo este documento e consultando as fontes técnicas oficiais quando necessário.

Este arquivo não substitui:

- arquitetura;
- migrations;
- estratégia de testes;
- regras de segurança.

Esses contratos permanecem definidos em seus documentos específicos.

---

# Pré-requisitos

Instalar previamente:

- Node.js 22 LTS ou superior;
- npm 10+;
- Git;
- Conta GitHub;
- Conta Supabase;
- Conta Vercel;
- VS Code recomendado.

---

# Clonar o Projeto

```bash
git clone <URL_DO_REPOSITORIO>

cd fasbtech-crm
```

---

# Instalar Dependências

```bash
npm install
```

---

# Variáveis de Ambiente

Criar:

```text
.env.local
```

Copiar o conteúdo de:

```text
.env.example
```

Preencher as variáveis obrigatórias atualmente utilizadas pelo projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Nunca versionar arquivos locais de ambiente como:

```text
.env.local
.env.development.local
.env.production.local
```

---

# Configuração do Supabase

Criar ou utilizar o projeto Supabase correspondente ao ambiente de desenvolvimento.

Após a criação:

1. obter a URL do projeto;
2. obter a Publishable Key;
3. preencher `.env.local`;
4. validar que a aplicação consegue inicializar os clientes Supabase;
5. aplicar as migrations necessárias para o estado atual do projeto.

---

# Banco de Dados

A primeira migration oficial do projeto é:

```text
Migration 001 — Foundation
```

Sua responsabilidade é criar exclusivamente a infraestrutura persistente da Foundation.

---

# Migration 001 — Foundation

As estruturas principais são:

```text
organizations
profiles
organization_members
activity_logs
```

Também poderá incluir, conforme o documento oficial:

- constraints;
- índices;
- funções auxiliares;
- triggers;
- Bootstrap;
- RPCs estritamente necessárias à Foundation;
- Row Level Security;
- Policies;
- Grants;
- configuração mínima de Storage privado quando versionada por SQL.

---

# Migration 001 não inclui

Não fazem parte da Migration 001:

```text
leads
clients
client_assignments
demands
financial_entries
financial_goals
contract_templates
contracts
```

Clientes e Client Assignments pertencem à Sprint 02.

Leads não fazem parte do MVP v3.0.

---

# Ordem das Migrations

Nenhuma migration posterior deverá ser aplicada antes das migrations anteriores das quais depende.

A fonte oficial para:

- ordem;
- numeração;
- responsabilidade;
- evolução do banco;

é:

```text
docs/04-database/Migrations
```

---

# Migration Executável

A documentação de uma migration não substitui seu arquivo executável.

Antes de considerar o banco configurado, verificar se a migration SQL correspondente existe no repositório e foi aplicada corretamente.

---

# Bootstrap

Após a Foundation estar aplicada e o utilizador autenticado, executar o fluxo de Bootstrap oficial quando o projeto estiver nesse estágio de implementação.

Referência:

```text
Bootstrap
```

O Bootstrap deverá inicializar:

```text
Profile

↓

Organization FASBtech

↓

Membership OWNER ACTIVE
```

---

# Contrato do Bootstrap

O Bootstrap deverá ser:

- autenticado;
- atômico;
- idempotente;
- seguro contra duplicações;
- seguro em chamadas concorrentes;
- independente de `organization_id` fornecido pelo navegador;
- independente de `user_id` fornecido pelo navegador.

---

# Bootstrap não significa execução única por código

Idempotência significa que chamadas repetidas não deverão produzir estado duplicado.

Portanto, o contrato correto não é:

```text
pode ser chamado somente uma vez
```

e sim:

```text
pode ser chamado novamente com segurança
sem duplicar a Foundation inicial
```

A autorização concreta para executar o Bootstrap pertence ao contrato oficial correspondente.

---

# Executar o Projeto

Modo desenvolvimento:

```bash
npm run dev
```

Aplicação local:

```text
http://localhost:3000
```

---

# Qualidade

Antes de considerar uma alteração pronta, executar os comandos aplicáveis disponíveis no projeto.

---

## Lint

```bash
npm run lint
```

---

## Typecheck

```bash
npm run typecheck
```

---

## Build

```bash
npm run build
```

Build deverá ser executado quando a alteração puder afetar:

- compilação;
- rotas;
- Server Components;
- Server Actions;
- configuração;
- produção.

---

# Testes

Utilizar somente scripts realmente definidos no:

```text
package.json
```

Os scripts existentes atualmente incluem:

```text
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e
npm run test:e2e:ui
```

---

# Unitários e Integração

O contrato atual utiliza:

```bash
npm run test
```

como executor Vitest dos testes incluídos na configuração correspondente.

A separação física entre:

```text
unit
integration
```

deverá seguir:

```text
Testing Strategy
```

---

# test:integration

Atualmente não assumir a existência de:

```bash
npm run test:integration
```

sem verificar primeiro:

```text
package.json
```

Caso futuramente seja criado um script dedicado, este Setup deverá ser atualizado.

---

# Cobertura

Executar:

```bash
npm run test:coverage
```

A política de cobertura pertence ao:

```text
Testing Strategy
```

Este documento não define thresholds próprios.

---

# E2E

Executar:

```bash
npm run test:e2e
```

Para execução interativa, quando necessário:

```bash
npm run test:e2e:ui
```

---

# Banco de Testes

Testes de:

- RLS;
- Bootstrap;
- RPCs;
- isolamento entre Organizations;
- autorização por Cliente;

deverão utilizar ambiente de banco isolado quando essa infraestrutura estiver implementada.

O contrato definitivo deverá especificar:

```text
provisionamento

↓

aplicação das migrations

↓

fixtures

↓

execução

↓

cleanup
```

A fonte oficial é:

```text
Testing Strategy
```

---

# Deploy

Aplicação:

```text
Vercel
```

Banco e serviços relacionados:

```text
Supabase
```

Todo deploy deverá seguir o fluxo oficial do projeto.

---

# Editor

Editor recomendado:

```text
VS Code
```

Extensões úteis:

- ESLint;
- Prettier;
- Tailwind CSS IntelliSense;
- Error Lens;
- GitLens.

Essas extensões são recomendações de produtividade e não requisitos arquiteturais.

---

# Fluxo Oficial

```text
Clonar Projeto

↓

npm install

↓

Criar .env.local

↓

Configurar Supabase

↓

Aplicar migrations existentes

↓

Executar Bootstrap quando aplicável

↓

npm run dev

↓

Desenvolvimento

↓

Lint

↓

Typecheck

↓

Testes aplicáveis

↓

Build quando aplicável

↓

Revisar alterações

↓

Commit

↓

Pull Request
```

---

# Documentação Obrigatória

Antes de iniciar uma implementação relevante:

1. `AGENTS.md`;
2. `Project Index`;
3. identificar a Sprint atual;
4. consultar PRD e MVP Scope quando houver impacto funcional;
5. consultar Functional Requirements e Business Rules;
6. consultar arquitetura correspondente;
7. consultar banco/RLS quando houver persistência;
8. consultar ADRs relacionadas;
9. consultar Design System quando houver interface;
10. implementar somente depois disso.

---

# Ordem de Entrada

A ordem oficial começa por:

```text
AGENTS.md

↓

Project Index
```

Isso deverá permanecer consistente com os demais documentos.

---

# Troubleshooting

## Projeto não inicia

Verificar:

- versão do Node.js;
- dependências instaladas;
- `.env.local`;
- variáveis obrigatórias;
- projeto Supabase acessível.

---

## Erro de autenticação

Verificar:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
- configuração de Auth;
- sessão autenticada;
- fluxo de login.

---

## Erro de permissão

Quando a Foundation estiver implementada, verificar:

- Migration 001 aplicada;
- Profile existente;
- Organization existente;
- Membership `ACTIVE`;
- role esperada;
- RLS ativa;
- Policies aplicadas.

---

## Bootstrap falha

Verificar:

- utilizador autenticado;
- Migration 001 aplicada;
- RPC/função de Bootstrap existente;
- Grants;
- contrato de autorização;
- ausência de conflito de dados;
- logs de erro do ambiente de desenvolvimento.

---

## Erro de RLS

Verificar:

- Membership;
- Organization;
- role;
- Policy correspondente;
- contexto autenticado;
- se a operação está utilizando Mutation direta ou RPC conforme a arquitetura.

---

## Falha em Testes de Integração

Verificar:

- Testing Strategy;
- ambiente isolado de banco;
- migrations aplicadas;
- fixtures;
- variáveis de ambiente;
- cleanup entre testes;
- scripts reais em `package.json`.

---

# Setup da Sprint Atual

A Sprint atual é:

```text
Sprint 01 — Foundation
```

O ambiente somente estará preparado para a Sprint 02 quando a Foundation possuir, no mínimo:

```text
Profile

Organization

Membership

Roles

Migration 001

Bootstrap

RLS

Policies

Activity Logs

Storage privado base

AppShell v3.0

Testes aplicáveis
```

---

# Não Criar Durante o Setup

Configurar o ambiente não significa criar antecipadamente módulos futuros.

Não criar durante o Setup:

```text
Clients
Client Assignments
Demandas
Financeiro
Contratos
```

antes da Sprint correspondente.

---

# Segurança

Nunca colocar em arquivos versionados:

- Service Role Key;
- senhas;
- tokens;
- secrets;
- cookies de sessão;
- credenciais de produção.

---

# Service Role

Service Role não deverá ser utilizada no fluxo normal de desenvolvimento da aplicação para contornar RLS.

Quando necessária para tarefas administrativas ou infraestrutura de teste, seu uso deverá seguir documentação específica e permanecer fora do código exposto ao cliente.

---

# Definition of Done

O ambiente será considerado corretamente configurado quando, conforme o estágio atual do projeto:

- dependências estiverem instaladas;
- `.env.local` estiver configurado;
- aplicação executar localmente;
- autenticação funcionar;
- migrations existentes puderem ser aplicadas;
- Migration 001 estiver aplicada quando implementada;
- Bootstrap funcionar quando implementado;
- RLS estiver ativa quando implementada;
- Policies estiverem aplicadas;
- lint estiver aprovado;
- typecheck estiver aprovado;
- testes aplicáveis estiverem aprovados;
- build estiver aprovado quando necessário;
- nenhum secret estiver exposto;
- a configuração estiver consistente com a Sprint atual.

---

# Fonte da Verdade Final

O Setup prepara o ambiente.

Ele não redefine o produto nem a arquitetura.

Para banco:

```text
Migrations
```

define a evolução.

Para Foundation:

```text
Migration 001
```

define a estrutura.

Para segurança:

```text
RLS
```

define autorização no banco.

Para testes:

```text
Testing Strategy
```

define o contrato.

Para execução:

```text
Sprint Atual
```

define o trabalho em andamento.