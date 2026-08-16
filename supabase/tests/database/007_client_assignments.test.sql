begin;

-- ============================================================
-- FASBtech CRM
-- Sprint 02 — Clientes & Acessos
-- Client Assignments tests
-- ============================================================

create extension if not exists pgtap with schema extensions;

select plan(20);


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
  'member-a@fasbtech.test',
  '{"full_name":"Member A"}'::jsonb
),
(
  '33333333-3333-4333-8333-333333333333',
  'admin-a@fasbtech.test',
  '{"full_name":"Admin A"}'::jsonb
),
(
  '44444444-4444-4444-8444-444444444444',
  'suspended-a@fasbtech.test',
  '{"full_name":"Suspended A"}'::jsonb
),
(
  '55555555-5555-4555-8555-555555555555',
  'member-b@fasbtech.test',
  '{"full_name":"Member B"}'::jsonb
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
('11111111-1111-4111-8111-111111111111', 'Owner A', 'ACTIVE'),
('22222222-2222-4222-8222-222222222222', 'Member A', 'ACTIVE'),
('33333333-3333-4333-8333-333333333333', 'Admin A', 'ACTIVE'),
('44444444-4444-4444-8444-444444444444', 'Suspended A', 'ACTIVE'),
('55555555-5555-4555-8555-555555555555', 'Member B', 'ACTIVE'),
('66666666-6666-4666-8666-666666666666', 'Owner B', 'ACTIVE');


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
  'ADMIN',
  'ACTIVE'
),
(
  '74444444-4444-4444-8444-444444444444',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '44444444-4444-4444-8444-444444444444',
  'MEMBER',
  'SUSPENDED'
),
(
  '75555555-5555-4555-8555-555555555555',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '55555555-5555-4555-8555-555555555555',
  'MEMBER',
  'ACTIVE'
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
  'Client A',
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111'
),
(
  '82222222-2222-4222-8222-222222222222',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'Client B',
  '66666666-6666-4666-8666-666666666666',
  '66666666-6666-4666-8666-666666666666'
);


-- ============================================================
-- 2. OWNER CONCEDE ACESSO
-- ============================================================

set local role authenticated;

set local request.jwt.claim.sub =
  '11111111-1111-4111-8111-111111111111';


select lives_ok(
  $$
    select public.assign_client_access(
      '81111111-1111-4111-8111-111111111111',
      '72222222-2222-4222-8222-222222222222'
    )
  $$,
  'OWNER deve conseguir associar MEMBER ACTIVE ao Cliente da própria Organization'
);

select is(
  (select count(*) from public.client_assignments),
  1::bigint,
  'Associação deve ser persistida'
);

select is(
  (
    select created_by
    from public.client_assignments
  ),
  '11111111-1111-4111-8111-111111111111'::uuid,
  'created_by da associação deve ser o OWNER autenticado'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_type = 'CLIENT'
      and entity_id = '81111111-1111-4111-8111-111111111111'
      and action = 'ACCESS_GRANTED'
  ),
  1::bigint,
  'Concessão de acesso deve gerar Activity Log'
);


-- ============================================================
-- 3. IDEMPOTÊNCIA
-- ============================================================

select lives_ok(
  $$
    select public.assign_client_access(
      '81111111-1111-4111-8111-111111111111',
      '72222222-2222-4222-8222-222222222222'
    )
  $$,
  'Repetir a mesma associação deve ser idempotente'
);

select is(
  (select count(*) from public.client_assignments),
  1::bigint,
  'Associação repetida não deve duplicar registro'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_type = 'CLIENT'
      and entity_id = '81111111-1111-4111-8111-111111111111'
      and action = 'ACCESS_GRANTED'
  ),
  1::bigint,
  'Associação idempotente não deve duplicar Activity Log'
);


-- ============================================================
-- 4. MEMBER ASSOCIADO
-- ============================================================

set local request.jwt.claim.sub =
  '22222222-2222-4222-8222-222222222222';


select is(
  (select count(*) from public.clients),
  1::bigint,
  'MEMBER associado deve acessar o Cliente'
);

