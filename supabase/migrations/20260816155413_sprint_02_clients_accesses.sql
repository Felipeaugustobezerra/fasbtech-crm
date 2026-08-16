-- ============================================================
-- FASBtech CRM
-- Sprint 02 — Clientes & Acessos
-- Migration: clients + client_assignments + access control
-- ============================================================
--
-- Escopo:
--   - clients
--   - client_assignments
--   - autorização por Cliente
--   - ampliação de leitura administrativa de Membership/Profile
--   - onboarding operacional de Membership por OWNER
--   - Activity Logs transacionais
--   - RLS
--   - Policies
--   - Grants
--   - RPCs autorizadas
--
-- Fora do escopo:
--   - demands
--   - financial_entries
--   - financial_goals
--   - contracts
--   - contract_templates
--   - documents
--   - meetings
--   - leads
--   - projects
--
-- ADMIN:
--   Nenhum acesso global a Clientes é concedido por inferência nesta
--   Migration. Regras adicionais para ADMIN deverão ser implementadas
--   somente quando estiverem oficialmente definidas.
-- ============================================================


-- ============================================================
-- 1. CLIENTS
-- ============================================================

create table public.clients (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id),

  name text not null,
  company_name text,

  email text,
  phone text,

  tax_id text,
  tax_id_type text,

  address_line_1 text,
  address_line_2 text,
  city text,
  region text,
  postal_code text,
  country_code text,

  notes text,

  created_by uuid not null
    references public.profiles(id),

  updated_by uuid not null
    references public.profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,

  constraint clients_name_not_empty
    check (btrim(name) <> ''),

  constraint clients_tax_id_pair_check
    check (
      (
        tax_id is null
        and tax_id_type is null
      )
      or
      (
        tax_id is not null
        and tax_id_type is not null
        and btrim(tax_id) <> ''
        and btrim(tax_id_type) <> ''
      )
    )
);


-- ============================================================
-- 2. CLIENT ASSIGNMENTS
-- ============================================================

create table public.client_assignments (
  id uuid primary key default gen_random_uuid(),

  client_id uuid not null
    references public.clients(id),

  membership_id uuid not null
    references public.organization_members(id),

  created_by uuid not null
    references public.profiles(id),

  created_at timestamptz not null default now(),

  constraint client_assignments_unique
    unique (client_id, membership_id)
);


-- ============================================================
-- 3. ÍNDICES
-- ============================================================

create index clients_organization_idx
  on public.clients (organization_id);

create index clients_organization_archived_idx
  on public.clients (
    organization_id,
    archived_at
  );

create index clients_organization_name_idx
  on public.clients (
    organization_id,
    name
  );

create index client_assignments_client_idx
  on public.client_assignments (client_id);

create index client_assignments_membership_idx
  on public.client_assignments (membership_id);


-- ============================================================
-- 4. UPDATED_AT
-- ============================================================

create trigger clients_set_updated_at
before update on public.clients
for each row
execute function private.set_updated_at();


-- ============================================================
-- 5. INTEGRIDADE CLIENT ↔ MEMBERSHIP ↔ ORGANIZATION
-- ============================================================

create or replace function private.enforce_client_assignment_organization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_organization_id uuid;
  v_membership_organization_id uuid;
begin
  select client.organization_id
    into v_client_organization_id
  from public.clients as client
  where client.id = new.client_id;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_NOT_FOUND';
  end if;

  select membership.organization_id
    into v_membership_organization_id
  from public.organization_members as membership
  where membership.id = new.membership_id;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'MEMBERSHIP_NOT_FOUND';
  end if;

  if v_client_organization_id <> v_membership_organization_id then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_ASSIGNMENT_ORGANIZATION_MISMATCH';
  end if;

  return new;
end;
$$;


revoke execute
on function private.enforce_client_assignment_organization()
from public;

revoke execute
on function private.enforce_client_assignment_organization()
from anon;

revoke execute
on function private.enforce_client_assignment_organization()
from authenticated;


create trigger client_assignments_enforce_organization
before insert or update on public.client_assignments
for each row
execute function private.enforce_client_assignment_organization();


-- ============================================================
-- 6. HELPERS DE AUTORIZAÇÃO
-- ============================================================

