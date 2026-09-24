import { expect, test, type BrowserContext, type Page } from "@playwright/test";

import { E2E_FIXTURES } from "./support/data";
import { loginAs } from "./support/login";

const UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const TEMPLATE = { initial: "Template Contratos E2E", updated: "Template Contratos E2E Atualizado", initialContent: "Conteúdo inicial do contrato E2E", updatedContent: "Conteúdo revisado e congelado do contrato E2E", laterContent: "Alteração posterior que não pode mudar o snapshot" } as const;
const CONTRACT = { initial: "Contrato Principal E2E", updated: "Contrato Principal E2E Atualizado" } as const;

async function expectSafeNotFound(page: Page) {
  await expect(page.getByRole("heading", { name: "404", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "This page could not be found.", level: 2 })).toBeVisible();
  await expect(page.getByText(/forbidden|RLS|object_path|não autorizado/iu)).toHaveCount(0);
}

function templateForm(page: Page, name: string) {
  return page.locator("form").filter({
    has: page.locator(`input[name="name"][value="${name}"]`),
  });
}

function statusBadge(page: Page, label: string) {
  return page.locator("span").filter({ hasText: new RegExp(`^${label}$`, "u") });
}

test.describe("Contratos — lifecycle, documentos e autorização", () => {
  test.describe.configure({ mode: "serial" });

  let ownerContext: BrowserContext;
  let memberContext: BrowserContext;
  let adminContext: BrowserContext;
  let otherOwnerContext: BrowserContext;
  let ownerPage: Page;
  let memberPage: Page;
  let adminPage: Page;
  let otherOwnerPage: Page;
  let contractId: string;

  test.beforeAll(async ({ browser }) => {
    ownerContext = await browser.newContext({ acceptDownloads: true });
    memberContext = await browser.newContext();
    adminContext = await browser.newContext();
    otherOwnerContext = await browser.newContext();
    ownerPage = await ownerContext.newPage();
    memberPage = await memberContext.newPage();
    adminPage = await adminContext.newPage();
    otherOwnerPage = await otherOwnerContext.newPage();
    await loginAs(ownerPage, E2E_FIXTURES.owner);
  });

  test.afterAll(async () => {
    await Promise.all([ownerContext.close(), memberContext.close(), adminContext.close(), otherOwnerContext.close()]);
  });

  test("OWNER cria e edita um Template", async () => {
    await ownerPage.goto("/contratos/templates");
    const create = ownerPage.locator("form").filter({ has: ownerPage.getByRole("heading", { name: "Novo Template" }) });
    await create.getByLabel("Nome").fill(TEMPLATE.initial);
    await create.getByLabel("Conteúdo").fill(TEMPLATE.initialContent);
    await create.getByRole("button", { name: "Criar Template" }).click();
    await expect(ownerPage.locator(`input[name="name"][value="${TEMPLATE.initial}"]`)).toBeVisible();

    const edit = templateForm(ownerPage, TEMPLATE.initial);
    await edit.getByLabel("Nome").fill(TEMPLATE.updated);
    await edit.getByLabel("Conteúdo").fill(TEMPLATE.updatedContent);
    await edit.getByRole("button", { name: "Guardar alterações" }).click();
    await expect(ownerPage.locator(`input[name="name"][value="${TEMPLATE.updated}"]`)).toBeVisible();
    await expect(templateForm(ownerPage, TEMPLATE.updated).getByLabel("Conteúdo")).toHaveValue(TEMPLATE.updatedContent);
  });

  test("OWNER cria e edita DRAFT com autofill persistente", async () => {
    await ownerPage.goto("/contratos/novo");
    await ownerPage.getByLabel(/Template/).selectOption({ label: TEMPLATE.updated });
    await expect(ownerPage.getByLabel(/Conteúdo final/)).toHaveValue(TEMPLATE.updatedContent);
    await ownerPage.getByLabel(/Cliente/).selectOption(E2E_FIXTURES.clients.clientA.id);
    await ownerPage.getByLabel(/Título/).fill(CONTRACT.initial);
    await ownerPage.getByRole("button", { name: "Criar rascunho" }).click();
    await ownerPage.waitForURL(new RegExp(`/contratos/(${UUID_PATTERN})$`, "u"));
    contractId = new URL(ownerPage.url()).pathname.split("/").at(-1) ?? "";
    await expect(ownerPage.getByRole("heading", { name: CONTRACT.initial, level: 1 })).toBeVisible();
    await expect(ownerPage.getByText(TEMPLATE.updatedContent, { exact: true })).toBeVisible();

    await ownerPage.getByRole("link", { name: "Editar rascunho" }).click();
    await ownerPage.getByLabel(/Título/).fill(CONTRACT.updated);
    await ownerPage.getByLabel(/Conteúdo final/).fill(TEMPLATE.updatedContent);
    await ownerPage.getByRole("button", { name: "Guardar rascunho" }).click();
    await expect(ownerPage).toHaveURL(`/contratos/${contractId}`);
    await ownerPage.reload();
    await expect(ownerPage.getByRole("heading", { name: CONTRACT.updated, level: 1 })).toBeVisible();
    await ownerPage.goto("/contratos");
    await ownerPage.getByRole("link", { name: CONTRACT.updated }).click();
    await expect(ownerPage.getByText(TEMPLATE.updatedContent, { exact: true })).toBeVisible();
  });

  test("DRAFT gera snapshot e ORIGINAL_PDF imutáveis", async () => {
    await ownerPage.goto(`/contratos/${contractId}`);
    await ownerPage.getByRole("button", { name: "Gerar PDF e concluir" }).click();
    await expect(statusBadge(ownerPage, "Gerado")).toBeVisible();
    await expect(ownerPage.getByRole("link", { name: "Editar rascunho" })).toHaveCount(0);
    await expect(ownerPage.getByRole("heading", { name: "Snapshot imutável" })).toBeVisible();
    await expect(ownerPage.getByText(TEMPLATE.updatedContent, { exact: true })).toBeVisible();
    const original = ownerPage.getByRole("article").filter({ has: ownerPage.getByRole("heading", { name: "PDF original" }) });
    await expect(original.getByRole("link", { name: "Transferir PDF" })).toBeVisible();

    await ownerPage.goto("/contratos/templates");
    const edit = templateForm(ownerPage, TEMPLATE.updated);
    await edit.getByLabel("Conteúdo").fill(TEMPLATE.laterContent);
    await edit.getByRole("button", { name: "Guardar alterações" }).click();
    await ownerPage.goto(`/contratos/${contractId}`);
    await expect(ownerPage.getByText(TEMPLATE.updatedContent, { exact: true })).toBeVisible();
    await expect(ownerPage.getByText(TEMPLATE.laterContent, { exact: true })).toHaveCount(0);
    await ownerPage.goto(`/contratos/${contractId}/editar`);
    await expectSafeNotFound(ownerPage);
  });

  test("download privado funciona sem expor object_path", async () => {
    await ownerPage.goto(`/contratos/${contractId}`);
    const link = ownerPage.getByRole("article").filter({ hasText: "PDF original" }).getByRole("link", { name: "Transferir PDF" });
    const href = await link.getAttribute("href");
    expect(href).toMatch(new RegExp(`^/contratos/${contractId}/documentos/${UUID_PATTERN}$`, "u"));
    expect(href).not.toContain("private-files");
    expect(await ownerPage.locator("body").innerText()).not.toContain("object_path");
    const downloadPromise = ownerPage.waitForEvent("download");
    await link.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/u);

    await loginAs(memberPage, E2E_FIXTURES.member);
    const unauthorizedDownload = await memberPage.request.get(href ?? "/contratos");
    expect(unauthorizedDownload.status()).toBe(404);
    expect(await unauthorizedDownload.text()).not.toMatch(/private-files|object_path/iu);
  });

  test("GENERATED pode ser cancelado e torna-se terminal", async () => {
    await ownerPage.goto(`/contratos/${contractId}`);
    await ownerPage.getByRole("button", { name: "Cancelar Contrato" }).click();
    await expect(statusBadge(ownerPage, "Gerado")).toBeVisible();
    await ownerPage.getByRole("button", { name: "Confirmar cancelamento" }).click();
    await expect(statusBadge(ownerPage, "Cancelado")).toBeVisible();
    await expect(ownerPage.getByText(/estado terminal/iu)).toBeVisible();
    await expect(ownerPage.getByRole("button", { name: /Gerar|Enviar|Assinado|Cancelar/u })).toHaveCount(0);
  });

  test("SIGNED_COPY separada conclui SENT → SIGNED e SIGNED é terminal", async () => {
    const fixture = E2E_FIXTURES.contracts.sentForSignature;
    await ownerPage.goto(`/contratos/${fixture.id}`);
    await expect(statusBadge(ownerPage, "Enviado")).toBeVisible();
    await ownerPage.getByLabel("Cópia assinada em PDF").setInputFiles({ name: "signed-copy.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF") });
    await ownerPage.getByRole("button", { name: "Guardar cópia e marcar Assinado" }).click();
    await expect(statusBadge(ownerPage, "Assinado")).toBeVisible();
    await expect(ownerPage.getByRole("article").filter({ hasText: "PDF original" }).getByRole("link", { name: "Transferir PDF" })).toBeVisible();
    await expect(ownerPage.getByRole("article").filter({ hasText: "Cópia assinada" }).getByRole("link", { name: "Transferir PDF" })).toBeVisible();
    await expect(ownerPage.getByText(/estado terminal/iu)).toBeVisible();
  });

  test("SENT pode ser cancelado e preserva o PDF original", async () => {
    const fixture = E2E_FIXTURES.contracts.sentForCancellation;
    await ownerPage.goto(`/contratos/${fixture.id}`);
    await ownerPage.getByRole("button", { name: "Cancelar Contrato" }).click();
    await expect(statusBadge(ownerPage, "Enviado")).toBeVisible();
    await ownerPage.getByRole("button", { name: "Confirmar cancelamento" }).click();
    await expect(statusBadge(ownerPage, "Cancelado")).toBeVisible();
    await expect(ownerPage.getByRole("article").filter({ hasText: "PDF original" }).getByRole("link", { name: "Transferir PDF" })).toBeVisible();
    await expect(ownerPage.getByText(/estado terminal/iu)).toBeVisible();
  });

  test("Template inativo e Cliente arquivado não iniciam novo Contract", async () => {
    await ownerPage.goto("/contratos/templates");
    const edit = templateForm(ownerPage, TEMPLATE.updated);
    await edit.getByRole("button", { name: "Desativar" }).click();
    await expect(edit.getByText("Ativo", { exact: true })).toBeVisible();
    await edit.getByRole("button", { name: "Confirmar desativação" }).click();
    await expect(templateForm(ownerPage, TEMPLATE.updated).getByText("Inativo", { exact: true })).toBeVisible();
    await ownerPage.goto("/contratos/novo");
    await expect(ownerPage.getByLabel(/Template/).getByRole("option", { name: TEMPLATE.updated })).toHaveCount(0);
    await expect(ownerPage.getByLabel(/Template/).getByRole("option", { name: E2E_FIXTURES.contracts.inactiveTemplate.name })).toHaveCount(0);
    await expect(ownerPage.getByLabel(/Cliente/).getByRole("option", { name: E2E_FIXTURES.contracts.archivedClient.name })).toHaveCount(0);
  });

  test("ADMIN, MEMBER, Client Assignment e cross-Organization não concedem acesso", async () => {
    await expect(memberPage.getByRole("link", { name: "Contratos" })).toHaveCount(0);
    await memberPage.goto(`/contratos/${E2E_FIXTURES.contracts.sentForSignature.id}`);
    await expectSafeNotFound(memberPage);

    await loginAs(adminPage, E2E_FIXTURES.admin);
    await expect(adminPage.getByRole("link", { name: "Contratos" })).toHaveCount(0);
    await adminPage.goto("/contratos/templates");
    await expectSafeNotFound(adminPage);

    await ownerPage.goto(`/contratos/${E2E_FIXTURES.contracts.otherOrganization.id}`);
    await expectSafeNotFound(ownerPage);
    await loginAs(otherOwnerPage, E2E_FIXTURES.otherOwner);
    await otherOwnerPage.goto(`/contratos/${E2E_FIXTURES.contracts.sentForSignature.id}`);
    await expectSafeNotFound(otherOwnerPage);
  });
});
