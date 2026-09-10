import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { createClient } from "@supabase/supabase-js";
import type { FullConfig } from "@playwright/test";

import { E2E_FIXTURES } from "./data";

const EXPECTED_PROJECT_ID = "fasbtech-crm";
const EXPECTED_API_PORT = "54321";
const EXPECTED_DATABASE_PORT = "54322";
const EXPECTED_DATABASE_NAME = "postgres";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1"]);

type LocalSupabaseStatus = Readonly<{
  API_URL: string;
  DB_URL: string;
  SECRET_KEY?: string;
  SERVICE_ROLE_KEY?: string;
}>;

function failLocalGuard(message: string): never {
  throw new Error(`E2E local guard: ${message}`);
}

function parseLoopbackUrl(
  label: string,
  value: string,
  expectedPort?: string,
) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    failLocalGuard(`${label} must be a valid URL.`);
  }

  if (!LOOPBACK_HOSTS.has(url.hostname)) {
    failLocalGuard(
      `${label} must use localhost or 127.0.0.1; received ${url.hostname}.`,
    );
  }

  if (expectedPort && url.port !== expectedPort) {
    failLocalGuard(
      `${label} must use port ${expectedPort}; received ${url.port || "default"}.`,
    );
  }

  return url;
}

function readEnvValue(projectRoot: string, name: string) {
  const envContents = readFileSync(join(projectRoot, ".env.local"), "utf8");
  const line = envContents
    .split(/\r?\n/u)
    .find((candidate) => candidate.startsWith(`${name}=`));

  if (!line) {
    failLocalGuard(`${name} is required in .env.local.`);
  }

  return line.slice(name.length + 1).replace(/^(["'])(.*)\1$/u, "$2");
}

function readSupabaseStatus(projectRoot: string): LocalSupabaseStatus {
  let output: string;

  try {
    output = execFileSync(
      "npx",
      ["--no-install", "supabase", "status", "-o", "json"],
      {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
  } catch {
    failLocalGuard(
      "the expected local Supabase instance is not running or cannot be inspected.",
    );
  }

  let status: unknown;

  try {
    status = JSON.parse(output);
  } catch {
    failLocalGuard("Supabase CLI returned an invalid local status payload.");
  }

  if (
    typeof status !== "object" ||
    status === null ||
    !("API_URL" in status) ||
    typeof status.API_URL !== "string" ||
    !("DB_URL" in status) ||
    typeof status.DB_URL !== "string"
  ) {
    failLocalGuard("Supabase CLI did not report the expected local endpoints.");
  }

  return status as LocalSupabaseStatus;
}

function assertLocalEnvironment(
  projectRoot: string,
  appBaseUrl: string,
  status: LocalSupabaseStatus,
) {
  parseLoopbackUrl("application URL", appBaseUrl);

  const configuredSupabaseUrl = parseLoopbackUrl(
    "configured Supabase URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
      readEnvValue(projectRoot, "NEXT_PUBLIC_SUPABASE_URL"),
    EXPECTED_API_PORT,
  );
  const runningSupabaseUrl = parseLoopbackUrl(
    "running Supabase URL",
    status.API_URL,
    EXPECTED_API_PORT,
  );

  if (configuredSupabaseUrl.origin !== runningSupabaseUrl.origin) {
    failLocalGuard(
      "the application Supabase URL does not match the running local instance.",
    );
  }

  const databaseUrl = parseLoopbackUrl(
    "local PostgreSQL URL",
    status.DB_URL,
    EXPECTED_DATABASE_PORT,
  );

  if (databaseUrl.pathname !== `/${EXPECTED_DATABASE_NAME}`) {
    failLocalGuard(
      `local PostgreSQL must use database ${EXPECTED_DATABASE_NAME}.`,
    );
  }

  const configContents = readFileSync(
    join(projectRoot, "supabase", "config.toml"),
    "utf8",
  );

  if (
    !configContents.includes(`project_id = "${EXPECTED_PROJECT_ID}"`) ||
    !configContents.includes(`port = ${EXPECTED_API_PORT}`) ||
    !configContents.includes(`port = ${EXPECTED_DATABASE_PORT}`)
  ) {
    failLocalGuard(
      `supabase/config.toml must identify ${EXPECTED_PROJECT_ID} on local ports ${EXPECTED_API_PORT}/${EXPECTED_DATABASE_PORT}.`,
    );
  }
}

function resetLocalDatabase(projectRoot: string) {
  try {
    execFileSync(
      "npx",
      [
        "--no-install",
        "supabase",
        "db",
        "reset",
        "--local",
        "--no-seed",
      ],
      {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Unable to reset the guarded local E2E database: ${message}`);
  }
}

async function createFixtures(status: LocalSupabaseStatus) {
  const privilegedKey = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY;

  if (!privilegedKey) {
    failLocalGuard(
      "Supabase CLI did not expose a local secret key for E2E fixture setup.",
    );
  }

  const supabase = createClient(status.API_URL, privilegedKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const actors = [
    ["owner", E2E_FIXTURES.owner],
    ["member", E2E_FIXTURES.member],
    ["memberB", E2E_FIXTURES.memberB],
    ["admin", E2E_FIXTURES.admin],
    ["otherOwner", E2E_FIXTURES.otherOwner],
  ] as const;
  const userIds = new Map<(typeof actors)[number][0], string>();

  for (const [key, actor] of actors) {
    const result = await supabase.auth.admin.createUser({
      email: actor.email,
      password: actor.password,
      email_confirm: true,
      user_metadata: { full_name: actor.fullName },
    });

    if (result.error || !result.data.user) {
      throw new Error(
        `Unable to create the local E2E ${key}: ${result.error?.message ?? "missing user"}`,
      );
    }

    userIds.set(key, result.data.user.id);
  }

  function userId(key: (typeof actors)[number][0]) {
    const id = userIds.get(key);
    if (!id) throw new Error(`Missing local E2E user id for ${key}.`);
    return id;
  }

  const organizationsResult = await supabase.from("organizations").insert([
    {
      id: E2E_FIXTURES.organization.id,
      name: E2E_FIXTURES.organization.name,
      slug: E2E_FIXTURES.organization.slug,
      status: "ACTIVE",
    },
    {
      id: E2E_FIXTURES.otherOrganization.id,
      name: E2E_FIXTURES.otherOrganization.name,
      slug: E2E_FIXTURES.otherOrganization.slug,
      status: "ACTIVE",
    },
  ]);

  if (organizationsResult.error) {
    throw new Error(
      `Unable to create the local E2E Organizations: ${organizationsResult.error.message}`,
    );
  }

  const profilesResult = await supabase.from("profiles").insert(
    actors.map(([key, actor]) => ({
      id: userId(key),
      full_name: actor.fullName,
      status: "ACTIVE" as const,
    })),
  );

  if (profilesResult.error) {
    throw new Error(
      `Unable to create the local E2E Profiles: ${profilesResult.error.message}`,
    );
  }

  const membershipsResult = await supabase.from("organization_members").insert([
    {
      id: E2E_FIXTURES.owner.membershipId,
      organization_id: E2E_FIXTURES.organization.id,
      user_id: userId("owner"),
      role: "OWNER",
      status: "ACTIVE",
    },
    {
      id: E2E_FIXTURES.member.membershipId,
      organization_id: E2E_FIXTURES.organization.id,
      user_id: userId("member"),
      role: "MEMBER",
      status: "ACTIVE",
    },
    {
      id: E2E_FIXTURES.memberB.membershipId,
      organization_id: E2E_FIXTURES.organization.id,
      user_id: userId("memberB"),
      role: "MEMBER",
      status: "ACTIVE",
    },
    {
      id: E2E_FIXTURES.admin.membershipId,
      organization_id: E2E_FIXTURES.organization.id,
      user_id: userId("admin"),
      role: "ADMIN",
      status: "ACTIVE",
    },
    {
      id: E2E_FIXTURES.otherOwner.membershipId,
      organization_id: E2E_FIXTURES.otherOrganization.id,
      user_id: userId("otherOwner"),
      role: "OWNER",
      status: "ACTIVE",
    },
  ]);

  if (membershipsResult.error) {
    throw new Error(
      `Unable to create the local E2E Memberships: ${membershipsResult.error.message}`,
    );
  }

  const clientsResult = await supabase.from("clients").insert([
    {
      id: E2E_FIXTURES.clients.clientA.id,
      organization_id: E2E_FIXTURES.organization.id,
      name: E2E_FIXTURES.clients.clientA.name,
      created_by: userId("owner"),
      updated_by: userId("owner"),
    },
    {
      id: E2E_FIXTURES.clients.clientB.id,
      organization_id: E2E_FIXTURES.organization.id,
      name: E2E_FIXTURES.clients.clientB.name,
      created_by: userId("owner"),
      updated_by: userId("owner"),
    },
  ]);

  if (clientsResult.error) {
    throw new Error(
      `Unable to create the local E2E Clients: ${clientsResult.error.message}`,
    );
  }

  const assignmentsResult = await supabase.from("client_assignments").insert([
    {
      client_id: E2E_FIXTURES.clients.clientA.id,
      membership_id: E2E_FIXTURES.member.membershipId,
      created_by: userId("owner"),
    },
    {
      client_id: E2E_FIXTURES.clients.clientB.id,
      membership_id: E2E_FIXTURES.memberB.membershipId,
      created_by: userId("owner"),
    },
  ]);

  if (assignmentsResult.error) {
    throw new Error(
      `Unable to create the local E2E Client Assignments: ${assignmentsResult.error.message}`,
    );
  }

  const demandResult = await supabase.from("demands").insert({
    id: E2E_FIXTURES.demands.clientB.id,
    organization_id: E2E_FIXTURES.organization.id,
    client_id: E2E_FIXTURES.clients.clientB.id,
    title: E2E_FIXTURES.demands.clientB.title,
    description: "Demanda de controle para autorização e filtros E2E.",
    status: "COMPLETED",
    priority: "LOW",
    due_date: E2E_FIXTURES.demands.clientB.dueDate,
    created_by: userId("owner"),
    updated_by: userId("owner"),
  });

  if (demandResult.error) {
    throw new Error(
      `Unable to create the local E2E Demand: ${demandResult.error.message}`,
    );
  }
}

export default async function globalSetup(config: FullConfig) {
  const projectRoot = config.configFile
    ? dirname(config.configFile)
    : process.cwd();
  const configuredBaseUrl = config.projects[0]?.use.baseURL;
  const appBaseUrl =
    typeof configuredBaseUrl === "string"
      ? configuredBaseUrl
      : (process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000");
  const status = readSupabaseStatus(projectRoot);

  // This destructive reset is E2E-only and happens after every endpoint and
  // project identity has been proven to belong to the expected local stack.
  assertLocalEnvironment(projectRoot, appBaseUrl, status);
  resetLocalDatabase(projectRoot);
  const postResetStatus = readSupabaseStatus(projectRoot);

  assertLocalEnvironment(projectRoot, appBaseUrl, postResetStatus);

  await createFixtures(postResetStatus);
}
