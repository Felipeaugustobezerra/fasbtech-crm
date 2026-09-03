begin;

-- ============================================================
-- FASBtech CRM
-- Sprint 03 — Demandas
-- RPC, integrity, Activity Log and atomicity tests
-- ============================================================

create extension if not exists pgtap with schema extensions;

select plan(99);


-- ============================================================
-- 1. FIXTURES
-- ============================================================

insert into auth.users (id, email, raw_user_meta_data)
values
  ('10111111-1111-4111-8111-111111111111', 'rpc-owner-a@fasbtech.test', '{"full_name":"RPC Owner A"}'),
  ('20222222-2222-4222-8222-222222222222', 'rpc-member-assigned@fasbtech.test', '{"full_name":"RPC Member Assigned"}'),
  ('30333333-3333-4333-8333-333333333333', 'rpc-member-no-access@fasbtech.test', '{"full_name":"RPC Member No Access"}'),
  ('40444444-4444-4444-8444-444444444444', 'rpc-admin@fasbtech.test', '{"full_name":"RPC Admin"}'),
  ('50555555-5555-4555-8555-555555555555', 'rpc-owner-b@fasbtech.test', '{"full_name":"RPC Owner B"}'),
  ('60666666-6666-4666-8666-666666666666', 'rpc-member-second@fasbtech.test', '{"full_name":"RPC Member Second"}'),
  ('70777777-7777-4777-8777-777777777777', 'rpc-inactive-profile@fasbtech.test', '{"full_name":"RPC Inactive Profile"}');

insert into public.profiles (id, full_name, status)
values
  ('10111111-1111-4111-8111-111111111111', 'RPC Owner A', 'ACTIVE'),
  ('20222222-2222-4222-8222-222222222222', 'RPC Member Assigned', 'ACTIVE'),
  ('30333333-3333-4333-8333-333333333333', 'RPC Member No Access', 'ACTIVE'),
  ('40444444-4444-4444-8444-444444444444', 'RPC Admin', 'ACTIVE'),
  ('50555555-5555-4555-8555-555555555555', 'RPC Owner B', 'ACTIVE'),
  ('60666666-6666-4666-8666-666666666666', 'RPC Member Second', 'ACTIVE'),
  ('70777777-7777-4777-8777-777777777777', 'RPC Inactive Profile', 'INACTIVE');

insert into public.organizations (id, name, slug, status)
values
  ('a1111111-1111-4111-8111-111111111111', 'RPC Organization A', 'rpc-organization-a', 'ACTIVE'),
  ('b2222222-2222-4222-8222-222222222222', 'RPC Organization B', 'rpc-organization-b', 'ACTIVE');

insert into public.organization_members (id, organization_id, user_id, role, status)
values
  ('71111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111', 'OWNER', 'ACTIVE'),
  ('72222222-2222-4222-8222-222222222222', 'a1111111-1111-4111-8111-111111111111', '20222222-2222-4222-8222-222222222222', 'MEMBER', 'ACTIVE'),
  ('73333333-3333-4333-8333-333333333333', 'a1111111-1111-4111-8111-111111111111', '30333333-3333-4333-8333-333333333333', 'MEMBER', 'ACTIVE'),
  ('74444444-4444-4444-8444-444444444444', 'a1111111-1111-4111-8111-111111111111', '40444444-4444-4444-8444-444444444444', 'ADMIN', 'ACTIVE'),
  ('75555555-5555-4555-8555-555555555555', 'b2222222-2222-4222-8222-222222222222', '50555555-5555-4555-8555-555555555555', 'OWNER', 'ACTIVE'),
  ('76666666-6666-4666-8666-666666666666', 'a1111111-1111-4111-8111-111111111111', '60666666-6666-4666-8666-666666666666', 'MEMBER', 'ACTIVE'),
  ('77777777-7777-4777-8777-777777777777', 'a1111111-1111-4111-8111-111111111111', '70777777-7777-4777-8777-777777777777', 'OWNER', 'ACTIVE');

insert into public.clients (id, organization_id, name, created_by, updated_by)
values
  ('81111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111', 'RPC Client A1', '10111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111'),
  ('82222222-2222-4222-8222-222222222222', 'a1111111-1111-4111-8111-111111111111', 'RPC Client A2', '10111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111'),
  ('83333333-3333-4333-8333-333333333333', 'b2222222-2222-4222-8222-222222222222', 'RPC Client B1', '50555555-5555-4555-8555-555555555555', '50555555-5555-4555-8555-555555555555');

