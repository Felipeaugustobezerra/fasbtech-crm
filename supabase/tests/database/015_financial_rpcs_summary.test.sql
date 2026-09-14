begin;
create extension if not exists pgtap with schema extensions;
select plan(70);

insert into auth.users(id,email,raw_user_meta_data) values
('e1000000-0000-4000-8000-000000000001','fin-owner@test.local','{"full_name":"Owner"}'),
('e1000000-0000-4000-8000-000000000002','fin-admin@test.local','{"full_name":"Admin"}'),
('e1000000-0000-4000-8000-000000000003','fin-member@test.local','{"full_name":"Member"}'),
('e1000000-0000-4000-8000-000000000004','fin-owner-b@test.local','{"full_name":"Owner B"}');
insert into public.profiles(id,full_name) values
('e1000000-0000-4000-8000-000000000001','Owner'),('e1000000-0000-4000-8000-000000000002','Admin'),
('e1000000-0000-4000-8000-000000000003','Member'),('e1000000-0000-4000-8000-000000000004','Owner B');
insert into public.organizations(id,name,slug) values
('e2000000-0000-4000-8000-000000000001','Finance RPC A','finance-rpc-a'),
('e2000000-0000-4000-8000-000000000002','Finance RPC B','finance-rpc-b');
insert into public.organization_members(id,organization_id,user_id,role,status) values
('e3000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001','OWNER','ACTIVE'),
('e3000000-0000-4000-8000-000000000002','e2000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000002','ADMIN','ACTIVE'),
('e3000000-0000-4000-8000-000000000003','e2000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000003','MEMBER','ACTIVE'),
('e3000000-0000-4000-8000-000000000004','e2000000-0000-4000-8000-000000000002','e1000000-0000-4000-8000-000000000004','OWNER','ACTIVE');
insert into public.clients(id,organization_id,name,created_by,updated_by) values
('e4000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000001','Client A1','e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001'),
('e4000000-0000-4000-8000-000000000002','e2000000-0000-4000-8000-000000000001','Client A2','e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001'),
('e4000000-0000-4000-8000-000000000003','e2000000-0000-4000-8000-000000000002','Client B','e1000000-0000-4000-8000-000000000004','e1000000-0000-4000-8000-000000000004');

