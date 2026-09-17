-- FASBtech CRM — Sprint 05 Contratos

create table public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  content text not null,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  updated_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contract_templates_id_organization_unique unique (id, organization_id),
  constraint contract_templates_name_valid check (name = btrim(name) and name <> ''),
  constraint contract_templates_content_valid check (content = btrim(content) and content <> '')
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_id uuid not null,
  template_id uuid not null,
  title text not null,
  status text not null default 'DRAFT',
  draft_data jsonb not null default '{}'::jsonb,
  snapshot jsonb,
  sent_to_email text,
  generated_at timestamptz,
  sent_at timestamptz,
  signed_at timestamptz,
  canceled_at timestamptz,
  created_by uuid not null references public.profiles(id),
  updated_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contracts_id_organization_unique unique (id, organization_id),
  constraint contracts_client_organization_fkey foreign key (client_id, organization_id)
    references public.clients(id, organization_id),
  constraint contracts_template_organization_fkey foreign key (template_id, organization_id)
    references public.contract_templates(id, organization_id),
  constraint contracts_title_valid check (title = btrim(title) and title <> ''),
  constraint contracts_status_check check (status in ('DRAFT','GENERATED','SENT','SIGNED','CANCELED')),
  constraint contracts_draft_data_object check (jsonb_typeof(draft_data) = 'object'),
  constraint contracts_sent_email_valid check (
    sent_to_email is null or (sent_to_email = btrim(sent_to_email) and sent_to_email <> '' and position('@' in sent_to_email) > 1)
  ),
  constraint contracts_lifecycle_check check (
    (status = 'DRAFT' and snapshot is null and generated_at is null and sent_at is null and sent_to_email is null and signed_at is null and canceled_at is null)
    or (status = 'GENERATED' and snapshot is not null and generated_at is not null and sent_at is null and sent_to_email is null and signed_at is null and canceled_at is null)
    or (status = 'SENT' and snapshot is not null and generated_at is not null and sent_at is not null and sent_to_email is not null and signed_at is null and canceled_at is null)
    or (status = 'SIGNED' and snapshot is not null and generated_at is not null and sent_at is not null and sent_to_email is not null and signed_at is not null and canceled_at is null)
    or (status = 'CANCELED' and snapshot is not null and generated_at is not null and signed_at is null and canceled_at is not null
      and ((sent_at is null and sent_to_email is null) or (sent_at is not null and sent_to_email is not null)))
  ),
  constraint contracts_snapshot_shape_check check (
    snapshot is null or (
      jsonb_typeof(snapshot) = 'object'
      and jsonb_typeof(snapshot->'schema_version') = 'number'
      and (snapshot->>'schema_version') ~ '^[1-9][0-9]*$'
      and (snapshot->>'schema_version')::integer > 0
      and jsonb_typeof(snapshot->'content') = 'string'
      and btrim(snapshot->>'content') <> ''
      and jsonb_typeof(snapshot->'client') = 'object'
      and jsonb_typeof(snapshot#>'{client,data}') = 'object'
      and jsonb_typeof(snapshot->'manual_fields') = 'object'
      and jsonb_typeof(snapshot->'template') = 'object'
      and snapshot->'client' ? 'tax_id'
      and snapshot->'client' ? 'tax_id_type'
      and jsonb_typeof(snapshot#>'{template,name}') = 'string'
      and btrim(snapshot#>>'{template,name}') <> ''
    )
  )
);

create table public.documents (
  id uuid primary key,
  organization_id uuid not null references public.organizations(id),
  entity_type text not null,
  entity_id uuid not null,
  kind text not null,
  bucket_id text not null default 'private-files',
  object_path text not null,
  file_name text not null,
  mime_type text not null default 'application/pdf',
  size_bytes bigint not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint documents_entity_type_check check (entity_type = 'CONTRACT'),
  constraint documents_kind_check check (kind in ('ORIGINAL_PDF','SIGNED_COPY')),
  constraint documents_bucket_check check (bucket_id = 'private-files'),
  constraint documents_mime_check check (mime_type = 'application/pdf'),
  constraint documents_path_valid check (object_path = btrim(object_path) and object_path <> ''),
  constraint documents_file_name_valid check (file_name = btrim(file_name) and file_name <> ''),
  constraint documents_size_positive check (size_bytes > 0),
  constraint documents_object_path_unique unique (object_path),
  constraint documents_entity_kind_unique unique (entity_type, entity_id, kind)
);

create index contract_templates_org_active_updated_idx on public.contract_templates (organization_id, is_active, updated_at desc, id);
create index contract_templates_org_name_idx on public.contract_templates (organization_id, name, id);
create index contracts_org_updated_idx on public.contracts (organization_id, updated_at desc, id);
create index contracts_org_status_updated_idx on public.contracts (organization_id, status, updated_at desc, id);
create index contracts_client_updated_idx on public.contracts (client_id, updated_at desc, id);
create index contracts_template_updated_idx on public.contracts (template_id, updated_at desc, id);
create index documents_org_entity_created_idx on public.documents (organization_id, entity_type, entity_id, created_at, id);

create or replace function private.enforce_contract_template_integrity()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then raise exception using errcode='P0001', message='CONTRACT_TEMPLATE_DELETE_FORBIDDEN'; end if;
  if new.id is distinct from old.id or new.organization_id is distinct from old.organization_id
     or new.created_by is distinct from old.created_by or new.created_at is distinct from old.created_at then
    raise exception using errcode='P0001', message='CONTRACT_TEMPLATE_IMMUTABLE_FIELDS';
  end if;
  return new;
end; $$;

create or replace function public.mark_contract_sent(p_contract_id uuid,p_recipient_email text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_org uuid; v_status text; v_email text:=lower(nullif(btrim(p_recipient_email),''));
begin
  select c.organization_id,c.status into v_org,v_status from public.contracts c
  where c.id=p_contract_id and private.is_active_owner_of_organization(c.organization_id) for update;
  if not found then raise exception using errcode='P0001',message='CONTRACT_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_status<>'GENERATED' then raise exception using errcode='P0001',message='CONTRACT_SEND_STATUS_INVALID'; end if;
  if v_email is null or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode='P0001',message='CONTRACT_RECIPIENT_INVALID'; end if;
  update public.contracts set status='SENT',sent_to_email=v_email,sent_at=now(),updated_by=v_actor where id=p_contract_id;
  insert into public.activity_logs(organization_id,user_id,entity_type,entity_id,action,metadata)
  values(v_org,v_actor,'CONTRACT',p_contract_id,'SENT',null);
  return p_contract_id;
end; $$;

create or replace function public.mark_contract_signed(p_contract_id uuid,p_document_id uuid,p_object_path text,p_file_name text,p_mime_type text,p_size_bytes bigint)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_org uuid; v_status text;
begin
  select c.organization_id,c.status into v_org,v_status from public.contracts c
  where c.id=p_contract_id and private.is_active_owner_of_organization(c.organization_id) for update;
  if not found then raise exception using errcode='P0001',message='CONTRACT_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_status<>'SENT' then raise exception using errcode='P0001',message='CONTRACT_SIGN_STATUS_INVALID'; end if;
  if p_mime_type<>'application/pdf' or p_size_bytes is null or p_size_bytes<=0 or nullif(btrim(p_file_name),'') is null then
    raise exception using errcode='P0001',message='CONTRACT_DOCUMENT_METADATA_INVALID'; end if;
  perform private.require_contract_storage_object(
    p_contract_id,p_document_id,p_object_path,'SIGNED_COPY',p_mime_type,p_size_bytes,v_actor
  );
  insert into public.documents(id,organization_id,entity_type,entity_id,kind,object_path,file_name,mime_type,size_bytes,created_by)
  values(p_document_id,v_org,'CONTRACT',p_contract_id,'SIGNED_COPY',p_object_path,btrim(p_file_name),p_mime_type,p_size_bytes,v_actor);
  update public.contracts set status='SIGNED',signed_at=now(),updated_by=v_actor where id=p_contract_id;
  insert into public.activity_logs(organization_id,user_id,entity_type,entity_id,action,metadata)
  values(v_org,v_actor,'CONTRACT',p_contract_id,'SIGNED',jsonb_build_object('document_id',p_document_id));
  return p_contract_id;
end; $$;

create or replace function public.cancel_contract(p_contract_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_org uuid; v_status text;
begin
  select c.organization_id,c.status into v_org,v_status from public.contracts c
  where c.id=p_contract_id and private.is_active_owner_of_organization(c.organization_id) for update;
  if not found then raise exception using errcode='P0001',message='CONTRACT_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_status not in ('GENERATED','SENT') then raise exception using errcode='P0001',message='CONTRACT_CANCEL_STATUS_INVALID'; end if;
  update public.contracts set status='CANCELED',canceled_at=now(),updated_by=v_actor where id=p_contract_id;
  insert into public.activity_logs(organization_id,user_id,entity_type,entity_id,action,metadata)
  values(v_org,v_actor,'CONTRACT',p_contract_id,'CANCELED',jsonb_build_object('old_status',v_status));
  return p_contract_id;
end; $$;

create or replace function private.can_access_contract_object(p_name text)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from public.documents d
    where d.bucket_id='private-files' and d.object_path=p_name
      and private.is_active_owner_of_organization(d.organization_id)
  );
$$;

create or replace function private.can_upload_contract_object(p_name text,p_owner_id text)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare v_org uuid; v_contract uuid; v_kind text; v_status text;
begin
  if p_owner_id is distinct from auth.uid()::text or p_name !~ '^[0-9a-f-]{36}/contracts/[0-9a-f-]{36}/[0-9a-f-]{36}/(ORIGINAL_PDF|SIGNED_COPY)\.pdf$' then return false; end if;
  begin
    v_org:=split_part(p_name,'/',1)::uuid;
    v_contract:=split_part(p_name,'/',3)::uuid;
    perform split_part(p_name,'/',4)::uuid;
  exception when invalid_text_representation then return false;
  end;
  v_kind:=split_part(split_part(p_name,'/',5),'.',1);
  select c.status into v_status from public.contracts c
  where c.id=v_contract and c.organization_id=v_org and private.is_active_owner_of_organization(c.organization_id);
  if not found then return false; end if;
  return (v_kind='ORIGINAL_PDF' and v_status='DRAFT') or (v_kind='SIGNED_COPY' and v_status='SENT');
end; $$;

create or replace function private.can_delete_orphan_contract_object(p_name text,p_owner_id text)
returns boolean language sql stable security definer set search_path='' as $$
  select private.can_upload_contract_object(p_name,p_owner_id)
    and not exists(select 1 from public.documents d where d.bucket_id='private-files' and d.object_path=p_name);
$$;

revoke execute on function private.can_access_contract_object(text) from public,anon,authenticated;
revoke execute on function private.can_upload_contract_object(text,text) from public,anon,authenticated;
revoke execute on function private.can_delete_orphan_contract_object(text,text) from public,anon,authenticated;
grant execute on function private.can_access_contract_object(text) to authenticated;
grant execute on function private.can_upload_contract_object(text,text) to authenticated;
grant execute on function private.can_delete_orphan_contract_object(text,text) to authenticated;

create policy contract_objects_select_owner on storage.objects for select to authenticated
using (bucket_id='private-files' and (select private.can_access_contract_object(name)));

create policy contract_objects_insert_owner on storage.objects for insert to authenticated
with check (bucket_id='private-files' and (select private.can_upload_contract_object(name,owner_id)));

create policy contract_orphan_objects_delete_owner on storage.objects for delete to authenticated
using (bucket_id='private-files' and (select private.can_delete_orphan_contract_object(name,owner_id)));

create or replace function private.enforce_contract_lifecycle()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then raise exception using errcode='P0001', message='CONTRACT_DELETE_FORBIDDEN'; end if;
  if new.id is distinct from old.id or new.organization_id is distinct from old.organization_id
     or new.created_by is distinct from old.created_by or new.created_at is distinct from old.created_at then
    raise exception using errcode='P0001', message='CONTRACT_IMMUTABLE_FIELDS';
  end if;
  if old.status <> 'DRAFT' and (
    new.client_id is distinct from old.client_id or new.template_id is distinct from old.template_id
    or new.title is distinct from old.title or new.draft_data is distinct from old.draft_data
    or new.snapshot is distinct from old.snapshot or new.generated_at is distinct from old.generated_at
  ) then raise exception using errcode='P0001', message='CONTRACT_GENERATED_IMMUTABLE'; end if;
  if old.status = new.status then
    if old.status <> 'DRAFT' then raise exception using errcode='P0001', message='CONTRACT_TERMINAL_OR_IMMUTABLE'; end if;
  elsif not (
    (old.status='DRAFT' and new.status='GENERATED')
    or (old.status='GENERATED' and new.status in ('SENT','CANCELED'))
    or (old.status='SENT' and new.status in ('SIGNED','CANCELED'))
  ) then raise exception using errcode='P0001', message='CONTRACT_STATUS_TRANSITION_INVALID'; end if;
  return new;
end; $$;

create or replace function private.enforce_document_integrity()
returns trigger language plpgsql set search_path = '' as $$
declare v_status text; v_org uuid;
begin
  if tg_op = 'DELETE' then raise exception using errcode='P0001', message='DOCUMENT_DELETE_FORBIDDEN'; end if;
  if tg_op = 'UPDATE' then raise exception using errcode='P0001', message='DOCUMENT_IMMUTABLE'; end if;
  select c.status,c.organization_id into v_status,v_org from public.contracts c where c.id=new.entity_id;
  if not found or v_org <> new.organization_id then raise exception using errcode='P0001', message='DOCUMENT_CONTRACT_INVALID'; end if;
  if (new.kind='ORIGINAL_PDF' and v_status <> 'DRAFT') or (new.kind='SIGNED_COPY' and v_status <> 'SENT') then
    raise exception using errcode='P0001', message='DOCUMENT_CONTRACT_STATUS_INVALID';
  end if;
  return new;
end; $$;

create or replace function private.validate_contract_required_documents()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status in ('GENERATED','SENT','SIGNED','CANCELED') and not exists (
    select 1 from public.documents d where d.entity_type='CONTRACT' and d.entity_id=new.id and d.kind='ORIGINAL_PDF'
  ) then raise exception using errcode='P0001', message='CONTRACT_ORIGINAL_PDF_REQUIRED'; end if;
  if new.status='SIGNED' and not exists (
    select 1 from public.documents d where d.entity_type='CONTRACT' and d.entity_id=new.id and d.kind='SIGNED_COPY'
  ) then raise exception using errcode='P0001', message='CONTRACT_SIGNED_COPY_REQUIRED'; end if;
  return new;
end; $$;

revoke execute on function private.enforce_contract_template_integrity() from public,anon,authenticated;
revoke execute on function private.enforce_contract_lifecycle() from public,anon,authenticated;
revoke execute on function private.enforce_document_integrity() from public,anon,authenticated;
revoke execute on function private.validate_contract_required_documents() from public,anon,authenticated;

create trigger contract_templates_integrity before update or delete on public.contract_templates for each row execute function private.enforce_contract_template_integrity();
create trigger contract_templates_updated_at before update on public.contract_templates for each row execute function private.set_updated_at();
create trigger contracts_lifecycle before update or delete on public.contracts for each row execute function private.enforce_contract_lifecycle();
create trigger contracts_updated_at before update on public.contracts for each row execute function private.set_updated_at();
create trigger documents_integrity before insert or update or delete on public.documents for each row execute function private.enforce_document_integrity();
create trigger contracts_required_documents after insert or update on public.contracts for each row execute function private.validate_contract_required_documents();

alter table public.contract_templates enable row level security;
alter table public.contracts enable row level security;
alter table public.documents enable row level security;

create policy contract_templates_select_owner on public.contract_templates for select to authenticated
using ((select private.is_active_owner_of_organization(contract_templates.organization_id)));
create policy contracts_select_owner on public.contracts for select to authenticated
using ((select private.is_active_owner_of_organization(contracts.organization_id)));
create policy documents_select_owner on public.documents for select to authenticated
using ((select private.is_active_owner_of_organization(documents.organization_id)));

revoke all on public.contract_templates from anon,authenticated;
revoke all on public.contracts from anon,authenticated;
revoke all on public.documents from anon,authenticated;
grant select on public.contract_templates,public.contracts,public.documents to authenticated;

create or replace function public.create_contract_template(p_name text,p_content text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_org uuid; v_id uuid; v_name text:=nullif(btrim(p_name),''); v_content text:=nullif(btrim(p_content),'');
begin
  v_org:=private.require_active_owner_organization();
  if v_name is null then raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_NAME_REQUIRED'; end if;
  if v_content is null then raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_CONTENT_REQUIRED'; end if;
  insert into public.contract_templates(organization_id,name,content,created_by,updated_by)
  values(v_org,v_name,v_content,v_actor,v_actor) returning id into v_id;
  insert into public.activity_logs(organization_id,user_id,entity_type,entity_id,action,metadata)
  values(v_org,v_actor,'CONTRACT_TEMPLATE',v_id,'CREATED',null);
  return v_id;
end; $$;

create or replace function public.update_contract_template(p_template_id uuid,p_name text,p_content text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_org uuid; v_name text:=nullif(btrim(p_name),''); v_content text:=nullif(btrim(p_content),'');
begin
  select t.organization_id into v_org from public.contract_templates t
  where t.id=p_template_id and private.is_active_owner_of_organization(t.organization_id) for update;
  if not found then raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_name is null then raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_NAME_REQUIRED'; end if;
  if v_content is null then raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_CONTENT_REQUIRED'; end if;
  update public.contract_templates set name=v_name,content=v_content,updated_by=v_actor where id=p_template_id;
  insert into public.activity_logs(organization_id,user_id,entity_type,entity_id,action,metadata)
  values(v_org,v_actor,'CONTRACT_TEMPLATE',p_template_id,'UPDATED',null);
  return p_template_id;
end; $$;

create or replace function public.activate_contract_template(p_template_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_org uuid; v_active boolean;
begin
  select t.organization_id,t.is_active into v_org,v_active from public.contract_templates t
  where t.id=p_template_id and private.is_active_owner_of_organization(t.organization_id) for update;
  if not found then raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_active then raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_ALREADY_ACTIVE'; end if;
  update public.contract_templates set is_active=true,updated_by=v_actor where id=p_template_id;
  insert into public.activity_logs(organization_id,user_id,entity_type,entity_id,action,metadata)
  values(v_org,v_actor,'CONTRACT_TEMPLATE',p_template_id,'ACTIVATED',null);
  return p_template_id;
end; $$;

create or replace function public.deactivate_contract_template(p_template_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_org uuid; v_active boolean;
begin
  select t.organization_id,t.is_active into v_org,v_active from public.contract_templates t
  where t.id=p_template_id and private.is_active_owner_of_organization(t.organization_id) for update;
  if not found then raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_NOT_FOUND_OR_FORBIDDEN'; end if;
  if not v_active then raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_ALREADY_INACTIVE'; end if;
  update public.contract_templates set is_active=false,updated_by=v_actor where id=p_template_id;
  insert into public.activity_logs(organization_id,user_id,entity_type,entity_id,action,metadata)
  values(v_org,v_actor,'CONTRACT_TEMPLATE',p_template_id,'DEACTIVATED',null);
  return p_template_id;
end; $$;

create or replace function public.create_contract(p_client_id uuid,p_template_id uuid,p_title text,p_draft_data jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_org uuid; v_id uuid; v_title text:=nullif(btrim(p_title),'');
begin
  v_org:=private.require_active_owner_organization();
  if v_title is null then raise exception using errcode='P0001',message='CONTRACT_TITLE_REQUIRED'; end if;
  if p_draft_data is null or jsonb_typeof(p_draft_data)<>'object' then raise exception using errcode='P0001',message='CONTRACT_DRAFT_DATA_INVALID'; end if;
  if not exists(select 1 from public.clients c where c.id=p_client_id and c.organization_id=v_org and c.archived_at is null) then
    raise exception using errcode='P0001',message='CONTRACT_CLIENT_INVALID'; end if;
  if not exists(select 1 from public.contract_templates t where t.id=p_template_id and t.organization_id=v_org and t.is_active) then
    raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_INVALID'; end if;
  insert into public.contracts(organization_id,client_id,template_id,title,draft_data,created_by,updated_by)
  values(v_org,p_client_id,p_template_id,v_title,p_draft_data,v_actor,v_actor) returning id into v_id;
  insert into public.activity_logs(organization_id,user_id,entity_type,entity_id,action,metadata)
  values(v_org,v_actor,'CONTRACT',v_id,'CREATED',null);
  return v_id;
end; $$;

create or replace function public.update_draft_contract(p_contract_id uuid,p_client_id uuid,p_template_id uuid,p_title text,p_draft_data jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_org uuid; v_status text; v_title text:=nullif(btrim(p_title),'');
begin
  select c.organization_id,c.status into v_org,v_status from public.contracts c
  where c.id=p_contract_id and private.is_active_owner_of_organization(c.organization_id) for update;
  if not found then raise exception using errcode='P0001',message='CONTRACT_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_status<>'DRAFT' then raise exception using errcode='P0001',message='CONTRACT_NOT_EDITABLE'; end if;
  if v_title is null then raise exception using errcode='P0001',message='CONTRACT_TITLE_REQUIRED'; end if;
  if p_draft_data is null or jsonb_typeof(p_draft_data)<>'object' then raise exception using errcode='P0001',message='CONTRACT_DRAFT_DATA_INVALID'; end if;
  if not exists(select 1 from public.clients c where c.id=p_client_id and c.organization_id=v_org and c.archived_at is null) then
    raise exception using errcode='P0001',message='CONTRACT_CLIENT_INVALID'; end if;
  if not exists(select 1 from public.contract_templates t where t.id=p_template_id and t.organization_id=v_org and t.is_active) then
    raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_INVALID'; end if;
  update public.contracts set client_id=p_client_id,template_id=p_template_id,title=v_title,draft_data=p_draft_data,updated_by=v_actor where id=p_contract_id;
  insert into public.activity_logs(organization_id,user_id,entity_type,entity_id,action,metadata)
  values(v_org,v_actor,'CONTRACT',p_contract_id,'UPDATED',null);
  return p_contract_id;
end; $$;

create or replace function private.require_contract_storage_object(
  p_contract_id uuid,
  p_document_id uuid,
  p_object_path text,
  p_kind text,
  p_mime_type text,
  p_size_bytes bigint,
  p_actor uuid
)
returns void language plpgsql security definer set search_path='' as $$
declare v_org uuid; v_expected text;
begin
  select c.organization_id into v_org from public.contracts c where c.id=p_contract_id;
  v_expected:=format('%s/contracts/%s/%s/%s.pdf',v_org,p_contract_id,p_document_id,p_kind);
  if p_object_path is distinct from v_expected or not exists(
    select 1
    from storage.objects o
    where o.bucket_id='private-files'
      and o.name=p_object_path
      and o.owner_id=p_actor::text
      and o.metadata->>'mimetype'=p_mime_type
      and (o.metadata->>'size')::bigint=p_size_bytes
  ) then raise exception using errcode='P0001',message='CONTRACT_DOCUMENT_OBJECT_INVALID'; end if;
end; $$;

revoke execute on function private.require_contract_storage_object(uuid,uuid,text,text,text,bigint,uuid) from public,anon,authenticated;

create or replace function public.generate_contract(p_contract_id uuid,p_snapshot jsonb,p_document_id uuid,p_object_path text,p_file_name text,p_mime_type text,p_size_bytes bigint)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid:=auth.uid(); v_org uuid; v_client uuid; v_template uuid; v_status text;
begin
  select c.organization_id,c.client_id,c.template_id,c.status into v_org,v_client,v_template,v_status from public.contracts c
  where c.id=p_contract_id and private.is_active_owner_of_organization(c.organization_id) for update;
  if not found then raise exception using errcode='P0001',message='CONTRACT_NOT_FOUND_OR_FORBIDDEN'; end if;
  if v_status<>'DRAFT' then raise exception using errcode='P0001',message='CONTRACT_GENERATE_STATUS_INVALID'; end if;
  if not exists(select 1 from public.clients c where c.id=v_client and c.organization_id=v_org and c.archived_at is null) then
    raise exception using errcode='P0001',message='CONTRACT_CLIENT_INVALID'; end if;
  if not exists(select 1 from public.contract_templates t where t.id=v_template and t.organization_id=v_org and t.is_active) then
    raise exception using errcode='P0001',message='CONTRACT_TEMPLATE_INVALID'; end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot)<>'object'
    or p_snapshot#>>'{client,id}' is distinct from v_client::text
    or p_snapshot#>>'{template,id}' is distinct from v_template::text
    or jsonb_typeof(p_snapshot->'manual_fields')<>'object'
    or nullif(btrim(p_snapshot->>'content'),'') is null then
    raise exception using errcode='P0001',message='CONTRACT_SNAPSHOT_INVALID'; end if;
  if p_mime_type<>'application/pdf' or p_size_bytes is null or p_size_bytes<=0 or nullif(btrim(p_file_name),'') is null then
    raise exception using errcode='P0001',message='CONTRACT_DOCUMENT_METADATA_INVALID'; end if;
  perform private.require_contract_storage_object(
    p_contract_id,p_document_id,p_object_path,'ORIGINAL_PDF',p_mime_type,p_size_bytes,v_actor
  );
  insert into public.documents(id,organization_id,entity_type,entity_id,kind,object_path,file_name,mime_type,size_bytes,created_by)
  values(p_document_id,v_org,'CONTRACT',p_contract_id,'ORIGINAL_PDF',p_object_path,btrim(p_file_name),p_mime_type,p_size_bytes,v_actor);
  update public.contracts set snapshot=p_snapshot,status='GENERATED',generated_at=now(),updated_by=v_actor where id=p_contract_id;
  insert into public.activity_logs(organization_id,user_id,entity_type,entity_id,action,metadata)
  values(v_org,v_actor,'CONTRACT',p_contract_id,'GENERATED',jsonb_build_object('document_id',p_document_id));
  return p_contract_id;
end; $$;

revoke execute on function public.create_contract_template(text,text) from public,anon,service_role;
revoke execute on function public.update_contract_template(uuid,text,text) from public,anon,service_role;
revoke execute on function public.activate_contract_template(uuid) from public,anon,service_role;
revoke execute on function public.deactivate_contract_template(uuid) from public,anon,service_role;
revoke execute on function public.create_contract(uuid,uuid,text,jsonb) from public,anon,service_role;
revoke execute on function public.update_draft_contract(uuid,uuid,uuid,text,jsonb) from public,anon,service_role;
revoke execute on function public.generate_contract(uuid,jsonb,uuid,text,text,text,bigint) from public,anon,service_role;
revoke execute on function public.mark_contract_sent(uuid,text) from public,anon,service_role;
revoke execute on function public.mark_contract_signed(uuid,uuid,text,text,text,bigint) from public,anon,service_role;
revoke execute on function public.cancel_contract(uuid) from public,anon,service_role;

grant execute on function public.create_contract_template(text,text) to authenticated;
grant execute on function public.update_contract_template(uuid,text,text) to authenticated;
grant execute on function public.activate_contract_template(uuid) to authenticated;
grant execute on function public.deactivate_contract_template(uuid) to authenticated;
grant execute on function public.create_contract(uuid,uuid,text,jsonb) to authenticated;
grant execute on function public.update_draft_contract(uuid,uuid,uuid,text,jsonb) to authenticated;
grant execute on function public.generate_contract(uuid,jsonb,uuid,text,text,text,bigint) to authenticated;
grant execute on function public.mark_contract_sent(uuid,text) to authenticated;
grant execute on function public.mark_contract_signed(uuid,uuid,text,text,text,bigint) to authenticated;
grant execute on function public.cancel_contract(uuid) to authenticated;
