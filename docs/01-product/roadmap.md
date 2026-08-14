# Product Roadmap

## Projeto

FASBtech CRM

---

## Status

🟢 Ativo

---

## Versão

3.0

---

## Última atualização

Agosto de 2026

---

# Objetivo

Este documento define a evolução planejada do FASBtech CRM.

O Roadmap representa a ordem oficial de desenvolvimento dos módulos do sistema.

A sequência de desenvolvimento deverá seguir o escopo aprovado no:

- PRD;
- MVP Scope.

Em caso de conflito funcional entre documentos, o **PRD** é a fonte da verdade.

---

# Princípios

O desenvolvimento do CRM seguirá os seguintes princípios:

- construção incremental por módulos;
- cada Sprint deverá entregar valor real ao produto;
- a Foundation deverá estar consolidada antes dos módulos de negócio dependentes;
- Clientes serão a entidade operacional central;
- Demandas representarão o trabalho executado;
- módulos deverão reutilizar infraestrutura comum;
- segurança deverá ser implementada no backend e no banco;
- nenhuma funcionalidade futura deverá ser antecipada sem necessidade;
- o escopo do MVP deverá permanecer controlado;
- toda implementação deverá respeitar:
  - Arquitetura Oficial;
  - Design System;
  - Regras de Negócio;
  - RLS;
  - requisitos funcionais.

---

# Visão Geral do Roadmap

O MVP será desenvolvido na seguinte ordem:

```text
Sprint 01 — Foundation
        │
        ▼
Sprint 02 — Clientes & Acessos
        │
        ▼
Sprint 03 — Demandas
        │
        ▼
Sprint 04 — Financeiro
        │
        ▼
Sprint 05 — Contratos
        │
        ▼
Sprint 06 — Dashboard
```

Essa é a ordem oficial de desenvolvimento do MVP v3.0.

---

# Sprint 01 — Foundation

## Objetivo

Construir a infraestrutura técnica, de segurança e de interface necessária para suportar os módulos de negócio do FASBtech CRM.

---

## Entregas Concluídas ou Já Implementadas

- documentação base;
- arquitetura base;
- Module Architecture;
- Design System;
- Design Tokens;
- Layout base;
- Setup;
- Conventions;
- Testing Infrastructure;
- Next.js;
- TypeScript;
- Tailwind CSS;
- Supabase Auth;
- Login;
- Logout;
- sessão persistente;
- Dashboard inicial;
- infraestrutura inicial de testes.

---

## Entregas em Andamento

A Foundation deverá ser ajustada ao domínio v3.0 antes de ser considerada concluída.

Inclui:

- Migration 001;
- Bootstrap;
- estrutura base do banco;
- Profiles;
- Organization;
- Memberships;
- roles;
- Row Level Security;
- modelo de autorização;
- Activity Logs base;
- Error Handling operacional;
- infraestrutura de Storage privado;
- AppShell;
- Sidebar;
- Header;
- Page Header;
- menu principal.

---

## Menu Principal

O AppShell deverá apresentar:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

Os módulos poderão aparecer na navegação antes de estarem implementados completamente apenas se a experiência não permitir acesso a funcionalidades inexistentes.

---

## Storage Privado

A Foundation deverá disponibilizar a infraestrutura necessária para armazenamento privado de documentos.

Essa infraestrutura será posteriormente reutilizada por:

- Clientes;
- Demandas;
- Financeiro;
- Contratos.

Não deverão ser criadas soluções de armazenamento independentes para cada módulo.

---

## Segurança Base

A Foundation deverá estabelecer:

```text
Authentication

↓

Profile

↓

Organization

↓

Membership

↓

Role

↓

RLS
```

A autorização específica por Cliente será implementada na Sprint 02.

---

## Status

🟡 **Em andamento**

A Foundation somente será considerada concluída quando suas dependências obrigatórias estiverem implementadas e validadas.

---

# Sprint 02 — Clientes & Acessos

## Objetivo

Implementar a entidade operacional central do CRM e o modelo de autorização dos utilizadores internos.

Clientes serão a base para Demandas, Contratos, documentos e movimentações financeiras posteriores.

---

## Clientes

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
- histórico de atividades.

---

## Acessos

Implementar:

- utilizadores internos;
- Memberships;
- roles;
- associação entre utilizadores e Clientes;
- autorização por Cliente;
- isolamento de informações;
- testes de segurança.

---

## Roles

Papéis iniciais:

```text
OWNER
ADMIN
MEMBER
```

---

## Associação por Cliente

Um MEMBER deverá acessar somente os Clientes aos quais estiver autorizado.

A restrição deverá funcionar em:

- interface;
- URL direta;
- Server Actions;
- Queries;
- RPCs quando aplicáveis;
- banco de dados;
- arquivos privados.

Não será suficiente ocultar informações no frontend.

---

## Documentos de Cliente

A Sprint poderá utilizar a infraestrutura de Storage criada na Foundation para permitir documentos diretamente relacionados a Clientes quando necessário.

A autorização dos documentos deverá seguir a autorização do Cliente.

---

## Activity Logs

Operações relevantes de Clientes e Acessos deverão gerar Activity Logs conforme as regras arquiteturais aplicáveis.

---

## Testes

A Sprint deverá incluir testes compatíveis com o risco do módulo.

Especial atenção para:

- acesso permitido;
- acesso negado;
- acesso entre Clientes;
- acesso entre utilizadores;
- Membership inválido;
- role inadequada;
- acesso direto por URL;
- isolamento no banco;
- acesso a documentos privados.

---

## Dependência

```text
Sprint 01 — Foundation concluída
```

---

# Sprint 03 — Demandas

## Objetivo

Centralizar o trabalho executado pela FASBtech para seus Clientes.

Uma Demanda representa uma unidade de trabalho ou serviço.

---

## Entregas

Implementar:

- cadastro de Demandas;
- associação ao Cliente;
- listagem;
- pesquisa;
- filtros;
- ordenação;
- paginação;
- visualização;
- edição;
- arquivamento;
- descrição;
- responsáveis;
- data de início;
- prazo;
- prioridade;
- status;
- tags;
- observações;
- documentos;
- Activity Logs;
- alertas de prazo;
- notificações internas.

---

## Responsáveis

Uma Demanda poderá possuir um ou mais responsáveis.

Os responsáveis deverão ser utilizadores autorizados conforme as regras do sistema.

---

## Status

Domínio inicial:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

Status representa o workflow operacional da Demanda.

---

## Prioridade

Domínio inicial:

```text
LOW
MEDIUM
HIGH
URGENT
```

Prioridade é independente do Status.

---

## Tags

Tags serão utilizadas exclusivamente para classificação complementar.

Não poderão substituir:

- Status;
- Prioridade.

---

## Prazos

O sistema deverá identificar:

- Demandas dentro do prazo;
- Demandas próximas do prazo;
- Demandas atrasadas.

---

## Notificações

Implementar notificações internas relacionadas a prazo.

A detecção de vencimentos deverá ocorrer no backend e não depender do navegador aberto.

---

## Documentos

Demandas deverão reutilizar a infraestrutura central de documentos.

Exemplos:

- briefing;
- prototipagem;
- templates;
- arquivos enviados pelo Cliente;
- materiais de entrega.

---

## Dependência

```text
Sprint 02 — Clientes & Acessos concluída
```

---

# Sprint 04 — Financeiro

## Objetivo

Centralizar a gestão financeira operacional da FASBtech.

O módulo não substituirá um sistema contábil ou fiscal.

---

## Entregas

Implementar:

- dashboard financeiro;
- entradas;
- saídas;
- categorias;
- saldo em caixa;
- pagamentos;
- vencimentos;
- pagamentos únicos;
- recorrência informativa;
- metas mensais;
- anexos;
- Activity Logs aplicáveis.

---

## Entradas

Permitir registrar:

- Cliente quando aplicável;
- descrição;
- categoria;
- valor;
- data;
- vencimento;
- data de pagamento;
- status;
- tipo de pagamento;
- observações;
- documentos.

---

## Saídas

Permitir registrar:

- descrição;
- categoria;
- valor;
- data;
- vencimento;
- data de pagamento;
- status;
- observações;
- documentos.

Uma saída não deverá exigir associação a Cliente.

---

## Tipo de Pagamento

Domínio inicial:

```text
ONE_TIME
RECURRING
```

Recorrência representa a natureza do pagamento.

Automação de cobrança recorrente não pertence a esta Sprint.

---

## Saldo em Caixa

O saldo em caixa deverá considerar somente movimentações efetivamente realizadas.

Valores previstos ou pendentes não deverão alterar o saldo realizado.

---

## Meta Mensal

Implementar:

```text
Mês
Ano
Valor da Meta
```

O progresso deverá considerar a receita efetivamente recebida durante o período.

