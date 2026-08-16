begin;

-- ============================================================
-- FASBtech CRM
-- Sprint 02 — Clientes & Acessos
-- RLS + isolation tests
-- ============================================================

create extension if not exists pgtap with schema extensions;

select plan(21);


-- ============================================================
-- 1. FIXTURES
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
  'member-assigned@fasbtech.test',
  '{"full_name":"Member Assigned"}'::jsonb
),
(
  '33333333-3333-4333-8333-333333333333',
  'member-no-access@fasbtech.test',
  '{"full_name":"Member No Access"}'::jsonb
),
(
  '44444444-4444-4444-8444-444444444444',
  'admin-a@fasbtech.test',
  '{"full_name":"Admin A"}'::jsonb
),
(
  '55555555-5555-4555-8555-555555555555',
  'suspended-a@fasbtech.test',
  '{"full_name":"Suspended A"}'::jsonb
),
(
  '66666666-6666-4666-8666-666666666666',
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
  'Member Assigned',
  'ACTIVE'
),
(
  '33333333-3333-4333-8333-333333333333',
  'Member No Access',
  'ACTIVE'
),
(
  '44444444-4444-4444-8444-444444444444',
  'Admin A',
  'ACTIVE'
),
(
  '55555555-5555-4555-8555-555555555555',
  'Suspended A',
  'ACTIVE'
),
(
  '66666666-6666-4666-8666-666666666666',
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
  '71111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'OWNER',
  'ACTIVE'
),
(
  '72222222-2222-4222-8222-222222222222',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '22222222-2222-4222-8222-222222222222',
  'MEMBER',
  'ACTIVE'
),
(
  '73333333-3333-4333-8333-333333333333',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '33333333-3333-4333-8333-333333333333',
  'MEMBER',
  'ACTIVE'
),
(
  '74444444-4444-4444-8444-444444444444',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '44444444-4444-4444-8444-444444444444',
  'ADMIN',
  'ACTIVE'
),
(
  '75555555-5555-4555-8555-555555555555',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '55555555-5555-4555-8555-555555555555',
  'MEMBER',
  'SUSPENDED'
),
(
  '76666666-6666-4666-8666-666666666666',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '66666666-6666-4666-8666-666666666666',
  'OWNER',
  'ACTIVE'
);


insert into public.clients (
  id,
  organization_id,
  name,
  created_by,
  updated_by
)
values
(
  '81111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Client A1',
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111'
),
(
  '82222222-2222-4222-8222-222222222222',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Client A2',
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111'
),
(
  '83333333-3333-4333-8333-333333333333',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'Client B1',
  '66666666-6666-4666-8666-666666666666',
  '66666666-6666-4666-8666-666666666666'
);


insert into public.client_assignments (
  id,
  client_id,
  membership_id,
  created_by
)
values
(
  '91111111-1111-4111-8111-111111111111',
  '81111111-1111-4111-8111-111111111111',
  '72222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111'
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
  'a1111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'CLIENT',
  '81111111-1111-4111-8111-111111111111',
  'CREATED'
),
(
  'a2222222-2222-4222-8222-222222222222',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'CLIENT',
  '81111111-1111-4111-8111-111111111111',
  'ACCESS_GRANTED'
),
(
  'a3333333-3333-4333-8333-333333333333',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '66666666-6666-4666-8666-666666666666',
  'CLIENT',
  '83333333-3333-4333-8333-333333333333',
  'CREATED'
);


-- ============================================================
-- 2. OWNER A
-- ============================================================

set local role authenticated;

set local request.jwt.claim.sub =
  '11111111-1111-4111-8111-111111111111';


select is(
  (select count(*) from public.clients),
  2::bigint,
  'OWNER A deve visualizar todos os Clientes da Organization A'
);

select is(
  (select count(*) from public.client_assignments),
  1::bigint,
  'OWNER A deve visualizar Client Assignments da Organization A'
);

select is(
  (select count(*) from public.organization_members),
  5::bigint,
  'OWNER A deve visualizar Memberships da Organization A'
);

