# ADR-002 — Estratégia de Persistência e Transações

## Projeto

FASBtech CRM

---

## Status

✅ Aprovado

---

## Versão

3.0

---

# Contexto

O FASBtech CRM possui operações de escrita com diferentes níveis de complexidade.

Algumas operações modificam apenas uma entidade.

Outras podem:

- modificar múltiplas tabelas;
- exigir auditoria obrigatória;
- alterar relacionamentos;
- depender de autorização específica;
- exigir atomicidade;
- representar uma única unidade de negócio.

Exemplos atuais e futuros dentro do MVP:

- criação ou atualização de Membership;
- alteração de Role;
- Bootstrap inicial;
- criação de Cliente com operação auditável;
- associação ou remoção de utilizador de um Cliente;
- alteração de Status de Demanda;
- alteração de responsáveis de uma Demanda;
- operações financeiras que exijam múltiplas escritas;
- geração de Contrato com snapshot e documentos relacionados.

Essas operações deverão preservar a consistência do sistema.

Quando várias alterações fizerem parte da mesma unidade de negócio:

```text
ou todas persistem

ou nenhuma persiste
```

---

# Problema

Chamadas independentes feitas através do cliente Supabase não compartilham automaticamente a mesma transação PostgreSQL.

Exemplo conceitual:

```text
UPDATE entidade

↓

INSERT activity_logs
```

Se essas operações forem realizadas em chamadas separadas:

```text
primeira escrita concluída

↓

segunda escrita falha
```

o sistema poderá ficar em estado inconsistente.

Outro risco é permitir que utilizadores autenticados criem registros diretamente em:

```text
activity_logs
```

o que permitiria forjar ou manipular auditoria.

---

# Decisão

O FASBtech CRM adotará três caminhos oficiais de persistência:

```text
Query
Mutation
RPC
```

A escolha dependerá da natureza da operação.

---

# Princípio Central

Não utilizar RPC apenas porque existe uma escrita.

RPC deverá ser utilizada quando houver necessidade arquitetural real.

Fluxo de decisão:

```text
Leitura
    ↓
Query

Escrita simples
    ↓
Mutation

Escrita transacional / auditada / privilegiada
    ↓
RPC
```

---

# Arquitetura Oficial

## Leituras

Fluxo padrão:

```text
Server Component

↓

Service quando necessário

↓

Query

↓

Supabase

↓

RLS + Policies

↓

PostgreSQL
```

Queries são responsáveis exclusivamente por leitura.

---

# RPC em Leituras

RPC não deverá ser utilizada por padrão para:

- listagens;
- pesquisas;
- filtros;
- paginação;
- detalhes;
- consultas comuns.

Quando uma leitura simples puder ser representada por Query:

```text
utilizar Query
```

Uma função PostgreSQL somente deverá ser utilizada para leitura quando houver necessidade técnica concreta e documentada.

---

# Escritas Simples

Uma escrita poderá utilizar Mutation quando:

- envolver uma única operação persistente simples;
- não exigir múltiplas alterações atômicas;
- não exigir Activity Log obrigatório na mesma transação;
- não depender de privilégio controlado indisponível via RLS normal;
- puder ser autorizada corretamente por RLS e Policies.

Fluxo:

```text
Server Action

↓

Service

↓

Mutation

↓

Supabase

↓

RLS + Policies

↓

PostgreSQL
```

---

# Escritas Transacionais

Quando houver necessidade de atomicidade:

```text
Server Action

↓

Service

↓

RPC PostgreSQL

↓

Autorização interna

↓

Mutações relacionadas

+

Activity Log quando obrigatório

↓

Retorno
```

Toda a execução da função ocorre dentro da mesma transação da chamada PostgreSQL.

Se a função gerar uma exceção:

```text
a transação falha

↓

as alterações da operação são revertidas
```

---

# Quando Utilizar RPC

RPC deverá ser considerada quando ocorrer pelo menos uma das seguintes condições.

---

## Múltiplas Escritas Atômicas

Exemplo:

```text
criar entidade

+

criar relacionamento obrigatório
```

Se uma parte falhar, nenhuma deverá permanecer.

---

## Activity Log Obrigatório na Mesma Operação

Exemplo:

```text
alterar Role

+

registrar ROLE_CHANGED
```

Quando a regra exigir que auditoria e mutação sejam inseparáveis:

```text
RPC
```

---

## Operação Privilegiada Controlada

Quando determinada operação não puder ser implementada com segurança apenas com RLS normal e precisar de:

```text
SECURITY DEFINER
```

a função deverá realizar toda a autorização internamente.

---

## Bootstrap

Bootstrap é um caso especial porque ocorre antes da existência da Membership inicial.

Seu contrato específico permanece definido no documento oficial de Bootstrap.

---

# Exemplos por Sprint

