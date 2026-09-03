begin;

-- ============================================================
-- FASBtech CRM
-- Sprint 03 — Demandas
-- RLS, isolation and direct-write denial tests
-- ============================================================

create extension if not exists pgtap with schema extensions;

select plan(35);


-- ============================================================
-- 1. FIXTURES
-- ============================================================

insert into auth.users (id, email, raw_user_meta_data)
values
  ('10111111-1111-4111-8111-111111111111', 'demand-owner-a@fasbtech.test', '{"full_name":"Demand Owner A"}'),
  ('20222222-2222-4222-8222-222222222222', 'demand-member-assigned@fasbtech.test', '{"full_name":"Demand Member Assigned"}'),
  ('30333333-3333-4333-8333-333333333333', 'demand-member-historical@fasbtech.test', '{"full_name":"Demand Member Historical"}'),
  ('40444444-4444-4444-8444-444444444444', 'demand-member-none@fasbtech.test', '{"full_name":"Demand Member None"}'),
  ('50555555-5555-4555-8555-555555555555', 'demand-admin@fasbtech.test', '{"full_name":"Demand Admin"}'),
  ('60666666-6666-4666-8666-666666666666', 'demand-suspended@fasbtech.test', '{"full_name":"Demand Suspended"}'),
  ('70777777-7777-4777-8777-777777777777', 'demand-inactive-profile@fasbtech.test', '{"full_name":"Demand Inactive Profile"}'),
  ('80888888-8888-4888-8888-888888888888', 'demand-owner-b@fasbtech.test', '{"full_name":"Demand Owner B"}'),
  ('90999999-9999-4999-8999-999999999999', 'demand-owner-inactive-org@fasbtech.test', '{"full_name":"Demand Owner Inactive Org"}');

insert into public.profiles (id, full_name, status)
values
  ('10111111-1111-4111-8111-111111111111', 'Demand Owner A', 'ACTIVE'),
  ('20222222-2222-4222-8222-222222222222', 'Demand Member Assigned', 'ACTIVE'),
  ('30333333-3333-4333-8333-333333333333', 'Demand Member Historical', 'ACTIVE'),
  ('40444444-4444-4444-8444-444444444444', 'Demand Member None', 'ACTIVE'),
  ('50555555-5555-4555-8555-555555555555', 'Demand Admin', 'ACTIVE'),
  ('60666666-6666-4666-8666-666666666666', 'Demand Suspended', 'ACTIVE'),
  ('70777777-7777-4777-8777-777777777777', 'Demand Inactive Profile', 'INACTIVE'),
  ('80888888-8888-4888-8888-888888888888', 'Demand Owner B', 'ACTIVE'),
  ('90999999-9999-4999-8999-999999999999', 'Demand Owner Inactive Org', 'ACTIVE');

insert into public.organizations (id, name, slug, status)
values
  ('a1111111-1111-4111-8111-111111111111', 'Demand Organization A', 'demand-organization-a', 'ACTIVE'),
  ('b2222222-2222-4222-8222-222222222222', 'Demand Organization B', 'demand-organization-b', 'ACTIVE'),
  ('c3333333-3333-4333-8333-333333333333', 'Demand Organization Inactive', 'demand-organization-inactive', 'INACTIVE');

insert into public.organization_members (
  id,
  organization_id,
  user_id,
  role,
  status
)
values
  ('71111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111', 'OWNER', 'ACTIVE'),
  ('72222222-2222-4222-8222-222222222222', 'a1111111-1111-4111-8111-111111111111', '20222222-2222-4222-8222-222222222222', 'MEMBER', 'ACTIVE'),
  ('73333333-3333-4333-8333-333333333333', 'a1111111-1111-4111-8111-111111111111', '30333333-3333-4333-8333-333333333333', 'MEMBER', 'ACTIVE'),
  ('74444444-4444-4444-8444-444444444444', 'a1111111-1111-4111-8111-111111111111', '40444444-4444-4444-8444-444444444444', 'MEMBER', 'ACTIVE'),
  ('75555555-5555-4555-8555-555555555555', 'a1111111-1111-4111-8111-111111111111', '50555555-5555-4555-8555-555555555555', 'ADMIN', 'ACTIVE'),
  ('76666666-6666-4666-8666-666666666666', 'a1111111-1111-4111-8111-111111111111', '60666666-6666-4666-8666-666666666666', 'MEMBER', 'SUSPENDED'),
  ('77777777-7777-4777-8777-777777777777', 'a1111111-1111-4111-8111-111111111111', '70777777-7777-4777-8777-777777777777', 'OWNER', 'ACTIVE'),
  ('78888888-8888-4888-8888-888888888888', 'b2222222-2222-4222-8222-222222222222', '80888888-8888-4888-8888-888888888888', 'OWNER', 'ACTIVE'),
  ('79999999-9999-4999-8999-999999999999', 'c3333333-3333-4333-8333-333333333333', '90999999-9999-4999-8999-999999999999', 'OWNER', 'ACTIVE');

