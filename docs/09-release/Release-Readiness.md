# Release Readiness — MVP v3.0

## Projeto

FASBtech CRM

---

## Versão

3.0

---

## Status

NEEDS WORK — núcleo funcional concluído; preparação operacional de produção pendente

---

## Última atualização

Setembro de 2026

---

# Objetivo

Preparar o MVP v3.0 para produção sem adicionar funcionalidades, ampliar o escopo ou criar uma nova Sprint funcional.

As Sprints 01 a 06 estão concluídas. Esta fase valida configuração, segurança operacional, qualidade da experiência, deploy e capacidade de recuperação antes da decisão de `GO`.

---

# Classificação

Cada item utiliza exatamente um estado:

| Estado | Significado |
|---|---|
| `READY` | Implementado e já sustentado por documentação ou validações concluídas. |
| `NEEDS WORK` | Existe parcialmente, mas ainda exige verificação, correção ou execução antes do release. |
| `NOT CONFIGURED` | Depende de ambiente, credencial, serviço ou processo de produção ainda não configurado ou não comprovado. |
| `OUT OF SCOPE` | Opcional ou posterior ao MVP; não bloqueia o release atual. |

Categorias de execução:

```text
A — já validado pelas Sprints
B — precisa apenas de configuração
C — precisa de implementação ou correção operacional
D — opcional / pós-MVP
```

`READY` não significa que uma verificação de produção possa ser omitida. Significa que a capacidade funcional ou técnica já foi comprovada em ambiente local controlado.

---

# Readiness Geral

| Área | Estado | Categoria | Fundamentação |
|---|---|---|---|
| Núcleo funcional | `READY` | A | Sprints 01–06 concluídas, com banco, aplicação e E2E aprovados. |
| Segurança da aplicação e banco | `READY` | A | Auth, RLS, Grants, RPCs e Storage privado possuem contratos e testes locais. |
| Verificação final de segurança para produção | `NEEDS WORK` | C | Baseline local de headers, cookies, env e secrets concluído; falta validar o ambiente efetivamente implantado. |
| UX/UI de release | `NEEDS WORK` | C | Fluxos funcionam, mas falta passagem final sistemática de consistência, responsividade e feedback. |
| Acessibilidade | `NEEDS WORK` | C | Regras estão documentadas e há semântica básica, mas falta auditoria final WCAG 2.2 AA. |
| Ambiente de produção | `NOT CONFIGURED` | B | Nenhum ambiente Supabase/Vercel de produção foi comprovado nesta documentação. |
| Resend real | `NOT CONFIGURED` | B | Variáveis estão documentadas, mas domínio/remetente e envio real não foram validados. |
| Backup e recuperação | `NOT CONFIGURED` | B/C | Runbook e objetivos propostos existem; backup, retenção aprovada e restore testado ainda não estão configurados. |
| Observabilidade mínima | `NEEDS WORK` | C | Logs estruturados, captura server-side e health existem localmente; destino, monitor externo e alertas ainda dependem de staging/produção. |
| CI/CD | `NOT CONFIGURED` | C | Scripts existem, mas não há pipeline versionado encontrado. |
| Deploy de produção | `NOT CONFIGURED` | B/C | Domínio, HTTPS, variáveis, migrations e smoke pós-deploy ainda precisam ser executados. |

Readiness geral atual:

```text
NO-GO para produção

Motivo:
o produto está funcionalmente pronto,
mas o ambiente e os controles operacionais de produção ainda não estão configurados e comprovados.
```

---

# A. Já Validado pelas Sprints

## Functional readiness