## Sprint 01 — Foundation

Operações que podem exigir RPC:

```text
Bootstrap

Alteração de Role quando auditada atomicamente

Operações administrativas compostas de Membership
```

A necessidade exata deverá seguir a regra funcional e o contrato de auditoria.

---

## Sprint 02 — Clientes & Acessos

Exemplos possíveis:

```text
associar utilizador a Cliente

+

Activity Log
```

ou:

```text
remover Client Assignment

+

Activity Log
```

se a auditoria obrigatória tiver de ocorrer na mesma transação.

---

## Sprint 03 — Demandas

Exemplos possíveis:

```text
alterar Status

+

Activity Log
```

```text
atualizar múltiplos responsáveis

+

Activity Log
```

---

## Sprint 04 — Financeiro

RPC poderá ser necessária quando uma operação financeira envolver:

- múltiplas escritas relacionadas;
- consistência transacional;
- auditoria inseparável.

Não assumir RPC para toda movimentação financeira sem necessidade.

---

## Sprint 05 — Contratos

Operações compostas podem incluir:

```text
gerar Contrato

+

preservar snapshot

+

registrar estado

+

Activity Log
```

quando esses elementos fizerem parte da mesma unidade transacional.

---

# Quando NÃO Utilizar RPC

Não utilizar RPC apenas por conveniência.

Evitar RPC para:

- consultas simples;
- listagens;
- pesquisas;
- filtros;
- paginação;
- detalhes;
- writes triviais que RLS resolve corretamente;
- abstrações sem necessidade transacional.

---

# SECURITY DEFINER

Algumas RPCs transacionais poderão utilizar:

```sql
SECURITY DEFINER
```

Isso significa que a função executa com os privilégios do owner da função.

Por esse motivo, `SECURITY DEFINER` deverá ser tratado como fronteira crítica de segurança.

---

# Regra de Segurança

Toda RPC `SECURITY DEFINER` deverá aplicar internamente as mesmas regras de autorização exigidas pelo domínio.

Conforme aplicável:

- validar `auth.uid()`;
- resolver Profile;
- validar Membership `ACTIVE`;
- resolver Organization;
- validar estado da Organization;
- validar Role;
- validar ownership da entidade;
- validar Client Assignment;
- validar permissões específicas do módulo.

Nunca confiar em campos de autorização fornecidos pelo navegador.

---

# Hardening Obrigatório

Toda função `SECURITY DEFINER` deverá seguir o contrato definido no documento oficial:

```text
RLS
```

Incluindo:

```sql
SET search_path = ''
```

quando aplicável ao padrão adotado pelo projeto.

Também deverá utilizar referências explícitas de schema.

Exemplo conceitual:

```sql
public.organization_members
public.activity_logs
auth.uid()
```

Evitar resolução implícita de objetos via `search_path`.

---

# EXECUTE

Funções privilegiadas não deverão permanecer executáveis por:

```text
PUBLIC
```

ou:

```text
anon
```

quando não houver necessidade explícita.

O padrão deverá seguir o documento RLS:

```text
REVOKE EXECUTE FROM PUBLIC

REVOKE EXECUTE FROM anon

GRANT EXECUTE TO authenticated
```

ajustado ao contrato específico de cada função.

---

# Relação com RLS

Row Level Security continua obrigatória para tabelas protegidas.

RLS protege:

- Queries;
- Mutations simples;
- acesso direto permitido às tabelas;
- recursos expostos através da API de dados.

---

# RPC não Substitui RLS

A existência de RPC não significa que as tabelas possam ficar sem Policies.

Fluxo conceitual:

```text
Acesso normal a tabela
    ↓
RLS

Operação privilegiada controlada
    ↓
RPC com autorização interna
```

---

# SECURITY DEFINER e RLS

Uma função `SECURITY DEFINER` pode executar com privilégios diferentes do utilizador chamador.

Por isso:

```text
não depender apenas da RLS
```

para proteger a lógica interna da função.

A RPC deverá validar explicitamente o contexto autenticado antes de executar alterações privilegiadas.

---

# Activity Logs

Existe uma única infraestrutura oficial:

```text
activity_logs
```

A tabela deverá permanecer centralizada.

---

# INSERT Direto

Utilizadores autenticados não deverão possuir permissão para executar:

```text
INSERT direto em activity_logs
```

---

# Registro de Auditoria

Quando determinada operação exigir auditoria atômica:

```text
Mutação

+

Activity Log
```

deverão ocorrer na mesma RPC.

---

# Exemplo Conceitual

```text
RPC
│
├── validar autenticação
├── validar autorização
├── executar mutação
├── inserir Activity Log
└── retornar resultado
```

Se qualquer passo gerar erro:

```text
nenhuma alteração da operação deverá permanecer persistida
```

---

