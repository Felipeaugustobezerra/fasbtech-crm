# Changelog

Todas as alterações relevantes do FASBtech CRM deverão ser registradas neste documento.

O Changelog segue o princípio de documentar apenas mudanças significativas na arquitetura, requisitos, documentação e funcionalidades do projeto.

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