select is(
  (select count(*) from public.profiles),
  5::bigint,
  'OWNER A deve visualizar Profiles vinculados à Organization A'
);

select is(
  (select count(*) from public.activity_logs),
  2::bigint,
  'OWNER A deve visualizar Activity Logs somente da Organization A'
);


-- ============================================================
-- 3. MEMBER ASSOCIADO
-- ============================================================

set local request.jwt.claim.sub =
  '22222222-2222-4222-8222-222222222222';


select is(
  (select count(*) from public.clients),
  1::bigint,
  'MEMBER associado deve visualizar exatamente um Cliente'
);

select is(
  (
    select id
    from public.clients
  ),
  '81111111-1111-4111-8111-111111111111'::uuid,
  'MEMBER associado deve visualizar apenas Client A1'
);

select is(
  (select count(*) from public.client_assignments),
  1::bigint,
  'MEMBER associado deve visualizar sua própria associação'
);

select is(
  (select count(*) from public.organization_members),
  1::bigint,
  'MEMBER deve continuar visualizando apenas seu próprio Membership'
);

select is(
  (select count(*) from public.activity_logs),
  1::bigint,
  'MEMBER associado deve visualizar somente Activity Logs operacionais permitidos do Cliente'
);


-- ============================================================
-- 4. MEMBER NÃO ASSOCIADO
-- ============================================================

set local request.jwt.claim.sub =
  '33333333-3333-4333-8333-333333333333';


select is(
  (select count(*) from public.clients),
  0::bigint,
  'MEMBER sem associação não deve visualizar Clientes'
);

select is(
  (select count(*) from public.client_assignments),
  0::bigint,
  'MEMBER sem associação não deve visualizar Client Assignments'
);

select is(
  (select count(*) from public.activity_logs),
  0::bigint,
  'MEMBER sem associação não deve visualizar Activity Logs de Clientes'
);

select is(
  (
    select count(*)
    from public.clients
    where id = '82222222-2222-4222-8222-222222222222'
  ),
  0::bigint,
  'Acesso direto por client_id não deve contornar autorização'
);


-- ============================================================
-- 5. ADMIN
-- ============================================================

set local request.jwt.claim.sub =
  '44444444-4444-4444-8444-444444444444';


select is(
  (select count(*) from public.clients),
  0::bigint,
  'ADMIN não recebe acesso global a Clientes por inferência'
);

select is(
  (select count(*) from public.client_assignments),
  0::bigint,
  'ADMIN não recebe acesso global a Client Assignments por inferência'
);


-- ============================================================
-- 6. MEMBERSHIP SUSPENDED
-- ============================================================

set local request.jwt.claim.sub =
  '55555555-5555-4555-8555-555555555555';


select is(
  (select count(*) from public.clients),
  0::bigint,
  'Membership SUSPENDED não concede acesso a Clientes'
);


-- ============================================================
-- 7. OWNER B — ISOLAMENTO ENTRE ORGANIZATIONS
-- ============================================================

set local request.jwt.claim.sub =
  '66666666-6666-4666-8666-666666666666';


select is(
  (select count(*) from public.clients),
  1::bigint,
  'OWNER B deve visualizar somente Cliente da Organization B'
);

select is(
  (
    select count(*)
    from public.clients
    where id = '81111111-1111-4111-8111-111111111111'
  ),
  0::bigint,
  'OWNER B não deve acessar Cliente da Organization A por ID'
);

select is(
  (select count(*) from public.activity_logs),
  1::bigint,
  'OWNER B deve visualizar somente Activity Logs da Organization B'
);


-- ============================================================
-- 8. ANON
-- ============================================================

reset role;
set local role anon;
set local request.jwt.claim.sub = '';


select throws_ok(
  $$
    select count(*)
    from public.clients
  $$,
  '42501',
  null,
  'anon não pode consultar clients'
);


-- ============================================================
-- FINALIZAÇÃO
-- ============================================================

reset role;

select * from finish();

rollback;