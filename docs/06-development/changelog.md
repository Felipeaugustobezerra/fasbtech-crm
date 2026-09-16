# Changelog

Todas as alterações relevantes do FASBtech CRM deverão ser registradas neste documento.

O Changelog segue o princípio de documentar apenas mudanças significativas na arquitetura, requisitos, documentação e funcionalidades do projeto.

---

# [3.0.0] - Em desenvolvimento

## Sprint 04 — Financeiro

### Concluído

- Persistência de `financial_entries` e `financial_goals`.
- Autorização e RLS OWNER-only; ADMIN e MEMBER permanecem sem acesso.
- RPCs transacionais, Activity Logs e resumo financeiro autorizado.
- Types, validações, Queries, Services e Server Actions.
- UI completa de movimentações, filtros, Status, arquivamento e metas mensais.
- Regras `INCOME/EXPENSE`, `PENDING/REALIZED/CANCELED` e `ONE_TIME/RECURRING`.
- EUR como moeda operacional única.
- Movimento `REALIZED` arquivado preservado nos agregados e movimento `CANCELED` excluído.
- Testes unitários, pgTAP, concorrência e E2E aprovados.
- Dashboard consolidado mantido fora da Sprint 04.

### Validação

- 566 testes pgTAP em 15 arquivos.
- 520 testes unitários/aplicação em 33 arquivos.
- 24 testes E2E, incluindo 10 cenários financeiros.
- Database reset, database lint, três cenários concorrentes, typecheck, lint, build e diff-check aprovados.
- Nenhum bug funcional encontrado no E2E; somente um seletor do teste foi ajustado.
- Duplicações temporárias em `.next/types` foram confirmadas como cache local, sem mudança de produto.

## Próxima Sprint

- Sprint 05 — Contratos: não iniciada.

---

# [1.0.0] - Em desenvolvimento

## Documentação

### Adicionado

- Estrutura oficial da documentação do projeto.
- PRD completo.
- Vision.
- MVP Scope.
- Product Registry.
- Product Portfolio.
- Functional Requirements.
- Business Rules.
- User Stories.
- Leads User Stories.
- Organization User Model.
- Bootstrap.
- Activity Logs.
- Migration 001.
- Migrations.
- Design System completo.
- Testing Strategy.
- Setup.
- Conventions.
- Project Index.
- README.
- Home.

---

## Arquitetura

### Adicionado

- Arquitetura modular oficial.
- Separação entre Services, Queries e Mutations.
- Fluxo oficial de Server Actions.
- Error Handling padronizado.
- Estrutura oficial de pastas.
- ADR-001 da Stack Tecnológica.

### Alterado

- Definição única da arquitetura dos módulos.
- Padronização da camada de Services.
- Padronização dos fluxos de leitura e escrita.

---

## Banco de Dados

### Adicionado

- Modelo de Organização.
- Bootstrap inicial.
- Migration 001.
- Activity Logs centralizados.
- Soft Delete padronizado.
- Leads Schema.
- Data Model revisado.

### Alterado

- Migration 001 reorganizada.
- Ordem de execução da migration.
- Inclusão de Activity Logs na fundação do banco.
- Atualização do modelo lógico.

---

## Segurança

### Adicionado

- Row Level Security (RLS).
- Policies por organização.
- Organização obtida exclusivamente no servidor.
- Isolamento entre organizações.
- Activity Logs transacionais.

### Alterado

- Fluxo de autorização.
- Bootstrap seguro.
- Contrato de autenticação e autorização.

---

## Design System

### Adicionado

- Branding.
- Color Palette.
- Typography.
- Spacing.
- Design Tokens.
- Components.
- Icons.
- Animations.
- Layout.
- Dashboard Guidelines.
- CRM UI Guidelines.
- Accessibility.
- Implementation Guide.

### Alterado

- Consolidação dos Design Tokens.
- Padronização do Layout.
- Revisão das diretrizes de acessibilidade.

---

## Desenvolvimento

### Adicionado

- Setup completo.
- Convenções de desenvolvimento.
- Estratégia oficial de testes.
- Infraestrutura de testes com Vitest, React Testing Library e Playwright.
- Configuração de cobertura com V8, ambiente jsdom e alias `@`.
- Estrutura de testes unitários, integração, E2E, fixtures e mocks.
- Smoke tests unitário e E2E para validação da infraestrutura.
- README atualizado.
- Dashboard inicial da documentação.

### Alterado

- Fluxo oficial de onboarding.
- Organização da documentação.

---

## Sprint 01

### Concluído

- Autenticação com Supabase.
- Login por e-mail e senha.
- Logout.
- Proteção de rotas.
- Sessão autenticada.
- Layout base.
- Dashboard inicial.

---

## Sprint 02

### Planejado

- Gestão completa de Leads.
- CRUD.
- Pesquisa.
- Filtros.
- Ordenação.
- Paginação.
- Activity Logs.
- RLS.
- Error Handling.
- Testes.
- Interface seguindo o Design System.

---

## Qualidade

### Validado

- Estrutura documental consolidada.
- Arquitetura sincronizada.
- Banco de dados sincronizado.
- Design System consolidado.
- Segurança documentada.
- Testing Strategy definida.
- Setup documentado.
- Convenções padronizadas.

---

## Próximos Passos

- Implementação da Sprint 02.
- Desenvolvimento do módulo de Leads.
- Validação do MVP interno.
- Evolução para os módulos de Clientes e Projetos.

---

# Política de Versionamento

O projeto segue versionamento semântico (Semantic Versioning).

Formato:

MAJOR.MINOR.PATCH

Exemplo:

- 1.0.0 → Primeira versão consolidada da documentação.
- 1.1.0 → Novo módulo funcional.
- 1.1.1 → Correções sem alteração de comportamento.
- 2.0.0 → Mudanças incompatíveis ou grande evolução da arquitetura.
