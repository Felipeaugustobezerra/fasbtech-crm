# Product Requirements Document (PRD)

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟢 Em Desenvolvimento

---

## Última atualização

Agosto de 2026

---

# 1. Visão Geral

O FASBtech CRM é uma plataforma web desenvolvida para centralizar a gestão operacional, administrativa e financeira da FASBtech.

O sistema será utilizado inicialmente pela própria FASBtech e deverá centralizar:

- clientes;
- demandas;
- documentos;
- contratos;
- informações financeiras;
- utilizadores;
- permissões;
- indicadores operacionais.

A arquitetura continuará preparada para evolução futura para um produto SaaS multiempresa, mas essa capacidade não faz parte do MVP atual.

O objetivo é substituir planilhas, documentos dispersos e processos manuais por um sistema único, moderno, seguro e escalável.

---

# 2. Problema

Atualmente as informações da empresa encontram-se distribuídas em diversos locais:

- planilhas;
- Notion;
- calendários;
- WhatsApp;
- e-mails;
- documentos locais;
- serviços de armazenamento;
- memória operacional.

Isso gera:

- perda de informações;
- retrabalho;
- dificuldade para acompanhar serviços em andamento;
- dificuldade para controlar prazos;
- documentos dispersos;
- dificuldade para acompanhar receitas e despesas;
- dificuldade para gerir contratos;
- dificuldade para controlar o acesso de funcionários;
- baixa produtividade;
- dificuldade para escalar a operação.

---

# 3. Objetivos

## Objetivo Principal

Criar um sistema centralizado para gerir a operação da FASBtech.

---

## Objetivos Secundários

- Centralizar informações dos clientes.
- Organizar demandas de serviços.
- Controlar responsáveis e prazos.
- Centralizar documentos relacionados aos clientes.
- Acompanhar entradas e saídas financeiras.
- Controlar saldo em caixa.
- Acompanhar metas mensais.
- Criar e gerir contratos.
- Armazenar contratos e documentos assinados.
- Controlar utilizadores e permissões.
- Restringir funcionários aos clientes autorizados.
- Reduzir tarefas repetitivas.
- Melhorar indicadores operacionais.
- Facilitar tomada de decisão.
- Criar base para futuras automações.

---

# 4. Público-Alvo

## MVP

O MVP será utilizado exclusivamente pela:

```text
FASBtech
```

O ambiente inicial possuirá:

- uma única Organization;
- um OWNER;
- possibilidade de múltiplos utilizadores internos;
- funcionários com acesso controlado;
- isolamento de dados por Organization;
- restrição de acesso por Cliente quando aplicável.

---

## Futuro

O produto poderá evoluir para atender:

- pequenas empresas;
- Software Houses;
- agências;
- freelancers;
- consultores;
- empresas de tecnologia.

A evolução para múltiplas organizações não faz parte do MVP.

---

# 5. ICP

O ICP estratégico da FASBtech permanece documentado em:

- Customer Intelligence Playbook;
- Competitive Intelligence.

Esses documentos não determinam o modelo operacional interno do CRM.

---

# 6. Escopo do MVP

O MVP contempla os seguintes módulos principais:

- Autenticação;
- Dashboard;
- Clientes;
- Demandas;
- Financeiro;
- Contratos;
- Acessos;
- Documentos;
- Activity Logs;
- Configurações essenciais.

---

## 6.1 Dashboard

O Dashboard será a visão executiva da operação da FASBtech.

Deverá consolidar informações existentes nos demais módulos.

A primeira versão deverá apresentar indicadores como:

- saldo em caixa;
- entradas do mês;
- saídas do mês;
- progresso da meta mensal;
- demandas em andamento;
- demandas atrasadas;
- demandas próximas do prazo;
- próximos prazos;
- atividades recentes.

O Dashboard não deverá manter cópias próprias desses dados.

Os indicadores deverão ser calculados a partir das respectivas fontes oficiais.

Informações de reuniões somente serão incorporadas quando existir uma fonte de dados oficialmente implementada para esse domínio.

---

## 6.2 Clientes

Clientes serão a entidade operacional central do sistema.

Cada Cliente deverá concentrar suas principais informações e permitir acesso ao histórico relacionado.

A visão de um Cliente poderá reunir:

- informações gerais;
- demandas;
- contratos;
- movimentações financeiras;
- documentos;
- utilizadores autorizados;
- atividades relacionadas.

