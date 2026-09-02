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

  const ownerResult = await supabase.auth.admin.createUser({
    email: E2E_FIXTURES.owner.email,
    password: E2E_FIXTURES.owner.password,
    email_confirm: true,
    user_metadata: { full_name: E2E_FIXTURES.owner.fullName },
  });

  if (ownerResult.error || !ownerResult.data.user) {
    throw new Error(
      `Unable to create the local E2E OWNER: ${ownerResult.error?.message ?? "missing user"}`,
    );
  }

  const memberResult = await supabase.auth.admin.createUser({
    email: E2E_FIXTURES.member.email,
    password: E2E_FIXTURES.member.password,
    email_confirm: true,
    user_metadata: { full_name: E2E_FIXTURES.member.fullName },
  });

  if (memberResult.error || !memberResult.data.user) {
    throw new Error(
      `Unable to create the local E2E MEMBER: ${memberResult.error?.message ?? "missing user"}`,
    );
  }

  const organizationResult = await supabase
    .from("organizations")
    .insert({
      name: E2E_FIXTURES.organization.name,
      slug: E2E_FIXTURES.organization.slug,
      status: "ACTIVE",
    })
    .select("id")
    .single();

  if (organizationResult.error || !organizationResult.data) {
    throw new Error(
      `Unable to create the local E2E Organization: ${organizationResult.error?.message ?? "missing organization"}`,
    );
  }

  const profilesResult = await supabase.from("profiles").insert([
    {
      id: ownerResult.data.user.id,
      full_name: E2E_FIXTURES.owner.fullName,
      status: "ACTIVE",
    },
    {
      id: memberResult.data.user.id,
      full_name: E2E_FIXTURES.member.fullName,
      status: "ACTIVE",
    },
  ]);

  if (profilesResult.error) {
    throw new Error(
      `Unable to create the local E2E Profiles: ${profilesResult.error.message}`,
    );
  }

  const membershipsResult = await supabase.from("organization_members").insert([
    {
      organization_id: organizationResult.data.id,
      user_id: ownerResult.data.user.id,
      role: "OWNER",
      status: "ACTIVE",
    },
    {
      organization_id: organizationResult.data.id,
      user_id: memberResult.data.user.id,
      role: "MEMBER",
      status: "ACTIVE",
    },
  ]);

  if (membershipsResult.error) {
    throw new Error(
      `Unable to create the local E2E Memberships: ${membershipsResult.error.message}`,
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
