-- ============================================================
-- FASBtech CRM
-- Sprint 01 — Foundation
-- Private Storage infrastructure
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'private-files',
  'private-files',
  false
)
on conflict (id) do update
set
  name = excluded.name,
  public = false;

-- ============================================================
-- IMPORTANTE
-- ============================================================
--
-- Nenhuma policy de storage.objects é criada nesta etapa.
--
-- Isso significa:
--
-- anon
--   → sem acesso
--
-- authenticated
--   → sem upload/download genérico
--
-- Policies específicas serão adicionadas quando o domínio
-- relacionado ao arquivo existir.
--
-- Não criar ainda:
--
-- documents
-- client_id
-- demand_id
-- contract_id
-- financial_entry_id
--
-- ============================================================