insert into public.client_assignments (id, client_id, membership_id, created_by)
values
  ('91111111-1111-4111-8111-111111111111', '81111111-1111-4111-8111-111111111111', '72222222-2222-4222-8222-222222222222', '10111111-1111-4111-8111-111111111111'),
  ('92222222-2222-4222-8222-222222222222', '81111111-1111-4111-8111-111111111111', '76666666-6666-4666-8666-666666666666', '10111111-1111-4111-8111-111111111111');

create temporary table test_demand_context (
  owner_demand_id uuid,
  member_demand_id uuid,
  empty_demand_id uuid
) on commit drop;

insert into test_demand_context default values;

grant select, update
on test_demand_context
to authenticated;


-- ============================================================
-- 2. CREATE DEMAND — OWNER E MEMBER
-- ============================================================

set local role authenticated;
set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';

select lives_ok(
  $$
    update test_demand_context
    set owner_demand_id = public.create_demand(
      p_client_id := '81111111-1111-4111-8111-111111111111',
      p_title := '  Owner Demand  ',
      p_description := '  Initial description  ',
      p_start_date := '2026-09-01',
      p_due_date := '2026-09-30',
      p_notes := '  Initial notes  ',
      p_assignee_membership_ids := array[
        '71111111-1111-4111-8111-111111111111'::uuid,
        '72222222-2222-4222-8222-222222222222'::uuid
      ]
    )
  $$,
  'OWNER deve criar Demanda com responsáveis opcionais'
);

select is((select count(*) from public.demands), 1::bigint, 'create_demand deve persistir exatamente uma Demanda');
select is((select status || '|' || priority from public.demands), 'OPEN|MEDIUM', 'Defaults devem ser OPEN e MEDIUM');
select is((select organization_id from public.demands), 'a1111111-1111-4111-8111-111111111111'::uuid, 'Organization deve ser derivada do Cliente');
select is((select created_by::text || '|' || updated_by::text from public.demands), '10111111-1111-4111-8111-111111111111|10111111-1111-4111-8111-111111111111', 'Autoria deve ser derivada de auth.uid()');
select is((select title || '|' || description || '|' || notes from public.demands), 'Owner Demand|Initial description|Initial notes', 'Textos funcionais devem ser normalizados');
select is((select count(*) from public.demand_assignees), 2::bigint, 'Responsáveis iniciais devem ser persistidos atomicamente');
select is((select count(*) from public.activity_logs where entity_type = 'DEMAND' and action = 'CREATED'), 1::bigint, 'Criação deve gerar DEMAND / CREATED');
select is(
  (
    select organization_id::text || '|' || user_id::text
    from public.activity_logs
    where entity_type = 'DEMAND'
      and action = 'CREATED'
  ),
  'a1111111-1111-4111-8111-111111111111|10111111-1111-4111-8111-111111111111',
  'Log de criação deve registrar Organization e ator corretos'
);

set local request.jwt.claim.sub = '20222222-2222-4222-8222-222222222222';

select lives_ok(
  $$
    update test_demand_context
    set member_demand_id = public.create_demand(
      p_client_id := '81111111-1111-4111-8111-111111111111',
      p_title := 'Member Demand'
    )
  $$,
  'MEMBER com Client Assignment deve criar Demanda'
);

select is(
  (select created_by from public.demands where id = (select member_demand_id from test_demand_context)),
  '20222222-2222-4222-8222-222222222222'::uuid,
  'Demanda criada por MEMBER deve registrar o ator autenticado'
);

set local request.jwt.claim.sub = '30333333-3333-4333-8333-333333333333';
select throws_ok(
  $$ select public.create_demand('81111111-1111-4111-8111-111111111111', 'Forbidden Demand') $$,
  'P0001',
  'CLIENT_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER sem Client Assignment não pode criar Demanda'
);