| Item | Estado | Evidência / ação de release |
|---|---|---|
| Login, Logout, sessão e rotas privadas | `READY` | Validado desde a Sprint 01 e preservado nos E2E posteriores. Reexecutar apenas no smoke final. |
| Clientes e Acessos | `READY` | Lifecycle, Client Assignment, negação após remoção e acesso direto cobertos. |
| Demandas | `READY` | Lifecycle, filtros, responsáveis, Tags, autorização e archive cobertos. |
| Financeiro | `READY` | Entradas, saídas, Status, agregados, metas e autorização OWNER-only cobertos. |
| Contratos | `READY` | Templates, DRAFT, geração, documentos privados, assinatura manual e lifecycle cobertos. |
| Dashboard consolidado | `READY` | Dados reais, matriz por role, timezone e 4 E2E específicos aprovados. |
| Ausência de dados fake | `READY` | Dashboard e módulos utilizam fontes reais; Agenda e reuniões fictícias permanecem ausentes. |
| Totais duplicados | `READY` | Dashboard deriva os indicadores no banco e não persiste agregados próprios. |
| Suíte local atual | `READY` | pgTAP: 18/688 e E2E: 37 aprovados no fechamento da Sprint 06; unit/app atualizado nesta fase para 51 arquivos/707 testes aprovados. |

Smoke funcional obrigatório antes do `GO`:

- autenticar e terminar sessão;
- confirmar persistência da sessão após refresh;
- criar, editar, consultar e arquivar Cliente;
- atribuir e remover acesso de `MEMBER`;
- criar e operar Demanda autorizada;
- registrar e realizar Entrada/Saída e conferir resumo financeiro;
- criar Template e Contract DRAFT, gerar PDF, enviar e associar cópia assinada;
- conferir Dashboard para `OWNER`, `MEMBER` e `ADMIN`;
- confirmar estados empty e error seguros nas rotas críticas;
- confirmar que nenhuma rota apresenta placeholder como dado operacional real.

## Segurança já validada localmente

| Item | Estado | Evidência / limite |
|---|---|---|
| Supabase Auth SSR | `READY` | Sessão, cookies, Proxy e validação novamente no servidor implementados. |
| RLS | `READY` | Policies e cenários permitidos/negados cobertos por pgTAP e E2E. |
| RPC hardening | `READY` | Autorização interna, `auth.uid()`, schemas explícitos, `SET search_path = ''` e EXECUTE restrito fazem parte do contrato implementado. |
| Grants mínimos | `READY` | Grants, `anon`, `authenticated`, `PUBLIC` e operações diretas proibidas possuem testes. |
| Service role no fluxo normal | `READY` | Não utilizado pela aplicação para contornar RLS; uso privilegiado permanece restrito à preparação local de E2E. |
| Storage privado | `READY` | Bucket privado e Policies de documentos de Contracts implementados por migrations. |
| Download privado | `READY` | Download server-side autorizado e ausência de `object_path` na UI validados. |
| Activity Logs | `READY` | Infraestrutura central, imutabilidade e escrita transacional cobertas. |
| Isolamento cross-Organization | `READY` | Cenários negados cobertos por banco e E2E. |
| Security headers locais | `READY` | CSP, proteção de framing, nosniff, referrer, Permissions Policy e HSTS de produção estão configurados e testados. |
| Cookies Auth explícitos | `READY` | `Path=/`, `SameSite=Lax`, `Secure` em produção e compatibilidade SSR foram formalizados e testados. |
| Contrato de environment | `READY` | Variáveis públicas/server-only e separação local/staging/produção estão documentadas sem valores reais. |
| Secrets scan local | `READY` | Nenhum padrão de chave, token ou private key real foi identificado nos arquivos versionados ou histórico pesquisado. |

## Artefatos de execução existentes

| Item | Estado | Observação |
|---|---|---|
| Migrations versionadas | `READY` | Oito migrations reais reproduzem Foundation e módulos do MVP. |
| Scripts de validação | `READY` | `lint`, `typecheck`, `test`, `test:coverage`, `test:e2e` e `build` existem no `package.json`. |
| `.env.example` sem valores reais | `READY` | Contém apenas os nomes das variáveis públicas e server-only necessárias. |
| Build de produção local | `READY` | `next build` aprovado no fechamento técnico. |
| Production baseline | `READY` | Checklist reproduzível de staging/produção, migrations, Auth, RLS/Grants, Storage, OWNER e pós-migration documentado. |
| Recovery runbook | `READY` | Procedimentos de backup, restore, validação, incidentes e responsabilidades documentados. |
| Resend & Monitoring runbook | `READY` | Configuração do domínio, teste controlado, sinais técnicos, health e resposta inicial a incidentes documentados. |
| Contrato local de e-mail | `READY` | Configuração obrigatória validada antes do envio; falhas do provider mantêm `GENERATED` e não expõem detalhes à UI. |

