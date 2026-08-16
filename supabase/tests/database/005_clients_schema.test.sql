begin;

-- ============================================================
-- FASBtech CRM
-- Sprint 02 — Clientes & Acessos
-- Schema + Grants tests
-- ============================================================

create extension if not exists pgtap with schema extensions;

select plan(42);


-- ============================================================
-- 1. TABELAS
-- ============================================================

select has_table(
  'public',
  'clients',
  'public.clients deve existir'
);

select has_table(
  'public',
  'client_assignments',
  'public.client_assignments deve existir'
);


-- ============================================================
-- 2. PRIMARY KEYS
-- ============================================================

select col_is_pk(
  'public',
  'clients',
  'id',
  'clients.id deve ser Primary Key'
);

select col_is_pk(
  'public',
  'client_assignments',
  'id',
  'client_assignments.id deve ser Primary Key'
);


-- ============================================================
-- 3. COLUNAS CONGELADAS
-- ============================================================

select is(
  (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
  ),
  20::bigint,
  'clients deve possuir as 20 colunas congeladas na Sprint 02'
);

select is(
  (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'client_assignments'
  ),
  5::bigint,
  'client_assignments deve possuir as 5 colunas congeladas na Sprint 02'
);

select is(
  (
    select is_nullable
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'name'
  ),
  'NO',
  'clients.name deve ser obrigatório'
);

select is(
  (
    select is_nullable
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'organization_id'
  ),
  'NO',
  'clients.organization_id deve ser obrigatório'
);

select is(
  (
    select is_nullable
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'created_by'
  ),
  'NO',
  'clients.created_by deve ser obrigatório'
);

select is(
  (
    select is_nullable
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'updated_by'
  ),
  'NO',
  'clients.updated_by deve ser obrigatório'
);

select is(
  (
    select is_nullable
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'archived_at'
  ),
  'YES',
  'clients.archived_at deve ser opcional'
);


-- ============================================================
-- 4. CONSTRAINTS
-- ============================================================

select ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'clients_tax_id_pair_check'
      and conrelid = 'public.clients'::regclass
      and contype = 'c'
  ),
  'clients deve possuir constraint de par tax_id + tax_id_type'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'clients_name_not_empty'
      and conrelid = 'public.clients'::regclass
      and contype = 'c'
  ),
  'clients deve impedir name vazio'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_constraint
    where conrelid = 'public.clients'::regclass
      and contype = 'f'
  ),
  3::bigint,
  'clients deve possuir três Foreign Keys'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_constraint
    where conrelid = 'public.client_assignments'::regclass
      and contype = 'f'
  ),
  3::bigint,
  'client_assignments deve possuir três Foreign Keys'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'client_assignments_unique'
      and conrelid = 'public.client_assignments'::regclass
      and contype = 'u'
  ),
  'client_id + membership_id deve ser UNIQUE'
);


-- ============================================================
-- 5. ÍNDICES
-- ============================================================

select ok(
  to_regclass('public.clients_organization_idx') is not null,
  'clients_organization_idx deve existir'
);

select ok(
  to_regclass('public.clients_organization_archived_idx') is not null,
  'clients_organization_archived_idx deve existir'
);

select ok(
  to_regclass('public.clients_organization_name_idx') is not null,
  'clients_organization_name_idx deve existir'
);

select ok(
  to_regclass('public.client_assignments_client_idx') is not null,
  'client_assignments_client_idx deve existir'
);

select ok(
  to_regclass('public.client_assignments_membership_idx') is not null,
  'client_assignments_membership_idx deve existir'
);


-- ============================================================
-- 6. RLS
-- ============================================================

select ok(
  (
    select c.relrowsecurity
    from pg_catalog.pg_class as c
    join pg_catalog.pg_namespace as n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'clients'
  ),
  'RLS deve estar habilitada em clients'
);

select ok(
  (
    select c.relrowsecurity
    from pg_catalog.pg_class as c
    join pg_catalog.pg_namespace as n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'client_assignments'
  ),
  'RLS deve estar habilitada em client_assignments'
);


-- ============================================================
-- 7. TRIGGERS
-- ============================================================