Um Cliente poderá possuir múltiplas Demandas, Contratos, documentos e movimentações financeiras.

---

## 6.3 Demandas

Demandas representarão unidades de trabalho ou serviços executados para um Cliente.

Cada Demanda deverá possuir, no mínimo:

- Cliente;
- título;
- descrição;
- responsáveis;
- data de início;
- prazo;
- prioridade;
- status;
- tags;
- documentos relacionados;
- observações;
- timestamps;
- arquivamento quando aplicável.

Uma Demanda poderá possuir múltiplos responsáveis.

---

### Status de Demanda

O status operacional deverá utilizar valores controlados.

Domínio inicial:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

Status não poderá ser substituído por tags livres.

---

### Prioridade

A prioridade deverá utilizar valores controlados.

Domínio inicial:

```text
LOW
MEDIUM
HIGH
URGENT
```

---

### Tags

Tags serão independentes do status e da prioridade.

Serão utilizadas para classificação complementar.

Exemplos:

```text
SEO
Landing Page
Design
Aguardando conteúdo
Cliente VIP
```

As tags não deverão determinar regras essenciais de workflow.

---

### Prazos

Demandas poderão possuir prazo de entrega.

O sistema deverá permitir identificar:

- demandas dentro do prazo;
- demandas próximas do prazo;
- demandas atrasadas.

O sistema deverá ser preparado para notificações automáticas relacionadas a prazo.

---

## 6.4 Documentos

O sistema deverá possuir uma infraestrutura centralizada para documentos.

Documentos poderão estar relacionados a:

- Clientes;
- Demandas;
- Contratos;
- movimentações financeiras.

Exemplos:

- briefing;
- templates;
- protótipos;
- contrato;
- contrato assinado;
- nota fiscal;
- comprovante de pagamento;
- documentos do projeto;
- materiais enviados pelo Cliente.

O sistema deverá evitar implementar mecanismos de arquivos diferentes para cada módulo.

Os arquivos deverão utilizar armazenamento privado e respeitar as mesmas regras de autorização dos dados aos quais estiverem relacionados.

---

## 6.5 Financeiro

O módulo Financeiro será utilizado para gestão financeira operacional da FASBtech.

Não será um sistema contábil ou fiscal completo.

Deverá permitir:

- registrar entradas;
- registrar saídas;
- acompanhar saldo em caixa;
- acompanhar receitas;
- acompanhar despesas;
- acompanhar meta mensal;
- registrar pagamentos únicos;
- registrar pagamentos recorrentes;
- anexar documentos financeiros.

---

### Entradas

Uma entrada poderá possuir:

- Cliente;
- descrição;
- categoria;
- valor;
- data;
- vencimento quando aplicável;
- data de pagamento;
- tipo de pagamento;
- status;
- comprovante ou documento;
- observações.

---

### Saídas

Uma saída poderá possuir:

- descrição;
- categoria;
- valor;
- data;
- vencimento quando aplicável;
- data de pagamento;
- status;
- comprovante ou documento;
- observações.

Uma saída não precisa obrigatoriamente estar relacionada a um Cliente.

---

### Tipo de Pagamento

O sistema deverá distinguir pelo menos:

```text
ONE_TIME
RECURRING
```

A automação avançada de cobranças recorrentes não faz parte do MVP.

---

### Saldo em Caixa

O saldo deverá considerar movimentações efetivamente realizadas.

Valores apenas previstos ou pendentes não deverão aumentar ou reduzir o saldo realizado.

---

### Meta Mensal

O sistema deverá permitir definir uma meta de receita para determinado mês e ano.

O Dashboard deverá comparar:

```text
Receita recebida no mês

↓

Meta mensal
```

e apresentar o progresso correspondente.

---

## 6.6 Contratos

O módulo Contratos deverá permitir criar, gerar, armazenar e acompanhar contratos da FASBtech.

O fluxo esperado é:

```text
Selecionar Cliente

↓

Selecionar modelo de contrato

↓

Preencher dados disponíveis automaticamente

↓

Complementar dados necessários

↓

Revisar

↓

Gerar documento final

↓

Gerar PDF

↓

Salvar no sistema

↓

Enviar por e-mail ao Cliente
```

---

### Dados do Contrato

O formulário poderá utilizar informações já existentes no Cliente.

Quando necessário, poderá incluir:

- nome;
- nome da empresa;
- e-mail;
- endereço;
- documento fiscal;
- tipo do documento fiscal;
- dados específicos do serviço;
- valores;
- prazos;
- demais informações contratuais.