---

# B. Precisa Apenas de Configuração

## Production environment

| Item | Estado | Critério para ficar `READY` |
|---|---|---|
| Projeto Supabase de produção | `NOT CONFIGURED` | Criar/selecionar projeto dedicado, registrar responsáveis e confirmar região/plano. |
| Conexão da aplicação com produção | `NOT CONFIGURED` | Configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no host, sem expor chave secreta. |
| Auth Site URL e Redirect URLs | `NOT CONFIGURED` | Configurar somente origens oficiais HTTPS e validar Login/Logout/refresh no domínio final. |
| Aplicação das migrations | `NOT CONFIGURED` | Aplicar migrations versionadas em ordem, registrar resultado e comparar histórico remoto. |
| Bucket `private-files` | `NOT CONFIGURED` | Confirmar criação via migration, caráter privado, Policies e download/upload autorizados. |
| OWNER inicial | `NOT CONFIGURED` | Criar utilizador inicial por processo controlado e executar Bootstrap uma única vez, validando idempotência. |
| Secrets do ambiente | `NOT CONFIGURED` | Configurar apenas no cofre do provedor, restringir acesso e documentar rotação. |
| URL/domínio da aplicação | `NOT CONFIGURED` | Configurar domínio oficial e DNS. |
| HTTPS | `NOT CONFIGURED` | Confirmar certificado válido, redirecionamento para HTTPS e ausência de mixed content. |

O procedimento detalhado e a matriz de environment estão em `docs/09-release/Production-Baseline.md`. A existência do checklist é `READY`; todos os itens remotos acima permanecem `NOT CONFIGURED` até execução comprovada.

Não executar `db reset`, fixtures E2E ou qualquer script destrutivo contra produção.

## Resend

| Item | Estado | Critério para ficar `READY` |
|---|---|---|
| `RESEND_API_KEY` | `NOT CONFIGURED` | Criar chave de produção com menor acesso aplicável e armazenar como secret server-only. |
| `CONTRACTS_EMAIL_FROM` | `NOT CONFIGURED` | Configurar remetente oficial sem expor credencial ao browser. |
| Domínio validado | `NOT CONFIGURED` | Validar domínio e registros DNS exigidos pelo Resend. |
| Envio real controlado | `NOT CONFIGURED` | Enviar um Contract de teste para destinatário controlado e confirmar entrega/erro seguro. |
| Transição `SENT` | `READY` | Semântica de somente marcar após sucesso está coberta unitariamente; confirmar uma vez com provider real. |
| Validação local de configuração | `READY` | Ausência de key/remetente e remetente inválido falham com código seguro antes de contactar o Resend. |

O envio real é blocker porque faz parte do fluxo entregue de Contratos. Não criar bypass, fila, cron ou provider alternativo para liberar o release.

O procedimento de domínio/remetente e o ensaio controlado em staging estão em `docs/09-release/Resend-Monitoring-Runbook.md`.

---

# C. Precisa de Implementação ou Correção Operacional

## Functional readiness final

| Item | Estado | Trabalho necessário |
|---|---|---|
| Smoke integrado em ambiente candidato | `NEEDS WORK` | Executar a lista funcional deste documento após deploy de staging e novamente após produção. |
| Loading/error/empty | `NEEDS WORK` | Revisar rotas críticas e corrigir somente estados ausentes, enganosos ou que vazem detalhes internos. |
| Feedback de mutations | `NEEDS WORK` | Confirmar sucesso/erro em formulários e operações sem depender apenas de navegação implícita. |
| Ausência de placeholders/fakes | `NEEDS WORK` | Fazer inspeção final de todas as rotas do menu; remover somente conteúdo apresentado como real sem fonte. |

