-- ============================================================
-- FASBtech CRM
-- Sprint 02 — Correção de concorrência na alteração de roles
-- ============================================================
--
-- Serializa alterações de role por Organization para impedir que
-- rebaixamentos concorrentes removam todos os OWNERs ACTIVE.
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

  perform 1
  from public.organizations as organization
  where organization.id = v_organization_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'AUTHORIZATION_DENIED';
  end if;

  if not private.is_active_owner_of_organization(v_organization_id) then
    raise exception using
      errcode = 'P0001',
      message = 'AUTHORIZATION_DENIED';
  end if;

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