set local request.jwt.claim.sub = '40444444-4444-4444-8444-444444444444';
select throws_ok(
  $$ select public.create_demand('81111111-1111-4111-8111-111111111111', 'Admin Demand') $$,
  'P0001',
  'CLIENT_NOT_FOUND_OR_FORBIDDEN',
  'ADMIN deve ser negado em create_demand'
);

set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';
select throws_ok(
  $$ select public.create_demand('83333333-3333-4333-8333-333333333333', 'Cross Organization') $$,
  'P0001',
  'CLIENT_NOT_FOUND_OR_FORBIDDEN',
  'OWNER não pode criar Demanda em outra Organization'
);

select throws_ok(
  $$
    select public.create_demand(
      p_client_id := '81111111-1111-4111-8111-111111111111',
      p_title := 'Invalid Initial Assignee',
      p_assignee_membership_ids := array['74444444-4444-4444-8444-444444444444'::uuid]
    )
  $$,
  'P0001',
  'DEMAND_ASSIGNEE_INVALID',
  'ADMIN não pode ser responsável inicial'
);

select is((select count(*) from public.demands), 2::bigint, 'Assignee inicial inválido deve causar rollback da Demanda');
select is((select count(*) from public.activity_logs where entity_type = 'DEMAND' and action = 'CREATED'), 2::bigint, 'Falha de criação não deve gerar Log falso');

select lives_ok(
  $$
    update test_demand_context
    set empty_demand_id = public.create_demand(
      p_client_id := '82222222-2222-4222-8222-222222222222',
      p_title := 'Demand Without Assignees',
      p_assignee_membership_ids := '{}'::uuid[]
    )
  $$,
  'create_demand deve aceitar conjunto vazio de responsáveis'
);


-- ============================================================
-- 3. HAPPY PATH COMPLETO DE MEMBER
-- ============================================================

set local request.jwt.claim.sub = '20222222-2222-4222-8222-222222222222';

select lives_ok(
  $$
    select public.update_demand(
      p_demand_id := (select member_demand_id from test_demand_context),
      p_title := 'Member Demand Updated',
      p_priority := 'HIGH',
      p_notes := 'Member notes'
    )
  $$,
  'MEMBER autorizado deve atualizar conteúdo e Priority'
);

select lives_ok(
  $$
    select public.change_demand_status(
      (select member_demand_id from test_demand_context),
      'IN_PROGRESS'
    )
  $$,
  'MEMBER autorizado deve alterar Status'
);

select lives_ok(
  $$
    select public.set_demand_assignees(
      (select member_demand_id from test_demand_context),
      array['71111111-1111-4111-8111-111111111111'::uuid]
    )
  $$,
  'MEMBER autorizado deve gerir responsáveis elegíveis'
);

select lives_ok(
  $$
    select public.set_demand_tags(
      (select member_demand_id from test_demand_context),
      '{}'::uuid[],
      array['Member Tag']
    )
  $$,
  'MEMBER autorizado deve gerir Tags'
);

select is(
  (
    select title || '|' || priority || '|' || status
    from public.demands
    where id = (select member_demand_id from test_demand_context)
  ),
  'Member Demand Updated|HIGH|IN_PROGRESS',
  'Operações permitidas de MEMBER devem persistir'
);

select throws_ok(
  $$ select public.archive_demand((select member_demand_id from test_demand_context)) $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER não pode arquivar Demanda'
);


-- ============================================================
-- 4. UPDATE E STATUS — OWNER, NEGADOS E VALIDAÇÕES
-- ============================================================

set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';

select lives_ok(
  $$
    select public.update_demand(
      p_demand_id := (select owner_demand_id from test_demand_context),
      p_title := 'Owner Demand Updated',
      p_description := '',
      p_priority := 'urgent',
      p_start_date := '2026-09-02',
      p_due_date := '2026-10-01',
      p_notes := ''
    )
  $$,
  'OWNER deve atualizar somente campos funcionais editáveis'
);

select is(
  (
    select title || '|' || priority || '|' || coalesce(description, 'NULL') || '|' || coalesce(notes, 'NULL')
    from public.demands
    where id = (select owner_demand_id from test_demand_context)
  ),
  'Owner Demand Updated|URGENT|NULL|NULL',
  'update_demand deve normalizar e persistir campos editáveis'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_id = (select owner_demand_id from test_demand_context)
      and action = 'UPDATED'
  ),
  1::bigint,
  'Update de conteúdo deve gerar DEMAND / UPDATED'
);