## UX/UI

| Item | Estado | Trabalho necessário |
|---|---|---|
| Consistência visual | `NEEDS WORK` | Passagem final entre Dashboard, Clientes, Demandas, Financeiro, Contratos e Acessos. |
| Responsividade | `NEEDS WORK` | Validar desktop e mobile nos fluxos críticos, especialmente tabelas, filtros e formulários. |
| Navegação | `NEEDS WORK` | Confirmar menu por role, página ativa, retorno após mutation e rotas diretas. |
| Formulários | `NEEDS WORK` | Conferir labels, required, mensagens, preservação do input e prevenção de duplo envio. |
| Ações destrutivas | `NEEDS WORK` | Confirmar descrição da consequência e confirmação explícita para archive/cancel/remove. |
| Refinamento visual geral | `NEEDS WORK` | Corrigir inconsistências reais de espaçamento, hierarquia e legibilidade sem redesign ou nova feature. |

## Accessibility

| Item | Estado | Trabalho necessário |
|---|---|---|
| Navegação por teclado | `NEEDS WORK` | Executar todos os fluxos críticos sem rato. |
| Labels e nomes acessíveis | `NEEDS WORK` | Validar inputs, botões icon-only, tabelas, filtros e uploads. |
| Focus | `NEEDS WORK` | Confirmar foco visível, ordem lógica e retorno após dialogs/confirmations. |
| Contraste | `NEEDS WORK` | Verificar tokens e estados contra WCAG 2.2 AA. |
| HTML semântico | `NEEDS WORK` | Revisar headings, landmarks, listas, tabelas e mensagens de status. |
| Erros de formulário | `NEEDS WORK` | Confirmar associação campo–erro e anúncio por tecnologia assistiva. |
| Modais/dialogs | `NEEDS WORK` | Validar nome, foco inicial, trap, Escape e restauração de foco onde existirem. |

Critério de saída: nenhuma falha WCAG 2.2 AA de severidade alta nos fluxos críticos; demais limitações conhecidas devem ser documentadas antes do `GO`.

## Security final de produção

| Item | Estado | Trabalho necessário |
|---|---|---|
| Revisão do schema remoto | `NEEDS WORK` | Confirmar RLS habilitada, Policies, Grants, funções e Storage após migrations. |
| RPC inventory | `NEEDS WORK` | Conferir `SECURITY DEFINER`, `search_path`, schemas explícitos e EXECUTE no banco implantado. |
| Secrets scan | `READY` | Arquivos versionados e histórico foram pesquisados sem identificar secret real; o build local deve continuar sem valores server-only e a verificação deve ser repetida no candidato. |
| Cookies de produção | `NEEDS WORK` | Configuração local explícita e testada (`SameSite=Lax`, `Secure` em produção, `HttpOnly=false` por compatibilidade SSR); falta validar flags efetivas, expiração e refresh no domínio HTTPS final. |
| Security headers | `READY` | CSP compatível com Next.js/Supabase, HSTS somente em produção, nosniff, referrer, framing e Permissions Policy implementados e testados; repetir verificação do header efetivo após deploy. |
| Downloads | `NEEDS WORK` | Repetir autorização OWNER e negação MEMBER/ADMIN/cross-Organization no ambiente candidato. |
| Rate/abuse review | `NEEDS WORK` | Avaliar limites mínimos para Login, envio de e-mail e uploads sem criar infraestrutura desproporcional. |

## Data e operações

