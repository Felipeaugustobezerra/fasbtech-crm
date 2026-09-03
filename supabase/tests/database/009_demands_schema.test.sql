begin;

-- ============================================================
-- FASBtech CRM
-- Sprint 03 — Demandas
-- Schema, helpers, grants and hardening tests
-- ============================================================

create extension if not exists pgtap with schema extensions;

select plan(78);


-- ============================================================
-- 1. TABELAS E PRIMARY KEYS
-- ============================================================

select has_table('public', 'demands', 'public.demands deve existir');
select has_table('public', 'demand_assignees', 'public.demand_assignees deve existir');
select has_table('public', 'demand_tags', 'public.demand_tags deve existir');
select has_table('public', 'demand_tag_assignments', 'public.demand_tag_assignments deve existir');

select col_is_pk('public', 'demands', 'id', 'demands.id deve ser PK');
select col_is_pk('public', 'demand_assignees', 'id', 'demand_assignees.id deve ser PK');
select col_is_pk('public', 'demand_tags', 'id', 'demand_tags.id deve ser PK');

select ok(
  exists (
    select 1
    from pg_catalog.pg_constraint as constraint_definition
    where constraint_definition.conname = 'demand_tag_assignments_pkey'
      and constraint_definition.conrelid = 'public.demand_tag_assignments'::regclass
      and pg_get_constraintdef(constraint_definition.oid) =
        'PRIMARY KEY (demand_id, tag_id)'
  ),
  'demand_tag_assignments deve usar PK composta sem UUID próprio'
);


-- ============================================================
-- 2. COLUNAS CONGELADAS
-- ============================================================

select is(
  (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demands'
  ),
  15::bigint,
  'demands deve possuir as 15 colunas congeladas'
);

select is(
  (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demand_assignees'
  ),
  5::bigint,
  'demand_assignees deve possuir as 5 colunas congeladas'
);

select is(
  (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demand_tags'
  ),
  5::bigint,
  'demand_tags deve possuir as 5 colunas congeladas'
);

select is(
  (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demand_tag_assignments'
  ),
  3::bigint,
  'demand_tag_assignments deve possuir somente três colunas'
);

select is(
  (
    select data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demands'
      and column_name = 'start_date'
  ),
  'date',
  'demands.start_date deve usar DATE'
);

select is(
  (
    select data_type
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demands'
      and column_name = 'due_date'
  ),
  'date',
  'demands.due_date deve usar DATE'
);

select is(
  (
    select column_default
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demands'
      and column_name = 'status'
  ),
  '''OPEN''::text',
  'Status deve possuir default OPEN'
);

select is(
  (
    select column_default
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demands'
      and column_name = 'priority'
  ),
  '''MEDIUM''::text',
  'Priority deve possuir default MEDIUM'
);

select is(
  (
    select is_nullable
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demands'
      and column_name = 'archived_at'
  ),
  'YES',
  'archived_at deve ser opcional'
);

select ok(
  (
    select column_default like '%gen_random_uuid%'
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demands'
      and column_name = 'id'
  ),
  'demands.id deve ser UUID gerado pelo banco'
);

select ok(
  (
    select column_default like '%gen_random_uuid%'
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demand_assignees'
      and column_name = 'id'
  ),
  'demand_assignees.id deve ser UUID gerado pelo banco'
);

select ok(
  (
    select column_default like '%gen_random_uuid%'
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demand_tags'
      and column_name = 'id'
  ),
  'demand_tags.id deve ser UUID gerado pelo banco'
);


-- ============================================================
-- 3. CONSTRAINTS E ESCOPO NEGATIVO
-- ============================================================

select ok(
  exists (
    select 1 from pg_catalog.pg_constraint
    where conname = 'demands_title_not_empty'
      and conrelid = 'public.demands'::regclass
  ),
  'Título vazio deve ser protegido por constraint'
);

select ok(
  exists (
    select 1 from pg_catalog.pg_constraint
    where conname = 'demands_status_check'
      and conrelid = 'public.demands'::regclass
  ),
  'Status deve possuir constraint de domínio'
);

select ok(
  exists (
    select 1 from pg_catalog.pg_constraint
    where conname = 'demands_priority_check'
      and conrelid = 'public.demands'::regclass
  ),
  'Priority deve possuir constraint de domínio'
);

select ok(
  exists (
    select 1 from pg_catalog.pg_constraint
    where conname = 'demand_tags_name_not_empty'
      and conrelid = 'public.demand_tags'::regclass
  ),
  'Tag vazia deve ser protegida por constraint'
);

select ok(
  exists (
    select 1 from pg_catalog.pg_constraint
    where conname = 'demand_tags_name_trimmed'
      and conrelid = 'public.demand_tags'::regclass
  ),
  'Nome de Tag deve permanecer armazenado com trim'
);

