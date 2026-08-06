# Sprint 01 — Fundação do Projeto

## Status

✅ Concluída

---

# Objetivo

Construir a fundação técnica do FASBtech CRM.

Esta sprint tem como objetivo preparar toda a infraestrutura necessária para o desenvolvimento das próximas funcionalidades.

Nenhum módulo de negócio deverá ser implementado nesta etapa.

---

# Contexto

Esta é a primeira sprint do projeto.

Toda a documentação já foi criada e encontra-se na pasta `docs`.

O desenvolvimento deve seguir rigorosamente a documentação existente.

---

# Dependências

Antes de iniciar esta sprint é obrigatório ler:

- Project Index
- AGENTS.md
- PRD
- Vision
- MVP Scope
- Roadmap

---

# Escopo

## Autenticação

Implementar:

- Login utilizando Supabase Auth
- Logout
- Persistência da sessão
- Proteção de rotas privadas

---

## Layout

Criar um layout base reutilizável contendo:

- Sidebar (placeholder)
- Header
- Área principal
- Layout responsivo

Ainda não criar menus completos.

---

## Dashboard

Criar apenas uma página inicial contendo:

# Bem-vindo ao FASBtech CRM

Adicionar um pequeno texto de apresentação.

Não criar:

- gráficos
- cards
- métricas
- widgets

---

## Estrutura do Projeto

Organizar a estrutura da aplicação para suportar crescimento futuro.

Criar apenas se necessário:

- components
- layouts
- lib
- hooks
- services
- schemas
- types

---

# Requisitos Técnicos

Stack oficial

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- React Hook Form
- Zod

---

# Fora do Escopo

Não implementar:

- Leads
- Clientes
- Projetos
- Produtos
- Financeiro
- Tarefas
- Dashboard completo
- IA
- Integrações
- Multiempresa
- Portal do Cliente

---

# Critérios de Aceite

A sprint será considerada concluída quando:

- Login funcionando
- Logout funcionando
- Sessão persistindo após atualização da página
- Rotas privadas protegidas
- Layout responsivo criado
- Dashboard inicial funcionando
- Projeto compilando sem erros
- Lint sem erros
- Typecheck sem erros

---

# Entregáveis

- Página de Login
- Layout Base
- Dashboard Inicial
- Configuração do Supabase Auth
- Proxy para verificação de sessão e redirecionamento de rotas, utilizando `proxy.ts`, conforme a convenção do Next.js 16.
- Estrutura inicial de componentes

---

# Checklist Técnico

- Configurar autenticação
- Configurar variáveis de ambiente
- Criar layout
- Criar página de login
- Criar dashboard inicial
- Criar `proxy.ts` para verificação otimista da sessão e redirecionamento.
- Validar novamente a autenticação dentro das páginas privadas e operações do servidor.
- Validar responsividade
- Executar lint
- Executar typecheck

---

# Definition of Done

Antes de finalizar a sprint:

- Executar lint
- Executar typecheck
- Atualizar documentação caso necessário
- Informar todos os arquivos criados
- Informar todos os arquivos modificados
- Explicar decisões técnicas importantes
- Não implementar funcionalidades fora do escopo

---

# Resultado

- Integração SSR com o Supabase configurada para browser, servidor e Proxy.
- Login com e-mail e senha implementado com React Hook Form e Zod.
- Validação do formulário aplicada no cliente e repetida na Server Action.
- Logout implementado como operação de servidor.
- Cookies de sessão atualizados pelo Proxy e preservados em redirecionamentos.
- Rota privada validada no Proxy e novamente no layout de servidor.
- Página de login e layout base responsivos implementados.
- Dashboard inicial criado apenas com a mensagem de boas-vindas prevista.
- `.env.example` criado apenas com os nomes das variáveis públicas necessárias.
- Lint, typecheck e build executados sem erros.
- Redirecionamento de utilizador não autenticado para `/login` validado.
- Comunicação com o Supabase e tratamento de credenciais inválidas validados.
- Login bem-sucedido validado com o utilizador de teste.
- Renderização do dashboard privado validada após autenticação.
- Persistência da sessão validada após recarregar a página.
- Redirecionamento de utilizador autenticado de `/login` para `/` validado.
- Logout e redirecionamento imediato para `/login` validados.
- Bloqueio da rota privada após logout validado.
- Fluxo autenticado final executado em 06/08/2026 sem erros de console.

---

# Lições Aprendidas

- No Next.js 16, a proteção otimista deve utilizar `proxy.ts`, enquanto páginas e operações privadas continuam responsáveis por validar a identidade no servidor.
- Ao atualizar tokens no Proxy, os cookies emitidos pelo Supabase precisam ser copiados também para respostas de redirecionamento.
- A combinação de validação no cliente e no servidor evita depender da interface como fronteira de confiança.
- As versões do Supabase precisam considerar simultaneamente a compatibilidade entre `@supabase/ssr`, `@supabase/supabase-js` e a versão do Node.js do projeto.
- Credenciais de teste devem permanecer apenas no ambiente local e nunca ser exibidas, registradas ou versionadas.
- A validação ponta a ponta confirmou que Proxy, Server Actions e validação no layout privado trabalham em conjunto durante todo o ciclo da sessão.
