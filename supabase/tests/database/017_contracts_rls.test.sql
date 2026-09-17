begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users(id,email,raw_user_meta_data) values
('c1000000-0000-4000-8000-000000000001','contract-owner-a@test.local','{"full_name":"Owner A"}'),
('c1000000-0000-4000-8000-000000000002','contract-admin@test.local','{"full_name":"Admin"}'),
('c1000000-0000-4000-8000-000000000003','contract-member@test.local','{"full_name":"Member"}'),
('c1000000-0000-4000-8000-000000000004','contract-owner-b@test.local','{"full_name":"Owner B"}');

insert into public.profiles(id,full_name,status) values
('c1000000-0000-4000-8000-000000000001','Owner A','ACTIVE'),
('c1000000-0000-4000-8000-000000000002','Admin','ACTIVE'),
('c1000000-0000-4000-8000-000000000003','Member','ACTIVE'),
('c1000000-0000-4000-8000-000000000004','Owner B','ACTIVE');

insert into public.organizations(id,name,slug,status) values
('c2000000-0000-4000-8000-000000000001','Contracts A','contracts-a','ACTIVE'),
('c2000000-0000-4000-8000-000000000002','Contracts B','contracts-b','ACTIVE');

insert into public.organization_members(id,organization_id,user_id,role,status) values
('c3000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001','OWNER','ACTIVE'),
('c3000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000002','ADMIN','ACTIVE'),
('c3000000-0000-4000-8000-000000000003','c2000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000003','MEMBER','ACTIVE'),
('c3000000-0000-4000-8000-000000000004','c2000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000004','OWNER','ACTIVE');

insert into public.clients(id,organization_id,name,created_by,updated_by) values
('c4000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','Client A','c1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001'),
('c4000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000002','Client B','c1000000-0000-4000-8000-000000000004','c1000000-0000-4000-8000-000000000004');

insert into public.contract_templates(id,organization_id,name,content,created_by,updated_by) values
('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','Template A','Body A','c1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001'),
('c5000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000002','Template B','Body B','c1000000-0000-4000-8000-000000000004','c1000000-0000-4000-8000-000000000004');

insert into public.contracts(id,organization_id,client_id,template_id,title,created_by,updated_by) values
('c6000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','Contract A','c1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001'),
('c6000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000002','c4000000-0000-4000-8000-000000000002','c5000000-0000-4000-8000-000000000002','Contract B','c1000000-0000-4000-8000-000000000004','c1000000-0000-4000-8000-000000000004');

insert into public.documents(id,organization_id,entity_type,entity_id,kind,object_path,file_name,size_bytes,created_by) values
('c7000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','CONTRACT','c6000000-0000-4000-8000-000000000001','ORIGINAL_PDF','c2000000-0000-4000-8000-000000000001/contracts/c6000000-0000-4000-8000-000000000001/c7000000-0000-4000-8000-000000000001/ORIGINAL_PDF.pdf','a.pdf',10,'c1000000-0000-4000-8000-000000000001'),
('c7000000-0000-4000-8000-000000000002','c2000000-0000-4000-8000-000000000002','CONTRACT','c6000000-0000-4000-8000-000000000002','ORIGINAL_PDF','c2000000-0000-4000-8000-000000000002/contracts/c6000000-0000-4000-8000-000000000002/c7000000-0000-4000-8000-000000000002/ORIGINAL_PDF.pdf','b.pdf',10,'c1000000-0000-4000-8000-000000000004');

insert into storage.objects(id,bucket_id,name,owner,owner_id,metadata) values
('c7000000-0000-4000-8000-000000000001','private-files','c2000000-0000-4000-8000-000000000001/contracts/c6000000-0000-4000-8000-000000000001/c7000000-0000-4000-8000-000000000001/ORIGINAL_PDF.pdf','c1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001','{"mimetype":"application/pdf","size":10}'),
('c7000000-0000-4000-8000-000000000002','private-files','c2000000-0000-4000-8000-000000000002/contracts/c6000000-0000-4000-8000-000000000002/c7000000-0000-4000-8000-000000000002/ORIGINAL_PDF.pdf','c1000000-0000-4000-8000-000000000004','c1000000-0000-4000-8000-000000000004','{"mimetype":"application/pdf","size":10}');

set local role authenticated;
set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000001';
select is((select count(*) from public.contract_templates),1::bigint,'OWNER vê apenas seus templates');
select is((select count(*) from public.contracts),1::bigint,'OWNER vê apenas seus Contracts');
select is((select count(*) from public.documents),1::bigint,'OWNER vê apenas seus Documents');
select is((select count(*) from storage.objects where bucket_id='private-files' and name like '%/contracts/%'),1::bigint,'OWNER lê apenas o objeto vinculado autorizado');
select is((select id from public.contracts),'c6000000-0000-4000-8000-000000000001'::uuid,'OWNER não recebe Contract cross-org');
select lives_ok($$insert into storage.objects(id,bucket_id,name,owner,owner_id,metadata) values('c7000000-0000-4000-8000-000000000003','private-files','c2000000-0000-4000-8000-000000000001/contracts/c6000000-0000-4000-8000-000000000001/c7000000-0000-4000-8000-000000000003/ORIGINAL_PDF.pdf','c1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001','{"mimetype":"application/pdf","size":10}')$$,'OWNER envia objeto canônico para DRAFT');
select is((select count(*) from storage.objects where id='c7000000-0000-4000-8000-000000000003'),0::bigint,'objeto órfão não fica visível antes da metadata');
reset role;
select ok(
  (select private.can_delete_orphan_contract_object(
    'c2000000-0000-4000-8000-000000000001/contracts/c6000000-0000-4000-8000-000000000001/c7000000-0000-4000-8000-000000000003/ORIGINAL_PDF.pdf',
    'c1000000-0000-4000-8000-000000000001'
  )),
  'Policy autoriza remoção compensatória do objeto órfão pela Storage API'
);

