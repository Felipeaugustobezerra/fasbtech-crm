begin;

-- ============================================================
-- FASBtech CRM
-- Sprint 02 — Clientes & Acessos
-- RPCs + Activity Logs tests
-- ============================================================

create extension if not exists pgtap with schema extensions;

select plan(37);


-- ============================================================
-- 1. FIXTURES
-- ============================================================

insert into auth.users (
  id,
  email,
  raw_user_meta_data
)
values
(
  '11111111-1111-4111-8111-111111111111',
  'owner@fasbtech.test',
  '{"full_name":"Owner"}'::jsonb
),
(
  '22222222-2222-4222-8222-222222222222',
  'new-member@fasbtech.test',
  '{"full_name":"New Member"}'::jsonb
),
(
  '33333333-3333-4333-8333-333333333333',
  'second-owner@fasbtech.test',
  '{"full_name":"Second Owner"}'::jsonb
);


insert into public.profiles (
  id,
  full_name,
  status
)
values
(
  '11111111-1111-4111-8111-111111111111',
  'Owner',
  'ACTIVE'
);


insert into public.organizations (
  id,
  name,
  slug,
  status
)
values
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Organization A',
  'organization-a',
  'ACTIVE'
);


insert into public.organization_members (
  id,
  organization_id,
  user_id,
  role,
  status
)
values
(
  '71111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'OWNER',
  'ACTIVE'
);


set local role authenticated;

set local request.jwt.claim.sub =
  '11111111-1111-4111-8111-111111111111';


-- ============================================================
-- 2. CREATE CLIENT
-- ============================================================

select lives_ok(
  $$
    select public.create_client(
      p_name := 'Client One',
      p_company_name := 'Client One Ltd',
      p_email := 'client-one@example.test',
      p_phone := '+351000000000',
      p_tax_id := 'PT123456789',
      p_tax_id_type := 'NIF',
      p_city := 'Porto',
      p_country_code := 'PT',
      p_notes := 'Initial notes'
    )
  $$,
  'OWNER deve conseguir criar Cliente'
);

select is(
  (select count(*) from public.clients),
  1::bigint,
  'create_client deve persistir exatamente um Cliente'
);

select is(
  (
    select organization_id
    from public.clients
    where name = 'Client One'
  ),
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,
  'Organization do Cliente deve ser derivada do OWNER autenticado'
);

select is(
  (
    select created_by::text || '|' || updated_by::text
    from public.clients
    where name = 'Client One'
  ),
  '11111111-1111-4111-8111-111111111111|11111111-1111-4111-8111-111111111111',
  'created_by e updated_by devem ser definidos pelo sistema'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_type = 'CLIENT'
      and action = 'CREATED'
  ),
  1::bigint,
  'Criação de Cliente deve gerar Activity Log'
);


-- ============================================================
-- 3. ROLLBACK DE VALIDAÇÃO
-- ============================================================

select throws_ok(
  $$
    select public.create_client(
      p_name := 'Invalid Tax Client',
      p_tax_id := '123'
    )
  $$,
  'P0001',
  'CLIENT_TAX_ID_PAIR_REQUIRED',
  'tax_id sem tax_id_type deve ser rejeitado'
);

select is(
  (select count(*) from public.clients),
  1::bigint,
  'Falha de validação não deve criar Cliente parcial'
);


-- ============================================================
-- 4. UPDATE CLIENT
-- ============================================================

select lives_ok(
  $$
    select public.update_client(
      p_client_id := (
        select id
        from public.clients
        where name = 'Client One'
      ),
      p_name := 'Client One Updated',
      p_company_name := 'Client One Updated Ltd',
      p_email := 'updated@example.test',
      p_city := 'Braga',
      p_country_code := 'PT',
      p_notes := 'Updated notes'
    )
  $$,
  'OWNER deve conseguir editar Cliente'
);

select is(
  (
    select name || '|' || company_name || '|' || city
    from public.clients
    where name = 'Client One Updated'
  ),
  'Client One Updated|Client One Updated Ltd|Braga',
  'update_client deve persistir campos editáveis'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_type = 'CLIENT'
      and action = 'UPDATED'
  ),
  1::bigint,
  'Edição de Cliente deve gerar Activity Log'
);


