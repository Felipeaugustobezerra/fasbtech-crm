begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users(id,email,raw_user_meta_data) values
('d1000000-0000-4000-8000-000000000001','contract-rpc-owner@test.local','{"full_name":"Owner"}');
insert into public.profiles(id,full_name,status) values
('d1000000-0000-4000-8000-000000000001','Owner','ACTIVE');
insert into public.organizations(id,name,slug,status) values
('d2000000-0000-4000-8000-000000000001','Contract RPC','contract-rpc','ACTIVE');
insert into public.organization_members(id,organization_id,user_id,role,status) values
('d3000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001','OWNER','ACTIVE');
insert into public.clients(id,organization_id,name,email,tax_id,tax_id_type,created_by,updated_by) values
('d4000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','Client','client@test.local','PT123','NIF','d1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001'),
('d4000000-0000-4000-8000-000000000002','d2000000-0000-4000-8000-000000000001','Archived',null,null,null,'d1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001');
update public.clients set archived_at=now() where id='d4000000-0000-4000-8000-000000000002';

set local role authenticated;
set local request.jwt.claim.sub='d1000000-0000-4000-8000-000000000001';

select lives_ok($$select public.create_contract_template('  Main  ','  Contract body  ')$$, 'OWNER cria Template');
select is((select name from public.contract_templates limit 1),'Main','nome do Template é normalizado');
select is((select content from public.contract_templates limit 1),'Contract body','conteúdo do Template é normalizado');
select is((select action from public.activity_logs where entity_type='CONTRACT_TEMPLATE' order by created_at desc limit 1),'CREATED','criação do Template registra Log');

select lives_ok($$select public.update_contract_template((select id from public.contract_templates limit 1),'Updated','Updated body')$$,'OWNER atualiza Template');
select lives_ok($$select public.deactivate_contract_template((select id from public.contract_templates limit 1))$$,'OWNER desativa Template');
select is((select is_active from public.contract_templates limit 1),false,'Template fica inativo');
select throws_ok($$select public.create_contract('d4000000-0000-4000-8000-000000000001',(select id from public.contract_templates limit 1),'Contract','{}')$$,'P0001','CONTRACT_TEMPLATE_INVALID','Template inativo não inicia Contract');
select lives_ok($$select public.activate_contract_template((select id from public.contract_templates limit 1))$$,'OWNER reativa Template');
select throws_ok($$select public.create_contract('d4000000-0000-4000-8000-000000000002',(select id from public.contract_templates limit 1),'Contract','{}')$$,'P0001','CONTRACT_CLIENT_INVALID','Cliente arquivado não inicia Contract');

select lives_ok($$select public.create_contract('d4000000-0000-4000-8000-000000000001',(select id from public.contract_templates limit 1),'  First Contract  ','{"field":"value"}')$$,'OWNER cria Contract DRAFT');
select is((select title from public.contracts limit 1),'First Contract','título é normalizado');
select is((select status from public.contracts limit 1),'DRAFT','Contract nasce DRAFT');
select lives_ok($$select public.update_draft_contract((select id from public.contracts limit 1),'d4000000-0000-4000-8000-000000000001',(select id from public.contract_templates limit 1),'Changed','{"field":"changed"}')$$,'DRAFT é editável');
select is((select count(*) from public.activity_logs where entity_type='CONTRACT' and action='UPDATED'),1::bigint,'edição registra Log');

reset role;
insert into storage.objects(id,bucket_id,name,owner,owner_id,metadata) values(
  'd7000000-0000-4000-8000-000000000001','private-files',
  'd2000000-0000-4000-8000-000000000001/contracts/'||(select id from public.contracts limit 1)||'/d7000000-0000-4000-8000-000000000001/ORIGINAL_PDF.pdf',
  'd1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001','{"mimetype":"application/pdf","size":321}'
);

set local role authenticated;
set local request.jwt.claim.sub='d1000000-0000-4000-8000-000000000001';
select throws_ok($$select public.generate_contract(
  (select id from public.contracts limit 1),
  jsonb_build_object('schema_version',1,'content','Final','client',jsonb_build_object('id','d4000000-0000-4000-8000-000000000001','data',jsonb_build_object(),'tax_id','PT123','tax_id_type','NIF'),'manual_fields',jsonb_build_object(),'template',jsonb_build_object('id',(select id from public.contract_templates limit 1),'name','Updated')),
  'd7000000-0000-4000-8000-000000000001',
  'd2000000-0000-4000-8000-000000000001/contracts/'||(select id from public.contracts limit 1)||'/d7000000-0000-4000-8000-000000000001/ORIGINAL_PDF.pdf',
  'original.pdf','application/pdf',999
)$$,'P0001','CONTRACT_DOCUMENT_OBJECT_INVALID','metadata declarada deve corresponder ao objeto');

select lives_ok($$select public.generate_contract(
  (select id from public.contracts limit 1),
  jsonb_build_object('schema_version',1,'content','Final','client',jsonb_build_object('id','d4000000-0000-4000-8000-000000000001','data',jsonb_build_object('name','Client'),'tax_id','PT123','tax_id_type','NIF'),'manual_fields',jsonb_build_object('value','x'),'template',jsonb_build_object('id',(select id from public.contract_templates limit 1),'name','Updated')),
  'd7000000-0000-4000-8000-000000000001',
  'd2000000-0000-4000-8000-000000000001/contracts/'||(select id from public.contracts limit 1)||'/d7000000-0000-4000-8000-000000000001/ORIGINAL_PDF.pdf',
  'original.pdf','application/pdf',321
)$$,'DRAFT gera Contract somente com objeto original válido');
select is((select status from public.contracts limit 1),'GENERATED','Status muda para GENERATED');
select is((select count(*) from public.documents where kind='ORIGINAL_PDF'),1::bigint,'metadata ORIGINAL_PDF é criada');
select is((select count(*) from public.activity_logs where entity_type='CONTRACT' and action='GENERATED'),1::bigint,'geração registra Log');
select ok(not exists(select 1 from public.activity_logs where entity_type='CONTRACT' and metadata::text like '%Final%'),'Log não contém snapshot/conteúdo');

