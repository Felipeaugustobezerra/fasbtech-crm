# Contracts

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟢 Implementado na Sprint 05

---

## Última atualização

Setembro de 2026

---

# Objetivo

Este documento registra o contrato físico implementado na Sprint 05 — Contratos pela Migration 005.

Define tabelas, constraints, lifecycle, snapshot, documentos privados, autorização, RLS, Grants, RPCs, Activity Logs e índices mínimos.

---

# Fontes Normativas

- Sprint 05 — Contratos;
- Data Model;
- Migrations;
- Activity Logs;
- RLS e ADR-002;
- migrations reais existentes;
- Demands e Financial.

Os padrões atuais de UUID, autoria, integridade entre Organizations, menor privilégio, RPCs privilegiadas e auditoria atômica deverão ser preservados.

---

# Escopo Físico Congelado

A Migration 005 deverá criar exclusivamente:

```text
contract_templates
contracts
documents
```

Também deverá criar constraints, triggers privados, RLS, Grants, Policies, helpers, dez RPCs transacionais, Activity Logs, Policies para o bucket existente e índices deste contrato.

`documents` é a infraestrutura central de metadata. Não criar `contract_documents`.

---

# Fora do Escopo Físico

Não criar `contract_versions`, `contract_documents`, `contract_activities`, `contract_template_versions`, `email_queue` ou `notifications`.

Também ficam fora:

- e-sign ou assinatura certificada interna;
- versionamento complexo de templates;
- regeneração do mesmo Contract;
- delete físico operacional;
- scheduler, cron, worker ou fila de e-mail;
- billing, cobrança, IA e Dashboard consolidado.

---

# Modelo Relacional

```text
organizations
├── contract_templates
│   └── contracts ── clients
│       └── documents
└── activity_logs
```

```text
Organization 1 ── N Contract Templates
Organization 1 ── N Contracts
Client       1 ── N Contracts
Template     1 ── N Contracts
Contract     1 ── 1 ORIGINAL_PDF
Contract     1 ── 0..1 SIGNED_COPY
```

Relação não concede autorização.

---

# Convenções Físicas

- Primary Keys utilizam UUID gerado pelo banco;
- timestamps utilizam `TIMESTAMPTZ`;
- domínios fechados utilizam `TEXT` com constraints;
- textos obrigatórios exigem `btrim(value) <> ''`;
- `updated_at` reutiliza o mecanismo privado existente;
- autoria referencia `profiles`;
- nomes físicos usam inglês e `snake_case`;
- campos de autorização e autoria nunca vêm do browser;
- JSON recebido por RPC é validado antes de persistir;
- relações cross-Organization são negadas no banco e nas RPCs;
- não existe delete operacional.

---

# Tabela `contract_templates`

## Colunas

| Coluna | Tipo | Obrigatória | Default | Responsabilidade |
|---|---|---:|---|---|
| `id` | UUID | Sim | UUID do banco | Identificador |
| `organization_id` | UUID | Sim | Nenhum | Organization proprietária |
| `name` | TEXT | Sim | Nenhum | Nome operacional |
| `content` | TEXT | Sim | Nenhum | Corpo reutilizável |
| `is_active` | BOOLEAN | Sim | `true` | Disponibilidade para novos Contracts |
| `created_by` | UUID | Sim | RPC | Profile criador |
| `updated_by` | UUID | Sim | RPC | Profile da última alteração |
| `created_at` | TIMESTAMPTZ | Sim | Instante atual | Criação |
| `updated_at` | TIMESTAMPTZ | Sim | Instante atual | Atualização |

## Integridade

- Primary Key em `id`;
- Foreign Keys para `organizations` e `profiles`;
- UNIQUE em `(id, organization_id)` para FK composta de `contracts`;
- checks de nome e conteúdo não vazios;
- Foreign Keys restritivas;
- nome não é único; identidade é o UUID.

## Lifecycle

- somente OWNER administra;
- template ativo pode iniciar Contract;
- template inativo não pode iniciar Contract;
- ativação e desativação usam RPCs próprias;
- nome e conteúdo podem ser editados;
- mudanças futuras não alteram Contracts gerados;
- sem versionamento, archive ou delete físico.

---

# Tabela `contracts`

## Colunas