select ok(
  exists (
    select 1 from pg_catalog.pg_constraint
    where conname = 'demand_assignees_unique'
      and conrelid = 'public.demand_assignees'::regclass
  ),
  'Demand e Membership devem ser únicos em demand_assignees'
);

select ok(
  exists (
    select 1 from pg_catalog.pg_constraint
    where conname = 'clients_id_organization_unique'
      and conrelid = 'public.clients'::regclass
  ),
  'clients deve possuir chave candidata para ownership composto'
);

select ok(
  exists (
    select 1 from pg_catalog.pg_constraint
    where conname = 'demands_client_organization_fkey'
      and conrelid = 'public.demands'::regclass
      and contype = 'f'
  ),
  'Demand deve referenciar Client e Organization pela FK composta'
);

select ok(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demands'
      and column_name = 'is_overdue'
  ),
  'is_overdue não deve ser persistido'
);

select ok(
  not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'demands'
      and column_name = 'is_near_due'
  ),
  'is_near_due não deve ser persistido'
);

select ok(
  to_regclass('public.notifications') is null,
  'Migration 003 não deve criar notifications'
);


-- ============================================================
-- 4. ÍNDICES CONGELADOS
-- ============================================================

select ok(to_regclass('public.demands_client_organization_idx') is not null, 'Índice Demand/Client deve existir');
select ok(to_regclass('public.demands_active_organization_updated_idx') is not null, 'Índice ativo por Organization deve existir');
select ok(to_regclass('public.demands_active_client_updated_idx') is not null, 'Índice ativo por Client deve existir');
select ok(to_regclass('public.demands_active_organization_status_updated_idx') is not null, 'Índice ativo por Status deve existir');
select ok(to_regclass('public.demands_active_organization_priority_updated_idx') is not null, 'Índice ativo por Priority deve existir');
select ok(to_regclass('public.demands_active_organization_due_date_idx') is not null, 'Índice ativo por due_date deve existir');
select ok(to_regclass('public.demand_assignees_membership_idx') is not null, 'Índice inverso de assignees deve existir');
select ok(to_regclass('public.demand_tags_organization_normalized_name_idx') is not null, 'Índice único normalizado de Tags deve existir');
select ok(to_regclass('public.demand_tag_assignments_tag_idx') is not null, 'Índice inverso de Tag Assignment deve existir');


-- ============================================================
-- 5. RLS E TRIGGERS
-- ============================================================

select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.demands'::regclass), 'RLS deve estar ativa em demands');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.demand_assignees'::regclass), 'RLS deve estar ativa em demand_assignees');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.demand_tags'::regclass), 'RLS deve estar ativa em demand_tags');
select ok((select relrowsecurity from pg_catalog.pg_class where oid = 'public.demand_tag_assignments'::regclass), 'RLS deve estar ativa em demand_tag_assignments');

select ok(
  exists (select 1 from pg_catalog.pg_trigger where tgrelid = 'public.demands'::regclass and tgname = 'demands_ownership_immutable' and not tgisinternal),
  'Demand deve proteger ownership imutável por trigger'
);
select ok(
  exists (select 1 from pg_catalog.pg_trigger where tgrelid = 'public.demands'::regclass and tgname = 'demands_set_updated_at' and not tgisinternal),
  'Demand deve atualizar updated_at por trigger'
);
select ok(
  exists (select 1 from pg_catalog.pg_trigger where tgrelid = 'public.demand_assignees'::regclass and tgname = 'demand_assignees_enforce_integrity' and not tgisinternal),
  'Assignee deve proteger elegibilidade por trigger'
);
select ok(
  exists (select 1 from pg_catalog.pg_trigger where tgrelid = 'public.demand_tag_assignments'::regclass and tgname = 'demand_tag_assignments_enforce_organization' and not tgisinternal),
  'Tag Assignment deve proteger Organization por trigger'
);


-- ============================================================
-- 6. HELPERS E RPCs
-- ============================================================

select has_function('private', 'is_eligible_demand_assignee', array['uuid', 'uuid'], 'Helper de elegibilidade deve existir');
select has_function('private', 'can_access_demand', array['uuid'], 'Helper de acesso deve existir');
select has_function('private', 'can_access_demand_tag', array['uuid'], 'Helper de acesso a Tag deve existir');
select has_function('private', 'can_access_demand_log', array['uuid', 'uuid'], 'Helper de acesso a Log deve existir');
select has_function('private', 'require_demand_client_access', array['uuid'], 'Helper de contexto do Cliente deve existir');
select has_function('private', 'require_demand_access', array['uuid', 'boolean'], 'Helper de contexto da Demanda deve existir');
select has_function('private', 'enforce_demand_ownership_immutable', array[]::text[], 'Trigger function de ownership deve existir');
select has_function('private', 'enforce_demand_assignee_integrity', array[]::text[], 'Trigger function de assignee deve existir');
select has_function('private', 'enforce_demand_tag_organization', array[]::text[], 'Trigger function de Tag deve existir');

