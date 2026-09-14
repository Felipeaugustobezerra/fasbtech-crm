begin;
create extension if not exists pgtap with schema extensions;
select plan(50);

select has_table('public','financial_entries','financial_entries existe');
select has_table('public','financial_goals','financial_goals existe');
select col_is_pk('public','financial_entries','id','entry id é PK');
select col_is_pk('public','financial_goals','id','goal id é PK');
select is((select count(*) from information_schema.columns where table_schema='public' and table_name='financial_entries'),18::bigint,'entry possui 18 colunas');
select is((select count(*) from information_schema.columns where table_schema='public' and table_name='financial_goals'),9::bigint,'goal possui 9 colunas');
select col_type_is('public','financial_entries','amount','numeric(12,2)','amount é numeric(12,2)');
select col_type_is('public','financial_entries','reference_date','date','reference_date é date');
select col_type_is('public','financial_entries','due_date','date','due_date é date');
select col_type_is('public','financial_entries','realized_date','date','realized_date é date');
select col_type_is('public','financial_goals','target_amount','numeric(12,2)','target_amount é numeric(12,2)');
select col_default_is('public','financial_entries','status','PENDING','status default PENDING');
select col_default_is('public','financial_entries','payment_nature','ONE_TIME','nature default ONE_TIME');
select ok((select numeric_precision=12 and numeric_scale=2 from information_schema.columns where table_schema='public' and table_name='financial_entries' and column_name='amount'),'amount numeric(12,2)');
select ok((select numeric_precision=12 and numeric_scale=2 from information_schema.columns where table_schema='public' and table_name='financial_goals' and column_name='target_amount'),'target numeric(12,2)');
select ok(exists(select 1 from pg_constraint where conrelid='public.financial_entries'::regclass and conname='financial_entries_client_organization_fkey' and contype='f'),'FK composta Client/Organization existe');
select ok(exists(select 1 from pg_constraint where conrelid='public.financial_goals'::regclass and conname='financial_goals_period_unique' and contype='u'),'goal possui unique de período');
select ok(exists(select 1 from pg_constraint where conrelid='public.financial_entries'::regclass and conname='financial_entries_type_check'),'type possui check');
select ok(exists(select 1 from pg_constraint where conrelid='public.financial_entries'::regclass and conname='financial_entries_status_check'),'status possui check');
select ok(exists(select 1 from pg_constraint where conrelid='public.financial_entries'::regclass and conname='financial_entries_payment_nature_check'),'nature possui check');
select ok(exists(select 1 from pg_constraint where conrelid='public.financial_entries'::regclass and conname='financial_entries_amount_positive'),'amount possui check');
select ok(exists(select 1 from pg_constraint where conrelid='public.financial_entries'::regclass and conname='financial_entries_realization_check'),'realização possui check');
select ok(exists(select 1 from pg_constraint where conrelid='public.financial_goals'::regclass and conname='financial_goals_month_check'),'month possui check');
select ok(exists(select 1 from pg_constraint where conrelid='public.financial_goals'::regclass and conname='financial_goals_year_positive'),'year possui check');
select ok(exists(select 1 from pg_constraint where conrelid='public.financial_goals'::regclass and conname='financial_goals_target_positive'),'target possui check');
select has_index('public','financial_entries','financial_entries_active_org_reference_idx','índice de listagem existe');
select has_index('public','financial_entries','financial_entries_active_org_status_reference_idx','índice de status existe');
select has_index('public','financial_entries','financial_entries_active_org_client_reference_idx','índice de Client existe');
select has_index('public','financial_entries','financial_entries_realized_org_date_type_idx','índice de agregados existe');
select ok((select relrowsecurity from pg_class where oid='public.financial_entries'::regclass),'RLS em entries');
select ok((select relrowsecurity from pg_class where oid='public.financial_goals'::regclass),'RLS em goals');
select is((select count(*) from pg_policies where schemaname='public' and tablename='financial_entries' and cmd='SELECT'),1::bigint,'uma Policy SELECT entries');
select is((select count(*) from pg_policies where schemaname='public' and tablename='financial_goals' and cmd='SELECT'),1::bigint,'uma Policy SELECT goals');
select ok(not exists(select 1 from information_schema.columns where table_schema='public' and table_name='financial_entries' and column_name in ('currency','demand_id','contract_id')),'sem colunas fora do escopo');

