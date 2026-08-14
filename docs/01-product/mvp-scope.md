# MVP Scope

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

Este documento define o escopo funcional do MVP (Minimum Viable Product) do FASBtech CRM.

Seu objetivo é estabelecer exatamente quais funcionalidades deverão ser entregues antes da evolução do produto para versões posteriores.

O MVP será utilizado inicialmente pela própria FASBtech para centralizar sua operação e validar:

- processos internos;
- arquitetura;
- segurança;
- experiência de utilização;
- gestão operacional;
- gestão financeira;
- gestão documental;
- controle de acessos.

A evolução para um produto SaaS poderá ser avaliada futuramente, mas não faz parte deste MVP.

---

# Hierarquia da Documentação

Este documento é um recorte funcional do PRD.

A precedência funcional da documentação do projeto é:

1. PRD
2. MVP Scope
3. Product Roadmap
4. Functional Requirements
5. Business Rules
6. User Stories
7. Sprints

Em caso de conflito funcional, prevalecerá o documento de maior prioridade.

O PRD deverá ser atualizado antes de qualquer alteração estrutural no escopo do MVP.

---

# Objetivos do MVP

O MVP deverá permitir que a FASBtech:

- centralize informações dos Clientes;
- organize Demandas de serviços;
- controle responsáveis e prazos;
- centralize documentos;
- controle entradas e saídas financeiras;
- acompanhe saldo em caixa;
- acompanhe metas mensais;
- gere e gerencie contratos;
- controle utilizadores internos;
- restrinja funcionários aos Clientes autorizados;
- acompanhe indicadores operacionais;
- reduza dependência de planilhas e ferramentas dispersas.

---

# Estrutura Operacional do MVP

O domínio principal do MVP será:

```text
Dashboard

Demandas

Financeiro

Contratos

Clientes

Acessos
```

Clientes serão a entidade operacional central.

Os demais módulos deverão relacionar-se aos Clientes quando o domínio exigir.

Estrutura conceitual:

```text
Organization
│
├── Utilizadores
│
├── Clientes
│   │
│   ├── Demandas
│   ├── Contratos
│   ├── Movimentações Financeiras
│   ├── Documentos
│   └── Utilizadores autorizados
│
├── Metas Financeiras
├── Notificações
└── Activity Logs
```

---

# Escopo do MVP

# Fundação

Implementar:

- Login;
- Logout;
- Sessão;
- Profiles;
- Organization;
- Memberships;
- Roles;
- RLS base;
- Activity Logs base;
- armazenamento privado de documentos;
- AppShell;
- Sidebar;
- Header;
- Page Header;
- menu principal;
- Dashboard inicial;
- configurações essenciais.

---

## Organization

O MVP utilizará inicialmente:

```text
1 Organization
```

representando a FASBtech.

A arquitetura poderá permanecer preparada para multiempresa, mas múltiplas Organizations em produção não fazem parte do MVP.

---

## Utilizadores

O MVP deverá suportar múltiplos utilizadores internos.

Papéis iniciais:

```text
OWNER
ADMIN
MEMBER
```

O sistema não será limitado a um único utilizador.

---

# Clientes

Implementar:

- cadastro;
- listagem;
- pesquisa;
- filtros;
- ordenação;
- paginação;
- visualização;
- edição;
- arquivamento;
- dados de contato;
- dados empresariais;
- dados fiscais quando necessários;
- endereço quando necessário;
- observações;
- documentos relacionados;
- histórico de atividades;
- associação de funcionários autorizados.

Clientes serão a entidade operacional central do sistema.

---

## Visão do Cliente

A página de detalhes de um Cliente deverá permitir acessar informações relacionadas a:

```text
Visão Geral

Demandas

Contratos

Financeiro

Documentos

Acessos

Atividades
```

As funcionalidades poderão ser disponibilizadas progressivamente conforme as respectivas Sprints forem implementadas.

---

# Acessos

Implementar:

- visualização de utilizadores;
- gestão de Memberships;
- roles;
- associação entre funcionários e Clientes;
- controle de autorização;
- isolamento de dados;
- restrição de acesso a Clientes não autorizados.

---

## OWNER

Possui acesso administrativo completo à Organization.

---

## ADMIN

Possui acesso administrativo conforme permissões definidas pelo sistema.

---

## MEMBER

Utilizador operacional.

Um MEMBER deverá acessar apenas os Clientes aos quais estiver explicitamente associado, respeitando também as permissões do módulo acessado.

---

## Restrição por Cliente

A proteção não poderá existir apenas na interface.