create or replace function private.is_active_owner_of_organization(
  p_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members as membership
    inner join public.profiles as profile
      on profile.id = membership.user_id
    inner join public.organizations as organization
      on organization.id = membership.organization_id
    where membership.organization_id = p_organization_id
      and membership.user_id = (select auth.uid())
      and membership.role = 'OWNER'
      and membership.status = 'ACTIVE'
      and membership.archived_at is null
      and profile.status = 'ACTIVE'
      and organization.status = 'ACTIVE'
      and organization.archived_at is null
  );
$$;


create or replace function private.can_access_client(
  p_client_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.clients as client
    inner join public.organizations as organization
      on organization.id = client.organization_id
    inner join public.organization_members as membership
      on membership.organization_id = client.organization_id
    inner join public.profiles as profile
      on profile.id = membership.user_id
    where client.id = p_client_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'ACTIVE'
      and membership.archived_at is null
      and profile.status = 'ACTIVE'
      and organization.status = 'ACTIVE'
      and organization.archived_at is null
      and (
        membership.role = 'OWNER'
        or (
          membership.role = 'MEMBER'
          and exists (
            select 1
            from public.client_assignments as assignment
            where assignment.client_id = client.id
              and assignment.membership_id = membership.id
          )
        )
      )
  );
$$;


create or replace function private.can_view_client_assignment(
  p_client_id uuid,
  p_membership_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.clients as client
    inner join public.organizations as organization
      on organization.id = client.organization_id
    where client.id = p_client_id
      and organization.status = 'ACTIVE'
      and organization.archived_at is null
      and (
        exists (
          select 1
          from public.organization_members as current_membership
          inner join public.profiles as current_profile
            on current_profile.id = current_membership.user_id
          where current_membership.organization_id = client.organization_id
            and current_membership.user_id = (select auth.uid())
            and current_membership.role = 'OWNER'
            and current_membership.status = 'ACTIVE'
            and current_membership.archived_at is null
            and current_profile.status = 'ACTIVE'
        )
        or
        exists (
          select 1
          from public.organization_members as target_membership
          inner join public.profiles as target_profile
            on target_profile.id = target_membership.user_id
          where target_membership.id = p_membership_id
            and target_membership.organization_id = client.organization_id
            and target_membership.user_id = (select auth.uid())
            and target_membership.role = 'MEMBER'
            and target_membership.status = 'ACTIVE'
            and target_membership.archived_at is null
            and target_profile.status = 'ACTIVE'
        )
      )
  );
$$;


create or replace function private.can_owner_view_profile(
  p_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members as target_membership
    inner join public.organization_members as current_membership
      on current_membership.organization_id = target_membership.organization_id
    inner join public.profiles as current_profile
      on current_profile.id = current_membership.user_id
    inner join public.organizations as organization
      on organization.id = target_membership.organization_id
    where target_membership.user_id = p_profile_id
      and current_membership.user_id = (select auth.uid())
      and current_membership.role = 'OWNER'
      and current_membership.status = 'ACTIVE'
      and current_membership.archived_at is null
      and current_profile.status = 'ACTIVE'
      and organization.status = 'ACTIVE'
      and organization.archived_at is null
  );
$$;


create or replace function private.can_access_client_log(
  p_organization_id uuid,
  p_client_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.clients as client
    inner join public.organizations as organization
      on organization.id = client.organization_id
    inner join public.organization_members as membership
      on membership.organization_id = client.organization_id
    inner join public.profiles as profile
      on profile.id = membership.user_id
    where client.id = p_client_id
      and client.organization_id = p_organization_id
      and membership.user_id = (select auth.uid())
      and membership.role = 'MEMBER'
      and membership.status = 'ACTIVE'
      and membership.archived_at is null
      and profile.status = 'ACTIVE'
      and organization.status = 'ACTIVE'
      and organization.archived_at is null
      and exists (
        select 1
        from public.client_assignments as assignment
        where assignment.client_id = client.id
          and assignment.membership_id = membership.id
      )
  );
$$;


-- ============================================================
-- 7. HELPER DE CONTEXTO ADMINISTRATIVO
-- ============================================================