set local request.jwt.claim.sub = '30333333-3333-4333-8333-333333333333';
select throws_ok(
  $$ select public.update_demand((select owner_demand_id from test_demand_context), 'Forbidden Update') $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER sem Assignment não pode atualizar Demanda'
);

select throws_ok(
  $$ select public.change_demand_status((select owner_demand_id from test_demand_context), 'REVIEW') $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER sem Assignment não pode alterar Status'
);

select throws_ok(
  $$ select public.set_demand_assignees((select owner_demand_id from test_demand_context), '{}'::uuid[]) $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER sem Assignment não pode gerir responsáveis'
);

select throws_ok(
  $$ select public.set_demand_tags((select owner_demand_id from test_demand_context), '{}'::uuid[], '{}'::text[]) $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER sem Assignment não pode gerir Tags'
);

set local request.jwt.claim.sub = '40444444-4444-4444-8444-444444444444';
select throws_ok(
  $$ select public.update_demand((select owner_demand_id from test_demand_context), 'Admin Update') $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'ADMIN deve ser negado em update_demand'
);

select throws_ok(
  $$ select public.change_demand_status((select owner_demand_id from test_demand_context), 'REVIEW') $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'ADMIN deve ser negado em change_demand_status'
);

select throws_ok(
  $$ select public.set_demand_assignees((select owner_demand_id from test_demand_context), '{}'::uuid[]) $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'ADMIN deve ser negado em set_demand_assignees'
);

select throws_ok(
  $$ select public.set_demand_tags((select owner_demand_id from test_demand_context), '{}'::uuid[], '{}'::text[]) $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'ADMIN deve ser negado em set_demand_tags'
);

set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';
select throws_ok(
  $$ select public.update_demand((select owner_demand_id from test_demand_context), 'Invalid Priority', null, 'INVALID') $$,
  'P0001',
  'DEMAND_PRIORITY_INVALID',
  'Priority inválida deve ser negada pela RPC'
);

select is(
  (select title from public.demands where id = (select owner_demand_id from test_demand_context)),
  'Owner Demand Updated',
  'Falha de Priority não deve alterar a Demanda'
);

select lives_ok(
  $$ select public.change_demand_status((select owner_demand_id from test_demand_context), 'review') $$,
  'OWNER deve alterar Status'
);

select is(
  (select status from public.demands where id = (select owner_demand_id from test_demand_context)),
  'REVIEW',
  'Status deve ser normalizado e persistido'
);

select is(
  (
    select
      (metadata ->> 'old_status')
      || '|'
      || (metadata ->> 'new_status')
    from public.activity_logs
    where entity_id = (select owner_demand_id from test_demand_context)
      and action = 'STATUS_CHANGED'
  ),
  'OPEN|REVIEW',
  'STATUS_CHANGED deve registrar delta mínimo'
);

select throws_ok(
  $$ select public.change_demand_status((select owner_demand_id from test_demand_context), 'INVALID') $$,
  'P0001',
  'DEMAND_STATUS_INVALID',
  'Status inválido deve ser negado'
);


-- ============================================================
-- 5. SET DEMAND ASSIGNEES
-- ============================================================

select lives_ok(
  $$
    select public.set_demand_assignees(
      (select owner_demand_id from test_demand_context),
      array[
        '71111111-1111-4111-8111-111111111111'::uuid,
        '72222222-2222-4222-8222-222222222222'::uuid,
        '76666666-6666-4666-8666-666666666666'::uuid
      ]
    )
  $$,
  'OWNER deve substituir conjunto de responsáveis elegíveis'
);

select is(
  (select count(*) from public.demand_assignees where demand_id = (select owner_demand_id from test_demand_context)),
  3::bigint,
  'Conjunto completo de responsáveis deve ser persistido'
);

select ok(
  (
    select metadata -> 'assignee_membership_ids_added' ? '76666666-6666-4666-8666-666666666666'
    from public.activity_logs
    where entity_id = (select owner_demand_id from test_demand_context)
      and action = 'UPDATED'
      and metadata ? 'assignee_membership_ids_added'
    order by created_at desc
    limit 1
  ),
  'Alteração de responsáveis deve registrar IDs adicionados'
);