| Item | Estado | Trabalho necessário |
|---|---|---|
| Backup | `NOT CONFIGURED` | Runbook existe; ativar estratégia compatível com o plano Supabase e atribuir responsável. |
| Retenção | `NOT CONFIGURED` | Proposta de 30 dias registrada; confirmar cobertura de banco e Storage, custo e requisitos aplicáveis. |
| Restore | `NOT CONFIGURED` | Procedimento e validação estão documentados; executar restore controlado em ambiente isolado antes do `GO`. |
| RPO/RTO | `NEEDS WORK` | Propostas de RPO de 24 horas e RTO de 8 horas úteis registradas; responsáveis precisam aprovar e o restore precisa comprovar o RTO. |
| Activity Logs | `READY` | Persistência central e imutável implementada; definir consulta operacional em incidente sem criar feature. |
| Recuperação operacional | `READY` | Runbook cobre indisponibilidade, migration com falha, credencial comprometida, restore, documentos e responsabilidades. |
| Dados iniciais | `NEEDS WORK` | Definir quem cria OWNER, Clientes iniciais e configurações sem copiar fixtures locais. |

O runbook oficial está em `docs/09-release/Backup-Recovery-Runbook.md`. `READY` para o documento não significa capacidade remota pronta: backup ativo, retenção aprovada e restore comprovado continuam blockers.

## Observability

| Item | Estado | Trabalho necessário |
|---|---|---|
| Logs de aplicação | `READY` | Eventos JSON com níveis, módulo, operação e códigos predefinidos são emitidos server-side, sem payloads, secrets ou snapshots; confirmar captura do runtime em staging. |
| Erros de produção | `NEEDS WORK` | Falhas capturadas em Actions e pelo Next.js deixam sinal técnico local; falta configurar destino, retenção e responsável por triagem. |
| Health monitoring | `NEEDS WORK` | Endpoint `/api/health` implementado para aplicação e Supabase Auth; falta monitor externo e validação no ambiente candidato. |
| Alertas mínimos | `NOT CONFIGURED` | Alertar sobre indisponibilidade, falha recorrente e erro de deploy com destinatário definido. |
| Runbook de monitoramento | `READY` | Sinais, limitações do health e resposta inicial documentados. |
| Activity Logs de domínio | `READY` | Atendem auditoria de negócio, mas não substituem telemetria técnica. |
| APM distribuído complexo | `OUT OF SCOPE` | Adotar somente se evidência posterior justificar. |

Não registrar tokens, cookies, conteúdo de documentos, snapshot completo, dados fiscais ou credenciais em logs técnicos.

O health não verifica PostgreSQL, Storage nem Resend. Esses serviços exigem smoke e monitoramento próprios, conforme `docs/09-release/Resend-Monitoring-Runbook.md`.

## CI/CD

| Item | Estado | Trabalho necessário |
|---|---|---|
| Pipeline versionado | `NOT CONFIGURED` | Criar pipeline mínimo; nenhum workflow foi identificado no repositório. |
| Install reproduzível | `READY` | Utilizar lockfile e Node `>=22` conforme contrato do projeto. |
| Validações de aplicação | `NEEDS WORK` | Tornar `lint`, `typecheck`, `test` e `build` gates obrigatórios. |
| Validações de banco | `NEEDS WORK` | Executar reset/lint/pgTAP somente em ambiente local/isolado protegido. |
| E2E | `NEEDS WORK` | Executar com Supabase isolado e guard `LOCAL ONLY`; nunca apontar fixtures para produção. |
| Migrations no deploy | `NOT CONFIGURED` | Definir responsável, credencial, ordem e verificação pós-aplicação. |
| Deploy | `NOT CONFIGURED` | Definir staging, produção, proteção de branch e promoção controlada. |
| Rollback da aplicação | `NOT CONFIGURED` | Documentar retorno ao artefato anterior. |
| Rollback de banco | `NEEDS WORK` | Preferir migrations corretivas; definir restore para falha não reversível. Nunca usar reset. |

Pipeline mínimo recomendado:

```text
install reproduzível
↓
lint
↓
typecheck
↓
unit/app tests
↓
build
↓
db reset + db lint + pgTAP em ambiente isolado
↓
E2E em ambiente isolado
↓
aprovação humana para produção
↓
migrations de produção
↓
deploy
↓
smoke pós-deploy
```

## Production deploy