# Auditoria não é Segunda Chamada Pós-Commit

Não utilizar:

```text
Mutation concluída

↓

RPC / INSERT de Activity Log depois
```

quando a regra exigir atomicidade entre ambas.

Isso poderia gerar:

```text
mutação sem auditoria
```

---

# Operações sem Activity Log

Nem toda escrita exige obrigatoriamente Activity Log.

A necessidade de auditoria deverá vir de:

- Business Rules;
- Functional Requirements;
- Activity Logs;
- Sprint correspondente.

Se uma escrita simples:

- afetar uma única tabela;
- não exigir auditoria atômica;
- puder ser protegida por RLS;

ela poderá permanecer como Mutation.

---

# Responsabilidades

## Server Action

Responsável por:

- receber a intenção do utilizador;
- validar entrada;
- validar pré-condições de interface quando aplicável;
- chamar o Service;
- tratar retorno esperado.

Server Action não deverá concentrar regras de negócio complexas.

---

# Service

Responsável por:

- aplicar ou coordenar regras de negócio;
- decidir entre Query, Mutation e RPC;
- coordenar dependências da operação;
- retornar resultado de domínio.

---

# Query

Responsável exclusivamente por leitura.

Nunca deverá modificar dados.

---

# Mutation

Responsável por uma escrita simples.

Características:

- não coordena transação composta;
- não cria auditoria obrigatória separadamente;
- depende de RLS/Policies;
- possui responsabilidade limitada.

---

# RPC

Responsável por operações onde a fronteira transacional ou privilegiada pertença ao banco.

Pode:

- validar contexto autenticado;
- validar autorização;
- executar múltiplas escritas;
- registrar Activity Log;
- preservar atomicidade;
- retornar resultado estruturado.

---

# Supabase Service Role

Service Role não deverá ser utilizado no fluxo normal da aplicação para contornar:

```text
RLS

Policies

Membership

Authorization
```

Seu uso deverá ficar restrito a casos administrativos ou infraestrutura explicitamente autorizados.

---

# Bootstrap

Bootstrap permanece como exceção arquitetural porque ocorre antes da existência da Membership inicial.

Fluxo conceitual:

```text
auth.uid()

↓

validar estado inicial

↓

Profile

↓

Organization inicial

↓

Membership OWNER ACTIVE
```

Seu contrato é definido exclusivamente no documento:

```text
Bootstrap
```

---

# Bootstrap e SECURITY DEFINER

Se Bootstrap utilizar `SECURITY DEFINER`, deverá aplicar o hardening definido neste ADR e no documento RLS.

Também deverá ser:

- atômico;
- idempotente;
- seguro contra concorrência;
- independente de `organization_id` enviado pelo cliente;
- independente de `user_id` enviado pelo cliente.

---

# Não Confiar no Cliente

RPCs não deverão confiar em parâmetros como fonte de autorização.

Exemplo incorreto:

```text
p_user_id

p_organization_id

p_role
```

utilizados diretamente como identidade do chamador.

O contexto deverá ser derivado de:

```text
auth.uid()
```

e das relações persistidas.

---

# Organization

O MVP atual possui uma Organization operacional da FASBtech.

Ainda assim, o modelo deverá preservar:

```text
organization_id
```

nas entidades que dependam desse isolamento conforme o Data Model.

Não confundir isso com SaaS multiempresa em produção.

---

# Client Assignment

A partir da Sprint 02, recursos relacionados a Cliente poderão exigir:

```text
Membership ACTIVE

+

Client Assignment
```

conforme a role e as regras do módulo.

RPCs que atuem sobre entidade vinculada a Cliente deverão validar esse contexto quando aplicável.

---

# ADMIN

As permissões concretas de ADMIN deverão seguir:

- Business Rules;
- Functional Requirements;
- RLS;
- Sprint correspondente.

Este ADR não deverá inventar restrições adicionais.

---

# Resposta das RPCs

RPCs deverão retornar apenas os dados necessários à operação.

Evitar retornar:

- dados internos de autorização;
- secrets;
- detalhes desnecessários de Membership;
- informações de entidades não autorizadas.

---

# Erros

Falhas de autorização deverão produzir erro controlado.

Não retornar diretamente ao utilizador final:

- stack trace;
- SQL interno;
- detalhes sensíveis;
- informações que revelem existência de entidade não autorizada.

O tratamento externo deverá seguir:

```text
Error Handling
```

---

# Testes

RPCs privilegiadas deverão possuir testes adequados.

Conforme aplicável:

- utilizador autenticado;
- utilizador não autenticado;
- Membership ACTIVE;
- Membership inativa;
- Organization incorreta;
- Role não autorizada;
- Client Assignment ausente;
- Client Assignment válido;
- tentativa de spoofing de IDs;
- atomicidade;
- Activity Log;
- rollback em erro;
- grants;
- execução por `anon`;
- execução por `authenticated`.