select throws_ok(
  $$
    select public.assign_client_access(
      '81111111-1111-4111-8111-111111111111',
      '72222222-2222-4222-8222-222222222222'
    )
  $$,
  'P0001',
  'CLIENT_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER não pode conceder acesso'
);

select throws_ok(
  $$
    select public.remove_client_access(
      '81111111-1111-4111-8111-111111111111',
      '72222222-2222-4222-8222-222222222222'
    )
  $$,
  'P0001',
  'CLIENT_ACCESS_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER não pode remover acesso'
);

select throws_ok(
  $$
    insert into public.client_assignments (
      client_id,
      membership_id,
      created_by
    )
    values (
      '81111111-1111-4111-8111-111111111111',
      '72222222-2222-4222-8222-222222222222',
      '22222222-2222-4222-8222-222222222222'
    )
  $$,
  '42501',
  null,
  'authenticated não pode inserir client_assignments diretamente'
);


-- ============================================================
-- 5. ALVOS INVÁLIDOS
-- ============================================================

set local request.jwt.claim.sub =
  '11111111-1111-4111-8111-111111111111';


select throws_ok(
  $$
    select public.assign_client_access(
      '81111111-1111-4111-8111-111111111111',
      '73333333-3333-4333-8333-333333333333'
    )
  $$,
  'P0001',
  'CLIENT_ASSIGNMENT_TARGET_INVALID',
  'ADMIN não deve receber Client Assignment de MEMBER'
);

select throws_ok(
  $$
    select public.assign_client_access(
      '81111111-1111-4111-8111-111111111111',
      '74444444-4444-4444-8444-444444444444'
    )
  $$,
  'P0001',
  'CLIENT_ASSIGNMENT_TARGET_INVALID',
  'Membership SUSPENDED não pode receber Client Assignment'
);

select throws_ok(
  $$
    select public.assign_client_access(
      '81111111-1111-4111-8111-111111111111',
      '75555555-5555-4555-8555-555555555555'
    )
  $$,
  'P0001',
  'CLIENT_ASSIGNMENT_TARGET_INVALID',
  'Membership de outra Organization não pode ser associada'
);


-- ============================================================
-- 6. INTEGRIDADE NO BANCO
-- ============================================================

reset role;


select throws_ok(
  $$
    insert into public.client_assignments (
      client_id,
      membership_id,
      created_by
    )
    values (
      '81111111-1111-4111-8111-111111111111',
      '75555555-5555-4555-8555-555555555555',
      '11111111-1111-4111-8111-111111111111'
    )
  $$,
  'P0001',
  'CLIENT_ASSIGNMENT_ORGANIZATION_MISMATCH',
  'Banco deve impedir Client Assignment entre Organizations diferentes'
);

select throws_ok(
  $$
    insert into public.client_assignments (
      client_id,
      membership_id,
      created_by
    )
    values (
      '81111111-1111-4111-8111-111111111111',
      '72222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111111111'
    )
  $$,
  '23505',
  null,
  'Banco deve impedir associação duplicada'
);


-- ============================================================
-- 7. OWNER REMOVE ACESSO
-- ============================================================

set local role authenticated;

set local request.jwt.claim.sub =
  '11111111-1111-4111-8111-111111111111';


select lives_ok(
  $$
    select public.remove_client_access(
      '81111111-1111-4111-8111-111111111111',
      '72222222-2222-4222-8222-222222222222'
    )
  $$,
  'OWNER deve conseguir remover associação'
);

select is(
  (select count(*) from public.client_assignments),
  0::bigint,
  'Associação removida deve deixar de existir'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_type = 'CLIENT'
      and entity_id = '81111111-1111-4111-8111-111111111111'
      and action = 'ACCESS_REVOKED'
  ),
  1::bigint,
  'Remoção de acesso deve gerar Activity Log'
);


-- ============================================================
-- 8. MEMBER PERDE ACESSO
-- ============================================================

set local request.jwt.claim.sub =
  '22222222-2222-4222-8222-222222222222';


select is(
  (select count(*) from public.clients),
  0::bigint,
  'MEMBER deve perder acesso imediatamente após remoção da associação'
);


-- ============================================================
-- FINALIZAÇÃO
-- ============================================================

reset role;

select * from finish();

rollback;