Um utilizador não autorizado deverá ser impedido de acessar determinado Cliente através de:

- interface;
- URL direta;
- Query;
- Server Action;
- RPC;
- banco de dados;
- documentos privados.

---

## Informações Sensíveis

A associação de um MEMBER a um Cliente não deverá conceder automaticamente acesso irrestrito a:

- Financeiro;
- Contratos;
- configurações administrativas.

Essas áreas deverão respeitar as regras de autorização definidas pelo sistema.

---

# Demandas

Implementar:

- cadastro;
- listagem;
- pesquisa;
- filtros;
- ordenação;
- paginação;
- visualização;
- edição;
- arquivamento;
- associação ao Cliente;
- descrição;
- responsáveis;
- data de início;
- prazo;
- prioridade;
- status;
- tags;
- observações;
- documentos;
- histórico de atividades.

Uma Demanda representa uma unidade de trabalho ou serviço realizado para um Cliente.

---

## Responsáveis

Uma Demanda poderá possuir:

```text
1 ou mais responsáveis
```

Os responsáveis deverão ser utilizadores autorizados conforme as regras do sistema.

---

## Status

O status deverá utilizar valores controlados.

Domínio inicial:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

Status representa o workflow operacional.

Tags não substituem Status.

---

## Prioridade

Domínio inicial:

```text
LOW
MEDIUM
HIGH
URGENT
```

Prioridade é independente de Status.

---

## Tags

Tags serão utilizadas para classificação complementar.

Exemplos:

```text
SEO
Landing Page
Design
Aguardando conteúdo
Cliente VIP
```

Tags:

- não representam Status;
- não representam Prioridade;
- não deverão controlar regras essenciais de workflow.

---

## Prazos

O sistema deverá identificar:

- Demandas dentro do prazo;
- Demandas próximas do prazo;
- Demandas atrasadas.

---

## Notificações

O MVP deverá permitir notificações internas relacionadas a prazos de Demandas.

A verificação de prazo deverá ocorrer no backend.

Não depender exclusivamente do navegador aberto para detectar vencimentos.

Notificações externas por:

- push;
- WhatsApp;
- SMS;

não fazem parte do MVP.

---

# Documentos

Implementar uma infraestrutura centralizada de documentos.

Não criar sistemas independentes de armazenamento para cada módulo.

---

## Documentos poderão ser associados a

- Clientes;
- Demandas;
- Contratos;
- movimentações financeiras.

---

## Exemplos

- briefing;
- template;
- protótipo;
- contrato;
- contrato assinado;
- comprovante;
- nota fiscal;
- documento enviado pelo Cliente;
- material relacionado à Demanda.

---

## Segurança

Os arquivos deverão utilizar armazenamento privado.

O acesso deverá respeitar:

- Organization;
- utilizador autenticado;
- Cliente relacionado;
- permissões aplicáveis.

Um utilizador sem acesso ao Cliente não deverá conseguir acessar seus documentos.

---

# Financeiro

Implementar gestão financeira operacional da FASBtech.

O módulo não pretende substituir software contábil ou fiscal.

---

## Dashboard Financeiro

Implementar indicadores como:

- entradas do mês;
- saídas do mês;
- saldo em caixa;
- progresso da meta mensal.

---

## Entradas

Permitir registrar:

- Cliente;
- descrição;
- categoria;
- valor;
- data;
- vencimento quando aplicável;
- data de pagamento;
- status;
- tipo de pagamento;
- observações;
- documentos anexados.

---

## Saídas

Permitir registrar:

- descrição;
- categoria;
- valor;
- data;
- vencimento quando aplicável;
- data de pagamento;
- status;
- observações;
- documentos anexados.

Uma saída não precisa estar relacionada a um Cliente.

---

## Pagamento

O MVP deverá distinguir:

```text
ONE_TIME
RECURRING
```

---

## Recorrência

O MVP deverá permitir identificar que determinada receita possui natureza recorrente.

Não faz parte do MVP:

- cobrança automática;
- geração automática de pagamentos;
- gateway de pagamento;
- débito automático.

---

## Saldo em Caixa

O saldo deverá considerar apenas movimentações efetivamente realizadas.

Valores previstos ou pendentes não deverão alterar o saldo realizado.

---

## Categorias

Entradas e saídas deverão permitir categorização.

As categorias deverão permitir organização e consolidação financeira.

---

## Meta Mensal

Implementar:

- mês;
- ano;
- valor da meta.

O progresso deverá ser calculado utilizando a receita efetivamente recebida no período.

---

## Anexos

Movimentações poderão possuir documentos como:

- comprovantes;
- notas fiscais;
- recibos;
- documentos relacionados.

Esses anexos deverão utilizar a infraestrutura central de documentos.

---

# Contratos

Implementar um sistema de geração e gestão de contratos.

---

## Templates

O sistema deverá possuir modelos de contrato reutilizáveis.

Os templates servirão como base para geração de contratos específicos para Clientes.

---

## Fluxo

```text
Selecionar Cliente

↓

Selecionar Template

↓

Carregar dados existentes

↓

Preencher dados adicionais

↓

Revisar

↓

Gerar documento

↓

Gerar PDF

↓

Salvar

↓

Enviar por e-mail
```

---

## Dados do Cliente

Quando disponíveis, os dados existentes no cadastro do Cliente deverão ser reutilizados.

Isso evita duplicação de preenchimento.

---

## Identificação Fiscal

O sistema deverá suportar diferentes tipos de identificação.

Exemplos:

```text
CPF
CNPJ
NIF
VAT
```

A estrutura não deverá ser limitada exclusivamente ao CPF.

---

## Snapshot

Quando um contrato for gerado, deverá ser preservado um snapshot dos dados utilizados.

Alterações posteriores no cadastro do Cliente não poderão modificar um contrato já gerado.

---

## Status

Domínio inicial:

```text
DRAFT
GENERATED
SENT
SIGNED
CANCELED
```

---

## PDF

O contrato final deverá poder ser gerado em PDF.

A cópia gerada deverá ser armazenada no sistema.

---

## Envio

O contrato deverá poder ser enviado ao Cliente por e-mail.

A versão enviada deverá permanecer preservada.

---

## Contrato Assinado

No MVP, a assinatura ocorrerá externamente.

Fluxo:

```text
Contrato enviado

↓

Cliente assina externamente

↓

Cópia assinada é recebida

↓

Upload no CRM

↓

Status SIGNED
```

---

# Dashboard

O sistema possuirá duas fases de Dashboard.

---

## Dashboard Inicial

Durante a Foundation será implementada a estrutura visual necessária para:

- navegação;
- AppShell;
- estados;
- componentes base.

Não será necessário simular indicadores sem fonte real de dados.

---

## Dashboard Consolidado

Após implementação dos módulos operacionais, o Dashboard deverá consolidar dados reais de:

- Financeiro;
- Demandas;
- Clientes;
- Contratos;
- Activity Logs.

---

## Indicadores Financeiros

- saldo em caixa;
- entradas do mês;
- saídas do mês;
- progresso da meta mensal.

---

## Indicadores Operacionais

- Demandas abertas;
- Demandas em andamento;
- Demandas atrasadas;
- Demandas próximas do prazo;
- Demandas concluídas.

---

## Operação

Também poderá apresentar:

- próximos prazos;
- alertas;
- atividades recentes.

---

## Reuniões

Próximas reuniões não fazem parte do MVP enquanto não existir uma fonte oficial de dados para reuniões.

Nenhum dado fictício deverá ser criado apenas para alimentar o Dashboard.

---

# Activity Logs

Operações relevantes deverão ser auditadas quando definido pela arquitetura.

Os logs deverão permitir identificar:

- utilizador;
- Organization;
- entidade;
- ação;
- data.

Activity Logs não substituem logs técnicos da aplicação.

---

# Não Faz Parte do MVP

Não serão implementados nesta versão:

- pipeline completo de Leads;
- módulo independente de Projetos;
- Product Registry operacional;
- Agenda completa;
- gestão estruturada de reuniões;
- aplicativo Mobile nativo;
- SaaS multiempresa em produção;
- múltiplas Organizations por utilizador;
- assinatura eletrônica integrada;
- sistema próprio de assinatura digital;
- processamento de pagamentos;
- gateway de pagamento;
- cobrança automática;
- emissão fiscal automática;
- contabilidade completa;
- API Pública;
- Billing SaaS;
- Marketplace;
- IA generativa;
- n8n;
- automações externas avançadas;
- Portal do Cliente;
- integrações bancárias;
- WhatsApp automatizado;
- SMS;
- push notification nativo.

Essas funcionalidades somente deverão ser implementadas quando aprovadas em versões futuras do PRD e Roadmap.

---

# Sprints do MVP

A implementação deverá ocorrer progressivamente.

---

## Sprint 01 — Foundation

Objetivo:

Criar a base segura do sistema.

Inclui:

- autenticação;
- Organization;
- Profiles;
- Memberships;
- roles;
- RLS base;
- Activity Logs base;
- Storage privado;
- AppShell;
- menu principal;
- Dashboard inicial.

