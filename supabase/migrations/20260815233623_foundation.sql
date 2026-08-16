-- ============================================================
-- FASBtech CRM
-- Migration 001 — Foundation
-- ============================================================
--
-- Escopo:
--   - profiles
--   - organizations
--   - organization_members
--   - activity_logs
--   - Bootstrap
--   - RLS
--   - Policies
--   - Grants
--
-- Fora do escopo:
--   - clients
--   - client_assignments
--   - demands
--   - financial_entries
--   - contracts
--   - documents
--   - leads
--
-- ============================================================


-- ============================================================
-- 1. SCHEMA INTERNO
-- ============================================================

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;


-- ============================================================
-- 2. ORGANIZATIONS
-- ============================================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),

  name varchar(150) not null,
  slug varchar(100) not null,
  status varchar(30) not null default 'ACTIVE',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,

  constraint organizations_name_not_empty
    check (btrim(name) <> ''),

  constraint organizations_slug_not_empty
    check (btrim(slug) <> ''),

  constraint organizations_slug_unique
    unique (slug),

  constraint organizations_status_check
    check (
      status in (
        'ACTIVE',
        'INACTIVE',
        'ARCHIVED'
      )
    )
);


-- ============================================================
-- 3. PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key
    references auth.users(id),

  full_name varchar(150) not null,
  avatar_url text,

  status varchar(30) not null default 'ACTIVE',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_full_name_not_empty
    check (btrim(full_name) <> ''),

  constraint profiles_status_check
    check (
      status in (
        'ACTIVE',
        'INACTIVE'
      )
    )
);


-- ============================================================
-- 4. ORGANIZATION MEMBERS
-- ============================================================

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id),

  user_id uuid not null
    references public.profiles(id),

  role varchar(30) not null,
  status varchar(30) not null default 'ACTIVE',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,

  constraint organization_members_unique
    unique (organization_id, user_id),

  constraint organization_members_role_check
    check (
      role in (
        'OWNER',
        'ADMIN',
        'MEMBER'
      )
    ),

  constraint organization_members_status_check
    check (
      status in (
        'ACTIVE',
        'INVITED',
        'SUSPENDED',
        'ARCHIVED'
      )
    )
);


-- ============================================================
-- 5. ACTIVITY LOGS
-- ============================================================

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id),

  user_id uuid
    references public.profiles(id),

  entity_type text not null,
  entity_id uuid not null,
  action text not null,

  metadata jsonb,

  created_at timestamptz not null default now(),

  constraint activity_logs_entity_type_not_empty
    check (btrim(entity_type) <> ''),

  constraint activity_logs_action_not_empty
    check (btrim(action) <> '')
);


-- ============================================================
-- 6. ÍNDICES
-- ============================================================

-- A constraint UNIQUE (organization_id, user_id)
-- já cria índice para essa combinação.
--
-- Este índice cobre a consulta inversa utilizada frequentemente
-- durante autenticação/autorização.

create index organization_members_user_status_org_idx
  on public.organization_members (
    user_id,
    status,
    organization_id
  );


-- Activity Logs por Organization e ordem cronológica.

create index activity_logs_organization_created_at_idx
  on public.activity_logs (
    organization_id,
    created_at desc
  );


-- Histórico de uma entidade específica.

create index activity_logs_entity_idx
  on public.activity_logs (
    organization_id,
    entity_type,
    entity_id,
    created_at desc
  );


-- ============================================================
-- 7. UPDATED_AT
-- ============================================================

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();

  return new;
end;
$$;


revoke execute
on function private.set_updated_at()
from public;

revoke execute
on function private.set_updated_at()
from anon;

revoke execute
on function private.set_updated_at()
from authenticated;


create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function private.set_updated_at();


create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function private.set_updated_at();


create trigger organization_members_set_updated_at
before update on public.organization_members
for each row
execute function private.set_updated_at();


-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles
enable row level security;

alter table public.organizations
enable row level security;

alter table public.organization_members
enable row level security;

alter table public.activity_logs
enable row level security;


-- ============================================================
-- 9. PROFILES POLICIES
-- ============================================================

-- O utilizador pode visualizar apenas o próprio Profile.

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
);


-- O utilizador pode atualizar apenas seu próprio Profile.
--
-- As colunas efetivamente editáveis serão limitadas também
-- através de GRANT por coluna.

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
)
with check (
  id = (select auth.uid())
);