select throws_ok($$select public.update_draft_contract((select id from public.contracts limit 1),'d4000000-0000-4000-8000-000000000001',(select id from public.contract_templates limit 1),'Illegal','{}')$$,'P0001','CONTRACT_NOT_EDITABLE','Contract gerado não volta a ser editável');
select throws_ok($$update public.contracts set snapshot=jsonb_build_object('schema_version',1) where id=(select id from public.contracts limit 1)$$,'42501',null,'escrita direta não altera snapshot');
select throws_ok($$select public.generate_contract((select id from public.contracts limit 1),'{}','d7000000-0000-4000-8000-000000000002','x','x.pdf','application/pdf',1)$$,'P0001','CONTRACT_GENERATE_STATUS_INVALID','não regenera Contract existente');

select lives_ok($$select public.mark_contract_sent((select id from public.contracts limit 1),' Recipient@Example.com ')$$,'GENERATED muda para SENT');
select is((select status from public.contracts limit 1),'SENT','Status SENT persistido');
select is((select sent_to_email from public.contracts limit 1),'recipient@example.com','destinatário efetivo normalizado');
select ok((select sent_at is not null from public.contracts limit 1),'sent_at vem do banco');

reset role;
insert into storage.objects(id,bucket_id,name,owner,owner_id,metadata) values(
  'd7000000-0000-4000-8000-000000000002','private-files',
  'd2000000-0000-4000-8000-000000000001/contracts/'||(select id from public.contracts limit 1)||'/d7000000-0000-4000-8000-000000000002/SIGNED_COPY.pdf',
  'd1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001','{"mimetype":"application/pdf","size":654}'
);

set local role authenticated;
set local request.jwt.claim.sub='d1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.mark_contract_signed(
  (select id from public.contracts limit 1),'d7000000-0000-4000-8000-000000000002',
  'd2000000-0000-4000-8000-000000000001/contracts/'||(select id from public.contracts limit 1)||'/d7000000-0000-4000-8000-000000000002/SIGNED_COPY.pdf',
  'signed.pdf','application/pdf',654
)$$,'SENT muda para SIGNED com cópia assinada');
select is((select status from public.contracts limit 1),'SIGNED','Status SIGNED persistido');
select ok((select signed_at is not null from public.contracts limit 1),'signed_at vem do banco');
select is((select count(*) from public.documents),2::bigint,'original e signed copy permanecem separados');
select throws_ok($$select public.cancel_contract((select id from public.contracts limit 1))$$,'P0001','CONTRACT_CANCEL_STATUS_INVALID','SIGNED é terminal');
select throws_ok($$update public.documents set file_name='replace.pdf' where kind='ORIGINAL_PDF'$$,'42501',null,'metadata não pode ser substituída diretamente');
select throws_ok($$delete from public.documents where kind='ORIGINAL_PDF'$$,'42501',null,'metadata original não pode ser apagada diretamente');

select lives_ok($$select public.create_contract('d4000000-0000-4000-8000-000000000001',(select id from public.contract_templates limit 1),'Cancel me','{}')$$,'cria segundo DRAFT');
reset role;
insert into storage.objects(id,bucket_id,name,owner,owner_id,metadata) values(
  'd7000000-0000-4000-8000-000000000003','private-files',
  'd2000000-0000-4000-8000-000000000001/contracts/'||(select id from public.contracts where title='Cancel me')||'/d7000000-0000-4000-8000-000000000003/ORIGINAL_PDF.pdf',
  'd1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000001','{"mimetype":"application/pdf","size":100}'
);
set local role authenticated;
set local request.jwt.claim.sub='d1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.generate_contract(
  (select id from public.contracts where title='Cancel me'),
  jsonb_build_object('schema_version',1,'content','Cancel','client',jsonb_build_object('id','d4000000-0000-4000-8000-000000000001','data',jsonb_build_object(),'tax_id',null,'tax_id_type',null),'manual_fields',jsonb_build_object(),'template',jsonb_build_object('id',(select id from public.contract_templates limit 1),'name','Updated')),
  'd7000000-0000-4000-8000-000000000003',
  'd2000000-0000-4000-8000-000000000001/contracts/'||(select id from public.contracts where title='Cancel me')||'/d7000000-0000-4000-8000-000000000003/ORIGINAL_PDF.pdf',
  'cancel.pdf','application/pdf',100
)$$,'gera segundo Contract');
select lives_ok($$select public.cancel_contract((select id from public.contracts where title='Cancel me'))$$,'GENERATED pode ser cancelado');
select is((select status from public.contracts where title='Cancel me'),'CANCELED','Status CANCELED persistido');
select ok((select canceled_at is not null from public.contracts where title='Cancel me'),'canceled_at vem do banco');
select is((select count(*) from public.documents where entity_id=(select id from public.contracts where title='Cancel me')),1::bigint,'cancelamento preserva PDF original');

select * from finish();
rollback;
