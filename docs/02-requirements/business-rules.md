# Regras de Negócio

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

Este documento define as regras de negócio oficiais do FASBtech CRM.

As regras descritas aqui complementam os requisitos funcionais e devem permanecer alinhadas com:

- PRD;
- MVP Scope;
- Product Roadmap;
- Functional Requirements.

Este documento define regras de domínio e comportamento.

Não define detalhes de implementação técnica, migrations ou estrutura física do banco.

---

# Organização

As regras estão organizadas pelos domínios oficiais do MVP:

```text
Foundation
Clientes
Acessos
Demandas
Documentos
Financeiro
Contratos
Dashboard
Activity Logs
```

---

# Foundation

## BR-001

Todos os dados operacionais devem pertencer à Organization ativa da FASBtech.

---

## BR-002

O MVP deve operar inicialmente com uma única Organization.

---

## BR-003

O sistema deve permitir múltiplos utilizadores internos vinculados à mesma Organization.

---

## BR-004

Os papéis iniciais do sistema são:

```text
OWNER
ADMIN
MEMBER
```

---

## BR-005

O utilizador não pode escolher arbitrariamente outra Organization para acessar dados.

---

# Clientes

## BR-100

Todo Cliente deve pertencer a uma Organization.

---

## BR-101

Um Cliente pode existir independentemente de um Lead.

A existência de Lead não é obrigatória no MVP atual.

---

## BR-102

Um Cliente pode possuir múltiplas Demandas.

---

## BR-103

Um Cliente pode possuir múltiplos Contratos.

---

## BR-104

Um Cliente pode possuir múltiplos documentos relacionados.

---

## BR-105

Um Cliente pode possuir múltiplas movimentações financeiras relacionadas.

---

## BR-106

Um Cliente pode possuir múltiplos utilizadores internos autorizados.

---

## BR-107

Clientes arquivados não devem aparecer nas listagens padrão.

---

## BR-108

O arquivamento de um Cliente não deve excluir fisicamente seu histórico.

---

## BR-109

O arquivamento de um Cliente não deve apagar automaticamente:

- Demandas;
- Contratos;
- movimentações financeiras;
- documentos;
- Activity Logs.

---

# Acessos

## BR-200

O OWNER possui acesso administrativo completo à Organization.

---

## BR-201

O ADMIN possui acesso administrativo conforme as permissões definidas pelo sistema.

---

## BR-202

O MEMBER possui acesso operacional restrito.

---

## BR-203

Um MEMBER deve acessar apenas os Clientes aos quais estiver explicitamente associado.

---

## BR-204

Um MEMBER não associado a determinado Cliente não pode acessar seus dados.

---

## BR-205

A restrição de acesso a um Cliente deve continuar válida mesmo em acesso direto por URL.

---

## BR-206

A associação de um utilizador a um Cliente não concede automaticamente acesso irrestrito ao módulo Financeiro.

---

## BR-207

A associação de um utilizador a um Cliente não concede automaticamente acesso irrestrito ao módulo Contratos.

---

## BR-208

A associação a um Cliente não concede permissões administrativas globais.

---

## BR-209

Um Cliente pode possuir mais de um utilizador autorizado.

---

## BR-210

Um utilizador pode estar associado a mais de um Cliente.

---

## BR-211

Alterações relevantes em:

- roles;
- Memberships;
- associações entre utilizadores e Clientes;

devem ser auditadas.

---

# Demandas

## BR-300

Toda Demanda deve pertencer a um Cliente.

---

## BR-301

Uma Demanda pode possuir um ou mais responsáveis.

---

## BR-302

Responsáveis por uma Demanda devem ser utilizadores autorizados conforme as regras de acesso aplicáveis.

---

## BR-303

O status da Demanda deve utilizar exclusivamente:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

---

## BR-304

A prioridade da Demanda deve utilizar exclusivamente:

```text
LOW
MEDIUM
HIGH
URGENT
```

---

## BR-305

Status, Prioridade e Tags são conceitos independentes.

---

## BR-306

Tags não podem substituir o Status da Demanda.

---

## BR-307

Tags não podem substituir a Prioridade da Demanda.

---

## BR-308

Tags podem ser utilizadas para classificação complementar.

Exemplos:

```text
SEO
Landing Page
Design
Aguardando conteúdo
Cliente VIP
```

---

## BR-309

Uma Demanda com prazo expirado deve ser considerada atrasada quando não estiver em:

```text
COMPLETED
CANCELED
```

---

## BR-310

Uma Demanda concluída não deve ser considerada atrasada.

---

## BR-311

Uma Demanda cancelada não deve ser considerada atrasada.

---

## BR-312

Demandas arquivadas não devem aparecer nas listagens padrão.

---

## BR-313

O arquivamento de uma Demanda não deve excluir fisicamente seu histórico.

---

## BR-314

Alterações relevantes em Demandas devem ser auditadas.

Incluindo, quando aplicável:

- criação;
- edição;
- arquivamento;
- alteração de Status;
- alteração de Prioridade;
- alteração de prazo;
- alteração de responsáveis.

---

# Documentos

## BR-400

Os documentos do sistema devem utilizar uma infraestrutura centralizada.

---

## BR-401

Um documento pode estar associado a uma entidade operacional.

Exemplos:

- Cliente;
- Demanda;
- Contrato;
- movimentação financeira.

---

## BR-402

Documentos devem ser privados por padrão.

---

## BR-403

O acesso a um documento deve respeitar as permissões da entidade à qual ele está associado.

---

## BR-404

Um utilizador sem acesso a determinado Cliente não pode acessar documentos pertencentes a esse Cliente.

---

## BR-405

O sistema não deve possuir regras de autorização independentes e contraditórias para arquivos do mesmo Cliente.

---

## BR-406

Documentos removidos do fluxo operacional não devem invalidar registros históricos que dependam deles sem regra explícita.

---

# Financeiro

## BR-500

Toda movimentação financeira deve ser classificada como entrada ou saída.

---

## BR-501

Uma entrada financeira pode estar associada a um Cliente.

---

## BR-502

Uma saída financeira não precisa estar associada a um Cliente.

---

## BR-503

Toda movimentação financeira deve possuir valor maior que zero.

---

## BR-504

O sistema deve diferenciar movimentações previstas de movimentações efetivamente realizadas.

---

## BR-505

Somente movimentações efetivamente realizadas devem compor o saldo em caixa.

---

## BR-506

Movimentações previstas ou pendentes não devem alterar o saldo realizado.

---

## BR-507

Os tipos iniciais de pagamento são:

```text
ONE_TIME
RECURRING
```

---

## BR-508

`RECURRING` representa a natureza recorrente da movimentação.

Não representa cobrança automática.

---

## BR-509

O MVP não executa cobrança automática de receitas recorrentes.

---

## BR-510

Toda meta mensal deve possuir:

- mês;
- ano;
- valor.

---

## BR-511

Deve existir apenas uma meta mensal ativa para a mesma combinação de mês e ano, salvo decisão futura em contrário.

---

## BR-512

O progresso da meta mensal deve considerar somente receitas efetivamente recebidas no período.

---

## BR-513

O saldo em caixa deve ser calculado a partir das movimentações realizadas e não mantido como valor manual independente.

---

## BR-514

Documentos financeiros devem utilizar a infraestrutura central de documentos.

---

## BR-515

Operações financeiras relevantes devem ser auditadas.

---

# Contratos

## BR-600

Todo Contrato deve estar associado a um Cliente.

---

## BR-601

Um Contrato deve ser criado a partir de um modelo reutilizável ou de um fluxo oficialmente permitido.

---

## BR-602

Dados existentes do Cliente devem ser reutilizados quando aplicáveis à geração do Contrato.

---

## BR-603

A identificação fiscal não deve ser limitada exclusivamente a CPF.

Tipos suportados podem incluir:

```text
CPF
CNPJ
NIF
VAT
```

---

## BR-604

Ao gerar um Contrato, o sistema deve preservar um snapshot dos dados utilizados.

---

## BR-605

Alterações posteriores no cadastro do Cliente não podem modificar retroativamente um Contrato já gerado.

---

## BR-606

Os status iniciais de Contrato são:

```text
DRAFT
GENERATED
SENT
SIGNED
CANCELED
```

---

## BR-607

Um Contrato em `DRAFT` ainda pode ser editado conforme o fluxo permitido.

