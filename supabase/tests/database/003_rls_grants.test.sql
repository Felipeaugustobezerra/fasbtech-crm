begin;

-- ============================================================
-- FASBtech CRM
-- Migration 001 — Foundation
-- RLS + Grants tests
-- ============================================================

create extension if not exists pgtap with schema extensions;

select plan(34);


-- ============================================================
-- 1. GRANTS — AUTHENTICATED
-- ============================================================

select table_privs_are(
  'public',
  'profiles',
  'authenticated',
  array['SELECT'],
  'authenticated deve possuir apenas SELECT no nível da tabela profiles'
);

select column_privs_are(
  'public',
  'profiles',
  'full_name',
  'authenticated',
  array['SELECT', 'UPDATE'],
  'authenticated pode visualizar e atualizar profiles.full_name'
);

select column_privs_are(
  'public',
  'profiles',
  'avatar_url',
  'authenticated',
  array['SELECT', 'UPDATE'],
  'authenticated pode visualizar e atualizar profiles.avatar_url'
);

select column_privs_are(
  'public',
  'profiles',
  'status',
  'authenticated',
  array['SELECT'],
  'authenticated não pode atualizar profiles.status diretamente'
);


select table_privs_are(
  'public',
  'organizations',
  'authenticated',
  array['SELECT'],
  'authenticated deve possuir SELECT no nível da tabela organizations'
);

select column_privs_are(
  'public',
  'organizations',
  'name',
  'authenticated',
  array['SELECT', 'UPDATE'],
  'authenticated possui UPDATE de coluna em organizations.name'
);


select table_privs_are(
  'public',
  'organization_members',
  'authenticated',
  array['SELECT'],
  'authenticated deve possuir apenas SELECT em organization_members'
);

select table_privs_are(
  'public',
  'activity_logs',
  'authenticated',
  array['SELECT'],
  'authenticated deve possuir apenas SELECT em activity_logs'
);


-- ============================================================
-- 2. GRANTS — ANON
-- ============================================================

select table_privs_are(
  'public',
  'profiles',
  'anon',
  array[]::text[],
  'anon não deve possuir privilégios em profiles'
);

select table_privs_are(
  'public',
  'organizations',
  'anon',
  array[]::text[],
  'anon não deve possuir privilégios em organizations'
);

select table_privs_are(
  'public',
  'organization_members',
  'anon',
  array[]::text[],
  'anon não deve possuir privilégios em organization_members'
);

select table_privs_are(
  'public',
  'activity_logs',
  'anon',
  array[]::text[],
  'anon não deve possuir privilégios em activity_logs'
);


-- ============================================================
-- 3. BOOTSTRAP GRANTS
-- ============================================================

select function_privs_are(
  'public',
  'bootstrap_initial_organization',
  array[]::text[],
  'authenticated',
  array['EXECUTE'],
  'authenticated deve possuir EXECUTE no Bootstrap'
);

select function_privs_are(
  'public',
  'bootstrap_initial_organization',
  array[]::text[],
  'anon',
  array[]::text[],
  'anon não deve possuir EXECUTE no Bootstrap'
);

select ok(
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'bootstrap_initial_organization'
      and grantee = 'PUBLIC'
      and privilege_type = 'EXECUTE'
  ),
  'PUBLIC não deve possuir EXECUTE no Bootstrap'
);


-- ============================================================
-- 4. SCHEMA PRIVATE
-- ============================================================

select schema_privs_are(
  'private',
  'authenticated',
  array[]::text[],
  'authenticated não deve possuir privilégios diretos no schema private'
);


-- ============================================================
-- 5. FIXTURES
-- ============================================================

insert into auth.users (
  id,
  email,
  raw_user_meta_data
)
values
(
  '11111111-1111-4111-8111-111111111111',
  'owner-a@fasbtech.test',
  '{"full_name":"Owner A"}'::jsonb
),
(
  '22222222-2222-4222-8222-222222222222',
  'member-a@fasbtech.test',
  '{"full_name":"Member A"}'::jsonb
),
(
  '33333333-3333-4333-8333-333333333333',
  'suspended-a@fasbtech.test',
  '{"full_name":"Suspended A"}'::jsonb
),
(
  '44444444-4444-4444-8444-444444444444',
  'owner-b@fasbtech.test',
  '{"full_name":"Owner B"}'::jsonb
);


insert into public.profiles (
  id,
  full_name,
  status
)
values
(
  '11111111-1111-4111-8111-111111111111',
  'Owner A',
  'ACTIVE'
),
(
  '22222222-2222-4222-8222-222222222222',
  'Member A',
  'ACTIVE'
),
(
  '33333333-3333-4333-8333-333333333333',
  'Suspended A',
  'ACTIVE'
),
(
  '44444444-4444-4444-8444-444444444444',
  'Owner B',
  'ACTIVE'
);


insert into public.organizations (
  id,
  name,
  slug,
  status
)
values
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Organization A',
  'organization-a',
  'ACTIVE'
),
(
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'Organization B',
  'organization-b',
  'ACTIVE'
);


insert into public.organization_members (
  id,
  organization_id,
  user_id,
  role,
  status
)
values
(
  '51111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'OWNER',
  'ACTIVE'
),
(
  '52222222-2222-4222-8222-222222222222',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '22222222-2222-4222-8222-222222222222',
  'MEMBER',
  'ACTIVE'
),
(
  '53333333-3333-4333-8333-333333333333',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '33333333-3333-4333-8333-333333333333',
  'MEMBER',
  'SUSPENDED'
),
(
  '54444444-4444-4444-8444-444444444444',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '44444444-4444-4444-8444-444444444444',
  'OWNER',
  'ACTIVE'
);


