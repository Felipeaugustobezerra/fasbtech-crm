import { expect, test, type BrowserContext, type Page } from "@playwright/test";

import { E2E_FIXTURES } from "./support/data";
import { loginAs } from "./support/login";

const UUID_PATTERN = "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const INCOME = { initial: "Receita Financeiro E2E", updated: "Receita Financeiro E2E Atualizada", amount: "1000.00", category: "Consultoria" } as const;
const EXPENSE = { description: "Despesa Financeiro E2E", amount: "250.00", category: "Infraestrutura" } as const;

function localCivilDate() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function expectSafeNotFound(page: Page) {
  await expect(page.getByRole("heading", { name: "404", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "This page could not be found.", level: 2 })).toBeVisible();
  await expect(page.getByText(/forbidden|RLS|não autorizado/iu)).toHaveCount(0);
}

async function createEntry(page: Page, input: { type: "INCOME" | "EXPENSE"; description: string; amount: string; category: string; nature?: "ONE_TIME" | "RECURRING"; clientId?: string }) {
  await page.goto("/financeiro/novo");
  await page.getByLabel("Tipo").selectOption(input.type);
  await page.getByLabel("Natureza").selectOption(input.nature ?? "ONE_TIME");
  await page.getByLabel(/Descrição/).fill(input.description);
  await page.getByLabel(/Valor/).fill(input.amount);
  await page.getByLabel(/Data de referência/).fill(localCivilDate());
  await page.getByLabel("Categoria").fill(input.category);
  if (input.clientId) await page.getByLabel("Cliente").selectOption(input.clientId);
  await page.getByRole("button", { name: "Criar movimentação" }).click();
  await page.waitForURL(new RegExp(`/financeiro/(${UUID_PATTERN})$`, "u"));
  const match = new URL(page.url()).pathname.match(new RegExp(`^/financeiro/(${UUID_PATTERN})$`, "u"));
  expect(match).not.toBeNull();
  return match?.[1] ?? "";
}

function summaryCard(page: Page, label: string) {
  return page.getByRole("article").filter({ hasText: label });
}