set local role authenticated;
set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000002';
select is((select count(*) from public.contract_templates),0::bigint,'ADMIN não vê templates');
select is((select count(*) from public.contracts),0::bigint,'ADMIN não vê Contracts');
select is((select count(*) from public.documents),0::bigint,'ADMIN não vê Documents');
select is((select count(*) from storage.objects where bucket_id='private-files' and name like '%/contracts/%'),0::bigint,'ADMIN não vê objetos de Contracts');
select throws_ok($$insert into storage.objects(id,bucket_id,name,owner,owner_id,metadata) values('c7000000-0000-4000-8000-000000000004','private-files','c2000000-0000-4000-8000-000000000001/contracts/c6000000-0000-4000-8000-000000000001/c7000000-0000-4000-8000-000000000004/ORIGINAL_PDF.pdf','c1000000-0000-4000-8000-000000000002','c1000000-0000-4000-8000-000000000002','{"mimetype":"application/pdf","size":10}')$$,'42501',null,'ADMIN não envia objeto de Contract');

set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000003';
select is((select count(*) from public.contract_templates),0::bigint,'MEMBER não vê templates');
select is((select count(*) from public.contracts),0::bigint,'MEMBER não vê Contracts mesmo na própria Organization');
select is((select count(*) from public.documents),0::bigint,'MEMBER não vê Documents');
select throws_ok($$insert into storage.objects(id,bucket_id,name,owner,owner_id,metadata) values('c7000000-0000-4000-8000-000000000005','private-files','c2000000-0000-4000-8000-000000000001/contracts/c6000000-0000-4000-8000-000000000001/c7000000-0000-4000-8000-000000000005/ORIGINAL_PDF.pdf','c1000000-0000-4000-8000-000000000003','c1000000-0000-4000-8000-000000000003','{"mimetype":"application/pdf","size":10}')$$,'42501',null,'MEMBER não envia objeto de Contract');

set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000001';
select throws_ok($$insert into public.contract_templates(organization_id,name,content,created_by,updated_by) values('c2000000-0000-4000-8000-000000000001','x','x','c1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001')$$,'42501',null,'INSERT direto em templates negado');
select throws_ok($$update public.contract_templates set name='x'$$,'42501',null,'UPDATE direto em templates negado');
select throws_ok($$delete from public.contract_templates$$,'42501',null,'DELETE direto em templates negado');
select throws_ok($$insert into public.contracts(organization_id,client_id,template_id,title,created_by,updated_by) values('c2000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','x','c1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000001')$$,'42501',null,'INSERT direto em Contracts negado');
select throws_ok($$update public.contracts set title='x'$$,'42501',null,'UPDATE direto em Contracts negado');
select throws_ok($$delete from public.contracts$$,'42501',null,'DELETE direto em Contracts negado');
select throws_ok($$insert into public.documents(id,organization_id,entity_type,entity_id,kind,object_path,file_name,size_bytes,created_by) values(gen_random_uuid(),'c2000000-0000-4000-8000-000000000001','CONTRACT','c6000000-0000-4000-8000-000000000001','ORIGINAL_PDF','x','x.pdf',1,'c1000000-0000-4000-8000-000000000001')$$,'42501',null,'INSERT direto em Documents negado');

set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000002';
select throws_ok($$select public.create_contract_template('x','x')$$,'P0001','AUTHORIZATION_DENIED','ADMIN não executa mutação autorizada');
set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000003';
select throws_ok($$select public.create_contract_template('x','x')$$,'P0001','AUTHORIZATION_DENIED','MEMBER não executa mutação autorizada');
set local request.jwt.claim.sub='c1000000-0000-4000-8000-000000000004';
select throws_ok($$select public.update_contract_template('c5000000-0000-4000-8000-000000000001','x','x')$$,'P0001','CONTRACT_TEMPLATE_NOT_FOUND_OR_FORBIDDEN','OWNER cross-org é negado sem revelar entidade');
select is((select count(*) from public.documents),1::bigint,'outra OWNER vê somente seu Document');
select throws_ok($$insert into storage.objects(id,bucket_id,name,owner,owner_id,metadata) values('c7000000-0000-4000-8000-000000000006','private-files','c2000000-0000-4000-8000-000000000001/contracts/c6000000-0000-4000-8000-000000000001/c7000000-0000-4000-8000-000000000006/ORIGINAL_PDF.pdf','c1000000-0000-4000-8000-000000000004','c1000000-0000-4000-8000-000000000004','{"mimetype":"application/pdf","size":10}')$$,'42501',null,'OWNER cross-org não envia objeto');

reset role;
set local role anon;
select throws_ok($$select * from public.contracts$$,'42501',null,'anon sem acesso a Contracts');
select throws_ok($$select * from public.documents$$,'42501',null,'anon sem acesso a Documents');
select throws_ok($$select public.create_contract_template('x','x')$$,'42501',null,'anon sem EXECUTE de RPC');

select * from finish();
rollback;