---

## BR-608

Um Contrato `GENERATED` deve preservar a versão gerada.

---

## BR-609

Um Contrato `SENT` deve preservar a versão enviada ao Cliente.

---

## BR-610

Um Contrato somente deve ser marcado como `SIGNED` quando existir confirmação válida do contrato assinado.

No MVP, essa confirmação ocorre através do upload da cópia assinada externamente.

---

## BR-611

Assinatura eletrônica integrada não faz parte do MVP.

---

## BR-612

O cancelamento de um Contrato não deve eliminar suas versões históricas.

---

## BR-613

Contratos e suas versões devem utilizar a infraestrutura central de documentos.

---

## BR-614

Operações relevantes de Contratos devem ser auditadas.

Incluindo, quando aplicável:

- criação;
- geração;
- envio;
- alteração de Status;
- upload da versão assinada;
- cancelamento.

---

# Dashboard

## BR-700

O Dashboard deve apresentar informações derivadas dos módulos oficiais.

---

## BR-701

O Dashboard não deve exigir manutenção manual dos indicadores.

---

## BR-702

O saldo exibido no Dashboard deve utilizar a mesma regra de saldo do módulo Financeiro.

---

## BR-703

Os indicadores de Demandas devem utilizar os mesmos Status oficiais do módulo Demandas.

---

## BR-704

Uma Demanda atrasada no Dashboard deve seguir a mesma regra de atraso definida nas regras de Demandas.

---

## BR-705

O Dashboard não deve exibir dados simulados como se fossem informações reais da empresa.

---

## BR-706

Reuniões não devem fazer parte dos indicadores oficiais enquanto não existir fonte de dados correspondente no MVP.

---

# Activity Logs

## BR-800

Activity Logs devem registrar operações relevantes definidas como auditáveis.

---

## BR-801

Activity Logs devem permanecer imutáveis após sua criação.

---

## BR-802

Activity Logs não devem ser eliminados pelo fluxo normal da aplicação.

---

## BR-803

Quando uma operação exigir atomicidade entre a alteração principal e sua auditoria, ambas devem ser consideradas uma única operação lógica.

---

## BR-804

Um Activity Log deve identificar, quando aplicável:

- utilizador;
- Organization;
- entidade;
- ação;
- data.

---

# Regras Gerais de Arquivamento

## BR-900

Arquivamento e exclusão física são conceitos diferentes.

---

## BR-901

O fluxo operacional padrão deve utilizar arquivamento quando o domínio exigir preservação histórica.

---

## BR-902

Registros arquivados não devem aparecer nas listagens padrão.

---

## BR-903

Arquivamento não deve apagar Activity Logs relacionados.

---

# Fora do Escopo

Não fazem parte das regras de negócio do MVP v3.0:

- Leads;
- conversão Lead → Cliente;
- Projetos;
- Product Registry operacional;
- Agenda;
- gestão estruturada de reuniões;
- assinatura eletrônica integrada;
- cobrança automática;
- emissão fiscal automática;
- contabilidade completa;
- SaaS multiempresa em produção.

Esses domínios somente devem ser introduzidos após alteração formal do PRD.

---

# Fonte da Verdade

Estas regras implementam o domínio funcional definido em:

```text
PRD v3.0

↓

MVP Scope v3.0

↓

Product Roadmap v3.0

↓

Functional Requirements v3.0
```

As regras centrais são:

```text
Cliente
├── Demandas
├── Contratos
├── Financeiro
├── Documentos
└── Acessos
```

Clientes são a entidade operacional central.

Demandas substituem Projetos como unidade de trabalho do MVP.

Status, Prioridade e Tags de Demandas são conceitos independentes.

O saldo financeiro é derivado de movimentações realizadas.

Contratos preservam snapshots.

A autorização de MEMBER depende da associação aos Clientes.

---

# Definition of Done

Uma regra de negócio será considerada corretamente implementada quando:

- estiver alinhada ao PRD;
- estiver refletida nos Functional Requirements correspondentes;
- possuir User Stories compatíveis quando aplicável;
- não introduzir comportamento fora do MVP;
- estiver protegida pelas regras de autorização aplicáveis;
- possuir testes quando seu risco justificar;
- estiver refletida na implementação sem contradições.