create or replace function private.require_active_owner_organization()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_organization_ids uuid[];
begin
  if auth.uid() is null then
    raise exception using
      errcode = 'P0001',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  select
    array_agg(
      membership.organization_id
      order by membership.created_at asc, membership.id asc
    )
    into v_organization_ids
  from public.organization_members as membership
  inner join public.profiles as profile
    on profile.id = membership.user_id
  inner join public.organizations as organization
    on organization.id = membership.organization_id
  where membership.user_id = (select auth.uid())
    and membership.role = 'OWNER'
    and membership.status = 'ACTIVE'
    and membership.archived_at is null
    and profile.status = 'ACTIVE'
    and organization.status = 'ACTIVE'
    and organization.archived_at is null;

  if coalesce(cardinality(v_organization_ids), 0) = 0 then
    raise exception using
      errcode = 'P0001',
      message = 'AUTHORIZATION_DENIED';
  end if;

  if cardinality(v_organization_ids) > 1 then
    raise exception using
      errcode = 'P0001',
      message = 'AMBIGUOUS_ORGANIZATION_CONTEXT';
  end if;

  return v_organization_ids[1];
end;
$$;


-- Helpers usados somente por mecanismos internos ou Policies.

revoke execute
on function private.require_active_owner_organization()
from public;

revoke execute
on function private.require_active_owner_organization()
from anon;

revoke execute
on function private.require_active_owner_organization()
from authenticated;


-- Helpers usados por RLS.
-- O schema private continua fora dos schemas expostos.

revoke execute
on function private.is_active_owner_of_organization(uuid)
from public;

revoke execute
on function private.is_active_owner_of_organization(uuid)
from anon;

revoke execute
on function private.is_active_owner_of_organization(uuid)
from authenticated;

grant execute
on function private.is_active_owner_of_organization(uuid)
to authenticated;


revoke execute
on function private.can_access_client(uuid)
from public;

revoke execute
on function private.can_access_client(uuid)
from anon;

revoke execute
on function private.can_access_client(uuid)
from authenticated;

grant execute
on function private.can_access_client(uuid)
to authenticated;


revoke execute
on function private.can_view_client_assignment(uuid, uuid)
from public;

revoke execute
on function private.can_view_client_assignment(uuid, uuid)
from anon;

revoke execute
on function private.can_view_client_assignment(uuid, uuid)
from authenticated;

grant execute
on function private.can_view_client_assignment(uuid, uuid)
to authenticated;


revoke execute
on function private.can_owner_view_profile(uuid)
from public;

revoke execute
on function private.can_owner_view_profile(uuid)
from anon;

revoke execute
on function private.can_owner_view_profile(uuid)
from authenticated;

grant execute
on function private.can_owner_view_profile(uuid)
to authenticated;


revoke execute
on function private.can_access_client_log(uuid, uuid)
from public;

revoke execute
on function private.can_access_client_log(uuid, uuid)
from anon;

revoke execute
on function private.can_access_client_log(uuid, uuid)
from authenticated;

grant execute
on function private.can_access_client_log(uuid, uuid)
to authenticated;


-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================

alter table public.clients
enable row level security;

alter table public.client_assignments
enable row level security;


-- ============================================================
-- 9. CLIENTS POLICIES
-- ============================================================

create policy clients_select_authorized
on public.clients
for select
to authenticated
using (
  (select private.can_access_client(clients.id))
);


-- Não existem Policies diretas de INSERT, UPDATE ou DELETE.
-- Escritas operacionais serão realizadas pelas RPCs autorizadas abaixo.


-- ============================================================
-- 10. CLIENT ASSIGNMENTS POLICIES
-- ============================================================

create policy client_assignments_select_authorized
on public.client_assignments
for select
to authenticated
using (
  (
    select private.can_view_client_assignment(
      client_assignments.client_id,
      client_assignments.membership_id
    )
  )
);


-- Não existem Policies diretas de INSERT, UPDATE ou DELETE.


-- ============================================================
-- 11. AMPLIAÇÃO DE POLICIES DA FOUNDATION PARA ACESSOS
-- ============================================================

-- OWNER ACTIVE pode visualizar Memberships da própria Organization.
-- A Policy da Foundation que permite ao utilizador ver seu próprio
-- Membership permanece válida.

create policy organization_members_select_owner_organization
on public.organization_members
for select
to authenticated
using (
  (
    select private.is_active_owner_of_organization(
      organization_members.organization_id
    )
  )
);


-- OWNER ACTIVE pode visualizar Profiles de utilizadores que possuem
-- Membership na Organization administrada.
-- A Policy profiles_select_own permanece válida.

create policy profiles_select_owner_organization_members
on public.profiles
for select
to authenticated
using (
  (select private.can_owner_view_profile(profiles.id))
);


