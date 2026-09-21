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

function getLisbonFixturePeriod(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const year = Number(read("year"));
  const month = Number(read("month"));
  const civilDate = `${read("year")}-${read("month")}-${read("day")}`;
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousMonthYear = month === 1 ? year - 1 : year;

  return {
    year,
    month,
    civilDate,
    currentMonthDate: `${year}-${String(month).padStart(2, "0")}-01`,
    previousMonthDate: `${previousMonthYear}-${String(previousMonth).padStart(2, "0")}-01`,
  };
}

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
    ["dashboardOwner", E2E_FIXTURES.dashboardOwner],
    ["dashboardMember", E2E_FIXTURES.dashboardMember],
    ["dashboardAdmin", E2E_FIXTURES.dashboardAdmin],
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
    {
      id: E2E_FIXTURES.dashboardOrganization.id,
      name: E2E_FIXTURES.dashboardOrganization.name,
      slug: E2E_FIXTURES.dashboardOrganization.slug,
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
    {
      id: E2E_FIXTURES.dashboardOwner.membershipId,
      organization_id: E2E_FIXTURES.dashboardOrganization.id,
      user_id: userId("dashboardOwner"),
      role: "OWNER",
      status: "ACTIVE",
    },
    {
      id: E2E_FIXTURES.dashboardMember.membershipId,
      organization_id: E2E_FIXTURES.dashboardOrganization.id,
      user_id: userId("dashboardMember"),
      role: "MEMBER",
      status: "ACTIVE",
    },
    {
      id: E2E_FIXTURES.dashboardAdmin.membershipId,
      organization_id: E2E_FIXTURES.dashboardOrganization.id,
      user_id: userId("dashboardAdmin"),
      role: "ADMIN",
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

  const financialResult = await supabase.from("financial_entries").insert({
    id: E2E_FIXTURES.financial.otherOrganizationEntry.id,
    organization_id: E2E_FIXTURES.otherOrganization.id,
    type: "INCOME",
    status: "PENDING",
    payment_nature: "ONE_TIME",
    description: E2E_FIXTURES.financial.otherOrganizationEntry.description,
    amount: 100,
    reference_date: "2026-09-01",
    created_by: userId("otherOwner"),
    updated_by: userId("otherOwner"),
  });

  if (financialResult.error) {
    throw new Error(
      `Unable to create the local E2E Financial Entry: ${financialResult.error.message}`,
    );
  }

  const archivedClientResult = await supabase.from("clients").insert({
    id: E2E_FIXTURES.contracts.archivedClient.id,
    organization_id: E2E_FIXTURES.organization.id,
    name: E2E_FIXTURES.contracts.archivedClient.name,
    archived_at: new Date().toISOString(),
    created_by: userId("owner"),
    updated_by: userId("owner"),
  });
  if (archivedClientResult.error) throw new Error(`Unable to seed archived Contract Client: ${archivedClientResult.error.message}`);

  const templateResult = await supabase.from("contract_templates").insert([
    { id: E2E_FIXTURES.contracts.fixtureTemplate.id, organization_id: E2E_FIXTURES.organization.id, name: E2E_FIXTURES.contracts.fixtureTemplate.name, content: "Conteúdo base fixture Contratos", is_active: true, created_by: userId("owner"), updated_by: userId("owner") },
    { id: E2E_FIXTURES.contracts.inactiveTemplate.id, organization_id: E2E_FIXTURES.organization.id, name: E2E_FIXTURES.contracts.inactiveTemplate.name, content: "Template propositalmente inativo", is_active: false, created_by: userId("owner"), updated_by: userId("owner") },
  ]);
  if (templateResult.error) throw new Error(`Unable to seed Contract Templates: ${templateResult.error.message}`);

  const otherTemplateId = "60000000-0000-4000-8000-000000000003";
  const otherTemplateResult = await supabase.from("contract_templates").insert({ id: otherTemplateId, organization_id: E2E_FIXTURES.otherOrganization.id, name: "Template Organization B", content: "Restrito", created_by: userId("otherOwner"), updated_by: userId("otherOwner") });
  if (otherTemplateResult.error) throw new Error(`Unable to seed cross-Organization Template: ${otherTemplateResult.error.message}`);

  const otherClientId = "63000000-0000-4000-8000-000000000002";
  const otherClientResult = await supabase.from("clients").insert({ id: otherClientId, organization_id: E2E_FIXTURES.otherOrganization.id, name: "Cliente Organization B Contratos", created_by: userId("otherOwner"), updated_by: userId("otherOwner") });
  if (otherClientResult.error) throw new Error(`Unable to seed cross-Organization Contract Client: ${otherClientResult.error.message}`);

  const contractsResult = await supabase.from("contracts").insert([
    { id: E2E_FIXTURES.contracts.sentForSignature.id, organization_id: E2E_FIXTURES.organization.id, client_id: E2E_FIXTURES.clients.clientA.id, template_id: E2E_FIXTURES.contracts.fixtureTemplate.id, title: E2E_FIXTURES.contracts.sentForSignature.title, draft_data: { content: "Snapshot para assinatura" }, created_by: userId("owner"), updated_by: userId("owner") },
    { id: E2E_FIXTURES.contracts.sentForCancellation.id, organization_id: E2E_FIXTURES.organization.id, client_id: E2E_FIXTURES.clients.clientA.id, template_id: E2E_FIXTURES.contracts.fixtureTemplate.id, title: E2E_FIXTURES.contracts.sentForCancellation.title, draft_data: { content: "Snapshot para cancelamento" }, created_by: userId("owner"), updated_by: userId("owner") },
    { id: E2E_FIXTURES.contracts.otherOrganization.id, organization_id: E2E_FIXTURES.otherOrganization.id, client_id: otherClientId, template_id: otherTemplateId, title: E2E_FIXTURES.contracts.otherOrganization.title, draft_data: { content: "Restrito" }, created_by: userId("otherOwner"), updated_by: userId("otherOwner") },
  ]);
  if (contractsResult.error) throw new Error(`Unable to seed Contracts: ${contractsResult.error.message}`);

  const ownerClient = createClient(status.API_URL, privilegedKey, { auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false } });
  const loginResult = await ownerClient.auth.signInWithPassword({ email: E2E_FIXTURES.owner.email, password: E2E_FIXTURES.owner.password });
  if (loginResult.error) throw new Error(`Unable to authenticate OWNER Contract fixtures: ${loginResult.error.message}`);
  const pdfBytes = new TextEncoder().encode("%PDF-1.4\n% FASBtech E2E\n%%EOF");
  for (const fixture of [E2E_FIXTURES.contracts.sentForSignature, E2E_FIXTURES.contracts.sentForCancellation]) {
    const objectPath = `${E2E_FIXTURES.organization.id}/contracts/${fixture.id}/${fixture.originalDocumentId}/ORIGINAL_PDF.pdf`;
    const upload = await ownerClient.storage.from("private-files").upload(objectPath, pdfBytes, { contentType: "application/pdf", upsert: false });
    if (upload.error) throw new Error(`Unable to upload Contract fixture PDF: ${upload.error.message}`);
    const generated = await ownerClient.rpc("generate_contract", { p_contract_id: fixture.id, p_snapshot: { schema_version: 1, content: fixture === E2E_FIXTURES.contracts.sentForSignature ? "Snapshot para assinatura" : "Snapshot para cancelamento", client: { id: E2E_FIXTURES.clients.clientA.id, data: { name: E2E_FIXTURES.clients.clientA.name }, tax_id: null, tax_id_type: null }, manual_fields: {}, template: { id: E2E_FIXTURES.contracts.fixtureTemplate.id, name: E2E_FIXTURES.contracts.fixtureTemplate.name } }, p_document_id: fixture.originalDocumentId, p_object_path: objectPath, p_file_name: `${fixture.id}.pdf`, p_mime_type: "application/pdf", p_size_bytes: pdfBytes.byteLength });
    if (generated.error) throw new Error(`Unable to generate Contract fixture: ${generated.error.message}`);
    const sent = await ownerClient.rpc("mark_contract_sent", { p_contract_id: fixture.id, p_recipient_email: "client-contracts-e2e@example.test" });
    if (sent.error) throw new Error(`Unable to mark Contract fixture SENT: ${sent.error.message}`);
  }

  const dashboard = E2E_FIXTURES.dashboard;
  const dashboardOrganizationId = E2E_FIXTURES.dashboardOrganization.id;
  const dashboardOwnerId = userId("dashboardOwner");
  const dashboardPeriod = getLisbonFixturePeriod();
  const dashboardClients = await supabase.from("clients").insert([
    {
      id: dashboard.assignedClientId,
      organization_id: dashboardOrganizationId,
      name: "Cliente atribuído Dashboard E2E",
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
    {
      id: dashboard.restrictedClientId,
      organization_id: dashboardOrganizationId,
      name: "Cliente restrito Dashboard E2E",
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
  ]);
  if (dashboardClients.error) {
    throw new Error(`Unable to seed Dashboard Clients: ${dashboardClients.error.message}`);
  }

  const dashboardAssignment = await supabase.from("client_assignments").insert({
    client_id: dashboard.assignedClientId,
    membership_id: E2E_FIXTURES.dashboardMember.membershipId,
    created_by: dashboardOwnerId,
  });
  if (dashboardAssignment.error) {
    throw new Error(`Unable to seed Dashboard Client Assignment: ${dashboardAssignment.error.message}`);
  }

  const dashboardDemands = await supabase.from("demands").insert([
    {
      id: dashboard.assignedOverdueDemandId,
      organization_id: dashboardOrganizationId,
      client_id: dashboard.assignedClientId,
      title: "Demanda atribuída atrasada Dashboard E2E",
      status: "OPEN",
      priority: "HIGH",
      due_date: dashboardPeriod.previousMonthDate,
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
    {
      id: dashboard.assignedCompletedDemandId,
      organization_id: dashboardOrganizationId,
      client_id: dashboard.assignedClientId,
      title: "Demanda atribuída concluída Dashboard E2E",
      status: "COMPLETED",
      priority: "LOW",
      due_date: dashboardPeriod.civilDate,
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
    {
      id: dashboard.restrictedDemandId,
      organization_id: dashboardOrganizationId,
      client_id: dashboard.restrictedClientId,
      title: "Demanda restrita Dashboard E2E",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      due_date: null,
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
  ]);
  if (dashboardDemands.error) {
    throw new Error(`Unable to seed Dashboard Demands: ${dashboardDemands.error.message}`);
  }

  const dashboardFinancialEntries = await supabase.from("financial_entries").insert([
    {
      organization_id: dashboardOrganizationId,
      type: "INCOME",
      status: "REALIZED",
      payment_nature: "ONE_TIME",
      description: "Entrada mensal Dashboard E2E",
      amount: 1000,
      reference_date: dashboardPeriod.currentMonthDate,
      realized_date: dashboardPeriod.currentMonthDate,
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
    {
      organization_id: dashboardOrganizationId,
      type: "EXPENSE",
      status: "REALIZED",
      payment_nature: "ONE_TIME",
      description: "Saída mensal Dashboard E2E",
      amount: 250,
      reference_date: dashboardPeriod.currentMonthDate,
      realized_date: dashboardPeriod.currentMonthDate,
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
    {
      organization_id: dashboardOrganizationId,
      type: "INCOME",
      status: "REALIZED",
      payment_nature: "ONE_TIME",
      description: "Entrada anterior Dashboard E2E",
      amount: 100,
      reference_date: dashboardPeriod.previousMonthDate,
      realized_date: dashboardPeriod.previousMonthDate,
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
  ]);
  if (dashboardFinancialEntries.error) {
    throw new Error(`Unable to seed Dashboard Financial Entries: ${dashboardFinancialEntries.error.message}`);
  }

  const dashboardGoal = await supabase.from("financial_goals").insert({
    organization_id: dashboardOrganizationId,
    year: dashboardPeriod.year,
    month: dashboardPeriod.month,
    target_amount: 2000,
    created_by: dashboardOwnerId,
    updated_by: dashboardOwnerId,
  });
  if (dashboardGoal.error) {
    throw new Error(`Unable to seed Dashboard Financial Goal: ${dashboardGoal.error.message}`);
  }

  const dashboardTemplate = await supabase.from("contract_templates").insert({
    id: dashboard.templateId,
    organization_id: dashboardOrganizationId,
    name: "Template Dashboard E2E",
    content: "Conteúdo do Template Dashboard E2E",
    created_by: dashboardOwnerId,
    updated_by: dashboardOwnerId,
  });
  if (dashboardTemplate.error) {
    throw new Error(`Unable to seed Dashboard Contract Template: ${dashboardTemplate.error.message}`);
  }

  const snapshot = {
    schema_version: 1,
    content: "Snapshot Dashboard E2E",
    client: {
      id: dashboard.assignedClientId,
      data: { name: "Cliente atribuído Dashboard E2E" },
      tax_id: null,
      tax_id_type: null,
    },
    manual_fields: {},
    template: { id: dashboard.templateId, name: "Template Dashboard E2E" },
  };
  const dashboardContracts = await supabase.from("contracts").insert([
    {
      id: dashboard.draftContractId,
      organization_id: dashboardOrganizationId,
      client_id: dashboard.assignedClientId,
      template_id: dashboard.templateId,
      title: "Contrato DRAFT Dashboard E2E",
      status: "DRAFT",
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
    {
      id: dashboard.generatedContractId,
      organization_id: dashboardOrganizationId,
      client_id: dashboard.assignedClientId,
      template_id: dashboard.templateId,
      title: "Contrato GENERATED Dashboard E2E",
      status: "DRAFT",
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
    {
      id: dashboard.sentContractId,
      organization_id: dashboardOrganizationId,
      client_id: dashboard.assignedClientId,
      template_id: dashboard.templateId,
      title: "Contrato SENT Dashboard E2E",
      status: "DRAFT",
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
    {
      id: dashboard.signedContractId,
      organization_id: dashboardOrganizationId,
      client_id: dashboard.assignedClientId,
      template_id: dashboard.templateId,
      title: "Contrato SIGNED Dashboard E2E",
      status: "DRAFT",
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
    {
      id: dashboard.canceledContractId,
      organization_id: dashboardOrganizationId,
      client_id: dashboard.assignedClientId,
      template_id: dashboard.templateId,
      title: "Contrato CANCELED Dashboard E2E",
      status: "DRAFT",
      created_by: dashboardOwnerId,
      updated_by: dashboardOwnerId,
    },
  ]);
  if (dashboardContracts.error) {
    throw new Error(`Unable to seed Dashboard Contracts: ${dashboardContracts.error.message}`);
  }

  const dashboardOwnerClient = createClient(status.API_URL, privilegedKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  const dashboardLogin = await dashboardOwnerClient.auth.signInWithPassword({
    email: E2E_FIXTURES.dashboardOwner.email,
    password: E2E_FIXTURES.dashboardOwner.password,
  });
  if (dashboardLogin.error) {
    throw new Error(`Unable to authenticate Dashboard OWNER: ${dashboardLogin.error.message}`);
  }

  const dashboardPdf = new TextEncoder().encode("%PDF-1.4\n% Dashboard E2E\n%%EOF");
  async function generateDashboardContract(contractId: string, documentSuffix: string) {
    const documentId = `62000000-0000-4000-8000-0000000000${documentSuffix}`;
    const objectPath = `${dashboardOrganizationId}/contracts/${contractId}/${documentId}/ORIGINAL_PDF.pdf`;
    const upload = await dashboardOwnerClient.storage
      .from("private-files")
      .upload(objectPath, dashboardPdf, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (upload.error) {
      throw new Error(`Unable to upload Dashboard Contract PDF: ${upload.error.message}`);
    }
    const generated = await dashboardOwnerClient.rpc("generate_contract", {
      p_contract_id: contractId,
      p_snapshot: snapshot,
      p_document_id: documentId,
      p_object_path: objectPath,
      p_file_name: `${contractId}.pdf`,
      p_mime_type: "application/pdf",
      p_size_bytes: dashboardPdf.byteLength,
    });
    if (generated.error) {
      throw new Error(`Unable to generate Dashboard Contract: ${generated.error.message}`);
    }
  }

  await generateDashboardContract(dashboard.generatedContractId, "11");
  await generateDashboardContract(dashboard.sentContractId, "12");
  await generateDashboardContract(dashboard.signedContractId, "13");
  await generateDashboardContract(dashboard.canceledContractId, "14");

  for (const contractId of [dashboard.sentContractId, dashboard.signedContractId]) {
    const sent = await dashboardOwnerClient.rpc("mark_contract_sent", {
      p_contract_id: contractId,
      p_recipient_email: "dashboard-client@example.test",
    });
    if (sent.error) {
      throw new Error(`Unable to mark Dashboard Contract SENT: ${sent.error.message}`);
    }
  }

  const signedDocumentId = "62000000-0000-4000-8000-000000000015";
  const signedObjectPath = `${dashboardOrganizationId}/contracts/${dashboard.signedContractId}/${signedDocumentId}/SIGNED_COPY.pdf`;
  const signedUpload = await dashboardOwnerClient.storage
    .from("private-files")
    .upload(signedObjectPath, dashboardPdf, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (signedUpload.error) {
    throw new Error(`Unable to upload Dashboard signed copy: ${signedUpload.error.message}`);
  }
  const signed = await dashboardOwnerClient.rpc("mark_contract_signed", {
    p_contract_id: dashboard.signedContractId,
    p_document_id: signedDocumentId,
    p_object_path: signedObjectPath,
    p_file_name: "dashboard-signed-copy.pdf",
    p_mime_type: "application/pdf",
    p_size_bytes: dashboardPdf.byteLength,
  });
  if (signed.error) {
    throw new Error(`Unable to mark Dashboard Contract SIGNED: ${signed.error.message}`);
  }

  const canceled = await dashboardOwnerClient.rpc("cancel_contract", {
    p_contract_id: dashboard.canceledContractId,
  });
  if (canceled.error) {
    throw new Error(`Unable to cancel Dashboard Contract: ${canceled.error.message}`);
  }

  const dashboardActivities: Array<{
    organization_id: string;
    user_id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    created_at: string;
  }> = Array.from({ length: 11 }, (_, index) => ({
    organization_id: dashboardOrganizationId,
    user_id: dashboardOwnerId,
    entity_type: "DEMAND",
    entity_id: dashboard.assignedOverdueDemandId,
    action: "UPDATED",
    created_at: `2026-09-${String(index + 1).padStart(2, "0")}T08:00:00.000Z`,
  }));
  dashboardActivities.push({
    organization_id: dashboardOrganizationId,
    user_id: dashboardOwnerId,
    entity_type: "DEMAND",
    entity_id: dashboard.restrictedDemandId,
    action: "CREATED",
    created_at: "2026-09-30T08:00:00.000Z",
  });
  const dashboardActivityResult = await supabase
    .from("activity_logs")
    .insert(dashboardActivities);
  if (dashboardActivityResult.error) {
    throw new Error(`Unable to seed Dashboard Activities: ${dashboardActivityResult.error.message}`);
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