select ok(
  exists (
    select 1
    from pg_catalog.pg_trigger
    where tgrelid = 'public.clients'::regclass
      and tgname = 'clients_set_updated_at'
      and not tgisinternal
  ),
  'clients deve possuir trigger de updated_at'
);

select ok(
  exists (
    select 1
    from pg_catalog.pg_trigger
    where tgrelid = 'public.client_assignments'::regclass
      and tgname = 'client_assignments_enforce_organization'
      and not tgisinternal
  ),
  'client_assignments deve possuir trigger de integridade entre Organizations'
);


-- ============================================================
-- 8. HELPERS
-- ============================================================

select has_function(
  'private',
  'enforce_client_assignment_organization',
  array[]::text[],
  'private.enforce_client_assignment_organization() deve existir'
);

select has_function(
  'private',
  'can_access_client',
  array['uuid'],
  'private.can_access_client(uuid) deve existir'
);

select has_function(
  'private',
  'is_active_owner_of_organization',
  array['uuid'],
  'private.is_active_owner_of_organization(uuid) deve existir'
);


-- ============================================================
-- 9. RPCs
-- ============================================================

select has_function(
  'public',
  'add_organization_member',
  array['text', 'text'],
  'add_organization_member(text, text) deve existir'
);

select has_function(
  'public',
  'update_organization_member_role',
  array['uuid', 'text'],
  'update_organization_member_role(uuid, text) deve existir'
);

select has_function(
  'public',
  'create_client',
  array[
    'text', 'text', 'text', 'text', 'text', 'text', 'text',
    'text', 'text', 'text', 'text', 'text', 'text'
  ],
  'create_client(...) deve existir'
);

select has_function(
  'public',
  'update_client',
  array[
    'uuid',
    'text', 'text', 'text', 'text', 'text', 'text', 'text',
    'text', 'text', 'text', 'text', 'text', 'text'
  ],
  'update_client(...) deve existir'
);

select has_function(
  'public',
  'archive_client',
  array['uuid'],
  'archive_client(uuid) deve existir'
);

select has_function(
  'public',
  'assign_client_access',
  array['uuid', 'uuid'],
  'assign_client_access(uuid, uuid) deve existir'
);

select has_function(
  'public',
  'remove_client_access',
  array['uuid', 'uuid'],
  'remove_client_access(uuid, uuid) deve existir'
);


-- ============================================================
-- 10. GRANTS DAS TABELAS
-- ============================================================

select table_privs_are(
  'public',
  'clients',
  'authenticated',
  array['SELECT'],
  'authenticated deve possuir apenas SELECT em clients'
);

select table_privs_are(
  'public',
  'client_assignments',
  'authenticated',
  array['SELECT'],
  'authenticated deve possuir apenas SELECT em client_assignments'
);

select table_privs_are(
  'public',
  'clients',
  'anon',
  array[]::text[],
  'anon não deve possuir privilégios em clients'
);

select table_privs_are(
  'public',
  'client_assignments',
  'anon',
  array[]::text[],
  'anon não deve possuir privilégios em client_assignments'
);


-- ============================================================
-- 11. GRANTS DAS RPCs
-- ============================================================

select function_privs_are(
  'public',
  'create_client',
  array[
    'text', 'text', 'text', 'text', 'text', 'text', 'text',
    'text', 'text', 'text', 'text', 'text', 'text'
  ],
  'authenticated',
  array['EXECUTE'],
  'authenticated deve possuir EXECUTE em create_client'
);

select function_privs_are(
  'public',
  'create_client',
  array[
    'text', 'text', 'text', 'text', 'text', 'text', 'text',
    'text', 'text', 'text', 'text', 'text', 'text'
  ],
  'anon',
  array[]::text[],
  'anon não deve possuir EXECUTE em create_client'
);

select ok(
  not exists (
    select 1
    from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'create_client'
      and grantee = 'PUBLIC'
      and privilege_type = 'EXECUTE'
  ),
  'PUBLIC não deve possuir EXECUTE em create_client'
);


-- ============================================================
-- FINALIZAÇÃO
-- ============================================================

select * from finish();

rollback;