A identificação fiscal deverá permitir diferentes tipos de documento.

Exemplos:

```text
CPF
CNPJ
NIF
VAT
```

---

### Snapshot Contratual

Ao gerar um contrato, o sistema deverá preservar uma cópia dos dados utilizados naquele momento.

Alterações futuras no cadastro do Cliente não poderão modificar retroativamente um contrato já gerado.

---

### Status do Contrato

Domínio inicial:

```text
DRAFT
GENERATED
SENT
SIGNED
CANCELED
```

---

### Assinatura

Assinatura eletrônica integrada não faz parte do MVP.

Fluxo inicial:

```text
Gerar

↓

Enviar

↓

Guardar cópia enviada

↓

Receber contrato assinado externamente

↓

Fazer upload

↓

Marcar como SIGNED
```

Integração futura com plataformas de assinatura poderá ser avaliada posteriormente.

---

## 6.7 Acessos

O módulo Acessos será responsável pela gestão de utilizadores e permissões internas.

O OWNER deverá possuir capacidade administrativa sobre o sistema.

Os papéis iniciais serão:

```text
OWNER
ADMIN
MEMBER
```

---

### OWNER

Possui acesso administrativo completo à Organization.

---

### ADMIN

Possui acesso administrativo conforme as permissões estabelecidas pelo sistema.

---

### MEMBER

Utilizador operacional.

Um MEMBER deverá acessar apenas os Clientes aos quais estiver explicitamente associado, além das informações derivadas desses Clientes que sua função permita acessar.

Ocultar informações apenas no frontend não será suficiente.

A autorização deverá ser garantida também no banco de dados.

---

### Associação a Clientes

O sistema deverá permitir relacionar utilizadores internos aos Clientes sob sua responsabilidade.

Exemplo:

```text
Funcionário

↓

Clientes autorizados

↓

Demandas e documentos permitidos
```

Um utilizador sem autorização para determinado Cliente não poderá acessar seus dados diretamente através de URL, Query ou arquivo.

---

### Informações Sensíveis

Financeiro e Contratos não deverão ser disponibilizados automaticamente a todos os MEMBER.

Permissões específicas deverão controlar esses acessos.

---

# 7. Fora do Escopo

Não fazem parte do MVP atual:

- aplicativo Mobile nativo;
- SaaS multiempresa;
- múltiplas Organizations por utilizador;
- pipeline completo de Leads;
- módulo independente de Projetos;
- Product Registry operacional;
- agenda completa;
- assinatura eletrônica própria;
- processamento de pagamentos;
- gateway de cobrança;
- contabilidade completa;
- emissão fiscal automática;
- cobrança automática de recorrências;
- marketplace;
- API Pública;
- Billing SaaS;
- IA generativa;
- marketplace de plugins.

Funcionalidades removidas do MVP poderão ser reconsideradas futuramente quando houver necessidade real.

---

# 8. Proposta de Valor

Centralizar a operação da FASBtech em uma única plataforma, reunindo:

```text
Clientes

+

Demandas

+

Documentos

+

Financeiro

+

Contratos

+

Acessos

+

Indicadores
```

O sistema deverá permitir que a empresa saiba rapidamente:

- quem são os Clientes;
- o que precisa ser entregue;
- quem é responsável;
- quais prazos estão próximos;
- quanto entrou;
- quanto saiu;
- quanto existe em caixa;
- quais contratos existem;
- quais documentos pertencem a cada Cliente;
- quem pode acessar cada informação.

---

# 9. Personas

As personas estratégicas permanecem documentadas em:

Customer Intelligence Playbook

O sistema interno deverá considerar também utilizadores operacionais com diferentes níveis de autorização.

---

# 10. Jornada do Utilizador

A jornada operacional principal passa a ser:

```text
Login

↓

Dashboard

↓

Cliente

↓

Demanda

↓

Execução

↓

Entrega
```

Fluxos complementares:

```text
Cliente

├── Demandas
├── Contratos
├── Financeiro
├── Documentos
└── Acessos
```

---

# 11. Módulos do Sistema

## Fundação

- Autenticação
- Organization
- Profiles
- Memberships
- Roles
- RLS
- Activity Logs
- Configurações essenciais

---

## Dashboard

- Resumo financeiro
- Resumo operacional
- Demandas
- Prazos
- Alertas
- Atividades recentes

