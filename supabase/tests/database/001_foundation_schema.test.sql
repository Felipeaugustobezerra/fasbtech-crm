begin;


-- ============================================================
-- FASBtech CRM
-- Migration 001 — Foundation
-- Structural tests
-- ============================================================


create extension if not exists pgtap with schema extensions;


select plan(23);



-- ============================================================
-- 1. TABELAS DA FOUNDATION
-- ============================================================


select has_table(
  'public',
  'profiles',
  'public.profiles deve existir'
);


select has_table(
  'public',
  'organizations',
  'public.organizations deve existir'
);


select has_table(
  'public',
  'organization_members',
  'public.organization_members deve existir'
);


select has_table(
  'public',
  'activity_logs',
  'public.activity_logs deve existir'
);



-- ============================================================
-- 2. TABELAS AINDA FORA DO MVP ATUAL NÃO DEVEM EXISTIR
-- ============================================================

-- clients e client_assignments deixaram de ser "futuras" após a
-- Migration da Sprint 02. A estrutura delas é validada em
-- 005_clients_schema.test.sql.


select hasnt_table(
  'public',
  'demands',
  'demands ainda não deve existir nesta etapa'
);


select hasnt_table(
  'public',
  'financial_entries',
  'financial_entries ainda não deve existir nesta etapa'
);


select hasnt_table(
  'public',
  'contracts',
  'contracts ainda não deve existir nesta etapa'
);


select hasnt_table(
  'public',
  'documents',
  'documents ainda não deve existir nesta etapa'
);


select hasnt_table(
  'public',
  'leads',
  'leads não deve existir no MVP v3.0'
);



-- ============================================================
-- 3. PRIMARY KEYS
-- ============================================================


select col_is_pk(
  'public',
  'profiles',
  'id',
  'profiles.id deve ser Primary Key'
);


select col_is_pk(
  'public',
  'organizations',
  'id',
  'organizations.id deve ser Primary Key'
);


select col_is_pk(
  'public',
  'organization_members',
  'id',
  'organization_members.id deve ser Primary Key'
);


select col_is_pk(
  'public',
  'activity_logs',
  'id',
  'activity_logs.id deve ser Primary Key'
);



-- ============================================================
-- 4. RLS
-- ============================================================


select ok(
  (
    select c.relrowsecurity
    from pg_catalog.pg_class as c
    join pg_catalog.pg_namespace as n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'profiles'
  ),
  'RLS deve estar habilitada em profiles'
);


select ok(
  (
    select c.relrowsecurity
    from pg_catalog.pg_class as c
    join pg_catalog.pg_namespace as n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'organizations'
  ),
  'RLS deve estar habilitada em organizations'
);


select ok(
  (
    select c.relrowsecurity
    from pg_catalog.pg_class as c
    join pg_catalog.pg_namespace as n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'organization_members'
  ),
  'RLS deve estar habilitada em organization_members'
);


select ok(
  (
    select c.relrowsecurity
    from pg_catalog.pg_class as c
    join pg_catalog.pg_namespace as n
      on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'activity_logs'
  ),
  'RLS deve estar habilitada em activity_logs'
);



-- ============================================================
-- 5. MEMBERSHIP ÚNICO
-- ============================================================


select ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'organization_members_unique'
      and contype = 'u'
      and conrelid = 'public.organization_members'::regclass
  ),
  'organization_id + user_id deve possuir constraint UNIQUE'
);



-- ============================================================
-- 6. BOOTSTRAP
-- ============================================================


select has_function(
  'public',
  'bootstrap_initial_organization',
  array[]::text[],
  'bootstrap_initial_organization() deve existir'
);



select ok(
  (
    select p.prosecdef
    from pg_catalog.pg_proc as p
    join pg_catalog.pg_namespace as n
      on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'bootstrap_initial_organization'
      and pg_catalog.pg_get_function_identity_arguments(p.oid) = ''
  ),
  'bootstrap_initial_organization() deve utilizar SECURITY DEFINER'
);



-- ============================================================
-- 7. UPDATED_AT
-- ============================================================


select has_function(
  'private',
  'set_updated_at',
  array[]::text[],
  'private.set_updated_at() deve existir'
);



-- ============================================================
-- 8. ACTIVITY LOGS IMUTÁVEIS
-- ============================================================


select hasnt_column(
  'public',
  'activity_logs',
  'updated_at',
  'activity_logs não deve possuir updated_at'
);


select hasnt_column(
  'public',
  'activity_logs',
  'archived_at',
  'activity_logs não deve possuir archived_at'
);



-- ============================================================
-- FINALIZAÇÃO
-- ============================================================


select * from finish();


rollback;