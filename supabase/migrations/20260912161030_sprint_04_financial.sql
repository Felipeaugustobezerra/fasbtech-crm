-- FASBtech CRM — Sprint 04 Financeiro

create table public.financial_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  client_id uuid,
  type text not null,
  status text not null default 'PENDING',
  payment_nature text not null default 'ONE_TIME',
  description text not null,
  category text,
  amount numeric(12,2) not null,
  reference_date date not null,
  due_date date,
  realized_date date,
  notes text,
  created_by uuid not null references public.profiles(id),
  updated_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint financial_entries_client_organization_fkey
    foreign key (client_id, organization_id)
    references public.clients(id, organization_id),
  constraint financial_entries_type_check
    check (type in ('INCOME', 'EXPENSE')),
  constraint financial_entries_status_check
    check (status in ('PENDING', 'REALIZED', 'CANCELED')),
  constraint financial_entries_payment_nature_check
    check (payment_nature in ('ONE_TIME', 'RECURRING')),
  constraint financial_entries_description_not_empty
    check (btrim(description) <> ''),
  constraint financial_entries_description_trimmed
    check (description = btrim(description)),
  constraint financial_entries_category_normalized
    check (category is null or (category = btrim(category) and category <> '')),
  constraint financial_entries_amount_positive
    check (amount > 0),
  constraint financial_entries_realization_check
    check (
      (status = 'PENDING' and realized_date is null)
      or (status = 'REALIZED' and realized_date is not null)
      or status = 'CANCELED'
    )
);

create table public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  year integer not null,
  month integer not null,
  target_amount numeric(12,2) not null,
  created_by uuid not null references public.profiles(id),
  updated_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint financial_goals_period_unique unique (organization_id, year, month),
  constraint financial_goals_year_positive check (year > 0),
  constraint financial_goals_month_check check (month between 1 and 12),
  constraint financial_goals_target_positive check (target_amount > 0)
);

create index financial_entries_active_org_reference_idx
  on public.financial_entries (organization_id, reference_date desc, id desc)
  where archived_at is null;

create index financial_entries_active_org_status_reference_idx
  on public.financial_entries (organization_id, status, reference_date desc, id desc)
  where archived_at is null;

create index financial_entries_active_org_client_reference_idx
  on public.financial_entries (organization_id, client_id, reference_date desc, id desc)
  where archived_at is null and client_id is not null;

create index financial_entries_realized_org_date_type_idx
  on public.financial_entries (organization_id, realized_date, type)
  where status = 'REALIZED';

create or replace function private.enforce_financial_entry_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
     or new.organization_id is distinct from old.organization_id
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_ENTRY_IMMUTABLE_FIELDS';
  end if;
  return new;
end;
$$;

create or replace function private.enforce_financial_goal_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
     or new.organization_id is distinct from old.organization_id
     or new.year is distinct from old.year
     or new.month is distinct from old.month
     or new.created_by is distinct from old.created_by
     or new.created_at is distinct from old.created_at then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_GOAL_IMMUTABLE_FIELDS';
  end if;
  return new;
end;
$$;

revoke execute on function private.enforce_financial_entry_immutable() from public, anon, authenticated;
revoke execute on function private.enforce_financial_goal_immutable() from public, anon, authenticated;

create trigger financial_entries_immutable
before update on public.financial_entries
for each row execute function private.enforce_financial_entry_immutable();

create trigger financial_entries_set_updated_at
before update on public.financial_entries
for each row execute function private.set_updated_at();

create trigger financial_goals_immutable
before update on public.financial_goals
for each row execute function private.enforce_financial_goal_immutable();

create trigger financial_goals_set_updated_at
before update on public.financial_goals
for each row execute function private.set_updated_at();

alter table public.financial_entries enable row level security;
alter table public.financial_goals enable row level security;

create policy financial_entries_select_owner
on public.financial_entries for select to authenticated
using ((select private.is_active_owner_of_organization(financial_entries.organization_id)));

create policy financial_goals_select_owner
on public.financial_goals for select to authenticated
using ((select private.is_active_owner_of_organization(financial_goals.organization_id)));

revoke all on public.financial_entries from anon, authenticated;
revoke all on public.financial_goals from anon, authenticated;
grant select on public.financial_entries to authenticated;
grant select on public.financial_goals to authenticated;