---

## Clientes

- Cadastro
- Dados gerais
- Histórico relacionado
- Demandas
- Contratos
- Financeiro
- Documentos
- Utilizadores associados

---

## Demandas

- Cadastro
- Responsáveis
- Status
- Prioridade
- Tags
- Datas
- Prazos
- Documentos
- Observações
- Notificações

---

## Financeiro

- Entradas
- Saídas
- Saldo em caixa
- Categorias
- Pagamentos
- Recorrência informativa
- Meta mensal
- Documentos financeiros

---

## Contratos

- Templates
- Formulário
- Dados do Cliente
- Geração
- PDF
- Armazenamento
- Envio por e-mail
- Upload do contrato assinado
- Status

---

## Acessos

- Utilizadores
- Memberships
- Roles
- Associação a Clientes
- Permissões

---

## Documentos

- Armazenamento
- Organização
- Associação a entidades
- Controle de acesso

---

# 12. Requisitos Funcionais

Os requisitos completos encontram-se em:

```text
Functional Requirements
```

Esse documento deverá ser sincronizado com esta versão do PRD antes da implementação das novas funcionalidades.

---

# 13. Requisitos Não Funcionais

O sistema deverá:

- ser responsivo;
- possuir autenticação segura;
- utilizar RLS;
- proteger arquivos privados;
- suportar múltiplos utilizadores internos;
- garantir isolamento por Organization;
- garantir restrições de acesso por Cliente quando aplicável;
- suportar escalabilidade;
- possuir acessibilidade WCAG 2.2 AA;
- utilizar arquitetura modular;
- manter alta performance;
- possuir rastreabilidade para operações relevantes.

---

# 14. Regras de Negócio

As regras detalhadas encontram-se em:

```text
Business Rules
```

Regras específicas de cada domínio deverão ser mantidas nos respectivos documentos existentes quando aplicável.

Este PRD permanece como fonte funcional principal.

---

# 15. Arquitetura

A arquitetura oficial encontra-se em:

- System Architecture;
- Module Architecture;
- RLS;
- Error Handling;
- ADRs aprovadas.

Esses documentos deverão ser sincronizados com este PRD quando a mudança de domínio afetar suas responsabilidades.

---

# 16. Banco de Dados

A estrutura oficial encontra-se em:

- Data Model;
- Migration 001;
- Migrations;
- Organization User Model;
- Activity Logs.

O modelo de banco deverá ser atualizado para refletir progressivamente os módulos aprovados neste PRD.

Nenhuma entidade deverá ser criada apenas por estar prevista futuramente.

---

# 17. Segurança

O sistema utilizará:

- Supabase Auth;
- Row Level Security;
- UUID;
- Soft Delete quando aplicável;
- Server Actions;
- validação Zod;
- Activity Logs;
- armazenamento privado para documentos;
- autorização baseada em Organization;
- autorização por Cliente quando aplicável;
- roles;
- memberships.

O frontend nunca será considerado fonte de autorização.

---

# 18. Design System

Toda interface deverá seguir:

- Branding;
- Color Palette;
- Typography;
- Components;
- Design Tokens;
- Layout;
- CRM UI Guidelines;
- Accessibility;
- Animations quando aplicável.

O menu principal do sistema deverá refletir os módulos operacionais aprovados:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

---

# 19. Stack Tecnológica

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

---

## Backend

- Server Actions
- Supabase
- PostgreSQL RPCs quando exigidas pela arquitetura

---

## Banco

- PostgreSQL

---

## Arquivos

- Storage privado integrado à estratégia de autorização

---

## Deploy

- Vercel

---

# 20. KPIs

O sucesso operacional do sistema será acompanhado inicialmente por indicadores como:

## Financeiro

- entradas do mês;
- saídas do mês;
- saldo em caixa;
- progresso da meta mensal.

---

## Demandas

- demandas abertas;
- demandas em andamento;
- demandas atrasadas;
- demandas próximas do prazo;
- demandas concluídas.

---

## Operação

- quantidade de Clientes ativos;
- distribuição de Demandas por responsável;
- atividades recentes.

---

## Contratos

Quando houver volume suficiente:

- contratos em elaboração;
- contratos enviados;
- contratos assinados.

Os indicadores deverão ser derivados dos módulos oficiais e não duplicados manualmente.

---

# 21. Roadmap

O desenvolvimento deverá seguir a seguinte direção:

## Sprint 01 — Foundation

- autenticação;
- Organization;
- Profiles;
- Memberships;
- roles;
- RLS base;
- Activity Logs base;
- infraestrutura de documentos privados;
- AppShell;
- menu principal.

---

## Sprint 02 — Clientes & Acessos

- Clientes;
- utilizadores;
- associação entre utilizadores e Clientes;
- autorização;
- controle de acesso.

---

## Sprint 03 — Demandas

- Demandas;
- responsáveis;
- status;
- prioridade;
- tags;
- documentos;
- prazos;
- notificações.

---

## Sprint 04 — Financeiro

- entradas;
- saídas;
- saldo;
- categorias;
- metas;
- recorrência;
- comprovantes.

---

## Sprint 05 — Contratos

- templates;
- geração;
- PDF;
- envio;
- armazenamento;
- contrato assinado.

---

## Sprint 06 — Dashboard

- indicadores financeiros;
- indicadores operacionais;
- prazos;
- alertas;
- atividades recentes.

O AppShell poderá possuir Dashboard básico antes da Sprint 06.

A Sprint 06 representa a consolidação dos dados reais produzidos pelos módulos anteriores.

---

# 22. Critérios de Aceite

Uma funcionalidade somente será considerada concluída quando:

- estiver dentro do escopo aprovado;
- respeitar os requisitos funcionais correspondentes;
- respeitar as regras de negócio;
- documentação afetada estiver atualizada;
- testes obrigatórios estiverem aprovados;
- lint estiver aprovado;
- build estiver aprovado;
- typecheck estiver aprovado;
- revisão técnica estiver concluída.

Nenhuma documentação não relacionada deverá bloquear artificialmente a entrega de uma funcionalidade.

---

# 23. Definition of Done

Todo módulo deverá:

- seguir o Design System;
- seguir a arquitetura oficial;
- respeitar RLS;
- respeitar autorização por Cliente quando aplicável;
- utilizar Activity Logs para operações auditáveis;
- utilizar Error Handling;
- possuir testes compatíveis com seu risco;
- respeitar acessibilidade;
- impedir acesso indevido pelo frontend e pelo banco;
- utilizar documentos privados de forma segura quando houver anexos;
- respeitar o domínio oficial definido neste PRD e nos requisitos correspondentes.

---

# 24. Riscos

Principais riscos:

- crescimento desorganizado;
- duplicação de conceitos;
- permissões incorretas;
- exposição de documentos;
- divergência entre dados financeiros;
- perda de contratos;
- perda de documentos;
- prazos não acompanhados;
- duplicação de código;
- falhas de segurança;
- documentação divergente da implementação.

Esses riscos deverão ser reduzidos através de:

- arquitetura modular;
- fonte de verdade única;
- autorização no banco;
- documentos centralizados;
- status controlados;
- separação entre status, prioridade e tags;
- testes;
- revisão técnica;
- evolução incremental por Sprint.

---

# 25. Evoluções Futuras

Após o MVP poderão ser avaliados:

- Leads e pipeline comercial;
- módulo de Projetos quando houver necessidade de agrupar Demandas;
- Agenda e reuniões;
- assinatura eletrônica integrada;
- automações de cobrança;
- emissão fiscal;
- integrações bancárias;
- SaaS multiempresa;
- Mobile;
- IA;
- API Pública;
- Marketplace;
- Billing SaaS;
- integrações externas;
- n8n;
- Webhooks;
- Analytics avançado.

Nenhuma dessas evoluções deverá ser antecipada sem necessidade de produto.

---

# Fonte da Verdade

Este documento é a principal referência funcional do FASBtech CRM.

A partir da versão 3.0, o domínio operacional oficial do MVP é:

```text
Dashboard

Demandas

Financeiro

Contratos

Clientes

Acessos
```

Clientes são a entidade operacional central.

Demandas representam o trabalho executado.

Status de Demanda, Prioridade e Tags são conceitos independentes.

Documentos utilizam uma infraestrutura centralizada.

Financeiro representa gestão operacional e não contabilidade completa.

Contratos preservam snapshot dos dados utilizados em sua geração.

Acessos controlam utilizadores, roles e autorização por Cliente.

Leads, Projetos, Product Registry e Agenda não fazem parte do MVP operacional atual.

Sempre que houver conflito funcional entre documentos, este PRD deverá ser atualizado primeiro.

Os demais documentos deverão ser sincronizados a partir dele.