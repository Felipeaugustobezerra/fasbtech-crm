#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# FASBtech CRM
# OWNER role concurrency integration test
# LOCAL DATABASE ONLY
# ============================================================

DB_URL="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

# `supabase db reset --local` always targets the local stack, while psql uses
# DB_URL. Reject any mismatch before this script can reset or mutate data.
if [[ ! "${DB_URL}" =~ ^postgresql://[^/@[:space:]]+@(127\.0\.0\.1|localhost):54322/postgres$ ]]; then
  echo "FAIL: owner-role-concurrency.sh só pode executar no Supabase local."
  exit 1
fi

ORGANIZATION_ID="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
OWNER_A_USER_ID="11111111-1111-4111-8111-111111111111"
OWNER_B_USER_ID="22222222-2222-4222-8222-222222222222"
OWNER_A_MEMBERSHIP_ID="71111111-1111-4111-8111-111111111111"
OWNER_B_MEMBERSHIP_ID="72222222-2222-4222-8222-222222222222"

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

  if [[ -n "${LOCK_HOLDER_PID}" ]]; then
    kill "${LOCK_HOLDER_PID}" 2>/dev/null
    wait "${LOCK_HOLDER_PID}" 2>/dev/null
  fi

  if [[ -n "${PID_A}" ]]; then
    kill "${PID_A}" 2>/dev/null
    wait "${PID_A}" 2>/dev/null
  fi

  if [[ -n "${PID_B}" ]]; then
    kill "${PID_B}" 2>/dev/null
    wait "${PID_B}" 2>/dev/null
  fi

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


run_role_update() {
  local application_name="$1"
  local actor_user_id="$2"
  local target_membership_id="$3"
  local output_file="$4"

  PGAPPNAME="${application_name}" psql "${DB_URL}" \
    -v ON_ERROR_STOP=1 \
    -At \
    -c "
      begin;

      set local role authenticated;

      select set_config(
        'request.jwt.claim.sub',
        '${actor_user_id}',
        true
      );

      select public.update_organization_member_role(
        '${target_membership_id}'::uuid,
        'ADMIN'
      );

      commit;
    " >"${output_file}" 2>&1
}


echo "Resetando banco local..."
npx supabase db reset --local --no-seed >/dev/null

echo "Criando Organization com dois OWNERs ACTIVE..."

psql "${DB_URL}" \
  -v ON_ERROR_STOP=1 \
  -c "
    insert into auth.users (
      id,
      email,
      raw_user_meta_data
    )
    values
    (
      '${OWNER_A_USER_ID}'::uuid,
      'owner-a-concurrency@fasbtech.test',
      '{\"full_name\":\"Owner A\"}'::jsonb
    ),
    (
      '${OWNER_B_USER_ID}'::uuid,
      'owner-b-concurrency@fasbtech.test',
      '{\"full_name\":\"Owner B\"}'::jsonb
    );

    insert into public.profiles (
      id,
      full_name,
      status
    )
    values
    (
      '${OWNER_A_USER_ID}'::uuid,
      'Owner A',
      'ACTIVE'
    ),
    (
      '${OWNER_B_USER_ID}'::uuid,
      'Owner B',
      'ACTIVE'
    );

    insert into public.organizations (
      id,
      name,
      slug,
      status
    )
    values (
      '${ORGANIZATION_ID}'::uuid,
      'Organization Concurrency',
      'organization-concurrency',
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
      '${OWNER_A_MEMBERSHIP_ID}'::uuid,
      '${ORGANIZATION_ID}'::uuid,
      '${OWNER_A_USER_ID}'::uuid,
      'OWNER',
      'ACTIVE'
    ),
    (
      '${OWNER_B_MEMBERSHIP_ID}'::uuid,
      '${ORGANIZATION_ID}'::uuid,
      '${OWNER_B_USER_ID}'::uuid,
      'OWNER',
      'ACTIVE'
    );
  " >/dev/null


echo "Bloqueando a linha da Organization para ordenar as transações..."

PGAPPNAME="owner-role-lock-holder" psql "${DB_URL}" \
  -v ON_ERROR_STOP=1 \
  -At \
  -c "
    begin;

    select id
    from public.organizations
    where id = '${ORGANIZATION_ID}'::uuid
    for update;

    select pg_sleep(6);

    commit;
  " >"${LOCK_HOLDER_RESULT}" 2>&1 &
LOCK_HOLDER_PID=$!

wait_for_database_state "owner-role-lock-holder" "Timeout"


echo "Enfileirando OWNER A para rebaixar OWNER B..."

run_role_update \
  "owner-role-update-a" \
  "${OWNER_A_USER_ID}" \
  "${OWNER_B_MEMBERSHIP_ID}" \
  "${RESULT_A}" &
PID_A=$!

wait_for_database_state "owner-role-update-a" "Lock"


echo "Enfileirando OWNER B com autorização que ficará obsoleta..."

run_role_update \
  "owner-role-update-b" \
  "${OWNER_B_USER_ID}" \
  "${OWNER_A_MEMBERSHIP_ID}" \
  "${RESULT_B}" &
PID_B=$!

wait_for_database_state "owner-role-update-b" "Lock"


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


if [[ "${LOCK_HOLDER_STATUS}" -ne 0 ]]; then
  echo "FAIL: a conexão de controle falhou."
  cat "${LOCK_HOLDER_RESULT}"
  exit 1
fi

if [[ "${STATUS_A}" -ne 0 ]]; then
  echo "FAIL: a primeira alteração de role deveria concluir."
  cat "${RESULT_A}"
  exit 1
fi

if [[ "${STATUS_B}" -eq 0 ]]; then
  echo "FAIL: a segunda alteração utilizou autorização obsoleta."
  cat "${RESULT_B}"
  exit 1
fi

if ! grep -q "AUTHORIZATION_DENIED" "${RESULT_B}"; then
  echo "FAIL: a segunda alteração falhou por motivo inesperado."
  cat "${RESULT_B}"
  exit 1
fi


OWNER_COUNT="$(
  psql "${DB_URL}" -Atc "
    select count(*)
    from public.organization_members
    where organization_id = '${ORGANIZATION_ID}'::uuid
      and role = 'OWNER'
      and status = 'ACTIVE'
      and archived_at is null;
  "
)"

ROLE_STATE="$(
  psql "${DB_URL}" -Atc "
    select string_agg(
      membership.user_id::text || ':' || membership.role,
      ','
      order by membership.user_id
    )
    from public.organization_members as membership
    where membership.organization_id = '${ORGANIZATION_ID}'::uuid;
  "
)"

