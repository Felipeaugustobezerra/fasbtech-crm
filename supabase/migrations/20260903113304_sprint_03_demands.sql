-- ============================================================
-- FASBtech CRM
-- Sprint 03 — Demandas
-- Migration 003: demands + assignees + tags + access control
-- ============================================================
--
-- Escopo:
--   - demands
--   - demand_assignees
--   - demand_tags
--   - demand_tag_assignments
--   - integridade, RLS, Policies, Grants e RPCs do módulo
--
-- Fora do escopo:
--   - notifications
--   - documents
--   - cron, scheduler ou worker
--   - FTS ou trigram
--   - restauração ou delete físico
-- ============================================================


-- ============================================================
-- 1. CHAVE CANDIDATA DE CLIENTS PARA OWNERSHIP COMPOSTO
-- ============================================================

alter table public.clients
add constraint clients_id_organization_unique
unique (id, organization_id);


-- ============================================================
-- 2. DEMANDS
-- ============================================================

create table public.demands (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,
  client_id uuid not null,

  title text not null,
  description text,

  status text not null default 'OPEN',
  priority text not null default 'MEDIUM',

  start_date date,
  due_date date,
  notes text,

  created_by uuid not null
    references public.profiles(id),

  updated_by uuid not null
    references public.profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,

  constraint demands_client_organization_fkey
    foreign key (client_id, organization_id)
    references public.clients(id, organization_id),

  constraint demands_title_not_empty
    check (btrim(title) <> ''),

  constraint demands_status_check
    check (
      status in (
        'OPEN',
        'IN_PROGRESS',
        'WAITING_CLIENT',
        'REVIEW',
        'COMPLETED',
        'CANCELED'
      )
    ),

  constraint demands_priority_check
    check (
      priority in (
        'LOW',
        'MEDIUM',
        'HIGH',
        'URGENT'
      )
    )
);


-- ============================================================
-- 3. DEMAND ASSIGNEES
-- ============================================================

create table public.demand_assignees (
  id uuid primary key default gen_random_uuid(),

  demand_id uuid not null
    references public.demands(id),

  membership_id uuid not null
    references public.organization_members(id),

  created_by uuid not null
    references public.profiles(id),

  created_at timestamptz not null default now(),

  constraint demand_assignees_unique
    unique (demand_id, membership_id)
);


-- ============================================================
-- 4. DEMAND TAGS
-- ============================================================

create table public.demand_tags (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id),

  name text not null,

  created_by uuid not null
    references public.profiles(id),

  created_at timestamptz not null default now(),

  constraint demand_tags_name_not_empty
    check (btrim(name) <> ''),

  constraint demand_tags_name_trimmed
    check (name = btrim(name))
);


-- ============================================================
-- 5. DEMAND TAG ASSIGNMENTS
-- ============================================================

create table public.demand_tag_assignments (
  demand_id uuid not null
    references public.demands(id),

  tag_id uuid not null
    references public.demand_tags(id),

  created_at timestamptz not null default now(),

  constraint demand_tag_assignments_pkey
    primary key (demand_id, tag_id)
);


-- ============================================================
-- 6. ÍNDICES CONGELADOS
-- ============================================================

create index demands_client_organization_idx
  on public.demands (client_id, organization_id);

create index demands_active_organization_updated_idx
  on public.demands (organization_id, updated_at, id)
  where archived_at is null;

create index demands_active_client_updated_idx
  on public.demands (client_id, updated_at, id)
  where archived_at is null;

create index demands_active_organization_status_updated_idx
  on public.demands (organization_id, status, updated_at, id)
  where archived_at is null;

create index demands_active_organization_priority_updated_idx
  on public.demands (organization_id, priority, updated_at, id)
  where archived_at is null;

create index demands_active_organization_due_date_idx
  on public.demands (organization_id, due_date, id)
  where archived_at is null
    and due_date is not null;

create index demand_assignees_membership_idx
  on public.demand_assignees (membership_id);

create unique index demand_tags_organization_normalized_name_idx
  on public.demand_tags (
    organization_id,
    lower(btrim(name))
  );

create index demand_tag_assignments_tag_idx
  on public.demand_tag_assignments (tag_id);


-- ============================================================
-- 7. HELPERS DE AUTORIZAÇÃO E INTEGRIDADE
-- ============================================================

