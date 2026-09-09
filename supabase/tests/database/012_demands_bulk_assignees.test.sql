begin;

-- ============================================================
-- FASBtech CRM
-- Sprint 03 — Demandas
-- Bulk assignee read authorization and Data Leakage tests
-- ============================================================

create extension if not exists pgtap with schema extensions;

select plan(20);


-- ============================================================
-- 1. FIXTURES
-- ============================================================

insert into auth.users (id, email, raw_user_meta_data)
values
  ('a1000000-0000-4000-8000-000000000001', 'bulk-owner-a@fasbtech.test', '{"full_name":"Bulk Owner A"}'),
  ('a1000000-0000-4000-8000-000000000002', 'bulk-member-assigned@fasbtech.test', '{"full_name":"Bulk Member Assigned"}'),
  ('a1000000-0000-4000-8000-000000000003', 'bulk-member-no-access@fasbtech.test', '{"full_name":"Bulk Member No Access"}'),
  ('a1000000-0000-4000-8000-000000000004', 'bulk-admin@fasbtech.test', '{"full_name":"Bulk Admin"}'),
  ('b1000000-0000-4000-8000-000000000001', 'bulk-owner-b@fasbtech.test', '{"full_name":"Bulk Owner B"}'),
  ('a1000000-0000-4000-8000-000000000005', 'bulk-member-historical@fasbtech.test', '{"full_name":"Bulk Member Historical"}'),
  ('a1000000-0000-4000-8000-000000000006', 'bulk-member-current@fasbtech.test', '{"full_name":"Bulk Member Current"}');

insert into public.profiles (id, full_name, status)
values
  ('a1000000-0000-4000-8000-000000000001', 'Bulk Owner A', 'ACTIVE'),
  ('a1000000-0000-4000-8000-000000000002', 'Bulk Member Assigned', 'ACTIVE'),
  ('a1000000-0000-4000-8000-000000000003', 'Bulk Member No Access', 'ACTIVE'),
  ('a1000000-0000-4000-8000-000000000004', 'Bulk Admin', 'ACTIVE'),
  ('b1000000-0000-4000-8000-000000000001', 'Bulk Owner B', 'ACTIVE'),
  ('a1000000-0000-4000-8000-000000000005', 'Bulk Member Historical', 'ACTIVE'),
  ('a1000000-0000-4000-8000-000000000006', 'Bulk Member Current', 'ACTIVE');

insert into public.organizations (id, name, slug, status)
values
  ('a2000000-0000-4000-8000-000000000001', 'Bulk Organization A', 'bulk-organization-a', 'ACTIVE'),
  ('b2000000-0000-4000-8000-000000000001', 'Bulk Organization B', 'bulk-organization-b', 'ACTIVE');

