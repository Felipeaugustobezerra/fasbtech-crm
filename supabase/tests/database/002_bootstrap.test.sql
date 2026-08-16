begin;

-- ============================================================
-- FASBtech CRM
-- Migration 001 — Foundation
-- Bootstrap tests
-- ============================================================

create extension if not exists pgtap with schema extensions;

select plan(16);


-- ============================================================
-- 1. UTILIZADORES DE TESTE
-- ============================================================

insert into auth.users (
  id,
  email,
  raw_user_meta_data
)
values
(
  '11111111-1111-4111-8111-111111111111',
  'owner@fasbtech.test',
  '{"full_name":"Foundation Owner"}'::jsonb
),
(
  '22222222-2222-4222-8222-222222222222',
  'second-user@fasbtech.test',
  '{"full_name":"Second User"}'::jsonb
);


-- ============================================================
-- 2. ESTADO ANTES DO BOOTSTRAP
-- ============================================================

select is(
  (
    select count(*)
    from public.organizations
  ),
  0::bigint,
  'Nenhuma Organization deve existir antes do Bootstrap'
);


-- ============================================================
-- 3. AUTENTICAR COMO PRIMEIRO UTILIZADOR
-- ============================================================

set local role authenticated;

set local request.jwt.claim.sub =
  '11111111-1111-4111-8111-111111111111';


-- ============================================================
-- 4. PRIMEIRO BOOTSTRAP
-- ============================================================

-- Aqui queremos primeiro provar que a operação executa.
-- Não utilizamos results_eq porque a segunda query dependeria
-- do efeito produzido pela primeira.

select lives_ok(
  $$
    select public.bootstrap_initial_organization()
  $$,
  'Primeiro Bootstrap deve ser executado com sucesso'
);


-- ============================================================
-- 5. ORGANIZATION
-- ============================================================

select is(
  (
    select count(*)
    from public.organizations
  ),
  1::bigint,
  'Bootstrap deve criar exatamente uma Organization'
);


select is(
  (
    select name || '|' || slug || '|' || status
    from public.organizations
    where slug = 'fasbtech'
  ),
  'FASBtech|fasbtech|ACTIVE',
  'Organization inicial deve possuir os dados oficiais'
);


-- ============================================================
-- 6. PROFILE
-- ============================================================

select is(
  (
    select count(*)
    from public.profiles
    where id =
      '11111111-1111-4111-8111-111111111111'::uuid
  ),
  1::bigint,
  'Bootstrap deve criar o Profile do primeiro utilizador'
);


select is(
  (
    select full_name
    from public.profiles
    where id =
      '11111111-1111-4111-8111-111111111111'::uuid
  ),
  'Foundation Owner',
  'Profile deve utilizar raw_user_meta_data.full_name'
);


select is(
  (
    select status
    from public.profiles
    where id =
      '11111111-1111-4111-8111-111111111111'::uuid
  ),
  'ACTIVE',
  'Profile criado pelo Bootstrap deve estar ACTIVE'
);


-- ============================================================
-- 7. MEMBERSHIP OWNER
-- ============================================================

select is(
  (
    select count(*)
    from public.organization_members
    where user_id =
      '11111111-1111-4111-8111-111111111111'::uuid
  ),
  1::bigint,
  'Bootstrap deve criar exatamente uma Membership'
);


select is(
  (
    select role
    from public.organization_members
    where user_id =
      '11111111-1111-4111-8111-111111111111'::uuid
  ),
  'OWNER',
  'Primeiro utilizador deve receber role OWNER'
);


select is(
  (
    select status
    from public.organization_members
    where user_id =
      '11111111-1111-4111-8111-111111111111'::uuid
  ),
  'ACTIVE',
  'Membership inicial deve estar ACTIVE'
);


-- ============================================================
-- 8. IDEMPOTÊNCIA
-- ============================================================

-- Agora a Organization já existe.
-- Podemos comparar o UUID retornado em uma nova execução
-- diretamente com o UUID persistido.

select is(
  public.bootstrap_initial_organization(),
  (
    select id
    from public.organizations
    where slug = 'fasbtech'
  ),
  'Bootstrap repetido deve retornar a mesma Organization'
);


select is(
  (
    select count(*)
    from public.organizations
  ),
  1::bigint,
  'Bootstrap repetido não deve criar segunda Organization'
);


select is(
  (
    select count(*)
    from public.organization_members
    where user_id =
      '11111111-1111-4111-8111-111111111111'::uuid
  ),
  1::bigint,
  'Bootstrap repetido não deve duplicar Membership'
);


-- ============================================================
-- 9. SEGUNDO UTILIZADOR
-- ============================================================

set local request.jwt.claim.sub =
  '22222222-2222-4222-8222-222222222222';


-- Depois que a Organization existe, um novo utilizador sem
-- Membership não pode inicializar novamente o sistema.

select throws_ok(
  $$
    select public.bootstrap_initial_organization()
  $$,
  'P0001',
  'BOOTSTRAP_ALREADY_INITIALIZED',
  'Segundo utilizador não pode executar Bootstrap após inicialização'
);


-- ============================================================
-- 10. BOOTSTRAP NEGADO NÃO DEVE CRIAR PROFILE
-- ============================================================

select is(
  (
    select count(*)
    from public.profiles
    where id =
      '22222222-2222-4222-8222-222222222222'::uuid
  ),
  0::bigint,
  'Bootstrap negado não deve criar Profile para segundo utilizador'
);


-- ============================================================
-- 11. BOOTSTRAP NEGADO NÃO DEVE CRIAR MEMBERSHIP
-- ============================================================

select is(
  (
    select count(*)
    from public.organization_members
    where user_id =
      '22222222-2222-4222-8222-222222222222'::uuid
  ),
  0::bigint,
  'Bootstrap negado não deve criar Membership para segundo utilizador'
);


-- ============================================================
-- FINALIZAÇÃO
-- ============================================================

reset role;

select * from finish();

rollback;