| Coluna | Tipo | Obrigatória | Default | Responsabilidade |
|---|---|---:|---|---|
| `id` | UUID | Sim | UUID do banco | Identificador |
| `organization_id` | UUID | Sim | Nenhum | Organization proprietária |
| `client_id` | UUID | Sim | Nenhum | Cliente obrigatório |
| `template_id` | UUID | Sim | Nenhum | Template de origem |
| `title` | TEXT | Sim | Nenhum | Título operacional |
| `status` | TEXT | Sim | `DRAFT` | Status oficial |
| `draft_data` | JSONB | Sim | `{}` | Dados editáveis da preparação |
| `snapshot` | JSONB | Não | `NULL` | Snapshot final imutável |
| `sent_to_email` | TEXT | Não | `NULL` | Destinatário efetivamente utilizado |
| `generated_at` | TIMESTAMPTZ | Não | `NULL` | Geração concluída |
| `sent_at` | TIMESTAMPTZ | Não | `NULL` | Envio confirmado |
| `signed_at` | TIMESTAMPTZ | Não | `NULL` | Cópia assinada confirmada |
| `canceled_at` | TIMESTAMPTZ | Não | `NULL` | Cancelamento |
| `created_by` | UUID | Sim | RPC | Profile criador |
| `updated_by` | UUID | Sim | RPC | Profile da última alteração |
| `created_at` | TIMESTAMPTZ | Sim | Instante atual | Criação |
| `updated_at` | TIMESTAMPTZ | Sim | Instante atual | Atualização |

`draft_data` não é snapshot. Após geração, leituras não o utilizam para reconstruir o conteúdo final.

## Foreign Keys

- PK em `id`;
- FK de `organization_id` para `organizations`;
- FK composta `(client_id, organization_id)` para `clients`;
- FK composta `(template_id, organization_id)` para `contract_templates`;
- FKs de autoria para `profiles`;
- UNIQUE em `(id, organization_id)` para integridade documental;
- todas as Foreign Keys são restritivas.

## Imutabilidade

Sempre imutáveis: `id`, `organization_id`, `created_by` e `created_at`.

Editáveis somente em `DRAFT`: `client_id`, `template_id`, `title` e `draft_data`.

Após `GENERATED`, também são imutáveis: `client_id`, `template_id`, `title`, `draft_data`, `snapshot` e `generated_at`.

Campos de lifecycle somente mudam pelas RPCs autorizadas.

## Cliente e Template

- Client, Template e Contract pertencem à mesma Organization;
- Cliente e Template são obrigatórios;
- Cliente arquivado não pode criar, atualizar nem gerar novo Contract;
- Template inativo não pode criar, atualizar nem gerar novo Contract;
- `client_id` e `template_id` podem mudar somente em `DRAFT`;
- archive posterior do Cliente e desativação posterior do Template não invalidam histórico;
- Client Assignment não concede acesso.

---

# Status e Lifecycle

## Domínio

```text
DRAFT
GENERATED
SENT
SIGNED
CANCELED
```

## Transições permitidas

```text
DRAFT     → GENERATED
GENERATED → SENT
GENERATED → CANCELED
SENT      → SIGNED
SENT      → CANCELED
```

`SIGNED` e `CANCELED` são terminais. Não existe retorno a `DRAFT`, `SIGNED → CANCELED`, regeneração ou delete.

RPCs e trigger privado de lifecycle protegem as transições.

## Constraints por Status

| Status | Snapshot/geração | Envio | Assinatura | Cancelamento |
|---|---|---|---|---|
| `DRAFT` | `snapshot` e `generated_at` nulos | `sent_at` e `sent_to_email` nulos | `signed_at` nulo | `canceled_at` nulo |
| `GENERATED` | preenchidos | nulos | nulo | nulo |
| `SENT` | preenchidos | `sent_at` e `sent_to_email` preenchidos | nulo | nulo |
| `SIGNED` | preenchidos | preenchidos | `signed_at` preenchido | nulo |
| `CANCELED` | preenchidos | ambos nulos ou ambos preenchidos | nulo | `canceled_at` preenchido |

CHECK constraints expressam a nulabilidade. Validação relacional diferida garante documentos obrigatórios.

---

# Snapshot Contratual

## Representação

`snapshot` utiliza JSONB, é `NULL` em `DRAFT` e objeto não vazio após geração.

Estrutura mínima:

```json
{
  "schema_version": 1,
  "content": "conteúdo final",
  "client": {
    "id": "uuid",
    "data": {},
    "tax_id": null,
    "tax_id_type": null
  },
  "manual_fields": {},
  "template": {
    "id": "uuid",
    "name": "nome utilizado"
  }
}
```