select throws_ok($$insert into public.financial_entries(organization_id,type,description,amount,reference_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','BAD','x',1,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'type inválido');
select throws_ok($$insert into public.financial_entries(organization_id,type,status,description,amount,reference_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','INCOME','BAD','x',1,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'status inválido');
select throws_ok($$insert into public.financial_entries(organization_id,type,payment_nature,description,amount,reference_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','INCOME','BAD','x',1,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'nature inválida');
select throws_ok($$insert into public.financial_entries(organization_id,type,description,amount,reference_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','INCOME',' ',1,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'description vazia');
select throws_ok($$insert into public.financial_entries(organization_id,type,description,category,amount,reference_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','INCOME','x',' ',1,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'category vazia não armazenada');
select throws_ok($$insert into public.financial_entries(organization_id,type,description,amount,reference_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','INCOME','x',0,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'amount zero');
select throws_ok($$insert into public.financial_entries(organization_id,type,description,amount,reference_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','INCOME','x',-1,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'amount negativo');
select throws_ok($$insert into public.financial_entries(organization_id,type,status,description,amount,reference_date,realized_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','INCOME','PENDING','x',1,current_date,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'PENDING com data');
select throws_ok($$insert into public.financial_entries(organization_id,type,status,description,amount,reference_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','INCOME','REALIZED','x',1,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'REALIZED sem data');
select lives_ok($$insert into public.financial_entries(organization_id,type,status,description,amount,reference_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','INCOME','CANCELED','Canceled',1,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'CANCELED sem data');
select lives_ok($$insert into public.financial_entries(organization_id,type,status,description,amount,reference_date,realized_date,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001','INCOME','CANCELED','Canceled dated',1,current_date,current_date,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'CANCELED com data');
select throws_ok($$insert into public.financial_goals(organization_id,year,month,target_amount,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001',0,1,1,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'year positivo');
select throws_ok($$insert into public.financial_goals(organization_id,year,month,target_amount,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001',2026,13,1,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'month válido');
select throws_ok($$insert into public.financial_goals(organization_id,year,month,target_amount,created_by,updated_by) values('e2000000-0000-4000-8000-000000000001',2026,1,0,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001')$$,'23514',null,'target positivo');
select lives_ok($$insert into public.financial_goals(organization_id,year,month,target_amount,created_by,updated_by) values('e2000000-0000-4000-8000-000000000002',2025,1,100,'e1000000-0000-4000-8000-000000000004','e1000000-0000-4000-8000-000000000004')$$,'primeira meta no período');
select throws_ok($$insert into public.financial_goals(organization_id,year,month,target_amount,created_by,updated_by) values('e2000000-0000-4000-8000-000000000002',2025,1,200,'e1000000-0000-4000-8000-000000000004','e1000000-0000-4000-8000-000000000004')$$,'23505',null,'meta duplicada negada');

set local role authenticated;
set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000001';
select lives_ok($$select public.create_financial_entry('income','  Receita  ',100,'2026-09-10','e4000000-0000-4000-8000-000000000001','recurring','  Serviços  ',null,'  nota  ')$$,'OWNER cria entry');
select is((select description from public.financial_entries where description='Receita'),'Receita','description trim');
select is((select category from public.financial_entries where description='Receita'),'Serviços','category trim');
select is((select status from public.financial_entries where description='Receita'),'PENDING','default PENDING');
select is((select payment_nature from public.financial_entries where description='Receita'),'RECURRING','nature normalizada');
select is((select count(*) from public.activity_logs where entity_id=(select id from public.financial_entries where description='Receita') and action='CREATED'),1::bigint,'create log');
select lives_ok($$select public.create_financial_entry('EXPENSE','Despesa interna',25,'2026-09-10')$$,'OWNER cria despesa sem Client');
select is((select client_id from public.financial_entries where description='Despesa interna'),null::uuid,'Client opcional permanece NULL');
select lives_ok($$select public.update_financial_entry((select id from public.financial_entries where description='Receita'),'EXPENSE','Despesa',40,'2026-09-11','e4000000-0000-4000-8000-000000000002','ONE_TIME','',null,'')$$,'update autorizado');
select is((select client_id from public.financial_entries where description='Despesa'),'e4000000-0000-4000-8000-000000000002'::uuid,'Client alterado');
select is((select category from public.financial_entries where description='Despesa'),null::text,'category vazia vira NULL');
select is((select count(*) from public.activity_logs where entity_id=(select id from public.financial_entries where description='Despesa') and action='UPDATED'),1::bigint,'update log');
select lives_ok($$select public.update_financial_entry((select id from public.financial_entries where description='Despesa'),'EXPENSE','Despesa',40,'2026-09-11',null,'ONE_TIME',null,null,null)$$,'update permite remover Client');
select is((select client_id from public.financial_entries where description='Despesa'),null::uuid,'Client removido');
select is((select status from public.financial_entries where description='Despesa'),'PENDING','update não altera status');
select throws_ok($$select public.update_financial_entry((select id from public.financial_entries where description='Despesa'),'EXPENSE','x',1,current_date,'e4000000-0000-4000-8000-000000000003')$$,'P0001','FINANCIAL_CLIENT_INVALID','Client cross-org negado');
select lives_ok($$select public.change_financial_entry_status((select id from public.financial_entries where description='Despesa'),'PENDING',null)$$,'PENDING idêntico é no-op');
select is((select count(*) from public.activity_logs where entity_id=(select id from public.financial_entries where description='Despesa') and action='STATUS_CHANGED'),0::bigint,'status no-op sem log');
select lives_ok($$select public.change_financial_entry_status((select id from public.financial_entries where description='Despesa'),'REALIZED','2026-09-12')$$,'realiza entry');
select is((select realized_date from public.financial_entries where description='Despesa'),'2026-09-12'::date,'data realizada');
select lives_ok($$select public.change_financial_entry_status((select id from public.financial_entries where description='Despesa'),'CANCELED',null)$$,'cancela preservando data');
select is((select realized_date from public.financial_entries where description='Despesa'),'2026-09-12'::date,'cancel preserva data');
select is((select metadata from public.activity_logs where entity_id=(select id from public.financial_entries where description='Despesa') and action='STATUS_CHANGED' and metadata->>'new_status'='CANCELED'),jsonb_build_object('old_status','REALIZED','new_status','CANCELED','old_realized_date','2026-09-12'::date,'new_realized_date','2026-09-12'::date),'metadata mínima');
select lives_ok($$select public.archive_financial_entry((select id from public.financial_entries where description='Despesa'))$$,'archive autorizado');
select is((select status from public.financial_entries where description='Despesa'),'CANCELED','archive preserva status');
select is((select amount from public.financial_entries where description='Despesa'),40.00::numeric,'archive preserva amount');
select is((select type from public.financial_entries where description='Despesa'),'EXPENSE','archive preserva type');
select lives_ok($$select public.archive_financial_entry((select id from public.financial_entries where description='Despesa'))$$,'archive idempotente');
select is((select count(*) from public.activity_logs where entity_id=(select id from public.financial_entries where description='Despesa') and action='ARCHIVED'),1::bigint,'um archive log');
select throws_ok($$select public.update_financial_entry((select id from public.financial_entries where description='Despesa'),'INCOME','x',1,current_date)$$,'P0001','FINANCIAL_ENTRY_NOT_FOUND_OR_FORBIDDEN','arquivada não edita');
select throws_ok($$select public.change_financial_entry_status((select id from public.financial_entries where description='Despesa'),'PENDING',null)$$,'P0001','FINANCIAL_ENTRY_NOT_FOUND_OR_FORBIDDEN','arquivada não muda status');
select lives_ok($$select public.set_financial_goal(2026,9,200)$$,'cria goal');
select is((select count(*) from public.activity_logs where entity_id=(select id from public.financial_goals where year=2026 and month=9) and action='CREATED'),1::bigint,'goal created log');
select lives_ok($$select public.set_financial_goal(2026,9,200)$$,'goal igual no-op');
select is((select count(*) from public.activity_logs where entity_id=(select id from public.financial_goals where year=2026 and month=9)),1::bigint,'goal no-op sem log');
select lives_ok($$select public.set_financial_goal(2026,9,250)$$,'atualiza goal');
select is((select target_amount from public.financial_goals where year=2026 and month=9),250.00::numeric,'goal atualizado');
select is((select count(*) from public.activity_logs where entity_id=(select id from public.financial_goals where year=2026 and month=9) and action='UPDATED'),1::bigint,'goal updated log');

reset role;
insert into public.financial_entries(organization_id,type,status,description,amount,reference_date,realized_date,archived_at,created_by,updated_by) values
('e2000000-0000-4000-8000-000000000001','INCOME','REALIZED','Previous',50,'2026-08-01','2026-08-15',null,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001'),
('e2000000-0000-4000-8000-000000000001','INCOME','REALIZED','Archived current',100,'2026-09-01','2026-09-05',now(),'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001'),
('e2000000-0000-4000-8000-000000000001','EXPENSE','REALIZED','Expense',40,'2026-09-01','2026-09-06',null,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001'),
('e2000000-0000-4000-8000-000000000001','INCOME','REALIZED','Future',500,'2026-10-01','2026-10-01',null,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001'),
('e2000000-0000-4000-8000-000000000001','INCOME','CANCELED','Canceled',999,'2026-09-01','2026-09-07',null,'e1000000-0000-4000-8000-000000000001','e1000000-0000-4000-8000-000000000001');
set local role authenticated;
set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000001';
select is((select monthly_income from public.get_financial_summary(2026,9)),100::numeric,'monthly income inclui archived');
select is((select monthly_expense from public.get_financial_summary(2026,9)),40::numeric,'monthly expense');
select is((select cash_balance from public.get_financial_summary(2026,9)),110::numeric,'balance cumulativo');
select is((select goal_target from public.get_financial_summary(2026,9)),250::numeric,'goal target');
select is((select goal_progress from public.get_financial_summary(2026,9)),0.4::numeric,'goal progress razão');
select is((select goal_target from public.get_financial_summary(2026,10)),null::numeric,'mês sem goal retorna NULL');
set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000002';
select throws_ok($$select * from public.get_financial_summary(2026,9)$$,'P0001','AUTHORIZATION_DENIED','ADMIN sem summary');
select throws_ok($$select public.create_financial_entry('INCOME','Admin negado',1,current_date)$$,'P0001','AUTHORIZATION_DENIED','ADMIN não cria entry');
set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000003';
select throws_ok($$select public.set_financial_goal(2026,9,1)$$,'P0001','AUTHORIZATION_DENIED','MEMBER sem goal');
select throws_ok($$select public.create_financial_entry('INCOME','Member negado',1,current_date)$$,'P0001','AUTHORIZATION_DENIED','MEMBER não cria entry');
set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000004';
select lives_ok($$select public.create_financial_entry('INCOME','Owner B pending',10,'2026-09-01')$$,'OWNER B cria somente na própria Organization');
select is((select organization_id from public.financial_entries where description='Owner B pending'),'e2000000-0000-4000-8000-000000000002'::uuid,'Organization deriva do contexto do OWNER B');
select is((select monthly_income from public.get_financial_summary(2026,9)),0::numeric,'summary do OWNER B não contém totais da Organization A');

reset role;
create or replace function pg_temp.reject_financial_activity_log()
returns trigger
language plpgsql
as $$
begin
  if new.entity_type = 'FINANCIAL_ENTRY' then
    raise exception using errcode='P0001', message='TEST_FINANCIAL_LOG_FAILURE';
  end if;
  return new;
end;
$$;

create trigger test_reject_financial_activity_log
before insert on public.activity_logs
for each row execute function pg_temp.reject_financial_activity_log();

set local role authenticated;
set local request.jwt.claim.sub='e1000000-0000-4000-8000-000000000001';
select throws_ok($$select public.update_financial_entry((select id from public.financial_entries where description='Expense'),'EXPENSE','Must Roll Back',40,'2026-09-01')$$,'P0001','TEST_FINANCIAL_LOG_FAILURE','falha do Activity Log falha a mutação');
reset role;
select is((select description from public.financial_entries where description='Expense'),'Expense','falha do log reverte a mutação financeira');
select is((select count(*) from public.activity_logs where entity_id=(select id from public.financial_entries where description='Expense') and action='UPDATED'),0::bigint,'rollback não deixa Activity Log parcial');

select * from finish();
rollback;