-- ============================================================
-- 5. ARCHIVE CLIENT
-- ============================================================

select lives_ok(
  $$
    select public.archive_client(
      (
        select id
        from public.clients
        where name = 'Client One Updated'
      )
    )
  $$,
  'OWNER deve conseguir arquivar Cliente'
);

select ok(
  (
    select archived_at is not null
    from public.clients
    where name = 'Client One Updated'
  ),
  'archive_client deve preencher archived_at'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_type = 'CLIENT'
      and action = 'ARCHIVED'
  ),
  1::bigint,
  'Arquivamento de Cliente deve gerar Activity Log'
);


-- ============================================================
-- 6. ESCRITA DIRETA NEGADA
-- ============================================================

select throws_ok(
  $$
    insert into public.clients (
      organization_id,
      name,
      created_by,
      updated_by
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'Direct Insert',
      '11111111-1111-4111-8111-111111111111',
      '11111111-1111-4111-8111-111111111111'
    )
  $$,
  '42501',
  null,
  'authenticated não pode inserir clients diretamente'
);

select throws_ok(
  $$
    update public.clients
    set name = 'Direct Update'
  $$,
  '42501',
  null,
  'authenticated não pode atualizar clients diretamente'
);

select throws_ok(
  $$
    delete from public.clients
  $$,
  '42501',
  null,
  'authenticated não pode excluir clients diretamente'
);


-- ============================================================
-- 7. ADD ORGANIZATION MEMBER
-- ============================================================

select lives_ok(
  $$
    select public.add_organization_member(
      'new-member@fasbtech.test',
      'MEMBER'
    )
  $$,
  'OWNER deve conseguir adicionar utilizador autenticado à Organization'
);

select is(
  (
    select count(*)
    from public.profiles
    where id = '22222222-2222-4222-8222-222222222222'
  ),
  1::bigint,
  'add_organization_member deve criar Profile quando necessário'
);

select is(
  (
    select role || '|' || status
    from public.organization_members
    where user_id = '22222222-2222-4222-8222-222222222222'
  ),
  'MEMBER|ACTIVE',
  'Novo utilizador deve receber Membership MEMBER ACTIVE'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_type = 'MEMBERSHIP'
      and action = 'CREATED'
      and metadata ->> 'target_user_id' =
        '22222222-2222-4222-8222-222222222222'
  ),
  1::bigint,
  'Criação de Membership deve gerar Activity Log'
);


-- ============================================================
-- 8. MEMBER NÃO PODE ADMINISTRAR CLIENTES
-- ============================================================

create temporary table test_client_context (
  client_id uuid not null
) on commit drop;

insert into test_client_context (client_id)
select id
from public.clients
where name = 'Client One Updated';


set local request.jwt.claim.sub =
  '22222222-2222-4222-8222-222222222222';


select throws_ok(
  $$
    select public.create_client(
      p_name := 'Unauthorized Client'
    )
  $$,
  'P0001',
  'AUTHORIZATION_DENIED',
  'MEMBER não pode criar Cliente'
);

select throws_ok(
  $$
    select public.update_client(
      p_client_id := (
        select client_id
        from test_client_context
      ),
      p_name := 'Unauthorized Client Update'
    )
  $$,
  'P0001',
  'CLIENT_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER não pode editar Cliente via RPC'
);

select throws_ok(
  $$
    select public.archive_client(
      (
        select client_id
        from test_client_context
      )
    )
  $$,
  'P0001',
  'CLIENT_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER não pode arquivar Cliente via RPC'
);


-- ============================================================
-- 9. VALIDAÇÕES DE MEMBERSHIP
-- ============================================================

set local request.jwt.claim.sub =
  '11111111-1111-4111-8111-111111111111';


select throws_ok(
  $$
    select public.add_organization_member(
      'new-member@fasbtech.test',
      'MEMBER'
    )
  $$,
  'P0001',
  'MEMBERSHIP_ALREADY_EXISTS',
  'Membership duplicada deve ser rejeitada'
);