select throws_ok(
  $$
    select public.set_demand_assignees(
      (select owner_demand_id from test_demand_context),
      array[
        '72222222-2222-4222-8222-222222222222'::uuid,
        '72222222-2222-4222-8222-222222222222'::uuid
      ]
    )
  $$,
  'P0001',
  'DEMAND_ASSIGNEES_DUPLICATED',
  'IDs duplicados de responsáveis devem ser negados'
);

select throws_ok(
  $$
    select public.set_demand_assignees(
      (select owner_demand_id from test_demand_context),
      array['75555555-5555-4555-8555-555555555555'::uuid]
    )
  $$,
  'P0001',
  'DEMAND_ASSIGNEE_INVALID',
  'Responsável de outra Organization deve ser negado'
);

select is(
  (select count(*) from public.demand_assignees where demand_id = (select owner_demand_id from test_demand_context)),
  3::bigint,
  'Candidato inválido deve causar rollback integral do conjunto'
);

select lives_ok(
  $$ select public.set_demand_assignees((select owner_demand_id from test_demand_context), '{}'::uuid[]) $$,
  'Conjunto vazio de responsáveis deve ser aceito'
);

select is(
  (select count(*) from public.demand_assignees where demand_id = (select owner_demand_id from test_demand_context)),
  0::bigint,
  'Conjunto vazio deve remover relações sem excluir Demandas'
);

select lives_ok(
  $$
    select public.set_demand_assignees(
      (select owner_demand_id from test_demand_context),
      array['72222222-2222-4222-8222-222222222222'::uuid]
    )
  $$,
  'Responsável elegível deve poder ser associado novamente'
);


-- ============================================================
-- 6. SET DEMAND TAGS
-- ============================================================

select lives_ok(
  $$
    select public.set_demand_tags(
      (select owner_demand_id from test_demand_context),
      '{}'::uuid[],
      array['  Urgente  ', 'Backlog']
    )
  $$,
  'OWNER deve criar Tags inline e substituir relações'
);

select is((select count(*) from public.demand_tags where organization_id = 'a1111111-1111-4111-8111-111111111111'), 3::bigint, 'Tags inline de OWNER somam-se à Tag criada por MEMBER');
select is((select count(*) from public.demand_tag_assignments where demand_id = (select owner_demand_id from test_demand_context)), 2::bigint, 'Duas Tags devem ser associadas à Demanda');
select is((select name from public.demand_tags where lower(name) = 'urgente'), 'Urgente', 'Tag deve ser armazenada com trim e capitalização preservada');
select ok(
  exists (
    select 1
    from public.activity_logs
    where entity_id = (select owner_demand_id from test_demand_context)
      and action = 'UPDATED'
      and metadata ? 'tag_ids_added'
      and metadata ? 'tag_ids_removed'
  ),
  'Alteração de Tags deve gerar DEMAND / UPDATED com delta mínimo'
);

select lives_ok(
  $$
    select public.set_demand_tags(
      (select owner_demand_id from test_demand_context),
      '{}'::uuid[],
      array['URGENTE']
    )
  $$,
  'Nome normalizado deve reutilizar Tag existente'
);

select is((select count(*) from public.demand_tags where lower(name) = 'urgente'), 1::bigint, 'Correspondência case-insensitive não deve duplicar Tag');
select is((select count(*) from public.demand_tags where name = 'Backlog'), 1::bigint, 'Remover última associação não deve excluir Tag órfã');

select throws_ok(
  $$
    select public.set_demand_tags(
      (select owner_demand_id from test_demand_context),
      '{}'::uuid[],
      array['Duplicate', ' duplicate ']
    )
  $$,
  'P0001',
  'DEMAND_TAG_NAMES_DUPLICATED',
  'Novos nomes duplicados após normalização devem ser negados'
);

reset role;
insert into public.demand_tags (id, organization_id, name, created_by)
values ('f9999999-9999-4999-8999-999999999999', 'b2222222-2222-4222-8222-222222222222', 'Foreign Tag', '50555555-5555-4555-8555-555555555555');

set local role authenticated;
set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';