| Item | Estado | Trabalho necessário |
|---|---|---|
| Plataforma | `NEEDS WORK` | Confirmar Vercel + Supabase conforme ADR-001 e responsáveis operacionais. |
| Staging | `NOT CONFIGURED` | Criar ambiente candidato separado de produção. |
| Variáveis | `NOT CONFIGURED` | Configurar por ambiente, sem valores no repositório. |
| Migrations | `NOT CONFIGURED` | Aplicar e validar antes de liberar tráfego. |
| Domínio e HTTPS | `NOT CONFIGURED` | Configurar DNS, certificado e redirects. |
| Deploy da aplicação | `NOT CONFIGURED` | Promover artefato que passou pelos gates. |
| Smoke pós-deploy | `NEEDS WORK` | Executar fluxo mínimo por role e validar Resend/Storage de forma controlada. |
| Aprovação final | `NEEDS WORK` | Registrar responsável, horário, resultado e decisão `GO/NO-GO`. |

---

# D. Opcional / Pós-MVP

| Item | Estado | Motivo |
|---|---|---|
| APM distribuído e tracing avançado | `OUT OF SCOPE` | Observabilidade mínima é suficiente para o primeiro release. |
| Alta disponibilidade customizada | `OUT OF SCOPE` | Utilizar capacidades geridas dos provedores até existir necessidade comprovada. |
| Multi-region | `OUT OF SCOPE` | O MVP opera em uma única Organization e timezone operacional. |
| Load testing de grande escala | `OUT OF SCOPE` | Fazer apenas teste proporcional se houver expectativa concreta de carga. |
| BI, exportações e data warehouse | `OUT OF SCOPE` | Fora do MVP v3.0. |
| Agenda, reuniões, IA e automações | `OUT OF SCOPE` | Não fazem parte da Release Readiness nem do MVP aprovado. |
| Filas, cron e scheduler | `OUT OF SCOPE` | Não são necessários para os fluxos atuais. |
| Redesign geral | `OUT OF SCOPE` | A fase permite apenas correções reais de usabilidade e consistência. |

---

# Ordem Recomendada de Execução

## Bloco 1 — Ambiente candidato e ownership operacional

1. definir responsáveis pelo release, banco, secrets e incidentes;
2. provisionar staging Supabase e aplicação;
3. configurar variáveis, Auth URLs e bucket via migrations;
4. criar OWNER inicial por processo controlado.

## Bloco 2 — Segurança e dados

1. aplicar migrations em staging;
2. revisar RLS, RPC hardening, Grants e Storage implantados;
3. validar cookies, headers, downloads e ausência de service role no bundle;
4. configurar backup, retenção e executar restore isolado.

## Bloco 3 — Serviços externos e observabilidade

1. validar domínio e remetente Resend;
2. configurar secrets server-only;
3. executar envio real controlado;
4. configurar logs, captura de erros, health check e alertas mínimos.

## Bloco 4 — UX/UI e acessibilidade

1. executar smoke funcional completo;
2. revisar loading/error/empty e feedback;
3. validar responsividade;
4. executar auditoria de teclado, foco, labels, semântica e contraste;
5. corrigir somente falhas bloqueadoras ou relevantes para o MVP.

## Bloco 5 — CI/CD e ensaio de release

1. versionar pipeline com gates obrigatórios;
2. validar banco e E2E somente em ambiente isolado;
3. documentar migrations, deploy e rollback;
4. executar deploy completo em staging;
5. realizar ensaio de `GO/NO-GO`.

## Bloco 6 — Produção

1. congelar o commit candidato;
2. confirmar backups e responsáveis;
3. aplicar migrations de produção;
4. implantar o artefato aprovado;
5. executar smoke pós-deploy;
6. confirmar logs, health e envio controlado;
7. registrar decisão final e janela de acompanhamento.

---

# Checklist GO / NO-GO

## Functional readiness

- [ ] Todos os módulos abrem sem erro no ambiente candidato.
- [ ] Fluxos críticos por role passaram no smoke.
- [ ] Loading/error/empty não exibem dados falsos nem detalhes internos.
- [ ] Nenhum placeholder aparece como dado operacional real.

