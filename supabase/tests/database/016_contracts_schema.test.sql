begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

select has_table('public', 'contract_templates', 'contract_templates existe');
select has_table('public', 'contracts', 'contracts existe');
select has_table('public', 'documents', 'documents existe');

select col_is_pk('public', 'contract_templates', 'id', 'template id é PK');
select col_is_pk('public', 'contracts', 'id', 'contract id é PK');
select col_is_pk('public', 'documents', 'id', 'document id é PK');
select col_type_is('public', 'contracts', 'draft_data', 'jsonb', 'draft_data é jsonb');
select col_type_is('public', 'contracts', 'snapshot', 'jsonb', 'snapshot é jsonb');
select col_default_is('public', 'contracts', 'status', 'DRAFT', 'status default DRAFT');
select col_default_is('public', 'documents', 'bucket_id', 'private-files', 'bucket default privado');
select col_default_is('public', 'documents', 'mime_type', 'application/pdf', 'MIME default PDF');

select ok(exists(select 1 from pg_constraint where conrelid='public.contracts'::regclass and conname='contracts_client_organization_fkey' and contype='f'), 'FK composta Client/Organization existe');
select ok(exists(select 1 from pg_constraint where conrelid='public.contracts'::regclass and conname='contracts_template_organization_fkey' and contype='f'), 'FK composta Template/Organization existe');
select ok(exists(select 1 from pg_constraint where conrelid='public.contracts'::regclass and conname='contracts_lifecycle_check'), 'constraint de lifecycle existe');
select ok(exists(select 1 from pg_constraint where conrelid='public.contracts'::regclass and conname='contracts_snapshot_shape_check'), 'constraint de snapshot existe');
select ok(exists(select 1 from pg_constraint where conrelid='public.documents'::regclass and conname='documents_entity_kind_unique' and contype='u'), 'um documento por kind e Contract');
select ok(exists(select 1 from pg_constraint where conrelid='public.documents'::regclass and conname='documents_object_path_unique' and contype='u'), 'object_path é único');

select has_index('public', 'contract_templates', 'contract_templates_org_active_updated_idx', 'índice de templates ativos existe');
select has_index('public', 'contract_templates', 'contract_templates_org_name_idx', 'índice de nome de template existe');
select has_index('public', 'contracts', 'contracts_org_updated_idx', 'índice principal de Contracts existe');
select has_index('public', 'contracts', 'contracts_org_status_updated_idx', 'índice de Status existe');
select has_index('public', 'contracts', 'contracts_client_updated_idx', 'índice de Client existe');
select has_index('public', 'contracts', 'contracts_template_updated_idx', 'índice de Template existe');
select has_index('public', 'documents', 'documents_org_entity_created_idx', 'índice de Documents existe');

select ok((select relrowsecurity from pg_class where oid='public.contract_templates'::regclass), 'RLS em templates');
select ok((select relrowsecurity from pg_class where oid='public.contracts'::regclass), 'RLS em Contracts');
select ok((select relrowsecurity from pg_class where oid='public.documents'::regclass), 'RLS em Documents');
select is((select count(*) from pg_policies where schemaname='public' and tablename='contract_templates' and cmd='SELECT'), 1::bigint, 'uma Policy SELECT de templates');
select is((select count(*) from pg_policies where schemaname='public' and tablename='contracts' and cmd='SELECT'), 1::bigint, 'uma Policy SELECT de Contracts');
select is((select count(*) from pg_policies where schemaname='public' and tablename='documents' and cmd='SELECT'), 1::bigint, 'uma Policy SELECT de Documents');