select throws_ok(
  $$
    select public.set_demand_tags(
      (select owner_demand_id from test_demand_context),
      array['f9999999-9999-4999-8999-999999999999'::uuid],
      '{}'::text[]
    )
  $$,
  'P0001',
  'DEMAND_TAG_INVALID',
  'Tag de outra Organization deve ser negada sem Data Leakage'
);

select is(
  (select count(*) from public.demand_tag_assignments where demand_id = (select owner_demand_id from test_demand_context)),
  1::bigint,
  'Tag cross-Organization deve causar rollback integral'
);


-- ============================================================
-- 7. LEITURAS MÍNIMAS SEM DATA LEAKAGE
-- ============================================================

select is(
  (select count(*) from public.list_eligible_demand_assignees('81111111-1111-4111-8111-111111111111')),
  3::bigint,
  'Lista elegível deve conter OWNER e MEMBERs com Assignment'
);

select is(
  (
    select count(*)
    from public.list_eligible_demand_assignees('81111111-1111-4111-8111-111111111111') as candidate
    where candidate.role not in ('OWNER', 'MEMBER')
  ),
  0::bigint,
  'Lista elegível deve excluir ADMIN e roles não aprovadas'
);

select is(
  (
    select array_agg(projected.key order by projected.key)
    from jsonb_object_keys(
      (
        select to_jsonb(candidate)
        from public.list_eligible_demand_assignees(
          '81111111-1111-4111-8111-111111111111'
        ) as candidate
        limit 1
      )
    ) as projected(key)
  ),
  array['full_name', 'membership_id', 'role']::text[],
  'Candidatos devem expor somente membership_id, full_name e role'
);

set local request.jwt.claim.sub = '20222222-2222-4222-8222-222222222222';
select is(
  (select count(*) from public.list_eligible_demand_assignees('81111111-1111-4111-8111-111111111111')),
  3::bigint,
  'MEMBER autorizado pode obter candidatos mínimos do Cliente'
);

set local request.jwt.claim.sub = '30333333-3333-4333-8333-333333333333';
select throws_ok(
  $$ select * from public.list_eligible_demand_assignees('81111111-1111-4111-8111-111111111111') $$,
  'P0001',
  'CLIENT_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER sem Assignment não pode enumerar candidatos'
);

set local request.jwt.claim.sub = '50555555-5555-4555-8555-555555555555';
select throws_ok(
  $$ select * from public.list_eligible_demand_assignees('81111111-1111-4111-8111-111111111111') $$,
  'P0001',
  'CLIENT_NOT_FOUND_OR_FORBIDDEN',
  'Outra Organization não pode enumerar candidatos'
);


-- ============================================================
-- 8. RESPONSÁVEL HISTÓRICO
-- ============================================================

set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';
select lives_ok(
  $$
    select public.remove_client_access(
      '81111111-1111-4111-8111-111111111111',
      '72222222-2222-4222-8222-222222222222'
    )
  $$,
  'OWNER deve poder remover o Client Assignment sem apagar assignee'
);

select is(
  (select count(*) from public.demand_assignees where demand_id = (select owner_demand_id from test_demand_context) and membership_id = '72222222-2222-4222-8222-222222222222'),
  1::bigint,
  'Assignee histórico deve permanecer relacionado'
);

set local request.jwt.claim.sub = '20222222-2222-4222-8222-222222222222';
select is((select count(*) from public.demands), 0::bigint, 'Remoção do Assignment deve retirar acesso imediatamente');

set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';
select is(
  (
    select is_currently_eligible
    from public.list_demand_assignees((select owner_demand_id from test_demand_context))
    where membership_id = '72222222-2222-4222-8222-222222222222'
  ),
  false,
  'Responsável histórico deve ser exibido como não elegível'
);

select is(
  (
    select array_agg(projected.key order by projected.key)
    from jsonb_object_keys(
      (
        select to_jsonb(assignee)
        from public.list_demand_assignees((select owner_demand_id from test_demand_context)) as assignee
        where membership_id = '72222222-2222-4222-8222-222222222222'
      )
    ) as projected(key)
  ),
  array[
    'full_name',
    'is_currently_eligible',
    'membership_id',
    'role'
  ]::text[],
  'Responsável vinculado deve expor somente quatro campos mínimos'
);

