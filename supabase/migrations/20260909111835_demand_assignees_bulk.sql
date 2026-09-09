-- ============================================================
-- FASBtech CRM
-- Sprint 03 — Demandas
-- Leitura bulk mínima de responsáveis para a listagem
-- ============================================================

create or replace function public.list_demand_assignees_bulk(
  p_demand_ids uuid[]
)
returns table (
  demand_id uuid,
  membership_id uuid,
  full_name text,
  role text,
  is_currently_eligible boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with authorized_demands as materialized (
    select
      demand.id,
      demand.client_id
    from public.demands as demand
    where (select auth.uid()) is not null
      and demand.id = any(coalesce(p_demand_ids, '{}'::uuid[]))
      and private.can_access_demand(demand.id)
  )
  select
    authorized_demand.id,
    membership.id,
    profile.full_name::text,
    membership.role::text,
    private.is_eligible_demand_assignee(
      authorized_demand.client_id,
      membership.id
    )
  from authorized_demands as authorized_demand
  inner join public.demand_assignees as assignee
    on assignee.demand_id = authorized_demand.id
  inner join public.organization_members as membership
    on membership.id = assignee.membership_id
  inner join public.profiles as profile
    on profile.id = membership.user_id
  order by
    authorized_demand.id,
    profile.full_name,
    membership.id;
$$;


revoke execute on function public.list_demand_assignees_bulk(uuid[])
from public, anon, authenticated, service_role;

grant execute on function public.list_demand_assignees_bulk(uuid[])
to authenticated;