select has_function('public', 'create_demand', array['uuid', 'text', 'text', 'text', 'date', 'date', 'text', 'uuid[]'], 'create_demand deve existir');
select has_function('public', 'update_demand', array['uuid', 'text', 'text', 'text', 'date', 'date', 'text'], 'update_demand deve existir');
select has_function('public', 'change_demand_status', array['uuid', 'text'], 'change_demand_status deve existir');
select has_function('public', 'set_demand_assignees', array['uuid', 'uuid[]'], 'set_demand_assignees deve existir');
select has_function('public', 'set_demand_tags', array['uuid', 'uuid[]', 'text[]'], 'set_demand_tags deve existir');
select has_function('public', 'archive_demand', array['uuid'], 'archive_demand deve existir');
select has_function('public', 'list_eligible_demand_assignees', array['uuid'], 'list_eligible_demand_assignees deve existir');
select has_function('public', 'list_demand_assignees', array['uuid'], 'list_demand_assignees deve existir');


-- ============================================================
-- 7. GRANTS E HARDENING
-- ============================================================

select table_privs_are('public', 'demands', 'authenticated', array['SELECT'], 'authenticated deve possuir apenas SELECT em demands');
select table_privs_are('public', 'demand_assignees', 'authenticated', array['SELECT'], 'authenticated deve possuir apenas SELECT em demand_assignees');
select table_privs_are('public', 'demand_tags', 'authenticated', array['SELECT'], 'authenticated deve possuir apenas SELECT em demand_tags');
select table_privs_are('public', 'demand_tag_assignments', 'authenticated', array['SELECT'], 'authenticated deve possuir apenas SELECT em demand_tag_assignments');

select table_privs_are('public', 'demands', 'anon', array[]::text[], 'anon não deve possuir privilégios em demands');
select table_privs_are('public', 'demand_assignees', 'anon', array[]::text[], 'anon não deve possuir privilégios em demand_assignees');
select table_privs_are('public', 'demand_tags', 'anon', array[]::text[], 'anon não deve possuir privilégios em demand_tags');
select table_privs_are('public', 'demand_tag_assignments', 'anon', array[]::text[], 'anon não deve possuir privilégios em demand_tag_assignments');

select ok(
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name in (
        'create_demand',
        'update_demand',
        'change_demand_status',
        'set_demand_assignees',
        'set_demand_tags',
        'archive_demand',
        'list_eligible_demand_assignees',
        'list_demand_assignees'
      )
      and grantee in ('PUBLIC', 'anon')
      and privilege_type = 'EXECUTE'
  ),
  'PUBLIC e anon não devem executar RPCs de Demandas'
);

select is(
  (
    select count(distinct routine_name)
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name in (
        'create_demand',
        'update_demand',
        'change_demand_status',
        'set_demand_assignees',
        'set_demand_tags',
        'archive_demand',
        'list_eligible_demand_assignees',
        'list_demand_assignees'
      )
      and grantee = 'authenticated'
      and privilege_type = 'EXECUTE'
  ),
  8::bigint,
  'authenticated deve executar exatamente as oito RPCs públicas'
);

select ok(
  not exists (
    select 1
    from pg_catalog.pg_proc as procedure
    inner join pg_catalog.pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname in (
        'create_demand',
        'update_demand',
        'change_demand_status',
        'set_demand_assignees',
        'set_demand_tags',
        'archive_demand',
        'list_eligible_demand_assignees',
        'list_demand_assignees'
      )
      and not procedure.prosecdef
  ),
  'Todas as RPCs públicas devem usar SECURITY DEFINER'
);

select ok(
  not exists (
    select 1
    from pg_catalog.pg_proc as procedure
    inner join pg_catalog.pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname in ('public', 'private')
      and procedure.proname in (
        'create_demand',
        'update_demand',
        'change_demand_status',
        'set_demand_assignees',
        'set_demand_tags',
        'archive_demand',
        'list_eligible_demand_assignees',
        'list_demand_assignees',
        'is_eligible_demand_assignee',
        'can_access_demand',
        'can_access_demand_tag',
        'can_access_demand_log',
        'require_demand_client_access',
        'require_demand_access'
      )
      and not exists (
        select 1
        from unnest(procedure.proconfig) as configuration(setting)
        where configuration.setting like 'search_path=%'
      )
  ),
  'RPCs e helpers privilegiados devem usar search_path vazio'
);

select ok(
  not exists (
    select 1
    from information_schema.parameters
    where specific_schema = 'public'
      and specific_name like any(array[
        'create_demand_%',
        'update_demand_%',
        'change_demand_status_%',
        'set_demand_assignees_%',
        'set_demand_tags_%',
        'archive_demand_%'
      ])
      and parameter_name in (
        'p_organization_id',
        'p_user_id',
        'p_actor_id',
        'p_created_by',
        'p_updated_by',
        'p_role'
      )
  ),
  'RPCs não devem aceitar IDs administrativos ou role do caller'
);


select * from finish();

rollback;
