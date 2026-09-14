begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

insert into auth.users(id,email,raw_user_meta_data) values
('f1000000-0000-4000-8000-000000000001','finance-owner-a@test.local','{"full_name":"Owner A"}'),
('f1000000-0000-4000-8000-000000000002','finance-admin@test.local','{"full_name":"Admin"}'),
('f1000000-0000-4000-8000-000000000003','finance-member@test.local','{"full_name":"Member"}'),
('f1000000-0000-4000-8000-000000000004','finance-owner-b@test.local','{"full_name":"Owner B"}'),
('f1000000-0000-4000-8000-000000000005','finance-suspended@test.local','{"full_name":"Suspended"}');
insert into public.profiles(id,full_name,status) values
('f1000000-0000-4000-8000-000000000001','Owner A','ACTIVE'),('f1000000-0000-4000-8000-000000000002','Admin','ACTIVE'),
('f1000000-0000-4000-8000-000000000003','Member','ACTIVE'),('f1000000-0000-4000-8000-000000000004','Owner B','ACTIVE'),
('f1000000-0000-4000-8000-000000000005','Suspended','ACTIVE');
insert into public.organizations(id,name,slug,status) values
('f2000000-0000-4000-8000-000000000001','Finance A','finance-a','ACTIVE'),('f2000000-0000-4000-8000-000000000002','Finance B','finance-b','ACTIVE');
insert into public.organization_members(id,organization_id,user_id,role,status) values
('f3000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000001','OWNER','ACTIVE'),
('f3000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000002','ADMIN','ACTIVE'),
('f3000000-0000-4000-8000-000000000003','f2000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000003','MEMBER','ACTIVE'),
('f3000000-0000-4000-8000-000000000004','f2000000-0000-4000-8000-000000000002','f1000000-0000-4000-8000-000000000004','OWNER','ACTIVE'),
('f3000000-0000-4000-8000-000000000005','f2000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000005','OWNER','SUSPENDED');
insert into public.financial_entries(id,organization_id,type,description,amount,reference_date,created_by,updated_by) values
('f4000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001','INCOME','A',10,'2026-09-01','f1000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000001'),
('f4000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000002','INCOME','B',10,'2026-09-01','f1000000-0000-4000-8000-000000000004','f1000000-0000-4000-8000-000000000004');
insert into public.financial_goals(id,organization_id,year,month,target_amount,created_by,updated_by) values
('f5000000-0000-4000-8000-000000000001','f2000000-0000-4000-8000-000000000001',2026,9,100,'f1000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000001'),
('f5000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000002',2026,9,100,'f1000000-0000-4000-8000-000000000004','f1000000-0000-4000-8000-000000000004');

set local role authenticated;
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000001';
select is((select count(*) from public.financial_entries),1::bigint,'OWNER vê entries próprias');
select is((select count(*) from public.financial_goals),1::bigint,'OWNER vê goals próprios');
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000002';
select is((select count(*) from public.financial_entries),0::bigint,'ADMIN não vê entries');
select is((select count(*) from public.financial_goals),0::bigint,'ADMIN não vê goals');
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000003';
select is((select count(*) from public.financial_entries),0::bigint,'MEMBER não vê entries');
select is((select count(*) from public.financial_goals),0::bigint,'MEMBER não vê goals');
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000004';
select is((select count(*) from public.financial_entries),1::bigint,'outra OWNER vê somente própria org');
select is((select id from public.financial_entries),'f4000000-0000-4000-8000-000000000002'::uuid,'sem cross-org');
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000005';
select is((select count(*) from public.financial_entries),0::bigint,'Membership suspensa negada');
set local request.jwt.claim.sub='f1000000-0000-4000-8000-000000000001';
select throws_ok($$insert into public.financial_entries(organization_id,type,description,amount,reference_date,created_by,updated_by) values('f2000000-0000-4000-8000-000000000001','INCOME','x',1,current_date,'f1000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000001')$$,'42501',null,'INSERT direto negado');
select throws_ok($$update public.financial_entries set description='x'$$,'42501',null,'UPDATE direto negado');
select throws_ok($$delete from public.financial_entries$$,'42501',null,'DELETE direto negado');
select throws_ok($$insert into public.financial_goals(organization_id,year,month,target_amount,created_by,updated_by) values('f2000000-0000-4000-8000-000000000001',2027,1,1,'f1000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000001')$$,'42501',null,'goal INSERT direto negado');
select throws_ok($$update public.financial_goals set target_amount=2$$,'42501',null,'goal UPDATE direto negado');
select throws_ok($$delete from public.financial_goals$$,'42501',null,'goal DELETE direto negado');
reset role;
set local role anon;
select throws_ok($$select * from public.financial_entries$$,'42501',null,'anon sem acesso entries');
select throws_ok($$select * from public.financial_goals$$,'42501',null,'anon sem acesso goals');
select throws_ok($$select * from public.get_financial_summary(2026,9)$$,'42501',null,'anon sem summary');

select * from finish();
rollback;