## Security

- [ ] Auth URLs estão restritas aos domínios oficiais.
- [ ] RLS está habilitada em todas as tabelas expostas.
- [ ] Policies, Grants e RPCs do banco implantado foram revisados.
- [ ] Nenhuma chave `service_role` ou secret está no bundle ou repositório.
- [ ] Storage e downloads privados negam utilizadores não autorizados.
- [x] Headers e configuração de cookies possuem baseline local implementado e testado.
- [ ] Cookies e headers efetivos do domínio de produção foram verificados.

## UX/UI e acessibilidade

- [ ] Desktop e mobile passaram nos fluxos críticos.
- [ ] Formulários e ações destrutivas possuem feedback adequado.
- [ ] Navegação por teclado, foco, labels, contraste e semântica foram aprovados.
- [ ] Não há falha WCAG 2.2 AA alta conhecida nos fluxos críticos.

## Environment e Resend

- [ ] Supabase de produção está configurado e migrations foram aplicadas.
- [ ] OWNER inicial foi criado e validado.
- [ ] Variáveis e secrets estão no cofre do provedor.
- [ ] Domínio/remetente Resend está validado.
- [ ] Envio real controlado foi concluído com sucesso.

## Data e operations

- [ ] Backup está ativo e possui responsável.
- [ ] Retenção e RPO/RTO estão aprovados.
- [ ] Restore foi testado em ambiente isolado.
- [x] Runbook de incidente e recuperação está acessível.

## Observability e CI/CD

- [x] Logging server-side e health mínimo foram implementados e testados localmente.
- [ ] Logs e erros não expõem dados sensíveis.
- [ ] Health monitoring e alertas mínimos estão ativos.
- [ ] Pipeline obrigatório passou no commit candidato.
- [ ] Estratégias de deploy, migration e rollback foram ensaiadas.

## Deploy

- [ ] Domínio e HTTPS estão válidos.
- [ ] Smoke pós-deploy passou para `OWNER`, `MEMBER` e `ADMIN`.
- [ ] Storage, download e Resend foram confirmados após deploy.
- [ ] Não existe blocker crítico aberto.
- [ ] Responsável autorizado registrou a decisão `GO`.

Regra final:

```text
Qualquer item de segurança, integridade de dados, backup/restore,
ambiente, Resend obrigatório ou smoke crítico não aprovado

=

NO-GO
```

---

# Blockers Atuais para Produção

1. ambiente Supabase e aplicação de produção não configurados nem comprovados;
2. migrations, Auth URLs, bucket privado e OWNER inicial ainda não validados em ambiente candidato;
3. `RESEND_API_KEY`, `CONTRACTS_EMAIL_FROM`, domínio e envio real controlado não configurados;
4. backup remoto não ativado, retenção e RPO/RTO ainda não aprovados e restore ainda não testado;
5. destino operacional dos logs, monitor externo e alertas mínimos ainda não configurados;
6. pipeline CI/CD, estratégia de migration e rollback não versionados/ensaiados;
7. validação efetiva de schema remoto, cookies e headers no domínio HTTPS pendente;
8. smoke completo, refinamento UX/UI e auditoria de acessibilidade pendentes;
9. domínio, HTTPS e smoke pós-deploy pendentes.

Nenhum desses blockers exige nova feature. Todos pertencem à preparação operacional, configuração ou correção de release do MVP já implementado.

---

# Definition of Done da Release Readiness

A fase estará concluída quando:

- todos os blockers atuais estiverem resolvidos;
- todos os itens obrigatórios do checklist estiverem marcados;
- o ambiente de produção estiver reproduzível a partir das migrations e configuração documentada;
- secrets permanecerem fora do código e do bundle;
- backup e restore estiverem comprovados;
- CI/CD e rollback estiverem ensaiados;
- smoke de produção estiver aprovado;
- não houver vulnerabilidade crítica ou alta conhecida sem mitigação;
- a decisão `GO` estiver registrada por responsável autorizado.