## Regras

- `schema_version` é inteiro positivo;
- `content` é texto não vazio;
- IDs do Client e Template correspondem às colunas do Contract;
- dados usados do Cliente são preservados;
- `tax_id` e `tax_id_type` são sempre representados, inclusive como `NULL`;
- `manual_fields` é objeto;
- origem e nome do Template são preservados;
- a RPC valida forma, tipos e identidades;
- CHECKs validam objeto e chaves mínimas;
- snapshot é imutável após `GENERATED`.

Não criar colunas fiscais duplicadas em `contracts`. A fonte editável é `clients`; a história pertence ao snapshot.

---

# Tabela `documents`

## Responsabilidade

Metadata central e imutável de arquivos privados. Na Sprint 05 aceita somente `CONTRACT` com `ORIGINAL_PDF` ou `SIGNED_COPY`.

## Colunas

| Coluna | Tipo | Obrigatória | Default | Responsabilidade |
|---|---|---:|---|---|
| `id` | UUID | Sim | Gerado antes do upload | Identificador e segmento do path |
| `organization_id` | UUID | Sim | Nenhum | Organization proprietária |
| `entity_type` | TEXT | Sim | Nenhum | `CONTRACT` nesta Sprint |
| `entity_id` | UUID | Sim | Nenhum | Contract relacionado |
| `kind` | TEXT | Sim | Nenhum | `ORIGINAL_PDF` ou `SIGNED_COPY` |
| `bucket_id` | TEXT | Sim | `private-files` | Bucket oficial |
| `object_path` | TEXT | Sim | Nenhum | Caminho único |
| `file_name` | TEXT | Sim | Nenhum | Nome apresentado |
| `mime_type` | TEXT | Sim | `application/pdf` | MIME validado |
| `size_bytes` | BIGINT | Sim | Nenhum | Tamanho positivo |
| `created_by` | UUID | Sim | RPC | Profile responsável |
| `created_at` | TIMESTAMPTZ | Sim | Instante atual | Registro |

Não existem campos de atualização, archive ou delete porque a metadata é imutável.

## Constraints

- PK em `id` e FKs para Organization/Profile;
- checks dos domínios `CONTRACT`, `ORIGINAL_PDF|SIGNED_COPY`, `private-files` e `application/pdf`;
- path e nome não vazios;
- `size_bytes > 0`;
- UNIQUE em `object_path`;
- UNIQUE em `(entity_type, entity_id, kind)`;
- trigger privado confirma Contract existente, mesma Organization e proíbe UPDATE/DELETE.

Futuras Sprints poderão ampliar os domínios por migration, sem criar tabela paralela.

---

# Storage, PDF e Signed Copy

## Bucket e path

Reutilizar somente `private-files`.

Path canônico:

```text
<organization_id>/contracts/<contract_id>/<document_id>/<kind>.pdf
```

## Policies

- SELECT e upload somente para OWNER `ACTIVE` da Organization do Contract;
- upload somente em path canônico e Status compatível;
- negar UPDATE, upsert e substituição;
- negar delete operacional;
- negar ADMIN, MEMBER, anon e cross-Organization;
- nunca autorizar somente pelo texto do path;
- downloads usam sessão autorizada ou URL assinada curta após autorização atual.

## Fluxo entre Storage e banco

1. gerar UUID documental e path;
2. gerar arquivo antes da transição;
3. upload sem upsert;
4. RPC valida objeto, registra metadata, muda Contract e grava Log;
5. se a RPC falhar, remover compensatoriamente apenas o objeto órfão sem metadata.

## PDF original

- gerado a partir do snapshot final;
- `kind = ORIGINAL_PDF`;
- privado e imutável;
- exatamente um por Contract gerado;
- nunca substituído;
- geração/upload ocorrem antes de `generate_contract`;
- falha mantém `DRAFT`;
- biblioteca fica para implementação.

## Signed copy

- `kind = SIGNED_COPY`;
- PDF privado separado do original;
- no máximo um por Contract;
- somente associado em `SENT`;
- metadata e `SENT → SIGNED` são atômicos no banco;
- obrigatório para `SIGNED`;
- `signed_at` vem do relógio do banco;
- sem substituição ou delete;
- falha mantém `SENT`.

---

# Persistência do E-mail

Não criar tabela ou fila. Persistir somente `sent_to_email` e `sent_at` em `contracts`.