-- MEMBER não recebe acesso irrestrito aos Activity Logs.
-- Nesta Sprint ele pode visualizar apenas eventos operacionais de Cliente
-- para Clientes aos quais mantém acesso explícito.
-- Eventos administrativos de acesso continuam visíveis somente ao OWNER
-- através da Policy já criada na Foundation.

create policy activity_logs_select_authorized_client
on public.activity_logs
for select
to authenticated
using (
  activity_logs.entity_type = 'CLIENT'
  and activity_logs.action in (
    'CREATED',
    'UPDATED',
    'ARCHIVED'
  )
  and (
    select private.can_access_client_log(
      activity_logs.organization_id,
      activity_logs.entity_id
    )
  )
);


-- ============================================================
-- 12. GRANTS DAS TABELAS
-- ============================================================

revoke all on public.clients
from anon, authenticated;

revoke all on public.client_assignments
from anon, authenticated;


grant select
on public.clients
to authenticated;

grant select
on public.client_assignments
to authenticated;


-- Escritas diretas permanecem negadas.
-- As RPCs abaixo controlam autorização, autoria e Activity Logs.


-- ============================================================
-- 13. RPC — ADD ORGANIZATION MEMBER
-- ============================================================

create or replace function public.add_organization_member(
  p_email text,
  p_role text default 'MEMBER'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_organization_id uuid;

  v_email text;
  v_role text;

  v_target_user_id uuid;
  v_target_metadata jsonb;
  v_target_email text;
  v_target_full_name text;
  v_target_profile_status text;

  v_membership_id uuid;
begin
  v_actor_id := auth.uid();
  v_organization_id := private.require_active_owner_organization();

  v_email := nullif(btrim(p_email), '');
  v_role := upper(btrim(p_role));

  if v_email is null then
    raise exception using
      errcode = 'P0001',
      message = 'MEMBER_EMAIL_REQUIRED';
  end if;

  if v_role not in ('OWNER', 'ADMIN', 'MEMBER') then
    raise exception using
      errcode = 'P0001',
      message = 'MEMBER_ROLE_INVALID';
  end if;

  select
    auth_user.id,
    auth_user.raw_user_meta_data,
    auth_user.email
    into
      v_target_user_id,
      v_target_metadata,
      v_target_email
  from auth.users as auth_user
  where lower(auth_user.email) = lower(v_email)
  order by auth_user.created_at asc
  limit 1;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'AUTH_USER_NOT_FOUND';
  end if;

  v_target_full_name := coalesce(
    nullif(
      btrim(v_target_metadata ->> 'full_name'),
      ''
    ),
    nullif(
      btrim(v_target_email),
      ''
    )
  );

  if v_target_full_name is null then
    raise exception using
      errcode = 'P0001',
      message = 'PROFILE_NAME_UNAVAILABLE';
  end if;

  insert into public.profiles (
    id,
    full_name,
    status
  )
  values (
    v_target_user_id,
    v_target_full_name,
    'ACTIVE'
  )
  on conflict (id)
  do nothing;

  select profile.status
    into v_target_profile_status
  from public.profiles as profile
  where profile.id = v_target_user_id;

  if v_target_profile_status <> 'ACTIVE' then
    raise exception using
      errcode = 'P0001',
      message = 'PROFILE_INACTIVE';
  end if;

  if exists (
    select 1
    from public.organization_members as membership
    where membership.organization_id = v_organization_id
      and membership.user_id = v_target_user_id
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'MEMBERSHIP_ALREADY_EXISTS';
  end if;

  insert into public.organization_members (
    organization_id,
    user_id,
    role,
    status
  )
  values (
    v_organization_id,
    v_target_user_id,
    v_role,
    'ACTIVE'
  )
  returning id
  into v_membership_id;

  insert into public.activity_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    metadata
  )
  values (
    v_organization_id,
    v_actor_id,
    'MEMBERSHIP',
    v_membership_id,
    'CREATED',
    jsonb_build_object(
      'target_user_id',
      v_target_user_id,
      'role',
      v_role
    )
  );

  return v_membership_id;
end;
$$;


-- ============================================================
-- 14. RPC — UPDATE ORGANIZATION MEMBER ROLE
-- ============================================================

create or replace function public.update_organization_member_role(
  p_membership_id uuid,
  p_role text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_organization_id uuid;

  v_new_role text;
  v_old_role text;

  v_target_status text;
  v_target_archived_at timestamptz;

  v_other_active_owners bigint;
begin
  v_actor_id := auth.uid();
  v_organization_id := private.require_active_owner_organization();
  v_new_role := upper(btrim(p_role));

  if v_new_role not in ('OWNER', 'ADMIN', 'MEMBER') then
    raise exception using
      errcode = 'P0001',
      message = 'MEMBER_ROLE_INVALID';
  end if;

  select
    membership.role,
    membership.status,
    membership.archived_at
    into
      v_old_role,
      v_target_status,
      v_target_archived_at
  from public.organization_members as membership
  where membership.id = p_membership_id
    and membership.organization_id = v_organization_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'MEMBERSHIP_NOT_FOUND_OR_FORBIDDEN';
  end if;

  if v_old_role = v_new_role then
    return p_membership_id;
  end if;

  if v_old_role = 'OWNER'
     and v_new_role <> 'OWNER'
     and v_target_status = 'ACTIVE'
     and v_target_archived_at is null then

    select count(*)
      into v_other_active_owners
    from public.organization_members as membership
    inner join public.profiles as profile
      on profile.id = membership.user_id
    where membership.organization_id = v_organization_id
      and membership.id <> p_membership_id
      and membership.role = 'OWNER'
      and membership.status = 'ACTIVE'
      and membership.archived_at is null
      and profile.status = 'ACTIVE';

    if v_other_active_owners = 0 then
      raise exception using
        errcode = 'P0001',
        message = 'LAST_ACTIVE_OWNER_REQUIRED';
    end if;
  end if;

  update public.organization_members
  set role = v_new_role
  where id = p_membership_id;

  insert into public.activity_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    metadata
  )
  values (
    v_organization_id,
    v_actor_id,
    'MEMBERSHIP',
    p_membership_id,
    'ROLE_UPDATED',
    jsonb_build_object(
      'old_role',
      v_old_role,
      'new_role',
      v_new_role
    )
  );

  return p_membership_id;
end;
$$;


-- ============================================================
-- 15. RPC — CREATE CLIENT
-- ============================================================

create or replace function public.create_client(
  p_name text,
  p_company_name text default null,
  p_email text default null,
  p_phone text default null,
  p_tax_id text default null,
  p_tax_id_type text default null,
  p_address_line_1 text default null,
  p_address_line_2 text default null,
  p_city text default null,
  p_region text default null,
  p_postal_code text default null,
  p_country_code text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_organization_id uuid;
  v_client_id uuid;

  v_name text;
  v_tax_id text;
  v_tax_id_type text;
begin
  v_user_id := auth.uid();
  v_organization_id := private.require_active_owner_organization();

  v_name := nullif(btrim(p_name), '');
  v_tax_id := nullif(btrim(p_tax_id), '');
  v_tax_id_type := nullif(btrim(p_tax_id_type), '');

  if v_name is null then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_NAME_REQUIRED';
  end if;

  if (v_tax_id is null) <> (v_tax_id_type is null) then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_TAX_ID_PAIR_REQUIRED';
  end if;

  insert into public.clients (
    organization_id,
    name,
    company_name,
    email,
    phone,
    tax_id,
    tax_id_type,
    address_line_1,
    address_line_2,
    city,
    region,
    postal_code,
    country_code,
    notes,
    created_by,
    updated_by
  )
  values (
    v_organization_id,
    v_name,
    nullif(btrim(p_company_name), ''),
    nullif(btrim(p_email), ''),
    nullif(btrim(p_phone), ''),
    v_tax_id,
    v_tax_id_type,
    nullif(btrim(p_address_line_1), ''),
    nullif(btrim(p_address_line_2), ''),
    nullif(btrim(p_city), ''),
    nullif(btrim(p_region), ''),
    nullif(btrim(p_postal_code), ''),
    nullif(btrim(p_country_code), ''),
    nullif(btrim(p_notes), ''),
    v_user_id,
    v_user_id
  )
  returning id
  into v_client_id;

  insert into public.activity_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    metadata
  )
  values (
    v_organization_id,
    v_user_id,
    'CLIENT',
    v_client_id,
    'CREATED',
    null
  );

  return v_client_id;
end;
$$;


-- ============================================================
-- 16. RPC — UPDATE CLIENT
-- ============================================================

create or replace function public.update_client(
  p_client_id uuid,
  p_name text,
  p_company_name text default null,
  p_email text default null,
  p_phone text default null,
  p_tax_id text default null,
  p_tax_id_type text default null,
  p_address_line_1 text default null,
  p_address_line_2 text default null,
  p_city text default null,
  p_region text default null,
  p_postal_code text default null,
  p_country_code text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_organization_id uuid;

  v_name text;
  v_tax_id text;
  v_tax_id_type text;
begin
  v_user_id := auth.uid();

  select client.organization_id
    into v_organization_id
  from public.clients as client
  where client.id = p_client_id
    and private.is_active_owner_of_organization(client.organization_id)
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_NOT_FOUND_OR_FORBIDDEN';
  end if;

  v_name := nullif(btrim(p_name), '');
  v_tax_id := nullif(btrim(p_tax_id), '');
  v_tax_id_type := nullif(btrim(p_tax_id_type), '');

  if v_name is null then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_NAME_REQUIRED';
  end if;

  if (v_tax_id is null) <> (v_tax_id_type is null) then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_TAX_ID_PAIR_REQUIRED';
  end if;

  update public.clients
  set
    name = v_name,
    company_name = nullif(btrim(p_company_name), ''),
    email = nullif(btrim(p_email), ''),
    phone = nullif(btrim(p_phone), ''),
    tax_id = v_tax_id,
    tax_id_type = v_tax_id_type,
    address_line_1 = nullif(btrim(p_address_line_1), ''),
    address_line_2 = nullif(btrim(p_address_line_2), ''),
    city = nullif(btrim(p_city), ''),
    region = nullif(btrim(p_region), ''),
    postal_code = nullif(btrim(p_postal_code), ''),
    country_code = nullif(btrim(p_country_code), ''),
    notes = nullif(btrim(p_notes), ''),
    updated_by = v_user_id
  where id = p_client_id;

  insert into public.activity_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    metadata
  )
  values (
    v_organization_id,
    v_user_id,
    'CLIENT',
    p_client_id,
    'UPDATED',
    null
  );

  return p_client_id;
end;
$$;


-- ============================================================
-- 17. RPC — ARCHIVE CLIENT
-- ============================================================

create or replace function public.archive_client(
  p_client_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_organization_id uuid;
  v_archived_at timestamptz;
begin
  v_user_id := auth.uid();

  select
    client.organization_id,
    client.archived_at
    into
      v_organization_id,
      v_archived_at
  from public.clients as client
  where client.id = p_client_id
    and private.is_active_owner_of_organization(client.organization_id)
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_NOT_FOUND_OR_FORBIDDEN';
  end if;

  if v_archived_at is not null then
    return p_client_id;
  end if;

  update public.clients
  set
    archived_at = now(),
    updated_by = v_user_id
  where id = p_client_id;

  insert into public.activity_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    metadata
  )
  values (
    v_organization_id,
    v_user_id,
    'CLIENT',
    p_client_id,
    'ARCHIVED',
    null
  );

  return p_client_id;
end;
$$;


-- ============================================================
-- 18. RPC — ASSIGN CLIENT ACCESS
-- ============================================================

create or replace function public.assign_client_access(
  p_client_id uuid,
  p_membership_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;

  v_organization_id uuid;
  v_membership_organization_id uuid;

  v_target_user_id uuid;
  v_assignment_id uuid;
begin
  v_actor_id := auth.uid();

  select client.organization_id
    into v_organization_id
  from public.clients as client
  where client.id = p_client_id
    and private.is_active_owner_of_organization(client.organization_id)
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_NOT_FOUND_OR_FORBIDDEN';
  end if;

  select
    membership.organization_id,
    membership.user_id
    into
      v_membership_organization_id,
      v_target_user_id
  from public.organization_members as membership
  inner join public.profiles as profile
    on profile.id = membership.user_id
  where membership.id = p_membership_id
    and membership.organization_id = v_organization_id
    and membership.role = 'MEMBER'
    and membership.status = 'ACTIVE'
    and membership.archived_at is null
    and profile.status = 'ACTIVE';

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_ASSIGNMENT_TARGET_INVALID';
  end if;

  if v_membership_organization_id <> v_organization_id then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_ASSIGNMENT_ORGANIZATION_MISMATCH';
  end if;

  insert into public.client_assignments (
    client_id,
    membership_id,
    created_by
  )
  values (
    p_client_id,
    p_membership_id,
    v_actor_id
  )
  on conflict (client_id, membership_id)
  do nothing
  returning id
  into v_assignment_id;

  if v_assignment_id is null then
    select assignment.id
      into v_assignment_id
    from public.client_assignments as assignment
    where assignment.client_id = p_client_id
      and assignment.membership_id = p_membership_id;

    return v_assignment_id;
  end if;

  insert into public.activity_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    metadata
  )
  values (
    v_organization_id,
    v_actor_id,
    'CLIENT',
    p_client_id,
    'ACCESS_GRANTED',
    jsonb_build_object(
      'assignment_id',
      v_assignment_id,
      'membership_id',
      p_membership_id,
      'target_user_id',
      v_target_user_id
    )
  );

  return v_assignment_id;
end;
$$;


-- ============================================================
-- 19. RPC — REMOVE CLIENT ACCESS
-- ============================================================

create or replace function public.remove_client_access(
  p_client_id uuid,
  p_membership_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_organization_id uuid;

  v_assignment_id uuid;
  v_target_user_id uuid;
begin
  v_actor_id := auth.uid();

  select
    assignment.id,
    client.organization_id,
    membership.user_id
    into
      v_assignment_id,
      v_organization_id,
      v_target_user_id
  from public.client_assignments as assignment
  inner join public.clients as client
    on client.id = assignment.client_id
  inner join public.organization_members as membership
    on membership.id = assignment.membership_id
  where assignment.client_id = p_client_id
    and assignment.membership_id = p_membership_id
    and private.is_active_owner_of_organization(client.organization_id)
  for update of assignment;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_ACCESS_NOT_FOUND_OR_FORBIDDEN';
  end if;

  delete from public.client_assignments
  where id = v_assignment_id;

  insert into public.activity_logs (
    organization_id,
    user_id,
    entity_type,
    entity_id,
    action,
    metadata
  )
  values (
    v_organization_id,
    v_actor_id,
    'CLIENT',
    p_client_id,
    'ACCESS_REVOKED',
    jsonb_build_object(
      'assignment_id',
      v_assignment_id,
      'membership_id',
      p_membership_id,
      'target_user_id',
      v_target_user_id
    )
  );

  return v_assignment_id;
end;
$$;


-- ============================================================
-- 20. RPC GRANTS
-- ============================================================

-- add_organization_member

revoke execute
on function public.add_organization_member(text, text)
from public;

revoke execute
on function public.add_organization_member(text, text)
from anon;

revoke execute
on function public.add_organization_member(text, text)
from authenticated;

grant execute
on function public.add_organization_member(text, text)
to authenticated;


-- update_organization_member_role

revoke execute
on function public.update_organization_member_role(uuid, text)
from public;

revoke execute
on function public.update_organization_member_role(uuid, text)
from anon;

revoke execute
on function public.update_organization_member_role(uuid, text)
from authenticated;

grant execute
on function public.update_organization_member_role(uuid, text)
to authenticated;


-- create_client

revoke execute
on function public.create_client(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from public;

revoke execute
on function public.create_client(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from anon;

revoke execute
on function public.create_client(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from authenticated;

grant execute
on function public.create_client(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
to authenticated;


-- update_client

revoke execute
on function public.update_client(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from public;

revoke execute
on function public.update_client(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from anon;

revoke execute
on function public.update_client(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from authenticated;

grant execute
on function public.update_client(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
to authenticated;


-- archive_client

revoke execute
on function public.archive_client(uuid)
from public;

revoke execute
on function public.archive_client(uuid)
from anon;

revoke execute
on function public.archive_client(uuid)
from authenticated;

grant execute
on function public.archive_client(uuid)
to authenticated;


-- assign_client_access

revoke execute
on function public.assign_client_access(uuid, uuid)
from public;

revoke execute
on function public.assign_client_access(uuid, uuid)
from anon;

revoke execute
on function public.assign_client_access(uuid, uuid)
from authenticated;

grant execute
on function public.assign_client_access(uuid, uuid)
to authenticated;


-- remove_client_access

revoke execute
on function public.remove_client_access(uuid, uuid)
from public;

revoke execute
on function public.remove_client_access(uuid, uuid)
from anon;

revoke execute
on function public.remove_client_access(uuid, uuid)
from authenticated;

grant execute
on function public.remove_client_access(uuid, uuid)
to authenticated;


-- ============================================================
-- 21. FIM — SPRINT 02 / CLIENTES & ACESSOS
-- ============================================================