-- Não existe policy direta para:
--
-- INSERT
-- DELETE
--
-- Profile inicial é criado pelo Bootstrap.


-- ============================================================
-- 10. ORGANIZATIONS POLICIES
-- ============================================================

-- Membership ACTIVE permite visualizar a Organization relacionada.

create policy organizations_select_active_members
on public.organizations
for select
to authenticated
using (
  exists (
    select 1
    from public.organization_members as membership
    where membership.organization_id = organizations.id
      and membership.user_id = (select auth.uid())
      and membership.status = 'ACTIVE'
  )
);


-- OWNER ACTIVE poderá realizar atualização administrativa
-- da Organization.
--
-- As colunas permitidas também serão restringidas pelos GRANTs.

create policy organizations_update_owner
on public.organizations
for update
to authenticated
using (
  exists (
    select 1
    from public.organization_members as membership
    where membership.organization_id = organizations.id
      and membership.user_id = (select auth.uid())
      and membership.status = 'ACTIVE'
      and membership.role = 'OWNER'
  )
)
with check (
  exists (
    select 1
    from public.organization_members as membership
    where membership.organization_id = organizations.id
      and membership.user_id = (select auth.uid())
      and membership.status = 'ACTIVE'
      and membership.role = 'OWNER'
  )
);


-- Não existe policy direta para:
--
-- INSERT
-- DELETE
--
-- A Organization inicial é criada exclusivamente pelo Bootstrap.


-- ============================================================
-- 11. ORGANIZATION MEMBERS POLICIES
-- ============================================================

-- Durante a Foundation, cada utilizador pode consultar somente
-- seu próprio contexto de Membership.
--
-- A ampliação administrativa pertence à Sprint 02.

create policy organization_members_select_own
on public.organization_members
for select
to authenticated
using (
  user_id = (select auth.uid())
);


-- Não existem policies diretas para:
--
-- INSERT
-- UPDATE
-- DELETE
--
-- O primeiro Membership é criado pelo Bootstrap.
-- A gestão de membros pertence à Sprint 02.


-- ============================================================
-- 12. ACTIVITY LOGS POLICIES
-- ============================================================

-- Durante a Foundation somente OWNER ACTIVE pode consultar
-- Activity Logs da própria Organization.
--
-- As regras de ADMIN/MEMBER serão expandidas somente quando
-- os respectivos contratos funcionais forem implementados.

create policy activity_logs_select_owner
on public.activity_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.organization_members as membership
    where membership.organization_id = activity_logs.organization_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'ACTIVE'
      and membership.role = 'OWNER'
  )
);


-- NÃO criar policy para:
--
-- INSERT
-- UPDATE
-- DELETE
--
-- Activity Logs não são gravados diretamente por utilizadores.


-- ============================================================
-- 13. GRANTS DAS TABELAS
-- ============================================================

-- Defense in depth:
-- começar sem privilégios diretos.

revoke all on public.profiles
from anon, authenticated;

revoke all on public.organizations
from anon, authenticated;

revoke all on public.organization_members
from anon, authenticated;

revoke all on public.activity_logs
from anon, authenticated;


-- ------------------------------------------------------------
-- Profiles
-- ------------------------------------------------------------

grant select
on public.profiles
to authenticated;


-- Somente campos editáveis pelo próprio utilizador.
--
-- status, id, created_at e updated_at não podem ser alterados
-- diretamente pelo cliente.

grant update (full_name, avatar_url)
on public.profiles
to authenticated;


-- ------------------------------------------------------------
-- Organizations
-- ------------------------------------------------------------

grant select
on public.organizations
to authenticated;


-- OWNER é protegido adicionalmente pela Policy.
--
-- Não concedemos UPDATE de id, created_at ou updated_at.

grant update (
  name,
  slug,
  status,
  archived_at
)
on public.organizations
to authenticated;


-- ------------------------------------------------------------
-- Organization Members
-- ------------------------------------------------------------

grant select
on public.organization_members
to authenticated;


-- ------------------------------------------------------------
-- Activity Logs
-- ------------------------------------------------------------

grant select
on public.activity_logs
to authenticated;


-- ============================================================
-- 14. BOOTSTRAP
-- ============================================================

create or replace function public.bootstrap_initial_organization()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;

  v_full_name text;
  v_email text;
  v_metadata jsonb;

  v_existing_organization_id uuid;
  v_organization_id uuid;

