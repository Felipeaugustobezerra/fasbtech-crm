# Sprint 01 — Foundation

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

🟡 Em andamento

---

## Última atualização

Agosto de 2026

---

# Objetivo

Construir e consolidar a fundação técnica, de segurança e de interface do FASBtech CRM.

Esta Sprint deve preparar toda a infraestrutura necessária para o desenvolvimento seguro dos módulos de negócio previstos no MVP v3.0.

Nenhum módulo de negócio completo deverá ser implementado nesta etapa.

A Sprint 01 deverá entregar as bases necessárias para:

```text
Sprint 02 — Clientes & Acessos

Sprint 03 — Demandas

Sprint 04 — Financeiro

Sprint 05 — Contratos

Sprint 06 — Dashboard
```

---

# Contexto

Esta é a primeira Sprint do projeto.

Uma primeira etapa da Foundation já foi concluída e validada, incluindo:

- autenticação;
- sessão;
- proteção de rotas;
- layout inicial;
- Dashboard inicial;
- integração SSR com Supabase.

Após a revisão do produto para o MVP v3.0, a Foundation passou a incluir também:

- Organization;
- Profiles;
- Memberships;
- roles;
- Bootstrap;
- banco base;
- RLS base;
- Activity Logs base;
- Storage privado;
- AppShell definitivo;
- menu principal.

Por esse motivo, a Sprint 01 foi reaberta e permanece:

```text
🟡 Em andamento
```

O trabalho já concluído não deverá ser refeito sem necessidade técnica comprovada.

---

# Dependências

Antes de continuar esta Sprint, é obrigatório consultar os documentos oficiais relevantes.

Ordem funcional principal:

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

Sprint 01
```

Também deverão ser respeitados os documentos técnicos aplicáveis, incluindo:

- Project Index;
- AGENTS.md;
- System Architecture;
- Module Architecture;
- RLS;
- Activity Logs;
- ADRs aprovadas;
- Setup;
- Conventions;
- Testing Strategy;
- Design System.

---

# Princípio da Sprint

A Foundation deve implementar apenas infraestrutura compartilhada.

Não antecipar tabelas, regras ou funcionalidades completas pertencentes às Sprints futuras.

Fluxo:

```text
Foundation

↓

Infraestrutura reutilizável

↓

Módulos de negócio
```

A Foundation não deverá implementar antecipadamente:

```text
Clientes

Demandas

Financeiro

Contratos
```

como módulos completos.

---

# Escopo

# 1. Autenticação

Implementar e manter:

- Login utilizando Supabase Auth;
- Logout;
- persistência da sessão;
- proteção de rotas privadas;
- validação server-side da identidade;
- redirecionamento apropriado entre áreas públicas e privadas.

---

## Estado Atual

✅ Implementado e validado.

Não deverá ser refeito sem necessidade.

---

# 2. Profile

Implementar a infraestrutura base de Profile para cada utilizador autenticado.

O Profile será a representação do utilizador dentro do domínio da aplicação.

Deverá permitir, no mínimo:

- associação ao utilizador autenticado;
- identificação do utilizador;
- dados básicos necessários ao CRM;
- evolução futura sem depender diretamente de `auth.users` para dados de negócio.

---

## Regra

O Profile não representa autorização por si só.

A autorização organizacional deverá ocorrer através de Membership.

---

# 3. Organization

Implementar a entidade base:

```text
Organization
```

No MVP existirá inicialmente apenas uma Organization operacional:

```text
FASBtech
```

A arquitetura poderá permanecer preparada para evolução futura, mas múltiplas Organizations em produção não fazem parte do MVP atual.

---

# 4. Memberships

Implementar a relação entre:

```text
Profile

↓

Organization
```

através de Membership.

Membership deverá determinar:

- vínculo do utilizador com a Organization;
- estado desse vínculo;
- role do utilizador.

---

# 5. Roles

A Foundation deverá estabelecer os papéis iniciais:

```text
OWNER
ADMIN
MEMBER
```

---

## OWNER

Possui acesso administrativo completo à Organization dentro do escopo do MVP.

---

## ADMIN

Possui acesso administrativo conforme as permissões definidas pelas regras de negócio.

---

## MEMBER

Possui acesso operacional limitado.

A autorização específica de MEMBER por Cliente será implementada na:

```text
Sprint 02 — Clientes & Acessos
```

A Sprint 01 deve apenas fornecer a base necessária para esse modelo.

---

# 6. Bootstrap

Implementar o processo inicial de Bootstrap.

O Bootstrap deverá permitir inicializar de forma segura a primeira estrutura necessária para o funcionamento da aplicação.

O fluxo deverá contemplar, conforme a arquitetura oficial:

```text
Utilizador autenticado

