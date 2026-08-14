# Leads User Stories

## Projeto

FASBtech CRM

---

## Status

⚪ Arquivado — Não normativo para o MVP v3.0

---

## Versão

2.0 — Histórico

---

# Objetivo

Este documento preserva as User Stories históricas do antigo módulo de Leads do FASBtech CRM.

O módulo:

```text
Leads
```

não faz parte do MVP v3.0.

Portanto, as histórias descritas neste arquivo:

- não representam requisitos atuais;
- não deverão orientar implementação;
- não deverão gerar tabelas;
- não deverão gerar migrations;
- não deverão gerar rotas;
- não deverão gerar componentes;
- não deverão gerar RPCs;
- não deverão gerar testes funcionais atuais;
- não deverão alterar o Roadmap vigente.

---

# Status Normativo

Este documento deverá ser interpretado exclusivamente como:

```text
registro histórico
```

e nunca como:

```text
fonte da verdade do produto atual
```

As fontes normativas atuais são:

```text
PRD v3.0

MVP Scope v3.0

Functional Requirements v3.0

Business Rules v3.0

User Stories v3.0

Product Roadmap v3.0

Sprint correspondente
```

---

# Modelo Atual

O MVP v3.0 não utiliza o fluxo:

```text
Lead

↓

Conversão

↓

Cliente
```

Clientes são cadastrados diretamente.

A entidade operacional central atual é:

```text
Cliente
```

---

# Não Implementar

Não implementar a partir deste documento:

```text
LeadForm

LeadTable

LeadFilters

LeadStatusBadge

Pipeline

Próximo Contato

Conversão de Lead

Tabela leads

RPCs de Lead

Activity Logs específicos de Lead
```

---

# Regra para Agentes de IA

Agentes de IA deverão ignorar estas histórias durante implementação do CRM v3.0.

Se houver conflito entre este arquivo e documentação atual:

```text
documentação v3.0 prevalece
```

Não tentar reconciliar o modelo de Leads com o produto atual.

---

# Conteúdo Histórico

As histórias abaixo são preservadas somente para referência histórica do projeto.

---

# Story 01 — Cadastrar Lead

**Como** utilizador autenticado

**Quero** cadastrar um Lead

**Para** acompanhar uma oportunidade comercial.

## Critérios de Aceite

- Cadastro realizado com sucesso;
- Campos obrigatórios validados;
- E-mail válido quando informado;
- Valor estimado positivo quando informado;
- organization_id obtido automaticamente no servidor;
- Activity Log registrado;
- RLS respeitada.

---

# Story 02 — Visualizar Leads

**Como** utilizador autenticado

**Quero** visualizar todos os Leads da minha organização

**Para** acompanhar oportunidades.

## Critérios de Aceite

- Exibir apenas Leads ativos;
- Respeitar RLS;
- Exibir paginação;
- Exibir estado vazio quando necessário;
- Exibir estado de loading;
- Exibir estado de erro.

---

# Story 03 — Pesquisar Leads

**Como** utilizador

**Quero** pesquisar Leads

**Para** localizar rapidamente uma oportunidade.

## Critérios de Aceite

Pesquisa por:

- Nome;
- Empresa;
- E-mail;
- Telefone.

A pesquisa deverá ser realizada diretamente no banco de dados.

---

# Story 04 — Filtrar Leads

**Como** utilizador

**Quero** aplicar filtros

**Para** encontrar Leads específicos.

## Critérios de Aceite

Filtros por:

- Status;
- Origem;
- Serviço de Interesse;
- Próximo Contato;
- Data de Criação.

---

# Story 05 — Ordenar Leads

**Como** utilizador

**Quero** alterar a ordenação

**Para** visualizar os Leads da forma mais útil.

## Critérios de Aceite

Ordenação por:

- Nome;
- Empresa;
- Valor Estimado;
- Status;
- Data de Criação;
- Próximo Contato.

---

# Story 06 — Editar Lead

**Como** utilizador

**Quero** editar informações de um Lead

**Para** manter os dados atualizados.

## Critérios de Aceite

- Dados atualizados;
- updated_at atualizado automaticamente;
- Activity Log registrado;
- RLS respeitada.

---

# Story 07 — Arquivar Lead

**Como** utilizador

