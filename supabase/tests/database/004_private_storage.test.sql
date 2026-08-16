begin;

create extension if not exists pgtap with schema extensions;

select plan(4);

select is(
  (
    select count(*)
    from storage.buckets
    where id = 'private-files'
  ),
  1::bigint,
  'Bucket private-files deve existir'
);

select is(
  (
    select public
    from storage.buckets
    where id = 'private-files'
  ),
  false,
  'Bucket private-files deve ser privado'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname like 'fasbtech_%'
  ),
  0::bigint,
  'Foundation não deve criar policies genéricas de objetos'
);

select ok(
  not exists (
    select 1
    from storage.buckets
    where id = 'private-files'
      and public = true
  ),
  'private-files nunca deve estar público'
);

select * from finish();

rollback;