---

## Sprint 02 — Clientes & Acessos

Objetivo:

Criar a entidade central do sistema e o modelo de autorização operacional.

Inclui:

- Clientes;
- utilizadores;
- associação utilizador ↔ Cliente;
- roles;
- autorização;
- restrição por Cliente;
- testes de isolamento.

---

## Sprint 03 — Demandas

Objetivo:

Centralizar o trabalho executado pela FASBtech.

Inclui:

- Demandas;
- responsáveis;
- status;
- prioridade;
- tags;
- datas;
- prazos;
- documentos;
- notificações;
- Activity Logs aplicáveis.

---

## Sprint 04 — Financeiro

Objetivo:

Centralizar a gestão financeira operacional.

Inclui:

- entradas;
- saídas;
- categorias;
- saldo;
- pagamentos;
- recorrência informativa;
- metas;
- documentos financeiros.

---

## Sprint 05 — Contratos

Objetivo:

Automatizar a criação e gestão de contratos.

Inclui:

- templates;
- formulário;
- preenchimento de dados;
- snapshot;
- geração;
- PDF;
- envio por e-mail;
- armazenamento;
- contrato assinado;
- status.

---

## Sprint 06 — Dashboard

Objetivo:

Consolidar indicadores produzidos pelos módulos anteriores.

Inclui:

- indicadores financeiros;
- indicadores operacionais;
- prazos;
- alertas;
- atividades recentes.

---

# Critérios de Sucesso

O MVP será considerado validado quando a FASBtech conseguir realizar no sistema sua operação essencial sem depender de planilhas paralelas para os processos contemplados pelo escopo.

Deverá ser possível:

- cadastrar e gerir Clientes;
- associar funcionários a Clientes;
- impedir acesso indevido;
- criar e acompanhar Demandas;
- identificar responsáveis;
- acompanhar prazos;
- armazenar documentos;
- registrar entradas e saídas;
- acompanhar saldo em caixa;
- acompanhar meta mensal;
- gerar contratos;
- armazenar contratos;
- enviar contratos;
- registrar contratos assinados;
- consultar indicadores úteis no Dashboard.

---

# Critérios Técnicos

O MVP também deverá:

- possuir autenticação segura;
- utilizar RLS;
- possuir isolamento por Organization;
- possuir autorização por Cliente quando aplicável;
- utilizar armazenamento privado para documentos;
- utilizar Activity Logs para operações auditáveis;
- possuir validação server-side;
- possuir testes compatíveis com os riscos de segurança;
- funcionar em desktop, tablet e mobile;
- respeitar WCAG 2.2 AA;
- manter arquitetura modular.

---

# Processo de Alteração

Toda alteração estrutural no escopo do MVP deverá seguir obrigatoriamente esta sequência:

1. Atualizar o PRD;
2. Atualizar este documento;
3. Atualizar o Product Roadmap;
4. Atualizar Functional Requirements;
5. Atualizar Business Rules quando necessário;
6. Atualizar User Stories afetadas;
7. Atualizar Sprints impactadas;
8. Sincronizar arquitetura e banco apenas depois das decisões funcionais estarem aprovadas.

Não deverão ser alterados documentos não afetados pela mudança.

---

# Fonte da Verdade

Este documento representa o recorte oficial do MVP definido pelo PRD v3.0.

O domínio operacional do MVP é:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

Clientes são a entidade central.

Demandas substituem Projetos como unidade operacional do MVP.

Leads não possuem módulo próprio no MVP atual.

Status, Prioridade e Tags de Demandas são conceitos separados.

Documentos utilizam infraestrutura centralizada.

O Financeiro representa controle operacional e não contabilidade completa.

Contratos preservam snapshot dos dados utilizados.

Acessos controlam utilizadores e autorização por Cliente.

---

# Definition of Done

O MVP será considerado concluído quando:

- todas as funcionalidades descritas neste documento estiverem implementadas;
- todas as Sprints previstas para o MVP estiverem concluídas;
- os critérios definidos no PRD estiverem atendidos;
- os Functional Requirements correspondentes estiverem implementados;
- as regras de negócio obrigatórias estiverem implementadas;
- os testes críticos estiverem aprovados;
- o isolamento entre utilizadores e Clientes estiver validado;
- os documentos privados estiverem protegidos;
- PRD, MVP Scope, Roadmap, Functional Requirements, Business Rules, User Stories e Sprints estiverem sincronizados;
- não existirem bloqueadores arquiteturais conhecidos para o escopo aprovado.