**Quero** arquivar um Lead

**Para** remover oportunidades encerradas da listagem principal.

## Critérios de Aceite

- Soft Delete;
- archived_at preenchido;
- Lead removido da listagem principal;
- Activity Log registrado;
- RLS respeitada.

---

# Story 08 — Paginar Leads

**Como** utilizador

**Quero** navegar entre páginas

**Para** visualizar grandes volumes de Leads.

## Critérios de Aceite

Permitir:

- 10 registros;
- 20 registros;
- 50 registros;
- 100 registros.

---

# Story 09 — Segurança

**Como** administrador do sistema

**Quero** garantir que os utilizadores visualizem apenas os Leads da própria organização

**Para** preservar a segurança dos dados.

## Critérios de Aceite

- RLS aplicada;
- organization_id obtido exclusivamente no servidor;
- Nenhum acesso entre organizações;
- Nenhum dado sensível enviado pelo cliente.

---

# Story 10 — Auditoria

**Como** administrador

**Quero** registrar todas as operações relevantes

**Para** manter rastreabilidade completa.

## Critérios de Aceite

Registrar Activity Logs para:

- Criação;
- Atualização;
- Arquivamento;
- Alteração de Status;
- Alteração do Próximo Contato;
- Alteração de Observações.

---

# Story 11 — Visualizar Detalhes do Lead

**Como** utilizador autenticado

**Quero** visualizar todos os detalhes de um Lead

**Para** consultar rapidamente todas as informações antes de realizar uma ação.

## Critérios de Aceite

- Exibir todas as informações do Lead;
- Exibir Status atual;
- Exibir Próximo Contato;
- Exibir Observações;
- Exibir histórico de atividades;
- Permitir navegar para edição;
- Respeitar RLS.

---

# Story 12 — Alterar Status do Lead

**Como** utilizador autenticado

**Quero** alterar o Status de um Lead

**Para** acompanhar corretamente o progresso da oportunidade.

## Critérios de Aceite

- Permitir apenas Status válidos;
- Atualizar imediatamente a interface;
- Registrar Activity Log;
- Respeitar RLS.

---

# Story 13 — Gerenciar Próximo Contato

**Como** utilizador autenticado

**Quero** definir ou alterar o próximo contato

**Para** organizar meu acompanhamento comercial.

## Critérios de Aceite

- Permitir selecionar uma data;
- Permitir remover a data;
- Atualizar o Lead;
- Registrar Activity Log;
- Respeitar RLS.

---

# Story 14 — Gerenciar Observações

**Como** utilizador autenticado

**Quero** adicionar ou editar observações

**Para** registrar informações relevantes sobre o Lead.

## Critérios de Aceite

- Salvar alterações;
- Atualizar automaticamente o Lead;
- Registrar Activity Log;
- Respeitar RLS.

---

# Story 15 — Visualizar Histórico

**Como** utilizador autenticado

**Quero** visualizar o histórico de atividades do Lead

**Para** acompanhar todas as alterações realizadas.

## Critérios de Aceite

- Listar Activity Logs relacionados ao Lead;
- Ordenar do mais recente para o mais antigo;
- Exibir utilizador responsável;
- Exibir data;
- Exibir ação realizada;
- Respeitar RLS.

---

# Definition of Done Histórica

No modelo anterior, uma User Story era considerada concluída quando:

- todos os critérios de aceite fossem aprovados;
- testes unitários fossem executados;
- testes de integração fossem executados;
- testes E2E críticos fossem executados quando aplicável;
- Activity Logs funcionassem corretamente;
- RLS fosse respeitada;
- Error Handling estivesse implementado;
- documentação estivesse atualizada.

Esta Definition of Done é preservada apenas como referência histórica.

Ela não define requisitos para o MVP v3.0.

---

# Referências Atuais

Para User Stories válidas do produto atual, utilizar:

```text
docs/02-requirements/User Stories
```

Para escopo:

```text
PRD v3.0

MVP Scope v3.0
```

Para execução:

```text
Sprint atual
```

---

# Fonte da Verdade Final

```text
Leads User Stories
        │
        └── histórico
             │
             └── não implementar

User Stories v3.0
        │
        └── fonte normativa atual
```

Portanto:

```text
histórico de Leads
≠
requisito ativo
```