---

# Ambiente de Testes

Testes de:

- RLS;
- RPC;
- Bootstrap;
- Grants;
- Policies;

deverão utilizar banco isolado quando essa infraestrutura estiver implementada.

O contrato pertence a:

```text
Testing Strategy
```

---

# Benefícios

- atomicidade quando necessária;
- auditoria consistente;
- autorização centralizada em operações privilegiadas;
- menor risco de estado parcial;
- separação clara entre leitura, escrita simples e escrita transacional;
- evolução consistente para novos módulos.

---

# Consequências Positivas

- operações compostas permanecem consistentes;
- Activity Logs não podem ser inseridos diretamente por utilizadores comuns;
- regras privilegiadas ficam explícitas;
- Server Actions permanecem menores;
- Services coordenam o domínio;
- RLS continua responsável por acesso normal às tabelas.

---

# Consequências Negativas

- RPCs exigem SQL e testes específicos;
- `SECURITY DEFINER` aumenta a responsabilidade de segurança;
- operações compostas exigem maior cuidado com contratos;
- mudanças em autorização podem exigir atualização simultânea de RLS e funções privilegiadas.

---

# Alternativas Rejeitadas

## Toda Escrita por RPC

Rejeitado.

Motivo:

```text
complexidade desnecessária para operações simples
```

---

## Auditoria em Segunda Chamada

Rejeitado quando a auditoria for obrigatória e inseparável da mutação.

Motivo:

```text
risco de mutação persistida sem Activity Log
```

---

## INSERT Direto de Activity Logs

Rejeitado.

Motivo:

```text
permite forjar auditoria
```

---

## Service Role para Operações Normais

Rejeitado.

Motivo:

```text
contorna o modelo oficial de autorização e RLS
```

---

# Impacto na Arquitetura

```text
Server Component / Client Interaction
                │
                ▼
          Server Action
                │
                ▼
             Service
                │
       ┌────────┼────────┐
       │        │        │
       ▼        ▼        ▼
     Query   Mutation    RPC
       │        │        │
       │        │        ├── autorização interna
       │        │        ├── múltiplas escritas
       │        │        └── Activity Log
       │        │
       └────────┼────────┘
                │
                ▼
             Supabase
                │
                ▼
           PostgreSQL
                │
          RLS + Policies
```

Observação:

```text
SECURITY DEFINER
```

pode executar sob privilégios diferentes do chamador e, portanto, deverá aplicar validações internas conforme este ADR e o documento RLS.

---

# Relação com Outros Documentos

Este ADR deverá permanecer sincronizado com:

- System Architecture;
- Module Architecture;
- RLS;
- Activity Logs;
- Data Model;
- Organization User Model;
- Migration 001;
- Migrations;
- Bootstrap;
- Testing Strategy;
- Error Handling;
- Sprint atual.

---

# Regras

Nunca:

- utilizar RPC para toda escrita sem necessidade;
- inserir Activity Logs diretamente como utilizador autenticado;
- confiar em IDs de autorização enviados pelo navegador;
- utilizar `SECURITY DEFINER` sem validação interna;
- utilizar `SECURITY DEFINER` sem hardening;
- deixar EXECUTE público sem necessidade;
- utilizar Service Role para contornar RLS;
- executar mutação e auditoria em chamadas separadas quando a regra exigir atomicidade.

Sempre:

- utilizar Query para leitura normal;
- utilizar Mutation para escrita simples quando suficiente;
- utilizar RPC quando houver necessidade real de atomicidade ou privilégio controlado;
- validar `auth.uid()`;
- validar Membership;
- validar Organization;
- validar autorização específica;
- seguir o documento RLS;
- manter auditoria consistente.

---

# Definition of Done

Uma operação transacional ou privilegiada somente será considerada concluída quando, conforme aplicável:

- possuir necessidade real de RPC;
- utilizar função oficial;
- validar `auth.uid()`;
- validar Profile;
- validar Membership `ACTIVE`;
- validar Organization;
- validar estado da Organization;
- validar Role;
- validar Client Assignment quando necessário;
- não confiar em identidade enviada pelo navegador;
- utilizar `SECURITY DEFINER` apenas quando necessário;
- aplicar hardening conforme RLS;
- utilizar `SET search_path = ''` quando definido pelo contrato;
- utilizar referências explícitas de schema;
- possuir EXECUTE restrito;
- executar todas as escritas relacionadas atomicamente;
- registrar Activity Log na mesma operação quando obrigatório;
- falhar integralmente em caso de erro;
- não permitir INSERT direto em Activity Logs;
- possuir testes de autorização;
- possuir testes de atomicidade;
- possuir testes de RLS e Grants;
- permanecer consistente com ADR-002, RLS e Activity Logs.