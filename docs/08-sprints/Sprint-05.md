# Sprint 05 — Contratos

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

Concluída

---

## Última atualização

Setembro de 2026

---

# Estado da Sprint

Este documento registra o contrato funcional, a execução e o encerramento da Sprint 05.

A Sprint possui contrato físico em `docs/04-database/Contracts.md`, Migration 005, implementação completa e testes automatizados.

Este documento separa explicitamente:

- decisões já congeladas para a Sprint;
- decisões encontradas nas fontes oficiais;
- decisões técnicas posteriores que não alteram o schema congelado.

---

# Objetivo

Implementar a criação, geração, armazenamento, envio e acompanhamento de Contratos da FASBtech a partir de templates reutilizáveis e de Clientes existentes.

O módulo deverá preservar exatamente o conteúdo efetivamente gerado, armazenar o PDF em infraestrutura privada e permitir registrar uma cópia assinada externamente.

---

# Dependências

```text
Sprint 01 — Foundation
Status: Concluída

Sprint 02 — Clientes & Acessos
Status: Concluída

Sprint 03 — Demandas
Status: Concluída

Sprint 04 — Financeiro
Status: Concluída
```

A Sprint reutilizará, conforme o contrato físico que ainda será aprovado:

- autenticação e sessão;
- Profiles, Organizations e Memberships;
- roles `OWNER`, `ADMIN` e `MEMBER`;
- Clientes;
- Activity Logs centralizados;
- Supabase Storage privado base;
- arquitetura de RLS, RPCs e Server Actions;
- AppShell, Design System e infraestrutura de testes.

---

# Fontes Consultadas

## Produto e Requisitos

- PRD v3.0;
- MVP Scope v3.0;
- Product Roadmap v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- User Stories v3.0.

## Arquitetura e Banco

- System Architecture;
- Module Architecture;
- Data Model;
- Migrations;
- RLS;
- Activity Logs;
- Migration 001;
- ADR-002 — Estratégia de Persistência e Transações.

## Execução

- AGENTS.md;
- Project Index;
- Sprints 01 a 04, quando aplicável.

---

# A. Decisões Já Congeladas

## Escopo funcional

- Contratos pertencem ao MVP.
- Todo Contrato pertence a exatamente um Cliente.
- O sistema utiliza templates reutilizáveis.
- Dados existentes do Cliente deverão ser reutilizados quando aplicáveis.
- Informações adicionais poderão ser preenchidas antes da geração.
- O conteúdo deverá ser revisado antes da geração final.
- O Contrato final deverá possuir versão PDF.
- A versão gerada deverá permanecer armazenada.
- O Contrato poderá ser enviado ao Cliente por e-mail.
- A cópia assinada externamente deverá poder ser enviada ao CRM.
- Operações relevantes deverão ser auditadas.

## Fluxo oficial da Sprint 05

```text
Template

↓

Selecionar Cliente

↓

Autofill

↓

Completar dados

↓

Revisar

↓

Gerar

↓

PDF

↓

Salvar

↓

Enviar por e-mail
```

Esse fluxo é o contrato de execução da Sprint 05. O envio por e-mail ocorre sobre uma versão gerada, salva e preservada.

## Status oficiais

O domínio possui exclusivamente:

```text
DRAFT
GENERATED
SENT
SIGNED
CANCELED
```

Não deverão ser criados outros Status sem alteração normativa prévia.

## Semântica mínima já definida

```text
DRAFT
→ ainda pode ser editado conforme o fluxo autorizado

GENERATED
→ possui versão gerada preservada

SENT
→ possui versão enviada preservada

SIGNED
→ exige confirmação válida por cópia assinada externamente

CANCELED
→ representa cancelamento sem eliminar versões históricas
```

## Transições permitidas

```text
DRAFT → GENERATED
GENERATED → SENT
GENERATED → CANCELED
SENT → SIGNED
SENT → CANCELED
```

Não são permitidos:

- retorno para `DRAFT` após a geração;
- regeneração do mesmo Contract depois de `GENERATED`;
- transição de `SIGNED` para `CANCELED`, pois não existe necessidade normativa explícita;
- qualquer transição a partir de `CANCELED`, que é terminal.

Uma nova versão comercial ou jurídica deverá ser representada por um novo Contract.

## Edição

- `DRAFT` é editável;
- `client_id` pode ser alterado somente enquanto o Contract estiver em `DRAFT`;
- depois de `GENERATED`, conteúdo, snapshot, Cliente e PDF original são imutáveis;
- alterações posteriores exigem novo Contract e nunca sobrescrevem o snapshot ou PDF existente.

