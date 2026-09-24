# CI/CD e Staging — MVP v3.0

## Estado

Pipeline local/CI preparado; staging, deploy remoto e branch protection ainda não configurados.

## Gates de pull request e push

O workflow `.github/workflows/ci.yml` executa em PRs para `master` e pushes em `master`, com Node 22 e `npm ci`. O job da aplicação exige `npm test`, `npm run typecheck`, `npm run lint` e `npm run build`. O build usa valores públicos fictícios apontando para loopback; nenhum secret ou projeto remoto é necessário. O job de banco inicia Supabase em Docker no runner descartável e exige `db reset --local`, `db lint --local --fail-on error` e pgTAP com `test db --local`. O CLI é fixado na versão 2.117.0.

O `supabase/config.toml` local não está versionado. O runner executa `supabase init --yes` para criar a configuração local padrão antes de iniciar o serviço. Não há `supabase link`, `db push` nem credenciais remotas no workflow. Confirmar o primeiro run no GitHub antes de tornar ambos os jobs obrigatórios na proteção de `master`; uma aprovação local não prova a estabilidade do runner. Se a configuração local padrão não reproduzir as migrations/testes, versionar uma configuração mínima revisada em tarefa separada, sem copiar configurações pessoais.

Ativar proteção de `master` no GitHub exigindo os dois jobs aprovados e revisão de PR. Isso é configuração remota pendente, não é realizado por este documento.

## Staging separado

Staging deve ter deploy Vercel, projeto Supabase, Auth Site URL/Redirect URLs HTTPS, bucket privado, secrets e remetente/domínio Resend próprios, todos separados de produção. Utilizar somente dados sintéticos/controlados; nunca copiar dados pessoais de produção, fixtures locais de E2E ou credenciais entre ambientes. Configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no ambiente Vercel de staging, e `RESEND_API_KEY` e `CONTRACTS_EMAIL_FROM` como secrets server-only próprios quando o teste controlado de envio for autorizado. Nenhum valor é mantido neste repositório.

## Caminho de migrations

1. Local: criar migration incremental, executar reset/lint/pgTAP no Supabase local e rever SQL/segurança.
2. CI: reproduzir todas as migrations em runner isolado e bloquear merge se qualquer gate falhar.
3. Staging: operador autorizado confirma Project Ref e histórico remoto, backup recuperável e commit candidato; aplica somente migrations versionadas, em ordem; compara histórico e valida schema, RLS, Grants, Storage, Auth e smoke.
4. Produção: somente após staging aprovado, backup verificado e autorização de release; repetir comparação antes/depois e registrar commit, operador, horário e resultado.

`db reset`, fixtures E2E e scripts de concorrência marcados como local-only nunca são usados em staging ou produção. Migrations já aplicadas são históricas; diferenças são corrigidas por nova migration. Nenhum deploy remoto de migrations está automatizado neste bloco.

## Deploy e rollback

A arquitetura aprova Vercel para a aplicação e Supabase para o backend. Preparar um deploy de staging do mesmo commit aprovado pelo CI, com variáveis próprias, e executar smoke antes de promover esse commit para produção. A configuração concreta dos projetos Vercel, domínio, permissões e promoção permanece pendente. Registrar identificador do deploy e da migration no release.

Em falha apenas da aplicação, retornar ao deploy/commit anterior compatível com o schema atual. Migrations devem ser forward-compatible durante a janela de promoção. Não fazer rollback SQL destrutivo automático. Se uma migration falhar ou deixar estado incompatível, parar a release e o tráfego dependente; avaliar migration corretiva aprovada ou restore isolado conforme `Backup-Recovery-Runbook.md`. Bloquear `GO` se backup, compatibilidade, histórico de migrations, RLS/Grants, Auth, Storage ou smoke não forem comprovados.

## E2E e e-mail

Executar E2E completo com Supabase local isolado antes da release; não é gate de cada commit por custo e necessidade de fixtures/reset. Em staging, fazer smoke dos fluxos críticos e E2E não destrutivo apropriado, sem apontar a suíte local atual para um projeto remoto. O envio Resend real exige aprovação e destinatário controlado; jamais enviar automaticamente por CI. Sem configuração segura do remetente e teste real controlado, o fluxo de Contratos continua bloqueador de produção.

## Segredos e aprovação

Usar GitHub Environments e cofres do provedor separados para staging e produção quando houver automação remota aprovada. O workflow atual não requer secrets. Nunca inserir tokens, senha de banco, service role ou chave Resend em YAML, logs ou variáveis `NEXT_PUBLIC_*`. Credenciais de produção não devem estar disponíveis a PRs nem ao job local de CI. Deploy/migrations de produção exigem aprovação humana e permissões mínimas.