`sent_to_email` registra o destinatário efetivamente usado. `mark_contract_sent` é chamada somente após sucesso do provider, valida o e-mail, define `sent_at`, muda para `SENT` e registra Log.

Falha do provider mantém `GENERATED`. Provider, fila e scheduler não fazem parte do banco.

---

# Matriz de Autorização

| Actor | Templates SELECT | Templates mutation | Contracts SELECT | Contracts mutation | Documents |
|---|---:|---:|---:|---:|---:|
| OWNER `ACTIVE` da própria Organization | Sim | RPC | Sim | RPC | Sim |
| ADMIN | Não | Não | Não | Não | Não |
| MEMBER com ou sem Client Assignment | Não | Não | Não | Não | Não |
| Outra Organization | Não | Não | Não | Não | Não |
| `anon` | Não | Não | Não | Não | Não |

A Organization deverá estar `ACTIVE`. Client Assignment nunca participa positivamente da autorização.

---

# RLS e Grants

## Tabelas

Ativar RLS em `contract_templates`, `contracts` e `documents`.

## SELECT

Cada tabela terá Policy somente para `authenticated` com `auth.uid()` válido, Profile válido, Membership `ACTIVE`, role `OWNER` e Organization `ACTIVE` correspondente à linha.

Não criar Policy para ADMIN, MEMBER ou anon.

## Escritas diretas

- não criar Policies de INSERT, UPDATE ou DELETE;
- revogar todos os privilégios de tabela de `anon` e `authenticated`;
- conceder a `authenticated` somente SELECT;
- mutations ocorrem exclusivamente por RPC.

As Policies de `storage.objects` aplicam a mesma autorização OWNER-only e o vínculo atual ao Contract.

---

# Hardening das RPCs

Todas as RPCs:

- são `SECURITY DEFINER`;
- usam `SET search_path = ''`;
- usam schemas explícitos;
- resolvem `auth.uid()` internamente;
- validam Profile, Membership `ACTIVE`, OWNER e Organization `ACTIVE`;
- não recebem `organization_id`, autoria, role ou user ID do caller;
- rejeitam cross-Organization;
- validam Status e transição;
- escrevem Activity Log na mesma transação;
- não diferenciam entidade inexistente de não autorizada para o caller.

Revogar `EXECUTE` de `PUBLIC`, `anon` e roles não autorizadas. Conceder somente a `authenticated`, mantendo autorização OWNER dentro da função.

---

# RPCs de Templates

## `create_contract_template`

Entrada: `p_name`, `p_content`.

Normaliza textos, cria template ativo na Organization do OWNER, define autoria, registra `CONTRACT_TEMPLATE / CREATED` e retorna UUID.

## `update_contract_template`

Entrada: `p_template_id`, `p_name`, `p_content`.

Atualiza nome e conteúdo do template autorizado, sem alterar `is_active`, e registra `CONTRACT_TEMPLATE / UPDATED`.

## `activate_contract_template`

Recebe somente `p_template_id`, exige estado inativo, ativa e registra `CONTRACT_TEMPLATE / ACTIVATED`.

## `deactivate_contract_template`

Recebe somente `p_template_id`, exige estado ativo, desativa e registra `CONTRACT_TEMPLATE / DEACTIVATED`.

---

# RPCs de Contracts

## `create_contract`

Entrada:

```text
p_client_id
p_template_id
p_title
p_draft_data
```

Exige Client não arquivado e Template ativo da mesma Organization, valida título/draft, cria `DRAFT`, define autoria, registra `CONTRACT / CREATED` e retorna UUID.

## `update_draft_contract`

Entrada:

```text
p_contract_id
p_client_id
p_template_id
p_title
p_draft_data
```

Exige `DRAFT`, revalida Client e Template e altera somente os campos editáveis, registrando `CONTRACT / UPDATED`.

## `generate_contract`

Entrada:

```text
p_contract_id
p_snapshot
p_document_id
p_object_path
p_file_name
p_mime_type
p_size_bytes
```

Exige `DRAFT`, Client não arquivado e Template ativo. Valida snapshot e objeto original já enviado, insere metadata `ORIGINAL_PDF`, define snapshot/`generated_at`, muda para `GENERATED` e registra `CONTRACT / GENERATED` atomicamente no banco.

## `mark_contract_sent`

Entrada: `p_contract_id`, `p_recipient_email`.

Exige `GENERATED` e PDF original. Após sucesso do provider, persiste destinatário e `sent_at`, muda para `SENT` e registra `CONTRACT / SENT`.

## `mark_contract_signed`