## Assinatura

- não existe assinatura eletrônica integrada no MVP;
- a assinatura ocorre externamente;
- a cópia assinada é enviada ao CRM;
- o Contrato é marcado manualmente como `SIGNED` conforme autorização;
- marcar `SIGNED` exige uma cópia assinada já associada ao Contract;
- `signed_at` é registrado no momento da confirmação;
- a versão originalmente gerada não deverá ser substituída pela cópia assinada.

## Snapshot

Quando o Contrato for gerado, deverão ser preservados de modo imutável:

- conteúdo final efetivamente gerado;
- dados do Cliente utilizados na geração;
- dados fiscais utilizados;
- dados manuais preenchidos;
- identificação da origem/template utilizado.

Alterações futuras no Cliente ou no template não poderão alterar retroativamente esse conteúdo.

A representação física do snapshot utiliza `JSONB`, conforme congelado e implementado em `docs/04-database/Contracts.md`.

## Armazenamento

- arquivos de Contratos utilizam a infraestrutura central de documentos;
- o Storage é privado por padrão;
- a versão gerada e a versão assinada deverão permanecer preservadas;
- não será criada uma solução paralela de armazenamento exclusiva para Contratos.

## Autorização

```text
OWNER
→ acesso completo a Contracts e Contract Templates da própria Organization

ADMIN
→ sem acesso na Sprint 05

MEMBER
→ sem acesso na Sprint 05
```

Client Assignment não concede acesso a Contracts, Templates ou seus documentos.

---

# B. Decisões Encontradas nas Fontes

## Entidades conceituais

O Data Model e o documento Migrations já identificam:

```text
contract_templates
contracts
```

Portanto, a existência e os schemas físicos dessas entidades estão congelados em `Contracts.md`.

Estruturas auxiliares somente poderão ser introduzidas quando forem necessárias ao contrato físico aprovado, especialmente para documentos ou versões.

## Relações

```text
Organization
├── 0..N Contract Templates
└── 0..N Contracts

Client
└── 0..N Contracts

Contract Template
└── 0..N Contracts
```

Cada Contrato deverá manter consistência entre a Organization do Contrato, do Cliente e do template utilizado.

## Templates

As fontes confirmam que templates:

- são reutilizáveis;
- servem de base para Contratos específicos de Clientes;
- possuem entidade conceitual própria;
- pertencem ao domínio Contratos;
- podem ser auditados sob `CONTRACT_TEMPLATE` quando a operação for definida como relevante.

O contrato funcional desta Sprint congela também:

- escopo por Organization;
- nome obrigatório;
- conteúdo obrigatório;
- estado ativo ou inativo;
- administração exclusiva por `OWNER`;
- templates inativos não iniciam novos Contracts;
- alterações futuras no template não afetam Contracts existentes;
- não haverá versionamento complexo de templates no MVP; o snapshot do Contract é a proteção histórica.

As fontes não congelam:

- colunas;
- linguagem ou mecanismo de variáveis;
- formato do conteúdo;
- tipos, tamanhos e constraints físicas;
- linguagem ou mecanismo concreto de variáveis;
- formato físico do conteúdo.

Não faz parte deste planejamento escolher editor rich-text ou template engine.

## Cliente e identificação fiscal

O schema de Clientes já possui:

```text
tax_id
tax_id_type
```

`tax_id_type` não é uma enumeração fechada e pode representar, por exemplo, CPF, CNPJ, NIF ou VAT.

Para a Sprint 05 fica estabelecido conceitualmente:

- o Cliente é a fonte existente desses dados quando disponíveis;
- os valores fiscais efetivamente usados na geração integram o snapshot imutável;
- alterações futuras no Cliente não alteram o Contrato já gerado.
- o Cliente é obrigatório e pertence à mesma Organization do Contract;
- `client_id` é editável somente em `DRAFT` e imutável após `GENERATED`;
- Cliente arquivado não pode ser escolhido para novo Contract;
- Contracts históricos de Cliente arquivado continuam válidos e visíveis ao `OWNER` autorizado.

Não haverá colunas fiscais próprias no Contract. Os valores editáveis permanecem no Cliente e os valores históricos utilizados permanecem no snapshot.

## Documentos

A infraestrutura utiliza o bucket privado base do Supabase Storage e a entidade física central de metadados `documents`.

As fontes exigem:

- infraestrutura centralizada;
- associação do documento a uma entidade autorizada;
- autorização coerente com a entidade relacionada;
- acesso privado;
- proteção contra acesso por URL direta;
- preservação de registros históricos.