create or replace function public.create_financial_entry(
  p_type text,
  p_description text,
  p_amount numeric,
  p_reference_date date,
  p_client_id uuid default null,
  p_payment_nature text default 'ONE_TIME',
  p_category text default null,
  p_due_date date default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_organization_id uuid;
  v_entry_id uuid;
  v_type text := upper(btrim(p_type));
  v_nature text := upper(btrim(p_payment_nature));
  v_description text := nullif(btrim(p_description), '');
begin
  v_organization_id := private.require_active_owner_organization();
  if v_type is null or v_type not in ('INCOME', 'EXPENSE') then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_TYPE_INVALID';
  end if;
  if v_nature is null or v_nature not in ('ONE_TIME', 'RECURRING') then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_PAYMENT_NATURE_INVALID';
  end if;
  if v_description is null then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_DESCRIPTION_REQUIRED';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_AMOUNT_INVALID';
  end if;
  if p_reference_date is null then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_REFERENCE_DATE_REQUIRED';
  end if;
  if p_client_id is not null and not exists (
    select 1 from public.clients as client
    where client.id = p_client_id and client.organization_id = v_organization_id
  ) then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_CLIENT_INVALID';
  end if;

  insert into public.financial_entries (
    organization_id, client_id, type, payment_nature, description, category,
    amount, reference_date, due_date, notes, created_by, updated_by
  ) values (
    v_organization_id, p_client_id, v_type, v_nature, v_description,
    nullif(btrim(p_category), ''), p_amount, p_reference_date, p_due_date,
    nullif(btrim(p_notes), ''), v_actor_id, v_actor_id
  ) returning id into v_entry_id;

  insert into public.activity_logs (organization_id, user_id, entity_type, entity_id, action, metadata)
  values (v_organization_id, v_actor_id, 'FINANCIAL_ENTRY', v_entry_id, 'CREATED', null);
  return v_entry_id;
end;
$$;

create or replace function public.update_financial_entry(
  p_entry_id uuid,
  p_type text,
  p_description text,
  p_amount numeric,
  p_reference_date date,
  p_client_id uuid default null,
  p_payment_nature text default 'ONE_TIME',
  p_category text default null,
  p_due_date date default null,
  p_notes text default null
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_organization_id uuid;
  v_type text := upper(btrim(p_type));
  v_nature text := upper(btrim(p_payment_nature));
  v_description text := nullif(btrim(p_description), '');
begin
  select entry.organization_id into v_organization_id
  from public.financial_entries as entry
  where entry.id = p_entry_id
    and entry.archived_at is null
    and private.is_active_owner_of_organization(entry.organization_id)
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_ENTRY_NOT_FOUND_OR_FORBIDDEN';
  end if;
  if v_type is null or v_type not in ('INCOME', 'EXPENSE') then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_TYPE_INVALID';
  end if;
  if v_nature is null or v_nature not in ('ONE_TIME', 'RECURRING') then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_PAYMENT_NATURE_INVALID';
  end if;
  if v_description is null then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_DESCRIPTION_REQUIRED';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_AMOUNT_INVALID';
  end if;
  if p_reference_date is null then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_REFERENCE_DATE_REQUIRED';
  end if;
  if p_client_id is not null and not exists (
    select 1 from public.clients as client
    where client.id = p_client_id and client.organization_id = v_organization_id
  ) then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_CLIENT_INVALID';
  end if;

  update public.financial_entries set
    client_id = p_client_id, type = v_type, payment_nature = v_nature,
    description = v_description, category = nullif(btrim(p_category), ''),
    amount = p_amount, reference_date = p_reference_date, due_date = p_due_date,
    notes = nullif(btrim(p_notes), ''), updated_by = v_actor_id
  where id = p_entry_id;
  insert into public.activity_logs (organization_id, user_id, entity_type, entity_id, action, metadata)
  values (v_organization_id, v_actor_id, 'FINANCIAL_ENTRY', p_entry_id, 'UPDATED', null);
  return p_entry_id;
end;
$$;

create or replace function public.change_financial_entry_status(
  p_entry_id uuid,
  p_status text,
  p_realized_date date default null
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_organization_id uuid;
  v_old_status text;
  v_old_realized_date date;
  v_new_status text := upper(btrim(p_status));
  v_new_realized_date date;
begin
  select entry.organization_id, entry.status, entry.realized_date
    into v_organization_id, v_old_status, v_old_realized_date
  from public.financial_entries as entry
  where entry.id = p_entry_id
    and entry.archived_at is null
    and private.is_active_owner_of_organization(entry.organization_id)
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_ENTRY_NOT_FOUND_OR_FORBIDDEN';
  end if;
  if v_new_status is null or v_new_status not in ('PENDING', 'REALIZED', 'CANCELED') then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_STATUS_INVALID';
  end if;
  if v_new_status = 'REALIZED' then
    if p_realized_date is null then
      raise exception using errcode = 'P0001', message = 'FINANCIAL_REALIZED_DATE_REQUIRED';
    end if;
    v_new_realized_date := p_realized_date;
  elsif v_new_status = 'CANCELED' then
    if p_realized_date is not null then
      raise exception using errcode = 'P0001', message = 'FINANCIAL_REALIZED_DATE_NOT_ALLOWED';
    end if;
    v_new_realized_date := v_old_realized_date;
  else
    v_new_realized_date := null;
  end if;
  if v_old_status = v_new_status and v_old_realized_date is not distinct from v_new_realized_date then
    return p_entry_id;
  end if;
  update public.financial_entries set status = v_new_status,
    realized_date = v_new_realized_date, updated_by = v_actor_id
  where id = p_entry_id;
  insert into public.activity_logs (organization_id, user_id, entity_type, entity_id, action, metadata)
  values (v_organization_id, v_actor_id, 'FINANCIAL_ENTRY', p_entry_id, 'STATUS_CHANGED',
    jsonb_build_object('old_status', v_old_status, 'new_status', v_new_status,
      'old_realized_date', v_old_realized_date, 'new_realized_date', v_new_realized_date));
  return p_entry_id;
end;
$$;

create or replace function public.archive_financial_entry(p_entry_id uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_organization_id uuid;
  v_archived_at timestamptz;
begin
  select entry.organization_id, entry.archived_at into v_organization_id, v_archived_at
  from public.financial_entries as entry
  where entry.id = p_entry_id
    and private.is_active_owner_of_organization(entry.organization_id)
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_ENTRY_NOT_FOUND_OR_FORBIDDEN';
  end if;
  if v_archived_at is not null then return p_entry_id; end if;
  update public.financial_entries set archived_at = now(), updated_by = v_actor_id where id = p_entry_id;
  insert into public.activity_logs (organization_id, user_id, entity_type, entity_id, action, metadata)
  values (v_organization_id, v_actor_id, 'FINANCIAL_ENTRY', p_entry_id, 'ARCHIVED', null);
  return p_entry_id;
end;
$$;

create or replace function public.set_financial_goal(
  p_year integer,
  p_month integer,
  p_target_amount numeric
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_organization_id uuid;
  v_goal_id uuid;
  v_old_amount numeric(12,2);
begin
  v_organization_id := private.require_active_owner_organization();
  if p_year is null or p_year <= 0 or p_month is null or p_month not between 1 and 12 then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_GOAL_PERIOD_INVALID';
  end if;
  if p_target_amount is null or p_target_amount <= 0 then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_GOAL_AMOUNT_INVALID';
  end if;
  perform 1 from public.organizations where id = v_organization_id for update;
  if not private.is_active_owner_of_organization(v_organization_id) then
    raise exception using errcode = 'P0001', message = 'AUTHORIZATION_DENIED';
  end if;
  select goal.id, goal.target_amount into v_goal_id, v_old_amount
  from public.financial_goals as goal
  where goal.organization_id = v_organization_id and goal.year = p_year and goal.month = p_month
  for update;
  if not found then
    insert into public.financial_goals (organization_id, year, month, target_amount, created_by, updated_by)
    values (v_organization_id, p_year, p_month, p_target_amount, v_actor_id, v_actor_id)
    returning id into v_goal_id;
    insert into public.activity_logs (organization_id, user_id, entity_type, entity_id, action, metadata)
    values (v_organization_id, v_actor_id, 'FINANCIAL_GOAL', v_goal_id, 'CREATED', null);
  elsif v_old_amount is distinct from p_target_amount then
    update public.financial_goals set target_amount = p_target_amount, updated_by = v_actor_id
    where id = v_goal_id;
    insert into public.activity_logs (organization_id, user_id, entity_type, entity_id, action, metadata)
    values (v_organization_id, v_actor_id, 'FINANCIAL_GOAL', v_goal_id, 'UPDATED', null);
  end if;
  return v_goal_id;
end;
$$;

create or replace function public.get_financial_summary(p_year integer, p_month integer)
returns table (
  monthly_income numeric,
  monthly_expense numeric,
  cash_balance numeric,
  goal_target numeric,
  goal_progress numeric
)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_organization_id uuid;
  v_organization_ids uuid[];
  v_start_date date;
  v_end_date date;
begin
  if p_year is null or p_year <= 0 or p_month is null or p_month not between 1 and 12 then
    raise exception using errcode = 'P0001', message = 'FINANCIAL_GOAL_PERIOD_INVALID';
  end if;
  if auth.uid() is null then
    raise exception using errcode = 'P0001', message = 'AUTHENTICATION_REQUIRED';
  end if;

  select array_agg(membership.organization_id order by membership.created_at, membership.id)
    into v_organization_ids
  from public.organization_members as membership
  join public.profiles as profile on profile.id = membership.user_id
  join public.organizations as organization on organization.id = membership.organization_id
  where membership.user_id = (select auth.uid())
    and membership.role = 'OWNER'
    and membership.status = 'ACTIVE'
    and membership.archived_at is null
    and profile.status = 'ACTIVE'
    and organization.status = 'ACTIVE'
    and organization.archived_at is null;

  if coalesce(cardinality(v_organization_ids), 0) = 0 then
    raise exception using errcode = 'P0001', message = 'AUTHORIZATION_DENIED';
  end if;
  if cardinality(v_organization_ids) > 1 then
    raise exception using errcode = 'P0001', message = 'AMBIGUOUS_ORGANIZATION_CONTEXT';
  end if;

  v_organization_id := v_organization_ids[1];
  v_start_date := make_date(p_year, p_month, 1);
  v_end_date := (v_start_date + interval '1 month')::date;
  return query
  with totals as (
    select
      coalesce(sum(entry.amount) filter (
        where entry.type = 'INCOME' and entry.realized_date >= v_start_date and entry.realized_date < v_end_date
      ), 0::numeric) as income,
      coalesce(sum(entry.amount) filter (
        where entry.type = 'EXPENSE' and entry.realized_date >= v_start_date and entry.realized_date < v_end_date
      ), 0::numeric) as expense,
      coalesce(sum(case when entry.type = 'INCOME' then entry.amount else -entry.amount end)
        filter (where entry.realized_date < v_end_date), 0::numeric) as balance
    from public.financial_entries as entry
    where entry.organization_id = v_organization_id and entry.status = 'REALIZED'
  ), goal as (
    select item.target_amount
    from public.financial_goals as item
    where item.organization_id = v_organization_id and item.year = p_year and item.month = p_month
  )
  select totals.income, totals.expense, totals.balance, goal.target_amount,
    case when goal.target_amount is null then null else totals.income / goal.target_amount end
  from totals left join goal on true;
end;
$$;

revoke execute on function public.create_financial_entry(text,text,numeric,date,uuid,text,text,date,text) from public, anon, service_role;
revoke execute on function public.update_financial_entry(uuid,text,text,numeric,date,uuid,text,text,date,text) from public, anon, service_role;
revoke execute on function public.change_financial_entry_status(uuid,text,date) from public, anon, service_role;
revoke execute on function public.archive_financial_entry(uuid) from public, anon, service_role;
revoke execute on function public.set_financial_goal(integer,integer,numeric) from public, anon, service_role;
revoke execute on function public.get_financial_summary(integer,integer) from public, anon, service_role;

grant execute on function public.create_financial_entry(text,text,numeric,date,uuid,text,text,date,text) to authenticated;
grant execute on function public.update_financial_entry(uuid,text,text,numeric,date,uuid,text,text,date,text) to authenticated;
grant execute on function public.change_financial_entry_status(uuid,text,date) to authenticated;
grant execute on function public.archive_financial_entry(uuid) to authenticated;
grant execute on function public.set_financial_goal(integer,integer,numeric) to authenticated;
grant execute on function public.get_financial_summary(integer,integer) to authenticated;