insert into public.clients (id, organization_id, name, created_by, updated_by)
values
  ('81111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'Demand Client A1', '10111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111'),
  ('82222222-2222-4222-8222-222222222222', 'a1111111-1111-4111-8111-111111111111', 'Demand Client A2', '10111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111'),
  ('83333333-3333-4333-8333-333333333333', 'b2222222-2222-4222-8222-222222222222', 'Demand Client B1', '80888888-8888-4888-8888-888888888888', '80888888-8888-4888-8888-888888888888'),
  ('84444444-4444-4444-8444-444444444444', 'c3333333-3333-4333-8333-333333333333', 'Demand Client Inactive Org', '90999999-9999-4999-8999-999999999999', '90999999-9999-4999-8999-999999999999');

insert into public.client_assignments (id, client_id, membership_id, created_by)
values
  ('91111111-1111-4111-8111-111111111111', '81111111-1111-4111-8111-111111111111', '72222222-2222-4222-8222-222222222222', '10111111-1111-4111-8111-111111111111'),
  ('92222222-2222-4222-8222-222222222222', '81111111-1111-4111-8111-111111111111', '73333333-3333-4333-8333-333333333333', '10111111-1111-4111-8111-111111111111');

insert into public.demands (
  id,
  organization_id,
  client_id,
  title,
  created_by,
  updated_by
)
values
  ('d1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', '81111111-1111-4111-8111-111111111111', 'Demand A1', '10111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111'),
  ('d2222222-2222-4222-8222-222222222222', 'a1111111-1111-4111-8111-111111111111', '82222222-2222-4222-8222-222222222222', 'Demand A2', '10111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111'),
  ('d3333333-3333-4333-8333-333333333333', 'b2222222-2222-4222-8222-222222222222', '83333333-3333-4333-8333-333333333333', 'Demand B1', '80888888-8888-4888-8888-888888888888', '80888888-8888-4888-8888-888888888888'),
  ('d4444444-4444-4444-8444-444444444444', 'c3333333-3333-4333-8333-333333333333', '84444444-4444-4444-8444-444444444444', 'Demand Inactive Org', '90999999-9999-4999-8999-999999999999', '90999999-9999-4999-8999-999999999999');

insert into public.demand_assignees (id, demand_id, membership_id, created_by)
values
  ('e1111111-1111-4111-8111-111111111111', 'd1111111-1111-4111-8111-111111111111', '72222222-2222-4222-8222-222222222222', '10111111-1111-4111-8111-111111111111'),
  ('e2222222-2222-4222-8222-222222222222', 'd1111111-1111-4111-8111-111111111111', '73333333-3333-4333-8333-333333333333', '10111111-1111-4111-8111-111111111111'),
  ('e3333333-3333-4333-8333-333333333333', 'd2222222-2222-4222-8222-222222222222', '71111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111');

insert into public.demand_tags (id, organization_id, name, created_by)
values
  ('f1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'A1 Tag', '10111111-1111-4111-8111-111111111111'),
  ('f2222222-2222-4222-8222-222222222222', 'a1111111-1111-4111-8111-111111111111', 'A2 Tag', '10111111-1111-4111-8111-111111111111'),
  ('f3333333-3333-4333-8333-333333333333', 'a1111111-1111-4111-8111-111111111111', 'Unused Tag', '10111111-1111-4111-8111-111111111111'),
  ('f4444444-4444-4444-8444-444444444444', 'b2222222-2222-4222-8222-222222222222', 'B1 Tag', '80888888-8888-4888-8888-888888888888');

insert into public.demand_tag_assignments (demand_id, tag_id)
values
  ('d1111111-1111-4111-8111-111111111111', 'f1111111-1111-4111-8111-111111111111'),
  ('d2222222-2222-4222-8222-222222222222', 'f2222222-2222-4222-8222-222222222222'),
  ('d3333333-3333-4333-8333-333333333333', 'f4444444-4444-4444-8444-444444444444');

insert into public.activity_logs (
  id,
  organization_id,
  user_id,
  entity_type,
  entity_id,
  action
)
values
  ('a1111111-aaaa-4aaa-8aaa-111111111111', 'a1111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111', 'DEMAND', 'd1111111-1111-4111-8111-111111111111', 'CREATED'),
  ('a2222222-aaaa-4aaa-8aaa-222222222222', 'a1111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111', 'DEMAND', 'd2222222-2222-4222-8222-222222222222', 'CREATED'),
  ('a3333333-aaaa-4aaa-8aaa-333333333333', 'b2222222-2222-4222-8222-222222222222', '80888888-8888-4888-8888-888888888888', 'DEMAND', 'd3333333-3333-4333-8333-333333333333', 'CREATED');

-- A associação histórica permanece, mas o acesso deixa de existir.
delete from public.client_assignments
where id = '92222222-2222-4222-8222-222222222222';


-- ============================================================
-- 2. OWNER A
-- ============================================================

set local role authenticated;
set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';

select is((select count(*) from public.demands), 2::bigint, 'OWNER deve visualizar Demandas da própria Organization');
select is((select count(*) from public.demand_assignees), 3::bigint, 'OWNER deve visualizar responsáveis das Demandas autorizadas');
select is((select count(*) from public.demand_tags), 3::bigint, 'OWNER deve visualizar catálogo da própria Organization');
select is((select count(*) from public.demand_tag_assignments), 2::bigint, 'OWNER deve visualizar relações de Tags autorizadas');
select is((select count(*) from public.activity_logs where entity_type = 'DEMAND'), 2::bigint, 'OWNER deve visualizar Logs de Demandas da própria Organization');


-- ============================================================
-- 3. MEMBER COM CLIENT ASSIGNMENT
-- ============================================================

set local request.jwt.claim.sub = '20222222-2222-4222-8222-222222222222';

select is((select count(*) from public.demands), 1::bigint, 'MEMBER associado deve visualizar Demandas do Cliente autorizado');
select is((select id from public.demands), 'd1111111-1111-4111-8111-111111111111'::uuid, 'MEMBER deve visualizar somente a Demanda do Cliente associado');
select is((select count(*) from public.demand_assignees), 2::bigint, 'MEMBER pode visualizar responsáveis da Demanda autorizada');
select is((select count(*) from public.demand_tags), 1::bigint, 'MEMBER deve visualizar somente Tags ligadas a Demandas acessíveis');
select is((select count(*) from public.demand_tag_assignments), 1::bigint, 'MEMBER deve visualizar somente Tag Assignments autorizados');
select is((select count(*) from public.activity_logs where entity_type = 'DEMAND'), 1::bigint, 'MEMBER deve visualizar somente Log da Demanda autorizada');


-- ============================================================
-- 4. MEMBER SEM ACESSO E RESPONSÁVEL HISTÓRICO
-- ============================================================

set local request.jwt.claim.sub = '40444444-4444-4444-8444-444444444444';

select is((select count(*) from public.demands), 0::bigint, 'MEMBER sem Assignment não deve visualizar Demandas');
select is((select count(*) from public.demand_assignees), 0::bigint, 'MEMBER sem Assignment não deve visualizar responsáveis');
select is((select count(*) from public.demand_tags), 0::bigint, 'MEMBER sem Assignment não deve visualizar Tags');
select is((select count(*) from public.activity_logs where entity_type = 'DEMAND'), 0::bigint, 'MEMBER sem Assignment não deve visualizar Logs de Demandas');

set local request.jwt.claim.sub = '30333333-3333-4333-8333-333333333333';

select is((select count(*) from public.demands), 0::bigint, 'Ser responsável sem Assignment não deve conceder acesso');
select is((select count(*) from public.demand_assignees), 0::bigint, 'Responsável histórico não deve ler a própria relação sem acesso atual');

reset role;
select is(
  (select count(*) from public.demand_assignees where membership_id = '73333333-3333-4333-8333-333333333333'),
  1::bigint,
  'Remover Client Assignment deve preservar demand_assignee histórico'
);


-- ============================================================
-- 5. ROLES E ESTADOS NEGADOS
-- ============================================================

set local role authenticated;
set local request.jwt.claim.sub = '50555555-5555-4555-8555-555555555555';

select is((select count(*) from public.demands), 0::bigint, 'ADMIN deve ser negado em Demandas');
select is((select count(*) from public.demand_assignees), 0::bigint, 'ADMIN deve ser negado em assignees');
select is((select count(*) from public.demand_tags), 0::bigint, 'ADMIN deve ser negado em Tags');
select is((select count(*) from public.activity_logs where entity_type = 'DEMAND'), 0::bigint, 'ADMIN deve ser negado em Logs de Demandas');

set local request.jwt.claim.sub = '60666666-6666-4666-8666-666666666666';
select is((select count(*) from public.demands), 0::bigint, 'Membership não ACTIVE deve ser negada');

set local request.jwt.claim.sub = '70777777-7777-4777-8777-777777777777';
select is((select count(*) from public.demands), 0::bigint, 'Profile não ACTIVE deve ser negado');


-- ============================================================
-- 6. OUTRA ORGANIZATION E ORGANIZATION INATIVA
-- ============================================================

set local request.jwt.claim.sub = '80888888-8888-4888-8888-888888888888';

select is((select count(*) from public.demands), 1::bigint, 'OWNER B deve visualizar somente sua Organization');
select is((select count(*) from public.demands where id = 'd1111111-1111-4111-8111-111111111111'), 0::bigint, 'ID direto de outra Organization deve ser negado');
select is((select count(*) from public.activity_logs where entity_type = 'DEMAND'), 1::bigint, 'Logs de outra Organization não devem vazar');

set local request.jwt.claim.sub = '90999999-9999-4999-8999-999999999999';
select is((select count(*) from public.demands), 0::bigint, 'Organization não ACTIVE deve ser negada');


-- ============================================================
-- 7. ANON E ESCRITAS DIRETAS
-- ============================================================

reset role;
set local role anon;
set local request.jwt.claim.sub = '';

select throws_ok(
  $$ select count(*) from public.demands $$,
  '42501',
  null,
  'anon não pode consultar Demandas'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';

select throws_ok(
  $$
    insert into public.demands (
      organization_id,
      client_id,
      title,
      created_by,
      updated_by
    ) values (
      'a1111111-1111-4111-8111-111111111111',
      '81111111-1111-4111-8111-111111111111',
      'Direct Demand',
      '10111111-1111-4111-8111-111111111111',
      '10111111-1111-4111-8111-111111111111'
    )
  $$,
  '42501',
  null,
  'authenticated não pode inserir Demandas diretamente'
);

select throws_ok($$ update public.demands set title = 'Direct Update' $$, '42501', null, 'authenticated não pode atualizar Demandas diretamente');
select throws_ok($$ delete from public.demands $$, '42501', null, 'authenticated não pode excluir Demandas diretamente');
select throws_ok(
  $$ insert into public.demand_assignees (demand_id, membership_id, created_by) values ('d1111111-1111-4111-8111-111111111111', '71111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111') $$,
  '42501',
  null,
  'authenticated não pode inserir assignees diretamente'
);
select throws_ok(
  $$ insert into public.demand_tags (organization_id, name, created_by) values ('a1111111-1111-4111-8111-111111111111', 'Direct Tag', '10111111-1111-4111-8111-111111111111') $$,
  '42501',
  null,
  'authenticated não pode inserir Tags diretamente'
);
select throws_ok(
  $$ insert into public.demand_tag_assignments (demand_id, tag_id) values ('d1111111-1111-4111-8111-111111111111', 'f1111111-1111-4111-8111-111111111111') $$,
  '42501',
  null,
  'authenticated não pode inserir Tag Assignments diretamente'
);


reset role;
select * from finish();
rollback;