↓

Profile

↓

Organization inicial

↓

Membership OWNER
```

O processo deverá respeitar o contrato definido nos documentos técnicos correspondentes.

---

# 7. Banco de Dados Base

A Migration 001 da Foundation deverá conter apenas as entidades necessárias à infraestrutura base.

A Foundation deverá preparar o banco para:

- Organization;
- Profiles;
- Memberships;
- Activity Logs;
- funções e mecanismos auxiliares necessários;
- RLS;
- Policies;
- Bootstrap.

Entidades de negócio das Sprints futuras não deverão ser antecipadas sem necessidade técnica.

Não implementar nesta Migration como módulo completo:

- Clientes;
- Demandas;
- Financeiro;
- Contratos.

---

# 8. Row Level Security

Implementar a estratégia base de RLS.

A Foundation deverá garantir pelo menos:

- isolamento por Organization;
- acesso autenticado;
- validação de Membership;
- proteção das tabelas base;
- Policies necessárias;
- bloqueio de acessos não autorizados.

A RLS não deverá confiar no frontend como fonte de autorização.

---

# 9. Activity Logs

Implementar a infraestrutura base de:

```text
activity_logs
```

Activity Logs deverão estar preparados para registrar operações relevantes dos módulos futuros.

A Foundation deverá garantir:

- estrutura centralizada;
- Organization;
- utilizador;
- entidade;
- ação;
- data;
- imutabilidade conforme arquitetura;
- acesso autorizado.

Não é necessário antecipar eventos específicos de módulos ainda não implementados.

---

# 10. Storage Privado

Configurar a infraestrutura base para armazenamento privado de documentos.

Essa infraestrutura será reutilizada futuramente por:

```text
Clientes

Demandas

Financeiro

