#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# FASBtech CRM
# Bootstrap concurrency integration test
# LOCAL DATABASE ONLY
# ============================================================

DB_URL="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

USER_A="aaaaaaaa-1111-4111-8111-111111111111"
USER_B="bbbbbbbb-2222-4222-8222-222222222222"

TMP_DIR="$(mktemp -d)"
RESULT_A="${TMP_DIR}/result-a.txt"
RESULT_B="${TMP_DIR}/result-b.txt"

cleanup() {
  rm -rf "${TMP_DIR}"
}

trap cleanup EXIT

echo "Resetando banco local..."
npx supabase db reset --local --no-seed >/dev/null

echo "Criando utilizadores de teste..."

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
      '${USER_A}'::uuid,
      'bootstrap-a@fasbtech.test',
      '{\"full_name\":\"Bootstrap A\"}'::jsonb
    ),
    (
      '${USER_B}'::uuid,
      'bootstrap-b@fasbtech.test',
      '{\"full_name\":\"Bootstrap B\"}'::jsonb
    );
  " >/dev/null


run_bootstrap() {
  local user_id="$1"
  local output_file="$2"

  psql "${DB_URL}" \
    -v ON_ERROR_STOP=1 \
    -At \
    -c "
      begin;

      set local role authenticated;

      select set_config(
        'request.jwt.claim.sub',
        '${user_id}',
        true
      );

      select public.bootstrap_initial_organization();

      commit;
    " >"${output_file}" 2>&1
}


echo "Executando dois Bootstraps simultaneamente..."

set +e

run_bootstrap "${USER_A}" "${RESULT_A}" &
PID_A=$!

run_bootstrap "${USER_B}" "${RESULT_B}" &
PID_B=$!

wait "${PID_A}"
STATUS_A=$?

wait "${PID_B}"
STATUS_B=$?

set -e


echo
echo "Resultado A:"
cat "${RESULT_A}"

echo
echo "Resultado B:"
cat "${RESULT_B}"

echo
echo "Validando estado final..."


ORGANIZATION_COUNT="$(
  psql "${DB_URL}" -Atc "
    select count(*)
    from public.organizations;
  "
)"

OWNER_COUNT="$(
  psql "${DB_URL}" -Atc "
    select count(*)
    from public.organization_members
    where role = 'OWNER'
      and status = 'ACTIVE';
  "
)"

MEMBERSHIP_COUNT="$(
  psql "${DB_URL}" -Atc "
    select count(*)
    from public.organization_members;
  "
)"

PROFILE_COUNT="$(
  psql "${DB_URL}" -Atc "
    select count(*)
    from public.profiles;
  "
)"


if [[ "${ORGANIZATION_COUNT}" != "1" ]]; then
  echo "FAIL: esperado exatamente 1 Organization, encontrado ${ORGANIZATION_COUNT}"
  exit 1
fi


if [[ "${OWNER_COUNT}" != "1" ]]; then
  echo "FAIL: esperado exatamente 1 OWNER ACTIVE, encontrado ${OWNER_COUNT}"
  exit 1
fi


if [[ "${MEMBERSHIP_COUNT}" != "1" ]]; then
  echo "FAIL: esperado exatamente 1 Membership, encontrado ${MEMBERSHIP_COUNT}"
  exit 1
fi


if [[ "${PROFILE_COUNT}" != "1" ]]; then
  echo "FAIL: esperado exatamente 1 Profile criado pelo Bootstrap, encontrado ${PROFILE_COUNT}"
  exit 1
fi


# Uma chamada deve concluir e a outra deve ser negada.
if [[ "${STATUS_A}" -eq 0 && "${STATUS_B}" -eq 0 ]]; then
  echo "FAIL: os dois Bootstraps concluíram com sucesso."
  exit 1
fi


if [[ "${STATUS_A}" -ne 0 && "${STATUS_B}" -ne 0 ]]; then
  echo "FAIL: os dois Bootstraps falharam."
  exit 1
fi


if [[ "${STATUS_A}" -ne 0 ]]; then
  if ! grep -q "BOOTSTRAP_ALREADY_INITIALIZED" "${RESULT_A}"; then
    echo "FAIL: Bootstrap A falhou por motivo inesperado."
    exit 1
  fi
fi


if [[ "${STATUS_B}" -ne 0 ]]; then
  if ! grep -q "BOOTSTRAP_ALREADY_INITIALIZED" "${RESULT_B}"; then
    echo "FAIL: Bootstrap B falhou por motivo inesperado."
    exit 1
  fi
fi


echo
echo "PASS: concorrência do Bootstrap validada."
echo
echo "Organization: ${ORGANIZATION_COUNT}"
echo "OWNER ACTIVE: ${OWNER_COUNT}"
echo "Memberships: ${MEMBERSHIP_COUNT}"
echo "Profiles: ${PROFILE_COUNT}"

echo
echo "Restaurando banco local..."

npx supabase db reset --local --no-seed >/dev/null

echo "Banco local restaurado."