insert into public.activity_logs (
  id,
  organization_id,
  user_id,
  entity_type,
  entity_id,
  action
)
values
(
  '61111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'ORGANIZATION',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'CREATED'
),
(
  '62222222-2222-4222-8222-222222222222',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '44444444-4444-4444-8444-444444444444',
  'ORGANIZATION',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'CREATED'
);


-- ============================================================
-- 6. OWNER A
-- ============================================================

set local role authenticated;

set local request.jwt.claim.sub =
  '11111111-1111-4111-8111-111111111111';


select is(
  (
    select count(*)
    from public.profiles
  ),
  1::bigint,
  'OWNER deve visualizar somente o próprio Profile na Foundation'
);


select is(
  (
    select count(*)
    from public.organizations
  ),
  1::bigint,
  'OWNER deve visualizar somente Organizations onde possui Membership ACTIVE'
);


select is(
  (
    select count(*)
    from public.organization_members
  ),
  1::bigint,
  'OWNER deve visualizar apenas o próprio Membership na Foundation'
);


select is(
  (
    select count(*)
    from public.activity_logs
  ),
  1::bigint,
  'OWNER deve visualizar Activity Logs apenas da própria Organization'
);


select lives_ok(
  $$
    update public.profiles
    set full_name = 'Owner A Updated'
    where id = '11111111-1111-4111-8111-111111111111'
  $$,
  'Utilizador deve poder atualizar seu próprio full_name'
);


-- Usamos apenas SQLSTATE para evitar dependência da mensagem
-- textual do PostgreSQL.

select throws_ok(
  $$
    update public.profiles
    set status = 'INACTIVE'
    where id = '11111111-1111-4111-8111-111111111111'
  $$,
  '42501',
  null,
  'Utilizador não pode atualizar profiles.status diretamente'
);


select lives_ok(
  $$
    update public.organizations
    set name = 'Organization A Updated'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  $$,
  'OWNER ACTIVE pode atualizar sua própria Organization'
);


-- ============================================================
-- 7. MEMBER A
-- ============================================================

set local request.jwt.claim.sub =
  '22222222-2222-4222-8222-222222222222';


select is(
  (
    select count(*)
    from public.organizations
  ),
  1::bigint,
  'MEMBER ACTIVE pode visualizar sua Organization'
);


select is(
  (
    select count(*)
    from public.activity_logs
  ),
  0::bigint,
  'MEMBER não possui acesso irrestrito aos Activity Logs'
);


select results_eq(
  $$
    with updated as (
      update public.organizations
      set name = 'Unauthorized Member Update'
      where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      returning id
    )
    select count(*) from updated
  $$,
  array[0::bigint],
  'MEMBER não pode atualizar a Organization'
);


-- ============================================================
-- 8. MEMBERSHIP SUSPENDED
-- ============================================================

set local request.jwt.claim.sub =
  '33333333-3333-4333-8333-333333333333';


select is(
  (
    select count(*)
    from public.organizations
  ),
  0::bigint,
  'Membership SUSPENDED não concede acesso operacional à Organization'
);


select is(
  (
    select count(*)
    from public.organization_members
  ),
  1::bigint,
  'Utilizador suspenso ainda pode consultar seu próprio contexto de Membership'
);


-- ============================================================
-- 9. OWNER B — ISOLAMENTO ENTRE ORGANIZATIONS
-- ============================================================

set local request.jwt.claim.sub =
  '44444444-4444-4444-8444-444444444444';


select is(
  (
    select count(*)
    from public.organizations
  ),
  1::bigint,
  'OWNER B deve visualizar somente Organization B'
);


select is(
  (
    select count(*)
    from public.activity_logs
  ),
  1::bigint,
  'OWNER B deve visualizar somente Activity Logs da Organization B'
);


-- ============================================================
-- 10. ACTIVITY LOGS — ESCRITA DIRETA NEGADA
-- ============================================================

set local request.jwt.claim.sub =
  '11111111-1111-4111-8111-111111111111';


select throws_ok(
  $$
    insert into public.activity_logs (
      organization_id,
      user_id,
      entity_type,
      entity_id,
      action
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      '11111111-1111-4111-8111-111111111111',
      'ORGANIZATION',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'CREATED'
    )
  $$,
  '42501',
  null,
  'authenticated não pode inserir Activity Log diretamente'
);


select throws_ok(
  $$
    update public.activity_logs
    set action = 'UPDATED'
    where id = '61111111-1111-4111-8111-111111111111'
  $$,
  '42501',
  null,
  'authenticated não pode atualizar Activity Logs'
);


select throws_ok(
  $$
    delete from public.activity_logs
    where id = '61111111-1111-4111-8111-111111111111'
  $$,
  '42501',
  null,
  'authenticated não pode excluir Activity Logs'
);


-- ============================================================
-- 11. PROFILE DE TERCEIRO
-- ============================================================

set local request.jwt.claim.sub =
  '22222222-2222-4222-8222-222222222222';


select results_eq(
  $$
    with updated as (
      update public.profiles
      set full_name = 'Hacked Owner'
      where id = '11111111-1111-4111-8111-111111111111'
      returning id
    )
    select count(*) from updated
  $$,
  array[0::bigint],
  'Utilizador não pode atualizar Profile de terceiro'
);


-- ============================================================
-- FINALIZAÇÃO
-- ============================================================

reset role;

select * from finish();

rollback;