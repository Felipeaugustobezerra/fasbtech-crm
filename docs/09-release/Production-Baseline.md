# Production Baseline — MVP v3.0

## Status

Preparação local concluída. Provisionamento remoto ainda não configurado.

---

# Objetivo

Definir a configuração mínima e reproduzível para staging e produção sem registrar credenciais no repositório e sem executar operações remotas a partir deste documento.

---

# Ambientes

| Ambiente | Aplicação | Supabase | Dados | Uso |
|---|---|---|---|---|
| Local | URL local | Supabase CLI local | Fixtures descartáveis | Desenvolvimento e testes isolados |
| Staging | Deploy e domínio próprios | Projeto dedicado | Dados sintéticos/controlados | Validação candidata e restore |
| Produção | Deploy e domínio oficiais | Projeto dedicado | Dados reais | Operação do MVP |

Staging e produção não podem compartilhar projeto Supabase, utilizadores, Storage ou secrets. Fixtures, `db reset` e scripts marcados como local-only nunca podem ser executados contra staging ou produção.

---

# Variáveis de Ambiente

| Variável | Exposição | Local | Staging | Produção |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Projeto local | Projeto de staging | Projeto de produção |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Pública | Publishable key local | Publishable key de staging | Publishable key de produção |
| `RESEND_API_KEY` | Server-only | Opcional para testes controlados | Secret próprio | Secret de produção |
| `CONTRACTS_EMAIL_FROM` | Server-only | Remetente controlado | Remetente de staging | Remetente oficial validado |

O procedimento de domínio/remetente, teste real controlado e monitoramento está em `docs/09-release/Resend-Monitoring-Runbook.md`.

Regras:

- configurar valores somente no ambiente local ignorado pelo Git ou no cofre do provedor;
- nunca criar variável `NEXT_PUBLIC_*` para service role, secret key, senha, token ou chave Resend;
- não disponibilizar service role ao runtime normal da aplicação;
- utilizar credenciais distintas por ambiente e restringir acesso operacional;
- registrar rotação e revogação no processo de incidente, nunca neste repositório.

---

# Security Headers

O Next.js aplica globalmente:

- `Content-Security-Policy` compatível com os scripts inline exigidos pelo Next.js atual;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- proteção contra framing com `frame-ancestors 'none'` e `X-Frame-Options: DENY`;
- `Permissions-Policy` negando câmera, geolocalização, microfone, payment e USB;
- HSTS e `upgrade-insecure-requests` somente no build de produção.

O `connect-src` permite apenas a própria origem e a origem definida em `NEXT_PUBLIC_SUPABASE_URL`. Desenvolvimento também permite WebSocket para o runtime local. Resend permanece server-only e não precisa ser liberado na CSP do browser.

Antes do `GO`, verificar os headers efetivos no domínio HTTPS de staging e produção. Não adicionar `preload` ao HSTS antes de existir decisão operacional sobre todos os subdomínios.

---

# Cookies e Supabase Auth SSR

O contrato explícito dos cookies de Auth é:

```text
Path=/
SameSite=Lax
Secure=true em produção
Secure=false somente no desenvolvimento HTTP local
HttpOnly=false
```

`HttpOnly=false` é intencional na arquitetura atual do `@supabase/ssr`: o cliente do browser precisa ler e atualizar os tokens para eventos e renovação de sessão. Isso não transforma a interface em autoridade; páginas e operações privadas continuam validando o utilizador no servidor, e RLS/RPCs continuam aplicando autorização.

Antes do `GO`, validar no domínio final HTTPS as flags efetivamente emitidas, refresh da sessão, Login, Logout e expiração. Qualquer futura migração para tokens exclusivamente server-side exige uma decisão arquitetural própria e não deve ser feita apenas alterando a flag.

---

# Secrets Baseline

A preparação local inclui:

- `.env.example` apenas com nomes e classificação das variáveis;
- `.env.local` e variantes locais ignorados pelo Git;
- busca por padrões de chaves, tokens e private keys nos arquivos versionados e no histórico;
- confirmação de que o código normal usa somente publishable key do Supabase;
- confirmação de que Resend é inicializado apenas no servidor.

Resultado da verificação local desta fase: nenhum secret real foi identificado nos arquivos versionados ou no histórico pesquisado. Esse resultado não substitui secret scanning contínuo nem a revisão dos valores configurados nos provedores.

---

# Checklist Supabase — Staging e Produção

Executar primeiro em staging e repetir em produção somente após aprovação.

## Provisionamento

- [ ] Criar projeto dedicado e registrar Organization/owner operacional, região e plano.
- [ ] Restringir acesso ao painel e habilitar MFA para responsáveis quando disponível.
- [ ] Registrar Project Ref sem registrar senhas, tokens ou secret keys no repositório.
- [ ] Configurar as variáveis da aplicação no cofre do ambiente correto.

## Migrations

- [ ] Confirmar que o alvo é staging ou produção antes de qualquer comando remoto.
- [ ] Comparar o histórico remoto com `supabase/migrations`.
- [ ] Garantir backup recuperável antes da primeira aplicação e de alterações posteriores.
- [ ] Aplicar somente migrations versionadas, em ordem, sem `db reset`.
- [ ] Registrar operador, commit, horário e resultado.
- [ ] Confirmar que não existem migrations locais pendentes ou divergentes.

## Auth

- [ ] Configurar Site URL HTTPS do ambiente.
- [ ] Permitir apenas Redirect URLs HTTPS necessárias ao ambiente.
- [ ] Criar utilizadores reais somente pelo processo operacional aprovado.
- [ ] Validar Login, Logout, refresh, expiração e bloqueio de rota privada.

## Banco, RLS, Grants e RPCs

- [ ] Confirmar RLS em todas as tabelas expostas.
- [ ] Revisar Policies e Grants de `anon`, `authenticated` e `PUBLIC` no schema implantado.
- [ ] Inventariar RPCs e confirmar `SECURITY DEFINER`, autorização interna, `SET search_path = ''`, schemas explícitos e EXECUTE restrito onde aplicável.
- [ ] Confirmar negações por role e cross-Organization sem usar service role na aplicação.
- [ ] Verificar que `activity_logs` não aceita INSERT direto e permanece imutável.

## Storage

- [ ] Confirmar que `private-files` existe por migration e é privado.
- [ ] Revisar Policies e Grants de `storage.objects` aplicáveis ao projeto.
- [ ] Validar upload e download autorizados de Contracts.
- [ ] Validar negação para MEMBER, ADMIN, outra Organization e utilizador anônimo.
- [ ] Confirmar que a UI e respostas públicas não expõem `object_path`.

## OWNER inicial

- [ ] Criar o utilizador inicial por canal controlado.
- [ ] Autenticar como esse utilizador e executar o Bootstrap oficial.
- [ ] Confirmar Profile, Organization e Membership OWNER ACTIVE.
- [ ] Repetir o Bootstrap de forma controlada e confirmar idempotência.
- [ ] Não copiar fixtures ou utilizadores de E2E.

## Verificação pós-migration

- [ ] Comparar tabelas, funções, Policies, Grants, índices e bucket com as migrations versionadas.
- [ ] Executar smoke seguro por OWNER, ADMIN e MEMBER.
- [ ] Confirmar isolamento cross-Organization.
- [ ] Confirmar que nenhuma chave privilegiada chegou ao browser ou bundle.
- [ ] Registrar evidências e decisão de promoção sem incluir dados pessoais ou secrets.

---

# Estado

O contrato local, os headers, os cookies e os checklists estão prontos. Projetos remotos, domínio HTTPS, aplicação de migrations, OWNER inicial e validações pós-migration continuam `NOT CONFIGURED` até execução explícita nos ambientes correspondentes.