ROLE_UPDATED_LOG_COUNT="$(
  psql "${DB_URL}" -Atc "
    select count(*)
    from public.activity_logs
    where organization_id = '${ORGANIZATION_ID}'::uuid
      and entity_type = 'MEMBERSHIP'
      and action = 'ROLE_UPDATED';
  "
)"


if [[ "${OWNER_COUNT}" != "1" ]]; then
  echo "FAIL: esperado exatamente 1 OWNER ACTIVE, encontrado ${OWNER_COUNT}."
  exit 1
fi

if [[ "${ROLE_STATE}" != "${OWNER_A_USER_ID}:OWNER,${OWNER_B_USER_ID}:ADMIN" ]]; then
  echo "FAIL: estado final inesperado das roles: ${ROLE_STATE}."
  exit 1
fi

if [[ "${ROLE_UPDATED_LOG_COUNT}" != "1" ]]; then
  echo "FAIL: esperado exatamente 1 Activity Log ROLE_UPDATED, encontrado ${ROLE_UPDATED_LOG_COUNT}."
  exit 1
fi


echo
echo "PASS: alteração de role serializada por Organization."
echo "PASS: autorização do ator foi revalidada após o lock."
echo "OWNER ACTIVE: ${OWNER_COUNT}"
echo "Activity Logs ROLE_UPDATED: ${ROLE_UPDATED_LOG_COUNT}"