select throws_ok(
  $$
    select public.add_organization_member(
      'missing-user@fasbtech.test',
      'MEMBER'
    )
  $$,
  'P0001',
  'AUTH_USER_NOT_FOUND',
  'Utilizador inexistente no Auth deve ser rejeitado'
);

select throws_ok(
  $$
    select public.add_organization_member(
      'second-owner@fasbtech.test',
      'INVALID_ROLE'
    )
  $$,
  'P0001',
  'MEMBER_ROLE_INVALID',
  'Role inválida deve ser rejeitada'
);


-- ============================================================
-- 10. UPDATE ROLE
-- ============================================================

select lives_ok(
  $$
    select public.update_organization_member_role(
      (
        select id
        from public.organization_members
        where user_id = '22222222-2222-4222-8222-222222222222'
      ),
      'ADMIN'
    )
  $$,
  'OWNER deve conseguir alterar role de Membership'
);

select is(
  (
    select role
    from public.organization_members
    where user_id = '22222222-2222-4222-8222-222222222222'
  ),
  'ADMIN',
  'Role deve ser atualizada para ADMIN'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_type = 'MEMBERSHIP'
      and action = 'ROLE_UPDATED'
      and metadata ->> 'new_role' = 'ADMIN'
  ),
  1::bigint,
  'Alteração de role deve gerar Activity Log'
);


-- ============================================================
-- 11. ADMIN NÃO RECEBE CLIENTES POR INFERÊNCIA
-- ============================================================

set local request.jwt.claim.sub =
  '22222222-2222-4222-8222-222222222222';


select throws_ok(
  $$
    select public.create_client(
      p_name := 'Admin Unauthorized Client'
    )
  $$,
  'P0001',
  'AUTHORIZATION_DENIED',
  'ADMIN não pode criar Cliente sem regra oficial explícita'
);


-- ============================================================
-- 12. PROTEÇÃO DO ÚLTIMO OWNER
-- ============================================================

set local request.jwt.claim.sub =
  '11111111-1111-4111-8111-111111111111';


select throws_ok(
  $$
    select public.update_organization_member_role(
      '71111111-1111-4111-8111-111111111111',
      'MEMBER'
    )
  $$,
  'P0001',
  'LAST_ACTIVE_OWNER_REQUIRED',
  'Último OWNER ACTIVE não pode ser removido'
);


-- ============================================================
-- 13. SEGUNDO OWNER
-- ============================================================

select lives_ok(
  $$
    select public.add_organization_member(
      'second-owner@fasbtech.test',
      'OWNER'
    )
  $$,
  'OWNER deve conseguir adicionar outro OWNER'
);

select is(
  (
    select count(*)
    from public.organization_members
    where role = 'OWNER'
      and status = 'ACTIVE'
      and archived_at is null
  ),
  2::bigint,
  'Organization deve possuir dois OWNERs ACTIVE'
);

select lives_ok(
  $$
    select public.update_organization_member_role(
      '71111111-1111-4111-8111-111111111111',
      'ADMIN'
    )
  $$,
  'OWNER original pode ser rebaixado quando outro OWNER ACTIVE existe'
);

select is(
  (
    select role
    from public.organization_members
    where id = '71111111-1111-4111-8111-111111111111'
  ),
  'ADMIN',
  'Role do OWNER original deve ser atualizada para ADMIN'
);


-- ============================================================
-- 14. SEGUNDO OWNER ASSUME OPERAÇÃO
-- ============================================================

set local request.jwt.claim.sub =
  '33333333-3333-4333-8333-333333333333';


select lives_ok(
  $$
    select public.create_client(
      p_name := 'Client Two'
    )
  $$,
  'Segundo OWNER ACTIVE deve conseguir criar Cliente'
);

select is(
  (select count(*) from public.clients),
  2::bigint,
  'Após segundo OWNER criar Cliente devem existir dois Clientes'
);


-- ============================================================
-- FINALIZAÇÃO
-- ============================================================

reset role;

select * from finish();

rollback;