create or replace function private.is_eligible_demand_assignee(
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
    inner join public.organization_members as membership
      on membership.id = p_membership_id
     and membership.organization_id = client.organization_id
    inner join public.profiles as profile
      on profile.id = membership.user_id
    where client.id = p_client_id
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


create or replace function private.can_access_demand(
  p_demand_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.demands as demand
    inner join public.clients as client
      on client.id = demand.client_id
     and client.organization_id = demand.organization_id
    inner join public.organizations as organization
      on organization.id = demand.organization_id
    inner join public.organization_members as membership
      on membership.organization_id = demand.organization_id
    inner join public.profiles as profile
      on profile.id = membership.user_id
    where demand.id = p_demand_id
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


create or replace function private.can_access_demand_tag(
  p_tag_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.demand_tags as tag
    where tag.id = p_tag_id
      and (
        private.is_active_owner_of_organization(tag.organization_id)
        or exists (
          select 1
          from public.demand_tag_assignments as assignment
          where assignment.tag_id = tag.id
            and private.can_access_demand(assignment.demand_id)
        )
      )
  );
$$;


create or replace function private.can_access_demand_log(
  p_organization_id uuid,
  p_demand_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.demands as demand
    where demand.id = p_demand_id
      and demand.organization_id = p_organization_id
      and private.can_access_demand(demand.id)
  );
$$;


create or replace function private.require_demand_client_access(
  p_client_id uuid
)
returns table (
  actor_id uuid,
  organization_id uuid,
  membership_id uuid,
  actor_role text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using
      errcode = 'P0001',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  return query
  select
    profile.id,
    client.organization_id,
    membership.id,
    membership.role::text
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
  limit 1;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'CLIENT_NOT_FOUND_OR_FORBIDDEN';
  end if;
end;
$$;


create or replace function private.require_demand_access(
  p_demand_id uuid,
  p_owner_only boolean default false
)
returns table (
  actor_id uuid,
  organization_id uuid,
  client_id uuid,
  membership_id uuid,
  actor_role text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using
      errcode = 'P0001',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  return query
  select
    profile.id,
    demand.organization_id,
    demand.client_id,
    membership.id,
    membership.role::text
  from public.demands as demand
  inner join public.clients as client
    on client.id = demand.client_id
   and client.organization_id = demand.organization_id
  inner join public.organizations as organization
    on organization.id = demand.organization_id
  inner join public.organization_members as membership
    on membership.organization_id = demand.organization_id
  inner join public.profiles as profile
    on profile.id = membership.user_id
  where demand.id = p_demand_id
    and membership.user_id = (select auth.uid())
    and membership.status = 'ACTIVE'
    and membership.archived_at is null
    and profile.status = 'ACTIVE'
    and organization.status = 'ACTIVE'
    and organization.archived_at is null
    and (
      membership.role = 'OWNER'
      or (
        not p_owner_only
        and membership.role = 'MEMBER'
        and exists (
          select 1
          from public.client_assignments as assignment
          where assignment.client_id = client.id
            and assignment.membership_id = membership.id
        )
      )
    )
  for update of demand;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_NOT_FOUND_OR_FORBIDDEN';
  end if;
end;
$$;


create or replace function private.enforce_demand_ownership_immutable()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.client_id is distinct from old.client_id
     or new.organization_id is distinct from old.organization_id then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_OWNERSHIP_IMMUTABLE';
  end if;

  return new;
end;
$$;


create or replace function private.enforce_demand_assignee_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
begin
  select demand.client_id
    into v_client_id
  from public.demands as demand
  where demand.id = new.demand_id;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_NOT_FOUND';
  end if;

  if not private.is_eligible_demand_assignee(
    v_client_id,
    new.membership_id
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_ASSIGNEE_INVALID';
  end if;

  return new;
end;
$$;


create or replace function private.enforce_demand_tag_organization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_demand_organization_id uuid;
  v_tag_organization_id uuid;
begin
  select demand.organization_id
    into v_demand_organization_id
  from public.demands as demand
  where demand.id = new.demand_id;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_NOT_FOUND';
  end if;

  select tag.organization_id
    into v_tag_organization_id
  from public.demand_tags as tag
  where tag.id = new.tag_id;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_TAG_NOT_FOUND';
  end if;

  if v_demand_organization_id <> v_tag_organization_id then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_TAG_ORGANIZATION_MISMATCH';
  end if;

  return new;
end;
$$;


-- Helpers internos não são APIs públicas.

revoke execute on function private.is_eligible_demand_assignee(uuid, uuid)
from public, anon, authenticated;

revoke execute on function private.require_demand_client_access(uuid)
from public, anon, authenticated;

revoke execute on function private.require_demand_access(uuid, boolean)
from public, anon, authenticated;

revoke execute on function private.enforce_demand_ownership_immutable()
from public, anon, authenticated;

revoke execute on function private.enforce_demand_assignee_integrity()
from public, anon, authenticated;

revoke execute on function private.enforce_demand_tag_organization()
from public, anon, authenticated;


-- Helpers invocados pelas Policies.

revoke execute on function private.can_access_demand(uuid)
from public, anon, authenticated;

grant execute on function private.can_access_demand(uuid)
to authenticated;

revoke execute on function private.can_access_demand_tag(uuid)
from public, anon, authenticated;

grant execute on function private.can_access_demand_tag(uuid)
to authenticated;

revoke execute on function private.can_access_demand_log(uuid, uuid)
from public, anon, authenticated;

grant execute on function private.can_access_demand_log(uuid, uuid)
to authenticated;


-- ============================================================
-- 8. TRIGGERS
-- ============================================================

create trigger demands_ownership_immutable
before update on public.demands
for each row
execute function private.enforce_demand_ownership_immutable();

create trigger demands_set_updated_at
before update on public.demands
for each row
execute function private.set_updated_at();

create trigger demand_assignees_enforce_integrity
before insert or update on public.demand_assignees
for each row
execute function private.enforce_demand_assignee_integrity();

create trigger demand_tag_assignments_enforce_organization
before insert or update on public.demand_tag_assignments
for each row
execute function private.enforce_demand_tag_organization();


-- ============================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================

alter table public.demands
enable row level security;

alter table public.demand_assignees
enable row level security;

alter table public.demand_tags
enable row level security;

alter table public.demand_tag_assignments
enable row level security;


create policy demands_select_authorized
on public.demands
for select
to authenticated
using (
  (select private.can_access_demand(demands.id))
);


create policy demand_assignees_select_authorized
on public.demand_assignees
for select
to authenticated
using (
  (select private.can_access_demand(demand_assignees.demand_id))
);


create policy demand_tags_select_authorized
on public.demand_tags
for select
to authenticated
using (
  (select private.can_access_demand_tag(demand_tags.id))
);


create policy demand_tag_assignments_select_authorized
on public.demand_tag_assignments
for select
to authenticated
using (
  (select private.can_access_demand(demand_tag_assignments.demand_id))
);


create policy activity_logs_select_authorized_demand
on public.activity_logs
for select
to authenticated
using (
  activity_logs.entity_type = 'DEMAND'
  and activity_logs.action in (
    'CREATED',
    'UPDATED',
    'STATUS_CHANGED',
    'ARCHIVED'
  )
  and (
    select private.can_access_demand_log(
      activity_logs.organization_id,
      activity_logs.entity_id
    )
  )
);


-- ============================================================
-- 10. GRANTS DAS TABELAS
-- ============================================================

revoke all on public.demands
from anon, authenticated;

revoke all on public.demand_assignees
from anon, authenticated;

revoke all on public.demand_tags
from anon, authenticated;

revoke all on public.demand_tag_assignments
from anon, authenticated;

grant select on public.demands
to authenticated;

grant select on public.demand_assignees
to authenticated;

grant select on public.demand_tags
to authenticated;

grant select on public.demand_tag_assignments
to authenticated;


-- ============================================================
-- 11. RPC — CREATE DEMAND
-- ============================================================

create or replace function public.create_demand(
  p_client_id uuid,
  p_title text,
  p_description text default null,
  p_priority text default null,
  p_start_date date default null,
  p_due_date date default null,
  p_notes text default null,
  p_assignee_membership_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_organization_id uuid;

  v_title text;
  v_priority text;
  v_assignee_ids uuid[];
  v_demand_id uuid;
begin
  select
    access.actor_id,
    access.organization_id
    into
      v_actor_id,
      v_organization_id
  from private.require_demand_client_access(p_client_id) as access;

  v_title := nullif(btrim(p_title), '');
  v_priority := coalesce(
    nullif(upper(btrim(p_priority)), ''),
    'MEDIUM'
  );
  v_assignee_ids := coalesce(
    p_assignee_membership_ids,
    '{}'::uuid[]
  );

  if v_title is null then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_TITLE_REQUIRED';
  end if;

  if v_priority not in ('LOW', 'MEDIUM', 'HIGH', 'URGENT') then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_PRIORITY_INVALID';
  end if;

  if exists (
    select 1
    from unnest(v_assignee_ids) as requested(membership_id)
    where requested.membership_id is null
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_ASSIGNEE_INVALID';
  end if;

  if cardinality(v_assignee_ids) <> (
    select count(distinct requested.membership_id)
    from unnest(v_assignee_ids) as requested(membership_id)
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_ASSIGNEES_DUPLICATED';
  end if;

  if exists (
    select 1
    from unnest(v_assignee_ids) as requested(membership_id)
    where not private.is_eligible_demand_assignee(
      p_client_id,
      requested.membership_id
    )
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_ASSIGNEE_INVALID';
  end if;

  insert into public.demands (
    organization_id,
    client_id,
    title,
    description,
    priority,
    start_date,
    due_date,
    notes,
    created_by,
    updated_by
  )
  values (
    v_organization_id,
    p_client_id,
    v_title,
    nullif(btrim(p_description), ''),
    v_priority,
    p_start_date,
    p_due_date,
    nullif(btrim(p_notes), ''),
    v_actor_id,
    v_actor_id
  )
  returning id
  into v_demand_id;

  insert into public.demand_assignees (
    demand_id,
    membership_id,
    created_by
  )
  select
    v_demand_id,
    requested.membership_id,
    v_actor_id
  from unnest(v_assignee_ids) as requested(membership_id);

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
    'DEMAND',
    v_demand_id,
    'CREATED',
    null
  );

  return v_demand_id;
end;
$$;


-- ============================================================
-- 12. RPC — UPDATE DEMAND
-- ============================================================

create or replace function public.update_demand(
  p_demand_id uuid,
  p_title text,
  p_description text default null,
  p_priority text default null,
  p_start_date date default null,
  p_due_date date default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_organization_id uuid;

  v_title text;
  v_priority text;
begin
  select
    access.actor_id,
    access.organization_id
    into
      v_actor_id,
      v_organization_id
  from private.require_demand_access(p_demand_id) as access;

  v_title := nullif(btrim(p_title), '');
  v_priority := coalesce(
    nullif(upper(btrim(p_priority)), ''),
    'MEDIUM'
  );

  if v_title is null then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_TITLE_REQUIRED';
  end if;

  if v_priority not in ('LOW', 'MEDIUM', 'HIGH', 'URGENT') then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_PRIORITY_INVALID';
  end if;

  update public.demands
  set
    title = v_title,
    description = nullif(btrim(p_description), ''),
    priority = v_priority,
    start_date = p_start_date,
    due_date = p_due_date,
    notes = nullif(btrim(p_notes), ''),
    updated_by = v_actor_id
  where id = p_demand_id;

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
    'DEMAND',
    p_demand_id,
    'UPDATED',
    null
  );

  return p_demand_id;
end;
$$;


-- ============================================================
-- 13. RPC — CHANGE DEMAND STATUS
-- ============================================================

create or replace function public.change_demand_status(
  p_demand_id uuid,
  p_status text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_organization_id uuid;

  v_old_status text;
  v_new_status text;
begin
  select
    access.actor_id,
    access.organization_id
    into
      v_actor_id,
      v_organization_id
  from private.require_demand_access(p_demand_id) as access;

  v_new_status := upper(btrim(p_status));

  if v_new_status is null
     or v_new_status not in (
    'OPEN',
    'IN_PROGRESS',
    'WAITING_CLIENT',
    'REVIEW',
    'COMPLETED',
    'CANCELED'
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_STATUS_INVALID';
  end if;

  select demand.status
    into v_old_status
  from public.demands as demand
  where demand.id = p_demand_id;

  if v_old_status = v_new_status then
    return p_demand_id;
  end if;

  update public.demands
  set
    status = v_new_status,
    updated_by = v_actor_id
  where id = p_demand_id;

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
    'DEMAND',
    p_demand_id,
    'STATUS_CHANGED',
    jsonb_build_object(
      'old_status',
      v_old_status,
      'new_status',
      v_new_status
    )
  );

  return p_demand_id;
end;
$$;


-- ============================================================
-- 14. RPC — SET DEMAND ASSIGNEES
-- ============================================================

create or replace function public.set_demand_assignees(
  p_demand_id uuid,
  p_membership_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_organization_id uuid;
  v_client_id uuid;

  v_membership_ids uuid[];
  v_existing_ids uuid[];
  v_added_ids uuid[];
  v_removed_ids uuid[];
begin
  select
    access.actor_id,
    access.organization_id,
    access.client_id
    into
      v_actor_id,
      v_organization_id,
      v_client_id
  from private.require_demand_access(p_demand_id) as access;

  v_membership_ids := coalesce(p_membership_ids, '{}'::uuid[]);

  if exists (
    select 1
    from unnest(v_membership_ids) as requested(membership_id)
    where requested.membership_id is null
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_ASSIGNEE_INVALID';
  end if;

  if cardinality(v_membership_ids) <> (
    select count(distinct requested.membership_id)
    from unnest(v_membership_ids) as requested(membership_id)
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_ASSIGNEES_DUPLICATED';
  end if;

  select coalesce(
    array_agg(assignee.membership_id order by assignee.membership_id),
    '{}'::uuid[]
  )
    into v_existing_ids
  from public.demand_assignees as assignee
  where assignee.demand_id = p_demand_id;

  if exists (
    select 1
    from unnest(v_membership_ids) as requested(membership_id)
    where not (requested.membership_id = any(v_existing_ids))
      and not private.is_eligible_demand_assignee(
        v_client_id,
        requested.membership_id
      )
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_ASSIGNEE_INVALID';
  end if;

  select coalesce(
    array_agg(delta.membership_id order by delta.membership_id),
    '{}'::uuid[]
  )
    into v_added_ids
  from (
    select requested.membership_id
    from unnest(v_membership_ids) as requested(membership_id)
    except
    select existing.membership_id
    from unnest(v_existing_ids) as existing(membership_id)
  ) as delta;

  select coalesce(
    array_agg(delta.membership_id order by delta.membership_id),
    '{}'::uuid[]
  )
    into v_removed_ids
  from (
    select existing.membership_id
    from unnest(v_existing_ids) as existing(membership_id)
    except
    select requested.membership_id
    from unnest(v_membership_ids) as requested(membership_id)
  ) as delta;

  if cardinality(v_added_ids) = 0
     and cardinality(v_removed_ids) = 0 then
    return p_demand_id;
  end if;

  delete from public.demand_assignees
  where demand_id = p_demand_id
    and not (membership_id = any(v_membership_ids));

  insert into public.demand_assignees (
    demand_id,
    membership_id,
    created_by
  )
  select
    p_demand_id,
    added.membership_id,
    v_actor_id
  from unnest(v_added_ids) as added(membership_id);

  update public.demands
  set updated_by = v_actor_id
  where id = p_demand_id;

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
    'DEMAND',
    p_demand_id,
    'UPDATED',
    jsonb_build_object(
      'assignee_membership_ids_added',
      to_jsonb(v_added_ids),
      'assignee_membership_ids_removed',
      to_jsonb(v_removed_ids)
    )
  );

  return p_demand_id;
end;
$$;


-- ============================================================
-- 15. RPC — SET DEMAND TAGS
-- ============================================================

create or replace function public.set_demand_tags(
  p_demand_id uuid,
  p_tag_ids uuid[],
  p_new_tag_names text[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_organization_id uuid;

  v_tag_ids uuid[];
  v_new_tag_names text[];
  v_desired_tag_ids uuid[];
  v_existing_tag_ids uuid[];
  v_added_tag_ids uuid[];
  v_removed_tag_ids uuid[];

  v_tag_name text;
  v_tag_id uuid;
begin
  select
    access.actor_id,
    access.organization_id
    into
      v_actor_id,
      v_organization_id
  from private.require_demand_access(p_demand_id) as access;

  v_tag_ids := coalesce(p_tag_ids, '{}'::uuid[]);
  v_new_tag_names := coalesce(p_new_tag_names, '{}'::text[]);

  if exists (
    select 1
    from unnest(v_tag_ids) as requested(tag_id)
    where requested.tag_id is null
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_TAG_INVALID';
  end if;

  if cardinality(v_tag_ids) <> (
    select count(distinct requested.tag_id)
    from unnest(v_tag_ids) as requested(tag_id)
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_TAG_IDS_DUPLICATED';
  end if;

  if exists (
    select 1
    from unnest(v_new_tag_names) as requested(name)
    where nullif(btrim(requested.name), '') is null
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_TAG_NAME_REQUIRED';
  end if;

  if cardinality(v_new_tag_names) <> (
    select count(distinct lower(btrim(requested.name)))
    from unnest(v_new_tag_names) as requested(name)
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_TAG_NAMES_DUPLICATED';
  end if;

  if (
    select count(*)
    from public.demand_tags as tag
    where tag.id = any(v_tag_ids)
      and tag.organization_id = v_organization_id
  ) <> cardinality(v_tag_ids) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_TAG_INVALID';
  end if;

  v_desired_tag_ids := v_tag_ids;

  for v_tag_name in
    select btrim(requested.name)
    from unnest(v_new_tag_names) as requested(name)
    order by lower(btrim(requested.name))
  loop
    insert into public.demand_tags (
      organization_id,
      name,
      created_by
    )
    values (
      v_organization_id,
      v_tag_name,
      v_actor_id
    )
    on conflict (
      organization_id,
      lower(btrim(name))
    ) do nothing;

    select tag.id
      into v_tag_id
    from public.demand_tags as tag
    where tag.organization_id = v_organization_id
      and lower(btrim(tag.name)) = lower(v_tag_name);

    if not found then
      raise exception using
        errcode = 'P0001',
        message = 'DEMAND_TAG_RESOLUTION_FAILED';
    end if;

    v_desired_tag_ids := array_append(
      v_desired_tag_ids,
      v_tag_id
    );
  end loop;

  select coalesce(
    array_agg(distinct desired.tag_id order by desired.tag_id),
    '{}'::uuid[]
  )
    into v_desired_tag_ids
  from unnest(v_desired_tag_ids) as desired(tag_id);

  select coalesce(
    array_agg(assignment.tag_id order by assignment.tag_id),
    '{}'::uuid[]
  )
    into v_existing_tag_ids
  from public.demand_tag_assignments as assignment
  where assignment.demand_id = p_demand_id;

  select coalesce(
    array_agg(delta.tag_id order by delta.tag_id),
    '{}'::uuid[]
  )
    into v_added_tag_ids
  from (
    select desired.tag_id
    from unnest(v_desired_tag_ids) as desired(tag_id)
    except
    select existing.tag_id
    from unnest(v_existing_tag_ids) as existing(tag_id)
  ) as delta;

  select coalesce(
    array_agg(delta.tag_id order by delta.tag_id),
    '{}'::uuid[]
  )
    into v_removed_tag_ids
  from (
    select existing.tag_id
    from unnest(v_existing_tag_ids) as existing(tag_id)
    except
    select desired.tag_id
    from unnest(v_desired_tag_ids) as desired(tag_id)
  ) as delta;

  if cardinality(v_added_tag_ids) = 0
     and cardinality(v_removed_tag_ids) = 0 then
    return p_demand_id;
  end if;

  delete from public.demand_tag_assignments
  where demand_id = p_demand_id
    and not (tag_id = any(v_desired_tag_ids));

  insert into public.demand_tag_assignments (
    demand_id,
    tag_id
  )
  select
    p_demand_id,
    added.tag_id
  from unnest(v_added_tag_ids) as added(tag_id);

  update public.demands
  set updated_by = v_actor_id
  where id = p_demand_id;

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
    'DEMAND',
    p_demand_id,
    'UPDATED',
    jsonb_build_object(
      'tag_ids_added',
      to_jsonb(v_added_tag_ids),
      'tag_ids_removed',
      to_jsonb(v_removed_tag_ids)
    )
  );

  return p_demand_id;
end;
$$;


-- ============================================================
-- 16. RPC — ARCHIVE DEMAND
-- ============================================================

create or replace function public.archive_demand(
  p_demand_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_organization_id uuid;
  v_archived_at timestamptz;
begin
  select
    access.actor_id,
    access.organization_id
    into
      v_actor_id,
      v_organization_id
  from private.require_demand_access(
    p_demand_id,
    true
  ) as access;

  select demand.archived_at
    into v_archived_at
  from public.demands as demand
  where demand.id = p_demand_id;

  if v_archived_at is not null then
    return p_demand_id;
  end if;

  update public.demands
  set
    archived_at = now(),
    updated_by = v_actor_id
  where id = p_demand_id;

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
    'DEMAND',
    p_demand_id,
    'ARCHIVED',
    null
  );

  return p_demand_id;
end;
$$;


-- ============================================================
-- 17. RPCs DE LEITURA MÍNIMA
-- ============================================================

create or replace function public.list_eligible_demand_assignees(
  p_client_id uuid
)
returns table (
  membership_id uuid,
  full_name text,
  role text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_organization_id uuid;
begin
  select
    access.organization_id
    into
      v_organization_id
  from private.require_demand_client_access(p_client_id) as access;

  return query
  select
    membership.id,
    profile.full_name::text,
    membership.role::text
  from public.organization_members as membership
  inner join public.profiles as profile
    on profile.id = membership.user_id
  where membership.organization_id = v_organization_id
    and private.is_eligible_demand_assignee(
      p_client_id,
      membership.id
    )
  order by profile.full_name, membership.id;
end;
$$;


create or replace function public.list_demand_assignees(
  p_demand_id uuid
)
returns table (
  membership_id uuid,
  full_name text,
  role text,
  is_currently_eligible boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_client_id uuid;
begin
  if not private.can_access_demand(p_demand_id) then
    raise exception using
      errcode = 'P0001',
      message = 'DEMAND_NOT_FOUND_OR_FORBIDDEN';
  end if;

  select demand.client_id
    into v_client_id
  from public.demands as demand
  where demand.id = p_demand_id;

  return query
  select
    membership.id,
    profile.full_name::text,
    membership.role::text,
    private.is_eligible_demand_assignee(
      v_client_id,
      membership.id
    )
  from public.demand_assignees as assignee
  inner join public.organization_members as membership
    on membership.id = assignee.membership_id
  inner join public.profiles as profile
    on profile.id = membership.user_id
  where assignee.demand_id = p_demand_id
  order by profile.full_name, membership.id;
end;
$$;


-- ============================================================
-- 18. GRANTS DAS RPCs
-- ============================================================

revoke execute on function public.create_demand(
  uuid,
  text,
  text,
  text,
  date,
  date,
  text,
  uuid[]
)
from public, anon, authenticated;

grant execute on function public.create_demand(
  uuid,
  text,
  text,
  text,
  date,
  date,
  text,
  uuid[]
)
to authenticated;


revoke execute on function public.update_demand(
  uuid,
  text,
  text,
  text,
  date,
  date,
  text
)
from public, anon, authenticated;

grant execute on function public.update_demand(
  uuid,
  text,
  text,
  text,
  date,
  date,
  text
)
to authenticated;


revoke execute on function public.change_demand_status(uuid, text)
from public, anon, authenticated;

grant execute on function public.change_demand_status(uuid, text)
to authenticated;


revoke execute on function public.set_demand_assignees(uuid, uuid[])
from public, anon, authenticated;

grant execute on function public.set_demand_assignees(uuid, uuid[])
to authenticated;


revoke execute on function public.set_demand_tags(uuid, uuid[], text[])
from public, anon, authenticated;

grant execute on function public.set_demand_tags(uuid, uuid[], text[])
to authenticated;


revoke execute on function public.archive_demand(uuid)
from public, anon, authenticated;

grant execute on function public.archive_demand(uuid)
to authenticated;


revoke execute on function public.list_eligible_demand_assignees(uuid)
from public, anon, authenticated;

grant execute on function public.list_eligible_demand_assignees(uuid)
to authenticated;


revoke execute on function public.list_demand_assignees(uuid)
from public, anon, authenticated;

grant execute on function public.list_demand_assignees(uuid)
to authenticated;


-- ============================================================
-- 19. FIM — SPRINT 03 / DEMANDAS
-- ============================================================