Entrada:

```text
p_contract_id
p_document_id
p_object_path
p_file_name
p_mime_type
p_size_bytes
```

Exige `SENT`, valida objeto assinado, insere `SIGNED_COPY`, define `signed_at`, muda para `SIGNED` e registra `CONTRACT / SIGNED` atomicamente no banco.

## `cancel_contract`

Recebe somente `p_contract_id`. Aceita `GENERATED` ou `SENT`, define `canceled_at`, muda para `CANCELED`, preserva snapshot/documentos e registra `CONTRACT / CANCELED`.

Não existem RPCs de regenerate, restore, delete ou cancelamento de `SIGNED`.

---

# Activity Logs

## Actions congeladas

```text
CONTRACT / CREATED
CONTRACT / UPDATED
CONTRACT / GENERATED
CONTRACT / SENT
CONTRACT / SIGNED
CONTRACT / CANCELED

CONTRACT_TEMPLATE / CREATED
CONTRACT_TEMPLATE / UPDATED
CONTRACT_TEMPLATE / ACTIVATED
CONTRACT_TEMPLATE / DEACTIVATED
```

- Contract usa `entity_type = CONTRACT`;
- Template usa `entity_type = CONTRACT_TEMPLATE`;
- ampliar constraints de `activity_logs` somente para esses valores;
- não criar tabela de Log específica;
- mutation e Log são atômicos;
- falha no Log causa rollback.

Metadata deverá ser mínima. Não armazenar snapshot, conteúdo, dados fiscais, destinatário completo, arquivo, URL, campos manuais, secrets ou resposta do provider.

---

# Queries Previstas

## Templates

- listagem autorizada;
- pesquisa por `name`;
- filtro por `is_active`;
- ordenação por whitelist de `name`, `created_at`, `updated_at`;
- paginação no banco;
- detalhe por ID.

## Contracts

- listagem autorizada;
- pesquisa por `title`;
- filtros por `status`, `client_id`, `template_id`;
- ordenação por whitelist de `title`, `created_at`, `updated_at`, `generated_at`, `sent_at`, `signed_at`;
- paginação no banco;
- detalhe por ID;
- documentos do Contract autorizado.

Leituras comuns usam Query + RLS. Não criar RPC de listagem.

---

# Índices Congelados

## `contract_templates`

1. `(organization_id, is_active, updated_at DESC, id)`;
2. `(organization_id, name, id)`.

## `contracts`

1. `(organization_id, updated_at DESC, id)`;
2. `(organization_id, status, updated_at DESC, id)`;
3. `(client_id, updated_at DESC, id)`;
4. `(template_id, updated_at DESC, id)`.

## `documents`

1. UNIQUE em `object_path`;
2. UNIQUE em `(entity_type, entity_id, kind)`;
3. `(organization_id, entity_type, entity_id, created_at, id)`.

Não criar índices para Dashboard, analytics, provider ou busca avançada.

---

# Triggers Privados

A Migration deverá implementar triggers mínimos para:

- `updated_at`;
- imutabilidade estrutural;
- lifecycle e transições;
- consistência dos timestamps;
- integridade polimórfica e imutabilidade de `documents`;
- proibição de delete;
- validação diferida de `ORIGINAL_PDF` para estados gerados;
- validação diferida de `SIGNED_COPY` para `SIGNED`.

Triggers de integridade não substituem autorização, RLS ou RPCs.

---

# Testes Físicos Implementados

Os testes pgTAP cobrem schema, constraints, lifecycle, imutabilidade, cross-Organization, Cliente arquivado, Template inativo, snapshot, documentos, RLS OWNER-only, Grants, hardening, Activity Logs, Storage e Data Leakage.

---

# Decisões Técnicas sem Impacto no Schema

- geração de PDF com `pdf-lib`;
- envio de e-mail com Resend;
- editor simples do Template;
- limites operacionais de upload respeitando a Migration 005.

Essas escolhas não reabrem schema, lifecycle, autorização ou snapshot.

---

# Blockers Físicos Restantes

```text
Nenhum.
```

O contrato foi traduzido na Migration 005 e validado pelos testes automatizados da Sprint 05.

---

# Definition of Done do Contrato

Este contrato define schemas, tipos, nulabilidade, defaults, constraints, snapshot JSONB, lifecycle, integridade organizacional, Documents, PDF, signed copy, envio, autorização, RLS, Grants, Storage, dez RPCs, Activity Logs, Queries e índices mínimos.