O documento Migrations determina que a estrutura física central de metadados seja congelada antes da primeira migration que dela necessitar. A Sprint 05 é a primeira Sprint cujo escopo exige materialmente PDF gerado e cópia assinada persistidos.

## Persistência transacional

A ADR-002 identifica como operação composta potencial:

```text
gerar Contrato
+ preservar snapshot
+ registrar estado
+ Activity Log
```

RPC deverá ser utilizada quando atomicidade, múltiplas escritas relacionadas ou auditoria inseparável exigirem. Consultas simples não deverão usar RPC apenas por conveniência.

## Activity Logs

As fontes exigem auditoria, quando aplicável, para:

- criação;
- geração;
- envio;
- alteração de Status;
- upload da versão assinada;
- cancelamento.

Os tipos conceituais previstos são:

```text
CONTRACT
CONTRACT_TEMPLATE
DOCUMENT
```

O snapshot pertence ao domínio contratual e não deverá ser armazenado como substituto dentro de `activity_logs`.

As Actions ficam congeladas como:

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

O snapshot completo não deverá ser armazenado no Activity Log.

---

# C. Decisões Físicas Congeladas

As decisões físicas desta seção foram fechadas em `docs/04-database/Contracts.md` e implementadas pela Migration 005.

## Schema físico de Contract

O schema, tipos, nulabilidade, defaults, constraints e timestamps estão definidos em `Contracts.md`.

O schema inclui:

- Organization;
- Cliente obrigatório;
- template de origem;
- título;
- Status;
- snapshot;
- conteúdo gerado;
- datas de geração, envio, assinatura e cancelamento;
- referências documentais;
- autoria e auditoria administrativa;
- timestamps.

## Schema físico de Contract Template

O schema físico define:

- tipos, tamanhos e constraints para nome e conteúdo;
- contrato físico de campos/variáveis;
- Organization;
- representação física do estado ativo/inativo;
- autoria e timestamps;
- constraints e índices;
- enforcement da administração exclusiva por `OWNER`.

## Representação do snapshot

O snapshot utiliza JSONB e preserva:

- conteúdo final;
- valores interpolados;
- dados do Cliente;
- dados fiscais;
- entradas manuais;
- referência da origem.

A estrutura mínima, validação e imutabilidade estão congeladas em `Contracts.md`.

## Identificação fiscal

`tax_id` e `tax_id_type` permanecem no Cliente e no snapshot. Não existem colunas fiscais duplicadas em `contracts`.

## Documents e Storage

`Contracts.md` congela a tabela central `documents`, seus vínculos, autorização e preservação.

O contrato físico define:

- entidade/tabela central;
- relação com Organization, Client e Contract;
- distinção entre PDF gerado e cópia assinada;
- chave/caminho de Storage;
- metadata técnica mínima;
- integridade entre metadata e objeto;
- policies de upload, leitura e eventual remoção;
- download autorizado;
- comportamento histórico quando um registro deixa o fluxo operacional.

Não alterar as Policies globais apenas para facilitar acesso a arquivos.

## PDF

PDF integra o MVP, é gerado a partir do snapshot e armazenado privadamente. O fluxo físico está congelado em `Contracts.md`.

O contrato define:

- entrada exata da geração;
- vínculo com o snapshot;
- momento transacional em que o Contrato se torna `GENERATED`;
- tratamento de falhas entre geração, upload e persistência;
- contrato de download autorizado.

O PDF será gerado a partir do snapshot. Falha na geração ou persistência do PDF mantém o Contract em `DRAFT` e não registra `GENERATED`.

A geração de PDF utiliza `pdf-lib`, sem impacto no schema.

## Envio por e-mail

O destinatário padrão é o e-mail do Cliente. Um override manual poderá ser informado exclusivamente no momento do envio.

O Contract somente passará para `SENT` após confirmação de sucesso. Falha de envio mantém o Status anterior. Não haverá fila, cron ou scheduler nesta Sprint.

O envio utiliza Resend, configurado por `RESEND_API_KEY` e `CONTRACTS_EMAIL_FROM`. O estado `SENT`, `sent_at` e o Activity Log somente são persistidos após o provider confirmar o envio.

## Cópia assinada

O contrato físico define:

- formato PDF e metadata mínima;
- vínculo documental com Contract;
- autorização de upload e download;
- validação mínima da existência da cópia antes de `SIGNED`;
- atomicidade entre upload, metadata, Status, `signed_at` e Activity Log;
- substituição, versionamento ou proibição de nova cópia assinada;
- comportamento em falhas parciais.