set local request.jwt.claim.sub = '20222222-2222-4222-8222-222222222222';
select throws_ok(
  $$ select * from public.list_demand_assignees((select owner_demand_id from test_demand_context)) $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'Responsável histórico sem acesso não pode consultar a Demanda'
);

set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';
select lives_ok(
  $$ select public.set_demand_assignees((select owner_demand_id from test_demand_context), '{}'::uuid[]) $$,
  'Gestão autorizada deve poder remover responsável histórico'
);

select is(
  (select count(*) from public.demand_assignees where demand_id = (select owner_demand_id from test_demand_context)),
  0::bigint,
  'Remoção explícita deve retirar a relação histórica'
);


-- ============================================================
-- 9. ARCHIVE DEMAND
-- ============================================================

set local request.jwt.claim.sub = '20222222-2222-4222-8222-222222222222';
select throws_ok(
  $$ select public.archive_demand((select owner_demand_id from test_demand_context)) $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'MEMBER sem Assignment continua negado no arquivamento'
);

set local request.jwt.claim.sub = '40444444-4444-4444-8444-444444444444';
select throws_ok(
  $$ select public.archive_demand((select owner_demand_id from test_demand_context)) $$,
  'P0001',
  'DEMAND_NOT_FOUND_OR_FORBIDDEN',
  'ADMIN deve ser negado no arquivamento'
);

set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';
select lives_ok(
  $$ select public.archive_demand((select owner_demand_id from test_demand_context)) $$,
  'OWNER deve arquivar Demanda'
);

select ok(
  (select archived_at is not null from public.demands where id = (select owner_demand_id from test_demand_context)),
  'archive_demand deve preencher archived_at'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_id = (select owner_demand_id from test_demand_context)
      and action = 'ARCHIVED'
  ),
  1::bigint,
  'Arquivamento deve gerar DEMAND / ARCHIVED'
);

select is(
  (select count(*) from public.demand_tag_assignments where demand_id = (select owner_demand_id from test_demand_context)),
  1::bigint,
  'Arquivamento lógico deve preservar Tags relacionadas'
);

select lives_ok(
  $$ select public.archive_demand((select owner_demand_id from test_demand_context)) $$,
  'Arquivamento repetido deve ser idempotente'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_id = (select owner_demand_id from test_demand_context)
      and action = 'ARCHIVED'
  ),
  1::bigint,
  'Arquivamento idempotente não deve duplicar Log'
);


-- ============================================================
-- 10. CONSTRAINTS E TRIGGERS DE INTEGRIDADE
-- ============================================================

reset role;

select throws_ok(
  $$
    insert into public.demands (organization_id, client_id, title, status, created_by, updated_by)
    values ('a1111111-1111-4111-8111-111111111111', '82222222-2222-4222-8222-222222222222', 'Invalid Status', 'INVALID', '10111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111')
  $$,
  '23514',
  null,
  'Status inválido deve ser negado pela constraint'
);

select throws_ok(
  $$
    insert into public.demands (organization_id, client_id, title, priority, created_by, updated_by)
    values ('a1111111-1111-4111-8111-111111111111', '82222222-2222-4222-8222-222222222222', 'Invalid Priority', 'INVALID', '10111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111')
  $$,
  '23514',
  null,
  'Priority inválida deve ser negada pela constraint'
);

select throws_ok(
  $$
    insert into public.demands (organization_id, client_id, title, created_by, updated_by)
    values ('a1111111-1111-4111-8111-111111111111', '82222222-2222-4222-8222-222222222222', '   ', '10111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111')
  $$,
  '23514',
  null,
  'Título vazio deve ser negado pela constraint'
);

select throws_ok(
  $$
    insert into public.demands (organization_id, client_id, title, created_by, updated_by)
    values ('b2222222-2222-4222-8222-222222222222', '82222222-2222-4222-8222-222222222222', 'Mismatched Ownership', '10111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111')
  $$,
  '23503',
  null,
  'Demand e Client de Organizations diferentes devem ser negados'
);

select throws_ok(
  $$ update public.demands set client_id = '82222222-2222-4222-8222-222222222222' where id = (select owner_demand_id from test_demand_context) $$,
  'P0001',
  'DEMAND_OWNERSHIP_IMMUTABLE',
  'client_id deve ser imutável'
);

