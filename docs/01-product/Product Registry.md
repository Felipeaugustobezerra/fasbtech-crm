# Product Registry

## Projeto

FASBtech

---

## Status

🟡 Estratégico — Não normativo para o CRM v3.0

---

## Versão

3.0

---

# Objetivo

Este documento representa o catálogo estratégico de produtos e serviços comercializados pela FASBtech.

Ele poderá ser utilizado como referência comercial para:

- Website;
- propostas;
- contratos;
- materiais comerciais;
- posicionamento;
- planejamento de novos serviços;
- agentes de IA quando a tarefa estiver relacionada ao catálogo comercial da FASBtech.

Este documento **não define o modelo de dados, módulos, entidades ou Sprints do FASBtech CRM v3.0**.

---

# Relação com o FASBtech CRM

No MVP v3.0 não existe módulo operacional:

```text
Product Registry
```

Também não existe Sprint destinada a implementar cadastro de produtos.

A Sprint 05 oficial do CRM é:

```text
Sprint 05 — Contratos
```

Portanto, este documento não deverá ser utilizado para:

- criar tabelas de produtos no CRM;
- criar entidades de Product Registry;
- criar rotas de produtos;
- criar componentes de produtos;
- criar migrations;
- alterar o Data Model;
- orientar implementação de Sprint.

---

# Uso Estratégico

O catálogo poderá continuar sendo utilizado pela FASBtech independentemente do CRM.

Exemplo:

```text
FASBtech
│
├── Website
├── Propostas
├── Contratos
├── Materiais comerciais
└── Product Registry estratégico
```

O CRM poderá armazenar futuramente informações relacionadas a serviços contratados somente após existir decisão formal no:

```text
PRD

+

MVP Scope

+

Roadmap
```

---

# Regra de Não Antecipação

A existência de um produto neste documento:

```text
não autoriza
```

automaticamente a criação de:

- módulo correspondente no CRM;
- entidade de banco;
- tabela;
- enum;
- relacionamento;
- formulário;
- feature;
- Migration;
- Sprint.

Qualquer funcionalidade desse tipo dependerá de alteração formal da documentação normativa do CRM.

---

# Fonte da Verdade

Para o catálogo comercial da FASBtech:

```text
Product Registry
```

pode funcionar como referência estratégica.

Para o FASBtech CRM:

```text
PRD v3.0

MVP Scope v3.0

Functional Requirements v3.0

Business Rules v3.0

Data Model v3.0

Roadmap v3.0
```

permanecem como fontes normativas.

Em caso de conflito sobre o CRM:

```text
a documentação normativa do CRM prevalece
```

---

# Objetivos do Product Registry

Centralizar informações estratégicas sobre os produtos e serviços da FASBtech.

Garantir:

- padronização comercial;
- governança;
- reutilização;
- documentação;
- alinhamento entre posicionamento, Website e materiais comerciais.

---

# Governança do Catálogo

Novos produtos ou serviços estratégicos poderão ser registrados neste documento antes de serem utilizados comercialmente.

Sempre que um produto sofrer alteração significativa, avaliar atualização de:

1. Product Registry;
2. Website;
3. propostas;
4. contratos;
5. materiais comerciais;
6. Product Portfolio quando aplicável.

O PRD do FASBtech CRM somente deverá ser alterado quando a mudança também representar uma alteração real no produto CRM.

---

# Estrutura Oficial do Produto

Todo produto deverá possuir as seguintes seções quando aplicáveis.

## Identificação

- Product ID
- Nome
- Categoria
- Status

---

## Comercial

- ICP
- Persona
- Problema Resolvido
- Solução Oferecida
- Proposta de Valor

---

## Financeiro

- Preço de Referência
- Modelo de Cobrança

---

## Entregáveis

- Escopo
- O que está incluso
- O que não está incluso

---

## Processo

- Etapas
- Prazo Médio
- Critérios de Aceite

---

## Indicadores

- Ticket Médio
- Tempo Médio de Entrega
- Conversão
- Satisfação do Cliente

---

## Evolução

- Versão Atual
- Última Revisão
- Melhorias Futuras

---

# Categorias Estratégicas Atuais

- Website
- Sistema Web
- CRM
- Dashboard
- IA
- Automação
- Consultoria
- SEO
- Manutenção

Alterações nessas categorias pertencem ao catálogo comercial e não alteram automaticamente o domínio do FASBtech CRM.

---

# Status do Catálogo

- ACTIVE
- PLANNED
- BETA
- DEPRECATED
- ARCHIVED

Esses Status pertencem exclusivamente ao catálogo estratégico.

Não deverão ser reutilizados automaticamente como enums ou Status de entidades do CRM.

---

# Produtos Oficiais