A cópia assinada não substitui nem elimina o PDF original gerado. Formatos, limites e vínculo físico seguem `Contracts.md` e a Migration 005.

## Cliente e autofill

`Contracts.md` separa `draft_data` editável do snapshot final. Chaves concretas de apresentação pertencem à validação/aplicação e não reabrem o schema.

## Autorização física

A matriz funcional e sua materialização por Policies, Grants e validações internas OWNER-only estão congeladas em `Contracts.md`.

## Cancelamento, arquivamento e retenção

`CANCELED` é Status terminal e não elimina snapshot, PDF, cópia assinada, Activity Logs ou histórico. Não haverá delete físico operacional.

Contract não possui arquivamento operacional separado nesta Sprint. Templates utilizam estado ativo/inativo.

## Atomicidade dos Activity Logs

As Actions e suas RPCs correspondentes estão congeladas. Falha em Activity Log obrigatório causa rollback da mutação.

## Índices, RLS, Grants e fronteiras RPC

`Contracts.md` define:

- índices para listagem, filtros, Organization, Client, template e Status;
- constraints de consistência intra-Organization;
- Policies por operação;
- Grants mínimos;
- RPCs `SECURITY DEFINER` somente para operações compostas;
- autorização interna completa das RPCs;
- `SET search_path = ''` e schemas explícitos;
- `EXECUTE` restrito;
- proteção contra Data Leakage em listagem, contagens, documentos e download.

---

# Templates — Planejamento Conceitual

O módulo deverá permitir administrar e selecionar templates reutilizáveis.

Capacidades conceituais previstas:

- listar templates autorizados;
- criar, editar, ativar e desativar templates exclusivamente como `OWNER`;
- selecionar template no início do fluxo;
- identificar os dados necessários para preenchimento;
- impedir que alteração futura modifique Contrato já gerado.

Não estão definidos nesta etapa:

- editor visual;
- rich-text;
- linguagem de template;
- motor de interpolação;
- biblioteca externa;
- assinatura ou schema físico.

---

# Contrato — Planejamento Conceitual

## Criação

O fluxo inicia pela escolha de um template e depois de um Cliente autorizado. O sistema reutiliza os dados existentes, recebe os dados adicionais e cria ou mantém o Contrato em `DRAFT` até a geração.

## Revisão

A interface deverá apresentar os dados que serão utilizados antes da geração final e permitir corrigir apenas informações ainda editáveis.

## Geração

A geração deverá produzir uma unidade consistente contendo:

- snapshot imutável;
- conteúdo final;
- estado `GENERATED`;
- PDF privado persistido;
- metadata documental necessária;
- Activity Log obrigatório.

O fluxo implementado gera o PDF, envia o objeto ao Storage e somente então conclui `GENERATED` pela RPC. Se a etapa transacional falhar, o objeto órfão é removido por compensação controlada.

## Envio

Somente uma versão salva e preservada poderá ser enviada. O estado `SENT`, sua data e o Activity Log deverão corresponder ao sucesso real do envio. Em caso de falha, o Status anterior será mantido.

## Assinatura externa

Uma cópia assinada recebida externamente será enviada ao Storage privado e vinculada ao Contrato. A marcação manual como `SIGNED` deverá exigir confirmação documental conforme o fluxo autorizado.

## Cancelamento

Cancelar altera o estado operacional sem excluir snapshot, PDF, cópia assinada ou histórico. `CANCELED` é terminal e não existe delete físico operacional.

---

# PDF e Download

Requisitos conceituais:

- geração pelo fluxo privado congelado em `Contracts.md`;
- conteúdo gerado a partir do snapshot aprovado;
- correspondência entre PDF e snapshot;
- armazenamento privado;
- vínculo inequívoco ao Contract;
- download apenas por utilizador atualmente autorizado;
- URL pública permanente proibida;
- alteração no Cliente ou template não modifica o PDF já gerado.

Falha na geração ou persistência não altera o Contract para `GENERATED`.

A geração server-side utiliza `pdf-lib`.

---

# Documents e Storage

O bucket privado base existente é reutilizado em conjunto com a metadata central da tabela `documents`.

Fluxo conceitual:

```text
Utilizador autenticado e autorizado

↓

Entidade Contract autorizada

↓

Metadata documental central

↓

Objeto privado no Supabase Storage
```

Não serão criadas soluções independentes como autorização exclusiva baseada apenas no caminho do objeto ou tabelas paralelas sem análise da infraestrutura central.

---

# Activity Logs

Activity Logs permanecem centralizados em:

```text
activity_logs
```

Não criar:

```text
contract_activities
contract_template_activities
document_activities
```