---

## Documentos Financeiros

O módulo deverá reutilizar a infraestrutura central de documentos.

Exemplos:

- comprovantes;
- recibos;
- notas fiscais;
- documentos relacionados à movimentação.

---

## Dependência

```text
Sprint 03 — Demandas concluída
```

---

# Sprint 05 — Contratos

## Objetivo

Centralizar e automatizar a criação e gestão de contratos da FASBtech.

---

## Entregas

Implementar:

- templates de contrato;
- seleção de Cliente;
- formulário;
- preenchimento automático de dados;
- dados adicionais;
- preview/revisão;
- snapshot contratual;
- geração do documento;
- geração de PDF;
- armazenamento;
- envio por e-mail;
- upload do contrato assinado;
- status;
- Activity Logs aplicáveis.

---

## Fluxo Principal

```text
Selecionar Cliente

↓

Selecionar Template

↓

Carregar dados existentes

↓

Complementar dados

↓

Revisar

↓

Gerar

↓

Gerar PDF

↓

Salvar

↓

Enviar por e-mail
```

---

## Snapshot

Todo contrato gerado deverá preservar os dados utilizados no momento da geração.

Alterações futuras no cadastro do Cliente não poderão modificar contratos já gerados.

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

## Assinatura

Assinatura eletrônica integrada não faz parte desta Sprint.

Fluxo inicial:

```text
Contrato enviado

↓

Assinatura externa

↓

Cópia assinada recebida

↓

Upload

↓

SIGNED
```

---

## Documentos

Contratos deverão utilizar a infraestrutura central de documentos.

A versão gerada e a versão assinada deverão permanecer preservadas.

---

## Dependência

```text
Sprint 04 — Financeiro concluída
```

---

# Sprint 06 — Dashboard

## Objetivo

Consolidar dados reais dos módulos implementados anteriormente em uma visão executiva da FASBtech.

---

## Entregas

Implementar Dashboard consolidado com indicadores provenientes de:

- Clientes;
- Demandas;
- Financeiro;
- Contratos;
- Activity Logs.

---

## Indicadores Financeiros

Apresentar:

- saldo em caixa;
- entradas do mês;
- saídas do mês;
- progresso da meta mensal.

---

## Indicadores de Demandas

Apresentar:

- Demandas abertas;
- Demandas em andamento;
- Demandas atrasadas;
- Demandas próximas do prazo;
- Demandas concluídas.

---

## Operação

Apresentar quando aplicável:

- próximos prazos;
- alertas operacionais;
- atividades recentes.

---

## Contratos

Quando houver dados suficientes, poderá apresentar:

- contratos em elaboração;
- contratos enviados;
- contratos assinados.

---

## Fonte dos Dados

O Dashboard não deverá manter cópias manuais dos indicadores.

Os dados deverão ser derivados das fontes oficiais dos módulos correspondentes.

---

## Reuniões

Reuniões não serão incluídas no Dashboard enquanto não existir uma fonte oficial de dados para esse domínio.

---

## Dependência

```text
Sprint 05 — Contratos concluída
```

---

# Funcionalidades Fora do MVP Atual

Não fazem parte da sequência atual de desenvolvimento:

- pipeline completo de Leads;
- módulo independente de Projetos;
- Product Registry operacional;
- Agenda completa;
- gestão estruturada de reuniões;
- assinatura eletrônica integrada;
- processamento de pagamentos;
- cobrança automática;
- emissão fiscal automática;
- contabilidade completa;
- SaaS multiempresa;
- múltiplas Organizations por utilizador;
- Aplicativo Mobile nativo;
- API Pública;
- Billing SaaS;
- Marketplace;
- IA generativa;
- Portal do Cliente;
- integrações bancárias;
- automações externas avançadas;
- n8n;
- WhatsApp automatizado;
- SMS;
- push notification nativo.

Essas funcionalidades poderão ser reavaliadas somente após validação do MVP ou nova decisão formal de produto.

---

# Evoluções Futuras

Após a validação do MVP poderão ser avaliados:

## Comercial

- Leads;
- pipeline comercial;
- conversão Lead → Cliente;
- propostas comerciais.

---

## Organização Operacional

- Projetos para agrupamento de múltiplas Demandas;
- Agenda;
- reuniões;
- calendário avançado.

---

## Produtos

- Product Registry operacional;
- catálogo de serviços;
- ligação entre produtos e contratos.

---