Contratos
```

---

## Requisitos

Os arquivos privados deverão:

- exigir autenticação;
- respeitar autorização;
- não ser públicos por padrão;
- permitir evolução para autorização relacionada a Cliente;
- não depender de URLs públicas permanentes como mecanismo de segurança.

---

## Limite da Sprint 01

A Foundation deverá configurar a infraestrutura de Storage.

Não deverá implementar ainda o gerenciador completo de documentos dos módulos futuros.

---

# 11. Layout

Consolidar um layout base reutilizável contendo:

- AppShell;
- Sidebar;
- Header;
- Page Header;
- área principal;
- comportamento responsivo.

---

## Estado Atual

Parte da estrutura de layout já está implementada.

Ela deverá ser ajustada somente onde necessário para refletir o AppShell oficial do MVP v3.0.

---

# 12. Menu Principal

O menu oficial deverá apresentar:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

A ordem deverá permanecer:

1. Dashboard;
2. Demandas;
3. Financeiro;
4. Contratos;
5. Clientes;
6. Acessos.

---

## Módulos Ainda Não Implementados

A presença do módulo na navegação não significa que sua funcionalidade esteja pronta.

O sistema não deverá apresentar fluxos falsos ou dados simulados.

Enquanto um módulo não estiver implementado, a interface deverá impedir que o utilizador interprete funcionalidades inexistentes como disponíveis.

---

# 13. Dashboard Inicial

Manter o Dashboard inicial criado durante a primeira etapa da Foundation.

Nesta Sprint não será necessário implementar o Dashboard consolidado.

Não criar artificialmente:

- valores financeiros;
- métricas de Demandas;
- contratos;
- Clientes fictícios;
- reuniões;
- gráficos com dados simulados.

---

## Sprint 06

O Dashboard real e consolidado será implementado na:

```text
Sprint 06 — Dashboard
```

utilizando dados reais dos módulos anteriores.

---

# 14. Error Handling

Consolidar o tratamento operacional de erros necessário à Foundation.

Erros técnicos não deverão ser exibidos diretamente ao utilizador final.

A aplicação deverá possuir tratamento adequado para:

- autenticação;
- sessão;
- operações protegidas;
- falhas de autorização;
- comunicação com serviços utilizados pela Foundation.

---

# 15. Estrutura do Projeto

Manter a estrutura modular oficial.

Criar ou utilizar apenas quando necessário:

```text
components
lib
hooks
services
schemas
types
actions
queries
mutations
```

e demais diretórios definidos pela arquitetura oficial.

Não criar diretórios vazios apenas para antecipar módulos futuros.

---

# 16. Infraestrutura de Testes

Manter a infraestrutura de testes já configurada.

A Foundation deverá permitir testes de:

- autenticação;
- sessão;
- autorização;
- RLS;
- Bootstrap;
- Membership;
- Organization;
- Activity Logs;
- Storage privado quando aplicável.

Testes deverão seguir:

```text
Testing Strategy
```

---

# Requisitos Técnicos

Stack oficial aplicável à Foundation:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- Supabase;
- PostgreSQL;
- Supabase Auth;
- React Hook Form;
- Zod;
- Vitest;
- React Testing Library;
- Playwright.

Decisões adicionais deverão respeitar os ADRs oficiais.

---

# Fora do Escopo

Não implementar como módulos completos nesta Sprint:

- Clientes;
- associação MEMBER ↔ Cliente;
- Demandas;
- Financeiro;
- Contratos;
- Dashboard consolidado;
- Leads;
- Projetos;
- Product Registry operacional;
- Agenda;
- gestão de reuniões;
- IA;
- automações externas;
- SaaS multiempresa em produção;
- Mobile;
- Portal do Cliente.

---

# Escopo Futuro Imediato

A Foundation deverá preparar o sistema para a próxima Sprint:

```text
Sprint 02 — Clientes & Acessos
```

A Sprint 02 será responsável por:

- Clientes;
- gestão operacional de utilizadores;
- associação utilizador ↔ Cliente;
- autorização por Cliente;
- controle de acesso;
- testes de isolamento por Cliente.

Essas funcionalidades não deverão ser antecipadas na Sprint 01.

---

# Critérios de Aceite

A Sprint 01 será considerada concluída quando todos os critérios abaixo estiverem atendidos.

---

## Autenticação

- Login funcionando.
- Logout funcionando.
- Sessão persistindo após atualização.
- Rotas privadas protegidas.
- Validação server-side da identidade funcionando.

---

## Foundation de Dados

- Profile implementado.
- Organization implementada.
- Membership implementado.
- Roles base definidos.
- Bootstrap implementado.
- Migration 001 da Foundation aplicada.

---

## Segurança

- RLS base operacional.
- Policies obrigatórias implementadas.
- Isolamento por Organization validado.
- Membership utilizado na autorização.
- Operações não autorizadas bloqueadas.

---

## Activity Logs

- infraestrutura base implementada;
- acesso protegido;
- imutabilidade respeitada conforme arquitetura;
- testes aplicáveis aprovados.

---

## Storage

- infraestrutura de Storage privado configurada;
- arquivos não expostos publicamente por padrão;
- estratégia preparada para autorização dos módulos futuros.

---

## Interface

- AppShell funcionando;
- Sidebar funcionando;
- Header funcionando;
- Page Header disponível;
- menu principal atualizado;
- layout responsivo;
- Dashboard inicial funcionando.

---

## Qualidade

- projeto compilando sem erros;
- lint aprovado;
- typecheck aprovado;
- testes obrigatórios aprovados;
- build aprovado;
- nenhum módulo futuro implementado indevidamente.

---

# Entregáveis

Ao final da Sprint 01 deverão existir:

- Página de Login;
- Logout;
- integração SSR com Supabase;
- `proxy.ts` para verificação otimista da sessão;
- validação server-side da identidade;
- Profile;
- Organization;
- Membership;
- roles base;
- Bootstrap;
- Migration 001 da Foundation;
- RLS base;
- Policies;
- Activity Logs base;
- infraestrutura de Storage privado;
- AppShell;
- Sidebar;
- Header;
- Page Header;
- menu principal;
- Dashboard inicial;
- Error Handling aplicável;
- infraestrutura de testes.

---

# Checklist Técnico

## Já concluído

- [x] Configurar Supabase Auth.
- [x] Configurar Login.
- [x] Configurar Logout.
- [x] Configurar persistência da sessão.
- [x] Configurar variáveis de ambiente.
- [x] Criar `proxy.ts`.
- [x] Proteger rotas privadas.
- [x] Validar autenticação novamente no servidor.
- [x] Criar layout inicial.
- [x] Criar Dashboard inicial.
- [x] Validar responsividade inicial.
- [x] Executar lint.
- [x] Executar typecheck.
- [x] Executar build.
- [x] Validar fluxo autenticado principal.

---

## Pendente

- [ ] Implementar Profile.
- [ ] Implementar Organization.
- [ ] Implementar Membership.
- [ ] Definir e aplicar roles base.
- [ ] Atualizar Migration 001 para a Foundation v3.0.
- [ ] Implementar Bootstrap.
- [ ] Implementar RLS base.
- [ ] Implementar Policies base.
- [ ] Implementar Activity Logs base.
- [ ] Configurar Storage privado.
- [ ] Consolidar AppShell.
- [ ] Consolidar Sidebar.
- [ ] Consolidar Header.
- [ ] Implementar Page Header oficial.
- [ ] Atualizar menu principal.
- [ ] Consolidar Error Handling operacional.
- [ ] Implementar testes de autorização da Foundation.
- [ ] Implementar testes de RLS aplicáveis.
- [ ] Implementar testes de Bootstrap.
- [ ] Implementar testes de Activity Logs aplicáveis.
- [ ] Executar auditoria final da Sprint 01.

---

# Resultado Já Validado

A primeira etapa da Foundation já produziu e validou:

- integração SSR com o Supabase configurada para browser, servidor e Proxy;
- Login com e-mail e senha utilizando React Hook Form e Zod;
- validação do formulário no cliente e novamente na Server Action;
- Logout implementado como operação de servidor;
- cookies de sessão atualizados pelo Proxy;
- preservação dos cookies durante redirecionamentos;
- rota privada validada no Proxy e novamente no layout de servidor;
- página de Login responsiva;
- layout base responsivo;
- Dashboard inicial com mensagem de boas-vindas;
- `.env.example` contendo apenas os nomes das variáveis públicas necessárias;
- lint executado sem erros;
- typecheck executado sem erros;
- build executado sem erros;
- redirecionamento de utilizador não autenticado para `/login`;
- tratamento de credenciais inválidas;
- Login bem-sucedido validado com utilizador de teste;
- renderização do Dashboard privado após autenticação;
- persistência da sessão após recarregar a página;
- redirecionamento de utilizador autenticado de `/login` para `/`;
- Logout com redirecionamento para `/login`;
- bloqueio da rota privada após Logout;
- fluxo autenticado final validado em 06/08/2026 sem erros de console.

Esses resultados permanecem válidos.

A reabertura da Sprint não significa que essas funcionalidades devam ser refeitas.

---

# Lições Aprendidas

- No Next.js 16, a proteção otimista utiliza `proxy.ts`, enquanto páginas e operações privadas continuam responsáveis por validar a identidade no servidor.
- Ao atualizar tokens no Proxy, os cookies emitidos pelo Supabase precisam ser preservados também em respostas de redirecionamento.
- A combinação de validação no cliente e no servidor evita depender da interface como fronteira de confiança.
- As versões do Supabase precisam considerar compatibilidade entre `@supabase/ssr`, `@supabase/supabase-js` e a versão do Node.js.
- Credenciais de teste devem permanecer apenas em ambiente seguro e nunca ser versionadas.
- Proxy, Server Actions e validação no layout privado trabalham de forma complementar durante o ciclo da sessão.
- Autenticação não é equivalente a autorização.
- A Foundation precisa estabelecer Organization, Membership e RLS antes de introduzir regras de acesso por Cliente.
- Infraestrutura compartilhada deve ser criada antes dos módulos que irão consumi-la.
- Módulos futuros não devem ser antecipados na Migration da Foundation.

---

# Definition of Done

A Sprint 01 será considerada concluída apenas quando:

- autenticação estiver operacional;
- sessão estiver operacional;
- Profile estiver implementado;
- Organization estiver implementada;
- Membership estiver implementado;
- roles base estiverem funcionando;
- Bootstrap estiver implementado;
- Migration 001 da Foundation estiver aplicada;
- RLS base estiver operacional;
- Policies obrigatórias estiverem aplicadas;
- Activity Logs base estiver operacional;
- Storage privado estiver configurado;
- AppShell estiver consolidado;
- menu principal estiver atualizado;
- Error Handling obrigatório estiver operacional;
- testes críticos estiverem aprovados;
- lint estiver aprovado;
- typecheck estiver aprovado;
- build estiver aprovado;
- nenhuma entidade de negócio futura tiver sido antecipada indevidamente;
- documentação diretamente afetada estiver sincronizada;
- auditoria final da Sprint 01 não possuir bloqueadores.

---

# Fonte da Verdade

Esta Sprint implementa a Foundation definida por:

```text
PRD v3.0

↓

MVP Scope v3.0

↓

Product Roadmap v3.0

↓

Functional Requirements v3.0

↓

Business Rules v3.0

↓

User Stories v3.0
```

A próxima Sprint somente poderá iniciar após a conclusão desta Foundation:

```text
Sprint 02 — Clientes & Acessos
```