insert into public.organization_members (
  id,
  organization_id,
  user_id,
  role,
  status
)
values
  ('a3000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'OWNER', 'ACTIVE'),
  ('a3000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 'MEMBER', 'ACTIVE'),
  ('a3000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', 'MEMBER', 'ACTIVE'),
  ('a3000000-0000-4000-8000-000000000004', 'a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000004', 'ADMIN', 'ACTIVE'),
  ('b3000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'OWNER', 'ACTIVE'),
  ('a3000000-0000-4000-8000-000000000005', 'a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000005', 'MEMBER', 'ACTIVE'),
  ('a3000000-0000-4000-8000-000000000006', 'a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000006', 'MEMBER', 'ACTIVE');

insert into public.clients (
  id,
  organization_id,
  name,
  created_by,
  updated_by
)
values
  ('a4000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'Bulk Client A1', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('a4000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000001', 'Bulk Client A2', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('b4000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'Bulk Client B1', 'b1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001');

insert into public.client_assignments (
  id,
  client_id,
  membership_id,
  created_by
)
values
  ('a5000000-0000-4000-8000-000000000001', 'a4000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001'),
  ('a5000000-0000-4000-8000-000000000002', 'a4000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001'),
  ('a5000000-0000-4000-8000-000000000003', 'a4000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001');

insert into public.demands (
  id,
  organization_id,
  client_id,
  title,
  created_by,
  updated_by
)
values
  ('a6000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a4000000-0000-4000-8000-000000000001', 'Bulk Demand A1 One', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('a6000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000001', 'a4000000-0000-4000-8000-000000000001', 'Bulk Demand A1 Two', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('a6000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000001', 'a4000000-0000-4000-8000-000000000002', 'Bulk Demand A2', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('b6000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'b4000000-0000-4000-8000-000000000001', 'Bulk Demand B1', 'b1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001');

insert into public.demand_assignees (
  id,
  demand_id,
  membership_id,
  created_by
)
values
  ('a7000000-0000-4000-8000-000000000001', 'a6000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('a7000000-0000-4000-8000-000000000002', 'a6000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001'),
  ('a7000000-0000-4000-8000-000000000003', 'a6000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001'),
  ('a7000000-0000-4000-8000-000000000004', 'a6000000-0000-4000-8000-000000000002', 'a3000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('a7000000-0000-4000-8000-000000000005', 'a6000000-0000-4000-8000-000000000003', 'a3000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('b7000000-0000-4000-8000-000000000001', 'b6000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001');

delete from public.client_assignments
where id = 'a5000000-0000-4000-8000-000000000002';


-- ============================================================
-- 2. FUNCTION CONTRACT AND HARDENING
-- ============================================================

select ok(
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'list_demand_assignees_bulk'
      and grantee in ('PUBLIC', 'anon', 'service_role')
      and privilege_type = 'EXECUTE'
  ),
  'PUBLIC, anon e service_role não devem executar a RPC bulk'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.list_demand_assignees_bulk(uuid[])',
    'EXECUTE'
  ),
  'authenticated deve executar a RPC bulk'
);

select ok(
  (
    select procedure.prosecdef
    from pg_catalog.pg_proc as procedure
    inner join pg_catalog.pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'list_demand_assignees_bulk'
  ),
  'RPC bulk deve usar SECURITY DEFINER'
);

select is(
  (
    select procedure.provolatile
    from pg_catalog.pg_proc as procedure
    inner join pg_catalog.pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'list_demand_assignees_bulk'
  ),
  's'::"char",
  'RPC bulk deve ser STABLE'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_proc as procedure
    inner join pg_catalog.pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    cross join lateral unnest(procedure.proconfig) as configuration(setting)
    where namespace.nspname = 'public'
      and procedure.proname = 'list_demand_assignees_bulk'
      and configuration.setting in ('search_path=', 'search_path=""')
  ),
  'RPC bulk deve usar search_path vazio'
);

select is(
  (
    select array_agg(
      parameter.parameter_name || ':' || parameter.udt_name
      order by parameter.ordinal_position
    )
    from information_schema.parameters as parameter
    inner join information_schema.routines as routine
      on routine.specific_schema = parameter.specific_schema
     and routine.specific_name = parameter.specific_name
    where routine.routine_schema = 'public'
      and routine.routine_name = 'list_demand_assignees_bulk'
      and parameter.parameter_mode = 'IN'
  ),
  array['p_demand_ids:_uuid']::text[],
  'RPC bulk deve receber somente p_demand_ids uuid[]'
);


-- ============================================================
-- 3. OWNER AND RETURN SEMANTICS
-- ============================================================

set local role authenticated;
set local request.jwt.claim.sub = 'a1000000-0000-4000-8000-000000000001';

select is(
  (
    select jsonb_agg(
      to_jsonb(bulk_assignee) - 'demand_id'
      order by bulk_assignee.full_name, bulk_assignee.membership_id
    )
    from public.list_demand_assignees_bulk(
      array['a6000000-0000-4000-8000-000000000001'::uuid]
    ) as bulk_assignee
  ),
  (
    select jsonb_agg(
      to_jsonb(single_assignee)
      order by single_assignee.full_name, single_assignee.membership_id
    )
    from public.list_demand_assignees(
      'a6000000-0000-4000-8000-000000000001'
    ) as single_assignee
  ),
  'RPC bulk deve preservar a semântica da RPC individual'
);

select is(
  (
    select array_agg(projected.key order by projected.key)
    from jsonb_object_keys(
      (
        select to_jsonb(assignee)
        from public.list_demand_assignees_bulk(
          array['a6000000-0000-4000-8000-000000000001'::uuid]
        ) as assignee
        limit 1
      )
    ) as projected(key)
  ),
  array[
    'demand_id',
    'full_name',
    'is_currently_eligible',
    'membership_id',
    'role'
  ]::text[],
  'RPC bulk deve expor somente os cinco campos mínimos'
);

select is(
  (
    select is_currently_eligible
    from public.list_demand_assignees_bulk(
      array['a6000000-0000-4000-8000-000000000001'::uuid]
    )
    where membership_id = 'a3000000-0000-4000-8000-000000000006'
  ),
  true,
  'Responsável com Client Assignment atual deve permanecer elegível'
);

select is(
  (
    select is_currently_eligible
    from public.list_demand_assignees_bulk(
      array['a6000000-0000-4000-8000-000000000001'::uuid]
    )
    where membership_id = 'a3000000-0000-4000-8000-000000000005'
  ),
  false,
  'Responsável histórico deve permanecer visível como não elegível'
);


-- ============================================================
-- 4. AUTHORIZATION AND DATA LEAKAGE
-- ============================================================

set local request.jwt.claim.sub = 'a1000000-0000-4000-8000-000000000002';

select is(
  (
    select count(*)
    from public.list_demand_assignees_bulk(
      array['a6000000-0000-4000-8000-000000000001'::uuid]
    )
  ),
  3::bigint,
  'MEMBER com Assignment deve ler responsáveis mesmo sem ser assignee'
);

select is(
  (
    select count(distinct demand_id)
    from public.list_demand_assignees_bulk(
      array[
        'a6000000-0000-4000-8000-000000000001'::uuid,
        'a6000000-0000-4000-8000-000000000002'::uuid
      ]
    )
  ),
  2::bigint,
  'Array com duas Demandas autorizadas deve retornar ambas'
);

set local request.jwt.claim.sub = 'a1000000-0000-4000-8000-000000000003';

select is(
  (
    select count(*)
    from public.list_demand_assignees_bulk(
      array['a6000000-0000-4000-8000-000000000001'::uuid]
    )
  ),
  0::bigint,
  'MEMBER sem Client Assignment não deve receber dados'
);

set local request.jwt.claim.sub = 'a1000000-0000-4000-8000-000000000005';

select is(
  (
    select count(*)
    from public.list_demand_assignees_bulk(
      array['a6000000-0000-4000-8000-000000000001'::uuid]
    )
  ),
  0::bigint,
  'Assignee histórico sem Client Assignment não deve receber acesso'
);

set local request.jwt.claim.sub = 'a1000000-0000-4000-8000-000000000004';

select is(
  (
    select count(*)
    from public.list_demand_assignees_bulk(
      array['a6000000-0000-4000-8000-000000000001'::uuid]
    )
  ),
  0::bigint,
  'ADMIN deve ser negado sem receber dados'
);

set local request.jwt.claim.sub = 'b1000000-0000-4000-8000-000000000001';

select is(
  (
    select count(*)
    from public.list_demand_assignees_bulk(
      array['a6000000-0000-4000-8000-000000000001'::uuid]
    )
  ),
  0::bigint,
  'OWNER de outra Organization não deve receber dados'
);

set local request.jwt.claim.sub = 'a1000000-0000-4000-8000-000000000002';

select is(
  (
    select array_agg(distinct demand_id order by demand_id)
    from public.list_demand_assignees_bulk(
      array[
        'a6000000-0000-4000-8000-000000000001'::uuid,
        'a6000000-0000-4000-8000-000000000003'::uuid,
        'b6000000-0000-4000-8000-000000000001'::uuid,
        'd9999999-9999-4999-8999-999999999999'::uuid
      ]
    )
  ),
  array['a6000000-0000-4000-8000-000000000001'::uuid],
  'Array misto deve retornar somente Demandas atualmente autorizadas'
);

set local request.jwt.claim.sub = 'a1000000-0000-4000-8000-000000000001';

select is(
  (
    select count(*)
    from public.list_demand_assignees_bulk(
      array['d9999999-9999-4999-8999-999999999999'::uuid]
    )
  ),
  0::bigint,
  'Demand inexistente deve retornar coleção vazia sem revelar existência'
);

select is(
  (
    select count(*)
    from public.list_demand_assignees_bulk('{}'::uuid[])
  ),
  0::bigint,
  'Array vazio deve retornar coleção vazia'
);

reset role;
set local role anon;
set local request.jwt.claim.sub = '';

select throws_ok(
  $$
    select *
    from public.list_demand_assignees_bulk(
      array['a6000000-0000-4000-8000-000000000001'::uuid]
    )
  $$,
  '42501',
  null,
  'anon não deve executar a RPC bulk'
);

reset role;

select * from finish();
rollback;