## Financeiro

- automação de recorrências;
- integração bancária;
- gateways de pagamento;
- emissão fiscal;
- relatórios financeiros avançados.

---

## Contratos

- assinatura eletrônica;
- integração com plataformas de assinatura;
- automações contratuais.

---

## Plataforma

- SaaS multiempresa;
- Mobile;
- API Pública;
- Billing;
- Marketplace;
- integrações externas;
- Webhooks;
- n8n;
- IA;
- Analytics avançado.

---

# Ordem Oficial de Desenvolvimento

```text
Sprint 01
Foundation
    │
    ▼
Sprint 02
Clientes & Acessos
    │
    ▼
Sprint 03
Demandas
    │
    ▼
Sprint 04
Financeiro
    │
    ▼
Sprint 05
Contratos
    │
    ▼
Sprint 06
Dashboard
    │
    ▼
MVP Validado
    │
    ▼
Evoluções Futuras
```

Não deverá ser criada uma nova Sprint entre essas etapas sem alteração prévia do PRD, MVP Scope e deste Roadmap.

---

# Critérios para Iniciar uma Nova Sprint

Uma nova Sprint somente poderá iniciar quando:

- a Sprint anterior estiver funcionalmente concluída;
- dependências obrigatórias estiverem implementadas;
- testes críticos estiverem aprovados;
- não existirem bloqueadores conhecidos;
- documentação diretamente afetada estiver sincronizada;
- revisão técnica estiver concluída.

Documentação não relacionada ao módulo não deverá bloquear artificialmente o início da Sprint.

---

# Critérios para Conclusão da Foundation

A Sprint 01 — Foundation será considerada concluída quando:

- autenticação estiver operacional;
- Profile estiver operacional;
- Organization estiver operacional;
- Membership estiver operacional;
- roles base estiverem definidos;
- Bootstrap estiver implementado;
- Migration 001 correspondente à Foundation estiver aplicada;
- RLS base estiver operacional;
- Activity Logs base estiver operacional;
- Storage privado estiver configurado;
- AppShell estiver implementado;
- menu principal estiver implementado;
- Error Handling obrigatório estiver operacional;
- testes de infraestrutura e segurança obrigatórios estiverem aprovados.

RPCs deverão existir apenas onde forem efetivamente exigidas pela arquitetura.

A Foundation não deverá implementar antecipadamente entidades pertencentes às Sprints posteriores.

---

# Critérios de Conclusão do MVP

O MVP será considerado concluído quando as Sprints:

```text
01
02
03
04
05
06
```

estiverem concluídas e a FASBtech puder centralizar no sistema:

- Clientes;
- utilizadores;
- permissões;
- Demandas;
- documentos;
- controle financeiro operacional;
- contratos;
- indicadores executivos.

---

# Processo de Alteração do Roadmap

Qualquer mudança estrutural na ordem ou no escopo deverá seguir:

```text
PRD

↓

MVP Scope

↓

Product Roadmap

↓

Functional Requirements

↓

Business Rules

↓

User Stories

↓

Sprints

↓

Arquitetura / Banco quando afetados
```

Não alterar arquitetura ou banco antes de a decisão funcional estar formalmente aprovada.

Não modificar documentos que não sejam afetados pela mudança.

---

# Fonte da Verdade

Este Roadmap implementa a direção definida pelo:

```text
PRD v3.0

↓

MVP Scope v3.0
```

A ordem oficial do MVP é:

```text
Foundation
Clientes & Acessos
Demandas
Financeiro
Contratos
Dashboard
```

Clientes são a entidade operacional central.

Demandas são a unidade operacional de trabalho.

Financeiro representa gestão financeira operacional.

Contratos utilizam templates e preservam snapshot.

Acessos controlam utilizadores e autorização por Cliente.

Dashboard consolida os dados reais produzidos pelos demais módulos.

Leads, Projetos, Product Registry e Agenda não fazem parte do MVP atual.

---

# Definition of Done

Cada Sprint do Roadmap será considerada concluída quando:

- todas as funcionalidades obrigatórias previstas estiverem implementadas;
- os testes obrigatórios estiverem aprovados;
- a arquitetura oficial estiver respeitada;
- as regras de segurança estiverem aplicadas;
- o Design System estiver seguido;
- a documentação diretamente afetada estiver atualizada;
- não existirem bloqueadores conhecidos;
- a Sprint estiver pronta para utilização dentro do fluxo operacional definido pelo MVP.