test.describe("Financeiro — lifecycle, agregados e autorização", () => {
  test.describe.configure({ mode: "serial" });

  let ownerContext: BrowserContext;
  let memberContext: BrowserContext;
  let adminContext: BrowserContext;
  let otherOwnerContext: BrowserContext;
  let ownerPage: Page;
  let memberPage: Page;
  let adminPage: Page;
  let otherOwnerPage: Page;
  let incomeId: string;
  let expenseId: string;

  test.beforeAll(async ({ browser }) => {
    ownerContext = await browser.newContext();
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

  test("OWNER cria INCOME e EXPENSE pelo fluxo real", async () => {
    await ownerPage.goto("/financeiro");
    await expect(ownerPage.getByRole("link", { name: "Financeiro" }).first()).toBeVisible();
    incomeId = await createEntry(ownerPage, { type: "INCOME", description: INCOME.initial, amount: INCOME.amount, category: INCOME.category, nature: "RECURRING", clientId: E2E_FIXTURES.clients.clientA.id });
    await expect(ownerPage.getByRole("heading", { name: INCOME.initial, level: 1 })).toBeVisible();
    await expect(ownerPage.getByText("Entrada", { exact: true })).toBeVisible();
    await expect(ownerPage.getByText(/1\s?000,00\s?€/u)).toBeVisible();

    expenseId = await createEntry(ownerPage, { type: "EXPENSE", description: EXPENSE.description, amount: EXPENSE.amount, category: EXPENSE.category });
    await expect(ownerPage.getByRole("heading", { name: EXPENSE.description, level: 1 })).toBeVisible();
    await expect(ownerPage.getByText("Saída", { exact: true })).toBeVisible();
  });

  test("listagem, detalhe, filtros e ordenação usam o estado da URL", async () => {
    await ownerPage.goto("/financeiro");
    const table = ownerPage.getByRole("table", { name: "Movimentações financeiras" });
    await expect(table.getByRole("link", { name: INCOME.initial })).toBeVisible();
    await expect(table.getByRole("link", { name: EXPENSE.description })).toBeVisible();

    await ownerPage.getByRole("searchbox", { name: "Pesquisar" }).fill(INCOME.initial);
    await ownerPage.getByLabel("Tipo").selectOption("INCOME");
    await ownerPage.getByLabel("Status").selectOption("PENDING");
    await ownerPage.getByLabel("Natureza").selectOption("RECURRING");
    await ownerPage.getByLabel("Categoria").fill(INCOME.category);
    await ownerPage.getByLabel("Referência — início").fill(localCivilDate());
    await ownerPage.getByLabel("Referência — fim").fill(localCivilDate());
    await ownerPage.getByLabel("Ordenar por").selectOption("amount");
    await ownerPage.getByLabel("Direção").selectOption("asc");
    await ownerPage.getByLabel("Por página").selectOption("10");
    await ownerPage.getByRole("button", { name: "Aplicar filtros" }).click();
    await expect.poll(() => new URL(ownerPage.url()).searchParams.get("type")).toBe("INCOME");
    await expect(ownerPage.getByRole("link", { name: INCOME.initial })).toBeVisible();
    await expect(ownerPage.getByText(EXPENSE.description)).toHaveCount(0);
    expect(new URL(ownerPage.url()).searchParams.get("page")).toBe("1");
    expect(new URL(ownerPage.url()).searchParams.get("pageSize")).toBe("10");
    expect(new URL(ownerPage.url()).searchParams.get("sort")).toBe("amount");
  });

  test("OWNER edita e os dados persistem após refresh e navegação", async () => {
    await ownerPage.goto(`/financeiro/${incomeId}/editar`);
    await expect(ownerPage.getByLabel(/Status/)).toHaveCount(0);
    await ownerPage.getByLabel(/Descrição/).fill(INCOME.updated);
    await ownerPage.getByLabel("Categoria").fill("Consultoria atualizada");
    await ownerPage.getByRole("button", { name: "Guardar alterações" }).click();
    await expect(ownerPage).toHaveURL(`/financeiro/${incomeId}`);
    await expect(ownerPage.getByRole("heading", { name: INCOME.updated, level: 1 })).toBeVisible();
    await ownerPage.reload();
    await expect(ownerPage.getByRole("heading", { name: INCOME.updated, level: 1 })).toBeVisible();
    await ownerPage.goto("/financeiro");
    await ownerPage.goto(`/financeiro/${incomeId}`);
    await expect(ownerPage.getByText("Consultoria atualizada", { exact: true })).toBeVisible();
  });

  test("realized_date é obrigatória e PENDING muda para REALIZED", async () => {
    await ownerPage.goto(`/financeiro/${incomeId}`);
    await ownerPage.getByLabel("Status").selectOption("REALIZED");
    const realizedDate = ownerPage.getByLabel("Data de realização");
    await expect(realizedDate).toBeVisible();
    expect(await realizedDate.evaluate((element: HTMLInputElement) => element.checkValidity())).toBe(false);
    await ownerPage.getByRole("button", { name: "Atualizar Status" }).click();
    await expect(ownerPage.getByText("Status atualizado.")).toHaveCount(0);
    await realizedDate.fill(localCivilDate());
    await ownerPage.getByRole("button", { name: "Atualizar Status" }).click();
    await expect(ownerPage.getByRole("status").filter({ hasText: "Status atualizado." })).toBeVisible();
    await ownerPage.reload();
    await expect(
      ownerPage
        .getByRole("region", { name: "Dados financeiros" })
        .getByText("Realizado", { exact: true }),
    ).toBeVisible();

    await ownerPage.goto(`/financeiro/${expenseId}`);
    await ownerPage.getByLabel("Status").selectOption("REALIZED");
    await ownerPage.getByLabel("Data de realização").fill(localCivilDate());
    await ownerPage.getByRole("button", { name: "Atualizar Status" }).click();
    await expect(ownerPage.getByRole("status").filter({ hasText: "Status atualizado." })).toBeVisible();
  });

  test("resumo mensal, saldo cumulativo, meta e progresso vêm do backend", async () => {
    await ownerPage.goto("/financeiro");
    await expect(summaryCard(ownerPage, "Entradas realizadas")).toContainText(/1\s?000,00\s?€/u);
    await expect(summaryCard(ownerPage, "Saídas realizadas")).toContainText(/250,00\s?€/u);
    await expect(summaryCard(ownerPage, "Saldo em caixa")).toContainText(/750,00\s?€/u);

    const goal = ownerPage.getByLabel("Meta (EUR)");
    await goal.fill("2000.00");
    await ownerPage.getByRole("button", { name: "Guardar meta" }).click();
    await expect(ownerPage.getByRole("status").filter({ hasText: "Meta mensal guardada." })).toBeVisible();
    await ownerPage.reload();
    await expect(summaryCard(ownerPage, "Meta mensal")).toContainText(/2\s?000,00\s?€/u);
    await expect(ownerPage.getByText("50%", { exact: true }).first()).toBeVisible();
  });

  test("arquivado REALIZED sai da lista e continua no resumo", async () => {
    await ownerPage.goto(`/financeiro/${incomeId}`);
    const archive = ownerPage.getByRole("region", { name: "Arquivar movimentação" });
    await expect(archive).toContainText(/não altera nem cancela o Status/iu);
    await archive.getByRole("button", { name: "Arquivar movimentação" }).click();
    await archive.getByRole("button", { name: "Confirmar arquivamento" }).click();
    await expect(ownerPage).toHaveURL("/financeiro");
    await expect(ownerPage.getByText(INCOME.updated)).toHaveCount(0);
    await expect(summaryCard(ownerPage, "Entradas realizadas")).toContainText(/1\s?000,00\s?€/u);
    await expect(summaryCard(ownerPage, "Saldo em caixa")).toContainText(/750,00\s?€/u);
  });

  test("CANCELED deixa de afetar agregados realizados", async () => {
    await ownerPage.goto(`/financeiro/${expenseId}`);
    await ownerPage.getByLabel("Status").selectOption("CANCELED");
    await ownerPage.getByRole("button", { name: "Atualizar Status" }).click();
    await expect(ownerPage.getByRole("status").filter({ hasText: "Status atualizado." })).toBeVisible();
    await ownerPage.goto("/financeiro");
    await expect(summaryCard(ownerPage, "Entradas realizadas")).toContainText(/1\s?000,00\s?€/u);
    await expect(summaryCard(ownerPage, "Saídas realizadas")).toContainText(/0,00\s?€/u);
    await expect(summaryCard(ownerPage, "Saldo em caixa")).toContainText(/1\s?000,00\s?€/u);
  });

  test("ADMIN e MEMBER não recebem menu nem acesso direto", async () => {
    await loginAs(memberPage, E2E_FIXTURES.member);
    await expect(memberPage.getByRole("link", { name: "Financeiro" })).toHaveCount(0);
    await memberPage.goto("/financeiro");
    await expectSafeNotFound(memberPage);
    await memberPage.goto(`/financeiro/${expenseId}`);
    await expectSafeNotFound(memberPage);

    await loginAs(adminPage, E2E_FIXTURES.admin);
    await expect(adminPage.getByRole("link", { name: "Financeiro" })).toHaveCount(0);
    await adminPage.goto("/financeiro/novo");
    await expectSafeNotFound(adminPage);
    await adminPage.goto(`/financeiro/${expenseId}/editar`);
    await expectSafeNotFound(adminPage);
  });

  test("cross-Organization é negado sem revelar a movimentação", async () => {
    await ownerPage.goto(`/financeiro/${E2E_FIXTURES.financial.otherOrganizationEntry.id}`);
    await expectSafeNotFound(ownerPage);
    await loginAs(otherOwnerPage, E2E_FIXTURES.otherOwner);
    await otherOwnerPage.goto(`/financeiro/${incomeId}`);
    await expectSafeNotFound(otherOwnerPage);
  });

  test("archive final remove a movimentação da lista operacional", async () => {
    await ownerPage.goto(`/financeiro/${expenseId}`);
    await ownerPage.getByRole("button", { name: "Arquivar movimentação" }).click();
    await ownerPage.getByRole("button", { name: "Confirmar arquivamento" }).click();
    await expect(ownerPage).toHaveURL("/financeiro");
    await ownerPage.getByRole("searchbox", { name: "Pesquisar" }).fill(EXPENSE.description);
    await ownerPage.getByRole("button", { name: "Aplicar filtros" }).click();
    await expect(ownerPage.getByRole("heading", { name: "Nenhum resultado encontrado" })).toBeVisible();
    await expect(ownerPage.getByText(EXPENSE.description)).toHaveCount(0);
  });
});