O conteúdo completo do snapshot e dos documentos não deverá ser copiado para metadata do Log. A metadata deverá permanecer mínima e não expor conteúdo contratual sensível desnecessário.

---

# UI Implementada

Rotas conceituais:

```text
/contratos
/contratos/novo
/contratos/[id]
/contratos/[id]/editar
```

Uma rota de administração como:

```text
/contratos/templates
```

será restrita ao `OWNER`, responsável exclusivo pela administração de templates.

Capacidades entregues:

- listagem autorizada;
- pesquisa, filtros, ordenação e paginação definidos posteriormente pelo contrato de Query;
- criação a partir de template;
- seleção de Cliente;
- autofill;
- preenchimento adicional;
- revisão;
- geração e download de PDF;
- envio por e-mail;
- upload da cópia assinada;
- mudança de Status apenas conforme transições autorizadas;
- estados vazios, carregamento, erro e acesso negado;
- responsividade e WCAG 2.2 AA.

A interface poderá ocultar affordances sem permissão, mas não substituirá a autorização de backend.

---

# Entregas Técnicas Concluídas

- `contract_templates`, `contracts` e `documents`;
- snapshot imutável e lifecycle completo;
- RLS `OWNER`-only, Grants mínimos e dez RPCs;
- Activity Logs centralizados;
- Types e Validation;
- Queries, Services e Server Actions;
- geração de PDF privado com `pdf-lib`;
- Storage privado e download autorizado;
- envio por e-mail com Resend;
- upload e preservação separada da `SIGNED_COPY`;
- UI completa de Contratos e Templates;
- testes pgTAP, unitários, de aplicação e E2E.

---

# Blockers Finais

```text
Nenhum.
```

Não existem blockers técnicos pendentes para o encerramento da Sprint 05.

---

# Divergências e Lacunas Identificadas

## Campos contratuais

Campos específicos do serviço permanecem em `draft_data` e no snapshot. Não serão promovidos a colunas sem nova regra de negócio.

---

# Fora do Escopo

Esta Sprint não deverá implementar:

- assinatura eletrônica integrada;
- assinatura digital certificada própria;
- integração com plataforma de assinatura;
- versionamento complexo de templates;
- regeneração destrutiva ou regeneração do mesmo Contract;
- pagamentos;
- cobrança automática;
- billing;
- faturação ou emissão fiscal automática;
- automação jurídica;
- análise jurídica automatizada;
- inteligência artificial generativa;
- cron ou scheduler;
- CRM ou portal público;
- SaaS multi-Organization;
- troca de tenant;
- aplicativo nativo;
- API pública;
- Dashboard consolidado;
- funcionalidades da Sprint 06.

---

# Resultado

Sprint 05 — Contratos concluída.

O módulo implementa o lifecycle oficial:

```text
DRAFT → GENERATED → SENT → SIGNED
          └──────────────→ CANCELED
                    └────→ CANCELED
```

`SIGNED` e `CANCELED` são terminais. Após `GENERATED`, snapshot, Cliente e Template são imutáveis. `ORIGINAL_PDF` e `SIGNED_COPY` permanecem documentos privados separados. `ADMIN` e `MEMBER` não possuem acesso ao módulo.

## Validações finais

- pgTAP: 18 arquivos e 688 testes aprovados;
- unit/app: 43 arquivos e 675 testes aprovados;
- E2E: 33 testes aprovados, sendo 9 de Contratos;
- database reset e database lint aprovados;
- concorrência de Bootstrap, OWNER role e Financial Goal aprovada;
- typecheck, lint, build e `git diff --check` aprovados.

## Ressalva do envio externo

O envio real via Resend não foi executado no E2E porque depende de `RESEND_API_KEY` e `CONTRACTS_EMAIL_FROM`. A semântica de sucesso e falha do provider e a regra de somente marcar `SENT` após sucesso estão cobertas por testes unitários. Nenhum bypass ou backdoor de teste foi criado.

## Commits relevantes

```text
2b9ab68
f2077b6
b87ec13
2bc52e6
b3cfa4a
e94894f
6a4fb2e
86c589c
```

## Lições Aprendidas

- efeitos externos como Storage e e-mail exigem compensação controlada e transições de estado somente após sucesso confirmado;
- o snapshot e os documentos separados preservam o histórico sem versionamento complexo de Templates;
- autorização de documentos deve derivar do Contract e permanecer protegida por RLS e download server-side;
- E2E não deve criar bypass de provider externo para simular sucesso de produção.

---

# Próxima Sprint

```text
Sprint 06 — Dashboard consolidado
Status: Não iniciada
```