select table_privs_are('public', 'contract_templates', 'authenticated', array['SELECT'], 'authenticated possui somente SELECT em templates');
select table_privs_are('public', 'contracts', 'authenticated', array['SELECT'], 'authenticated possui somente SELECT em Contracts');
select table_privs_are('public', 'documents', 'authenticated', array['SELECT'], 'authenticated possui somente SELECT em Documents');
select table_privs_are('public', 'contract_templates', 'anon', array[]::text[], 'anon sem privilégios em templates');
select table_privs_are('public', 'contracts', 'anon', array[]::text[], 'anon sem privilégios em Contracts');
select table_privs_are('public', 'documents', 'anon', array[]::text[], 'anon sem privilégios em Documents');

select has_function('public', 'create_contract_template', array['text','text'], 'create_contract_template existe');
select has_function('public', 'update_contract_template', array['uuid','text','text'], 'update_contract_template existe');
select has_function('public', 'activate_contract_template', array['uuid'], 'activate_contract_template existe');
select has_function('public', 'deactivate_contract_template', array['uuid'], 'deactivate_contract_template existe');
select has_function('public', 'create_contract', array['uuid','uuid','text','jsonb'], 'create_contract existe');
select has_function('public', 'update_draft_contract', array['uuid','uuid','uuid','text','jsonb'], 'update_draft_contract existe');
select has_function('public', 'generate_contract', array['uuid','jsonb','uuid','text','text','text','bigint'], 'generate_contract existe');
select has_function('public', 'mark_contract_sent', array['uuid','text'], 'mark_contract_sent existe');
select has_function('public', 'mark_contract_signed', array['uuid','uuid','text','text','text','bigint'], 'mark_contract_signed existe');
select has_function('public', 'cancel_contract', array['uuid'], 'cancel_contract existe');

select is((
  select count(distinct routine_name)
  from information_schema.routine_privileges
  where routine_schema='public'
    and routine_name in ('create_contract_template','update_contract_template','activate_contract_template','deactivate_contract_template','create_contract','update_draft_contract','generate_contract','mark_contract_sent','mark_contract_signed','cancel_contract')
    and grantee='authenticated' and privilege_type='EXECUTE'
), 10::bigint, 'authenticated executa exatamente as dez RPCs');

select ok(not exists(
  select 1 from information_schema.routine_privileges
  where routine_schema='public'
    and routine_name in ('create_contract_template','update_contract_template','activate_contract_template','deactivate_contract_template','create_contract','update_draft_contract','generate_contract','mark_contract_sent','mark_contract_signed','cancel_contract')
    and grantee in ('PUBLIC','anon','service_role') and privilege_type='EXECUTE'
), 'PUBLIC, anon e service_role não executam RPCs de Contracts');

select ok(not exists(
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname in ('create_contract_template','update_contract_template','activate_contract_template','deactivate_contract_template','create_contract','update_draft_contract','generate_contract','mark_contract_sent','mark_contract_signed','cancel_contract')
    and not p.prosecdef
), 'as dez RPCs usam SECURITY DEFINER');

select ok(not exists(
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname in ('public','private')
    and p.proname in ('create_contract_template','update_contract_template','activate_contract_template','deactivate_contract_template','create_contract','update_draft_contract','generate_contract','mark_contract_sent','mark_contract_signed','cancel_contract','enforce_contract_template_integrity','enforce_contract_lifecycle','enforce_document_integrity','validate_contract_required_documents','require_contract_storage_object','can_access_contract_object','can_upload_contract_object','can_delete_orphan_contract_object')
    and not exists(select 1 from unnest(p.proconfig) c(setting) where c.setting like 'search_path=%')
), 'RPCs e helpers usam search_path vazio');

select ok(not exists(
  select 1 from information_schema.parameters
  where specific_schema='public'
    and specific_name like any(array['create_contract_template_%','update_contract_template_%','activate_contract_template_%','deactivate_contract_template_%','create_contract_%','update_draft_contract_%','generate_contract_%','mark_contract_sent_%','mark_contract_signed_%','cancel_contract_%'])
    and parameter_name in ('p_organization_id','p_user_id','p_actor_id','p_created_by','p_updated_by','p_role')
), 'RPCs não recebem contexto de autorização ou autoria');

select * from finish();
rollback;
