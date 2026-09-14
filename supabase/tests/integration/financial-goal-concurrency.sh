#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# FASBtech CRM
# Financial goal concurrency integration test
# LOCAL DATABASE ONLY
# ============================================================

DB_URL="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

# The reset command always targets the local stack, while psql uses DB_URL.
# Reject a mismatch before any reset or mutation can reach another database.
if [[ ! "${DB_URL}" =~ ^postgresql://[^/@[:space:]]+@(127\.0\.0\.1|localhost):54322/postgres$ ]]; then
  echo "FAIL: financial-goal-concurrency.sh só pode executar no Supabase local."
  exit 1
fi

ORGANIZATION_ID="fa000000-0000-4000-8000-000000000001"
OWNER_USER_ID="fb000000-0000-4000-8000-000000000001"
OWNER_MEMBERSHIP_ID="fc000000-0000-4000-8000-000000000001"

TMP_DIR="$(mktemp -d)"
LOCK_HOLDER_RESULT="${TMP_DIR}/lock-holder.txt"
RESULT_A="${TMP_DIR}/result-a.txt"
RESULT_B="${TMP_DIR}/result-b.txt"

LOCK_HOLDER_PID=""
PID_A=""
PID_B=""

cleanup() {
  local exit_status=$?

  trap - EXIT
  set +e

  for process_id in "${LOCK_HOLDER_PID}" "${PID_A}" "${PID_B}"; do
    if [[ -n "${process_id}" ]]; then
      kill "${process_id}" 2>/dev/null
      wait "${process_id}" 2>/dev/null
    fi
  done

  rm -rf "${TMP_DIR}"
  npx supabase db reset --local --no-seed >/dev/null

  exit "${exit_status}"
}

trap cleanup EXIT

wait_for_database_state() {
  local application_name="$1"
  local wait_event_type="$2"

  for _ in {1..100}; do
    local matching_connections

    matching_connections="$(
      psql "${DB_URL}" -Atc "
        select count(*)
        from pg_catalog.pg_stat_activity
        where application_name = '${application_name}'
          and wait_event_type = '${wait_event_type}';
      "
    )"

    if [[ "${matching_connections}" == "1" ]]; then
      return 0
    fi

    sleep 0.05
  done

  echo "FAIL: ${application_name} não atingiu o estado ${wait_event_type}."
  return 1
}

run_goal_upsert() {
  local application_name="$1"
  local output_file="$2"

  PGAPPNAME="${application_name}" psql "${DB_URL}" \
    -v ON_ERROR_STOP=1 \
    -At \
    -c "
      begin;
      set local role authenticated;
      select set_config('request.jwt.claim.sub', '${OWNER_USER_ID}', true);
      select public.set_financial_goal(2026, 9, 100);
      commit;
    " >"${output_file}" 2>&1
}

echo "Resetando banco local..."
npx supabase db reset --local --no-seed >/dev/null

echo "Criando contexto OWNER para a meta financeira..."
psql "${DB_URL}" -v ON_ERROR_STOP=1 -c "
  insert into auth.users (id, email, raw_user_meta_data)
  values ('${OWNER_USER_ID}'::uuid, 'financial-goal-concurrency@fasbtech.test', '{\"full_name\":\"Finance Owner\"}'::jsonb);

  insert into public.profiles (id, full_name, status)
  values ('${OWNER_USER_ID}'::uuid, 'Finance Owner', 'ACTIVE');

  insert into public.organizations (id, name, slug, status)
  values ('${ORGANIZATION_ID}'::uuid, 'Financial Goal Concurrency', 'financial-goal-concurrency', 'ACTIVE');

  insert into public.organization_members (id, organization_id, user_id, role, status)
  values ('${OWNER_MEMBERSHIP_ID}'::uuid, '${ORGANIZATION_ID}'::uuid, '${OWNER_USER_ID}'::uuid, 'OWNER', 'ACTIVE');
" >/dev/null

echo "Bloqueando a Organization para sobrepor as duas chamadas..."
PGAPPNAME="financial-goal-lock-holder" psql "${DB_URL}" \
  -v ON_ERROR_STOP=1 \
  -At \
  -c "
    begin;
    select id from public.organizations where id = '${ORGANIZATION_ID}'::uuid for update;
    select pg_sleep(6);
    commit;
  " >"${LOCK_HOLDER_RESULT}" 2>&1 &
LOCK_HOLDER_PID=$!

wait_for_database_state "financial-goal-lock-holder" "Timeout"

run_goal_upsert "financial-goal-upsert-a" "${RESULT_A}" &
PID_A=$!
wait_for_database_state "financial-goal-upsert-a" "Lock"

run_goal_upsert "financial-goal-upsert-b" "${RESULT_B}" &
PID_B=$!
wait_for_database_state "financial-goal-upsert-b" "Lock"

set +e
wait "${LOCK_HOLDER_PID}"
LOCK_HOLDER_STATUS=$?
LOCK_HOLDER_PID=""
wait "${PID_A}"
STATUS_A=$?
PID_A=""
wait "${PID_B}"
STATUS_B=$?
PID_B=""
set -e

if [[ "${LOCK_HOLDER_STATUS}" -ne 0 || "${STATUS_A}" -ne 0 || "${STATUS_B}" -ne 0 ]]; then
  echo "FAIL: alguma transação concorrente falhou."
  echo "lock-holder:"
  sed -n '1,80p' "${LOCK_HOLDER_RESULT}"
  echo "upsert-a:"
  sed -n '1,80p' "${RESULT_A}"
  echo "upsert-b:"
  sed -n '1,80p' "${RESULT_B}"
  exit 1
fi

GOAL_COUNT="$(psql "${DB_URL}" -Atc "select count(*) from public.financial_goals where organization_id='${ORGANIZATION_ID}'::uuid and year=2026 and month=9;")"
CREATED_LOG_COUNT="$(psql "${DB_URL}" -Atc "select count(*) from public.activity_logs where organization_id='${ORGANIZATION_ID}'::uuid and entity_type='FINANCIAL_GOAL' and action='CREATED';")"
UPDATED_LOG_COUNT="$(psql "${DB_URL}" -Atc "select count(*) from public.activity_logs where organization_id='${ORGANIZATION_ID}'::uuid and entity_type='FINANCIAL_GOAL' and action='UPDATED';")"
TARGET_AMOUNT="$(psql "${DB_URL}" -Atc "select target_amount from public.financial_goals where organization_id='${ORGANIZATION_ID}'::uuid and year=2026 and month=9;")"

if [[ "${GOAL_COUNT}" != "1" ]]; then
  echo "FAIL: esperado exatamente 1 goal, encontrado ${GOAL_COUNT}."
  exit 1
fi

if [[ "${CREATED_LOG_COUNT}" != "1" || "${UPDATED_LOG_COUNT}" != "0" ]]; then
  echo "FAIL: Activity Logs inesperados (CREATED=${CREATED_LOG_COUNT}, UPDATED=${UPDATED_LOG_COUNT})."
  exit 1
fi

if [[ "${TARGET_AMOUNT}" != "100.00" ]]; then
  echo "FAIL: target_amount esperado 100.00, encontrado ${TARGET_AMOUNT}."
  exit 1
fi

echo "PASS: set_financial_goal é concorrente-segura e idempotente para o mesmo valor."
echo "Goals no período: ${GOAL_COUNT}"
echo "Activity Logs CREATED: ${CREATED_LOG_COUNT}"
echo "Activity Logs UPDATED: ${UPDATED_LOG_COUNT}"