select throws_ok(
  $$ update public.demands set organization_id = 'b2222222-2222-4222-8222-222222222222' where id = (select owner_demand_id from test_demand_context) $$,
  'P0001',
  'DEMAND_OWNERSHIP_IMMUTABLE',
  'organization_id deve ser imutável'
);

select throws_ok(
  $$ insert into public.demand_tags (organization_id, name, created_by) values ('a1111111-1111-4111-8111-111111111111', 'urgente', '10111111-1111-4111-8111-111111111111') $$,
  '23505',
  null,
  'Unicidade de Tags deve usar lower(trim(name))'
);

select throws_ok(
  $$ insert into public.demand_tags (organization_id, name, created_by) values ('a1111111-1111-4111-8111-111111111111', '   ', '10111111-1111-4111-8111-111111111111') $$,
  '23514',
  null,
  'Tag vazia deve ser negada'
);

select throws_ok(
  $$ insert into public.demand_tags (organization_id, name, created_by) values ('a1111111-1111-4111-8111-111111111111', ' Trimmed ', '10111111-1111-4111-8111-111111111111') $$,
  '23514',
  null,
  'Tag persistida fora da RPC deve continuar exigindo trim'
);

select throws_ok(
  $$
    insert into public.demand_assignees (demand_id, membership_id, created_by)
    values ((select empty_demand_id from test_demand_context), '75555555-5555-4555-8555-555555555555', '10111111-1111-4111-8111-111111111111')
  $$,
  'P0001',
  'DEMAND_ASSIGNEE_INVALID',
  'Trigger deve negar Assignee de outra Organization'
);

select throws_ok(
  $$
    insert into public.demand_tag_assignments (demand_id, tag_id)
    values ((select empty_demand_id from test_demand_context), 'f9999999-9999-4999-8999-999999999999')
  $$,
  'P0001',
  'DEMAND_TAG_ORGANIZATION_MISMATCH',
  'Trigger deve negar Tag Assignment cross-Organization'
);

insert into public.demand_assignees (demand_id, membership_id, created_by)
values ((select empty_demand_id from test_demand_context), '71111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111');

select throws_ok(
  $$
    insert into public.demand_assignees (demand_id, membership_id, created_by)
    values ((select empty_demand_id from test_demand_context), '71111111-1111-4111-8111-111111111111', '10111111-1111-4111-8111-111111111111')
  $$,
  '23505',
  null,
  'Assignee duplicado deve ser negado'
);

select throws_ok(
  $$
    insert into public.demand_tag_assignments (demand_id, tag_id)
    values ((select owner_demand_id from test_demand_context), (select tag_id from public.demand_tag_assignments where demand_id = (select owner_demand_id from test_demand_context) limit 1))
  $$,
  '23505',
  null,
  'Tag Assignment duplicado deve ser negado pela PK composta'
);


-- ============================================================
-- 11. ATOMICIDADE ENTRE MUTAÇÃO E ACTIVITY LOG
-- ============================================================

create or replace function pg_temp.reject_demand_activity_log()
returns trigger
language plpgsql
as $$
begin
  if new.entity_type = 'DEMAND' then
    raise exception using
      errcode = 'P0001',
      message = 'TEST_DEMAND_LOG_FAILURE';
  end if;

  return new;
end;
$$;

create trigger test_reject_demand_activity_log
before insert on public.activity_logs
for each row
execute function pg_temp.reject_demand_activity_log();

set local role authenticated;
set local request.jwt.claim.sub = '10111111-1111-4111-8111-111111111111';

select throws_ok(
  $$
    select public.update_demand(
      (select empty_demand_id from test_demand_context),
      'Must Roll Back',
      null,
      'LOW'
    )
  $$,
  'P0001',
  'TEST_DEMAND_LOG_FAILURE',
  'Falha do Activity Log deve falhar a operação inteira'
);

reset role;

select is(
  (select title from public.demands where id = (select empty_demand_id from test_demand_context)),
  'Demand Without Assignees',
  'Falha do Log deve reverter a mutação principal'
);

select is(
  (
    select count(*)
    from public.activity_logs
    where entity_id = (select empty_demand_id from test_demand_context)
      and action = 'UPDATED'
  ),
  0::bigint,
  'Rollback não deve deixar Activity Log parcial'
);


select * from finish();
rollback;