begin

  -- ----------------------------------------------------------
  -- Identidade autenticada
  -- ----------------------------------------------------------

  v_user_id := auth.uid();


  if v_user_id is null then
    raise exception using
      errcode = 'P0001',
      message = 'AUTHENTICATION_REQUIRED';
  end if;


  -- ----------------------------------------------------------
  -- Lock transacional
  --
  -- Serializa chamadas concorrentes do Bootstrap.
  -- O lock é liberado automaticamente ao final da transação.
  -- ----------------------------------------------------------

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fasbtech:bootstrap_initial_organization',
      0
    )
  );


  -- ----------------------------------------------------------
  -- Idempotência
  --
  -- Se o utilizador já possui Membership, o Bootstrap já não
  -- precisa modificar nenhuma estrutura.
  -- ----------------------------------------------------------

  select membership.organization_id
    into v_existing_organization_id
  from public.organization_members as membership
  where membership.user_id = v_user_id
  order by membership.created_at asc
  limit 1;


  if found then
    return v_existing_organization_id;
  end if;


  -- ----------------------------------------------------------
  -- Depois que uma Organization existe, novos utilizadores
  -- NÃO podem utilizar Bootstrap.
  -- ----------------------------------------------------------

  if exists (
    select 1
    from public.organizations
  ) then

    raise exception using
      errcode = 'P0001',
      message = 'BOOTSTRAP_ALREADY_INITIALIZED';

  end if;


  -- ----------------------------------------------------------
  -- Obter dados do utilizador autenticado.
  --
  -- raw_user_meta_data é utilizado apenas para apresentação,
  -- nunca para autorização.
  -- ----------------------------------------------------------

  select
    auth_user.raw_user_meta_data,
    auth_user.email
  into
    v_metadata,
    v_email
  from auth.users as auth_user
  where auth_user.id = v_user_id;


  if not found then

    raise exception using
      errcode = 'P0001',
      message = 'AUTH_USER_NOT_FOUND';

  end if;


  -- ----------------------------------------------------------
  -- Full Name
  --
  -- Prioridade oficial:
  --
  -- 1. raw_user_meta_data.full_name
  -- 2. e-mail
  -- ----------------------------------------------------------

  v_full_name := coalesce(
    nullif(
      btrim(v_metadata ->> 'full_name'),
      ''
    ),
    nullif(
      btrim(v_email),
      ''
    )
  );


  if v_full_name is null then

    raise exception using
      errcode = 'P0001',
      message = 'PROFILE_NAME_UNAVAILABLE';

  end if;


  -- ----------------------------------------------------------
  -- Profile
  -- ----------------------------------------------------------

  insert into public.profiles (
    id,
    full_name,
    status
  )
  values (
    v_user_id,
    v_full_name,
    'ACTIVE'
  )
  on conflict (id)
  do nothing;


  -- ----------------------------------------------------------
  -- Organization inicial
  -- ----------------------------------------------------------

  insert into public.organizations (
    name,
    slug,
    status
  )
  values (
    'FASBtech',
    'fasbtech',
    'ACTIVE'
  )
  returning id
  into v_organization_id;


  -- ----------------------------------------------------------
  -- Primeiro OWNER
  -- ----------------------------------------------------------

  insert into public.organization_members (
    organization_id,
    user_id,
    role,
    status
  )
  values (
    v_organization_id,
    v_user_id,
    'OWNER',
    'ACTIVE'
  );


  return v_organization_id;

end;
$$;


-- ============================================================
-- 15. BOOTSTRAP GRANTS
-- ============================================================

-- Functions recebem EXECUTE para PUBLIC por padrão no PostgreSQL.
-- Removemos explicitamente.

revoke execute
on function public.bootstrap_initial_organization()
from public;

revoke execute
on function public.bootstrap_initial_organization()
from anon;

revoke execute
on function public.bootstrap_initial_organization()
from authenticated;


-- Somente utilizadores autenticados podem tentar executar.
--
-- A autorização real continua dentro da própria função.

grant execute
on function public.bootstrap_initial_organization()
to authenticated;


-- ============================================================
-- 16. FIM DA FOUNDATION
-- ============================================================
--
-- NÃO adicionar abaixo:
--
-- clients
-- client_assignments
-- demands
-- notifications
-- financial_entries
-- financial_goals
-- contract_templates
-- contracts
-- documents
-- leads
--
-- ============================================================