select has_function('public','create_financial_entry',array['text','text','numeric','date','uuid','text','text','date','text'],'create_financial_entry existe');
select has_function('public','update_financial_entry',array['uuid','text','text','numeric','date','uuid','text','text','date','text'],'update_financial_entry existe');
select has_function('public','change_financial_entry_status',array['uuid','text','date'],'change_financial_entry_status existe');
select has_function('public','archive_financial_entry',array['uuid'],'archive_financial_entry existe');
select has_function('public','set_financial_goal',array['integer','integer','numeric'],'set_financial_goal existe');
select has_function('public','get_financial_summary',array['integer','integer'],'get_financial_summary existe');

select table_privs_are('public','financial_entries','authenticated',array['SELECT'],'authenticated possui somente SELECT em entries');
select table_privs_are('public','financial_goals','authenticated',array['SELECT'],'authenticated possui somente SELECT em goals');
select table_privs_are('public','financial_entries','anon',array[]::text[],'anon sem privilégios em entries');
select table_privs_are('public','financial_goals','anon',array[]::text[],'anon sem privilégios em goals');

select is((
  select count(distinct routine_name)
  from information_schema.routine_privileges
  where routine_schema='public'
    and routine_name in ('create_financial_entry','update_financial_entry','change_financial_entry_status','archive_financial_entry','set_financial_goal','get_financial_summary')
    and grantee='authenticated'
    and privilege_type='EXECUTE'
),6::bigint,'authenticated executa exatamente as seis RPCs financeiras');

select ok(not exists(
  select 1 from information_schema.routine_privileges
  where routine_schema='public'
    and routine_name in ('create_financial_entry','update_financial_entry','change_financial_entry_status','archive_financial_entry','set_financial_goal','get_financial_summary')
    and grantee in ('PUBLIC','anon','service_role')
    and privilege_type='EXECUTE'
),'PUBLIC, anon e service_role não executam RPCs financeiras');

select ok(not exists(
  select 1
  from pg_catalog.pg_proc as procedure
  join pg_catalog.pg_namespace as namespace on namespace.oid=procedure.pronamespace
  where namespace.nspname='public'
    and procedure.proname in ('create_financial_entry','update_financial_entry','change_financial_entry_status','archive_financial_entry','set_financial_goal','get_financial_summary')
    and not procedure.prosecdef
),'RPCs financeiras usam SECURITY DEFINER');

select ok(not exists(
  select 1
  from pg_catalog.pg_proc as procedure
  join pg_catalog.pg_namespace as namespace on namespace.oid=procedure.pronamespace
  where namespace.nspname in ('public','private')
    and procedure.proname in ('create_financial_entry','update_financial_entry','change_financial_entry_status','archive_financial_entry','set_financial_goal','get_financial_summary','enforce_financial_entry_immutable','enforce_financial_goal_immutable')
    and not exists (
      select 1 from unnest(procedure.proconfig) as configuration(setting)
      where configuration.setting like 'search_path=%'
    )
),'RPCs e helpers financeiros usam search_path vazio');

select ok(not exists(
  select 1
  from information_schema.parameters
  where specific_schema='public'
    and specific_name like any(array['create_financial_entry_%','update_financial_entry_%','change_financial_entry_status_%','archive_financial_entry_%','set_financial_goal_%','get_financial_summary_%'])
    and parameter_name in ('p_organization_id','p_user_id','p_actor_id','p_created_by','p_updated_by','p_role')
),'RPCs financeiras não recebem contexto de autorização ou auditoria');

select is((
  select procedure.provolatile::text
  from pg_catalog.pg_proc as procedure
  join pg_catalog.pg_namespace as namespace on namespace.oid=procedure.pronamespace
  where namespace.nspname='public' and procedure.proname='get_financial_summary'
), 's', 'get_financial_summary é STABLE');

select * from finish();
rollback;
