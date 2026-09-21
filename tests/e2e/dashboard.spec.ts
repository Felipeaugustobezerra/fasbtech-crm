import { expect, test, type BrowserContext, type Page } from "@playwright/test";

import { E2E_FIXTURES } from "./support/data";
import { loginAs } from "./support/login";

const euro = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

function dashboardCard(page: Page, label: string) {
  return page
    .getByRole("region", { name: "Resumo executivo" })
    .getByRole("link")
    .filter({ has: page.getByText(label, { exact: true }) });
}

function summaryCard(page: Page, label: string) {
  return page
    .getByRole("article")
    .filter({ has: page.getByText(label, { exact: true }) });
}

function expectCardValue(card: ReturnType<typeof dashboardCard>, value: string) {
  return expect(card.getByText(value, { exact: true })).toBeVisible();
}

test.describe("Dashboard consolidado — métricas e autorização", () => {
  let ownerContext: BrowserContext;
  let memberContext: BrowserContext;
  let adminContext: BrowserContext;
  let ownerPage: Page;
  let memberPage: Page;
  let adminPage: Page;

  test.beforeAll(async ({ browser }) => {
    ownerContext = await browser.newContext({ timezoneId: "Pacific/Auckland" });
    memberContext = await browser.newContext({ timezoneId: "America/Los_Angeles" });
    adminContext = await browser.newContext({ timezoneId: "Asia/Tokyo" });
    ownerPage = await ownerContext.newPage();
    memberPage = await memberContext.newPage();
    adminPage = await adminContext.newPage();

    await Promise.all([
      loginAs(ownerPage, E2E_FIXTURES.dashboardOwner),
      loginAs(memberPage, E2E_FIXTURES.dashboardMember),
      loginAs(adminPage, E2E_FIXTURES.dashboardAdmin),
    ]);
  });

  test.afterAll(async () => {
    await Promise.all([
      ownerContext.close(),
      memberContext.close(),
      adminContext.close(),
    ]);
  });

  test("OWNER vê métricas reais consolidadas e mantém resultados após refresh", async () => {
    await expect(
      ownerPage.getByRole("heading", { name: "Visão executiva", level: 1 }),
    ).toBeVisible();

    await expectCardValue(dashboardCard(ownerPage, "Clientes ativos"), "2");
    await expectCardValue(dashboardCard(ownerPage, "Demandas ativas"), "2");
    await expectCardValue(
      dashboardCard(ownerPage, "Contratos não terminais"),
      "3",
    );

    const demands = ownerPage.getByRole("region", { name: "Demandas" });
    await expectCardValue(
      demands.getByRole("link").filter({ hasText: "Demandas atrasadas" }),
      "1",
    );
    await expectCardValue(
      demands.getByRole("link").filter({ hasText: "Aberta" }),
      "1",
    );
    await expectCardValue(
      demands.getByRole("link").filter({ hasText: "Em andamento" }),
      "1",
    );
    await expectCardValue(
      demands.getByRole("link").filter({ hasText: "Concluída" }),
      "1",
    );

    const financial = ownerPage.getByRole("region", {
      name: "Resumo financeiro",
    });
    await expect(
      financial.getByText(euro.format(1000), { exact: true }),
    ).toBeVisible();
    await expect(
      financial.getByText(euro.format(250), { exact: true }),
    ).toBeVisible();
    await expect(
      financial.getByText(euro.format(850), { exact: true }),
    ).toBeVisible();
    await expect(
      financial.getByText(euro.format(2000), { exact: true }),
    ).toBeVisible();
    await expect(
      financial.getByRole("progressbar", { name: "Progresso da meta mensal" }),
    ).toHaveAttribute("value", "0.5");

    const contracts = ownerPage.getByRole("region", { name: "Contratos" });
    for (const label of [
      "Rascunho",
      "Gerado",
      "Enviado",
      "Assinado",
      "Cancelado",
    ]) {
      await expectCardValue(
        contracts.getByRole("link").filter({ hasText: label }),
        "1",
      );
    }

    const activity = ownerPage.getByRole("region", {
      name: "Atividade recente",
    });
    await expect(activity.getByRole("listitem")).toHaveCount(10);
    await expect(activity.getByText("Demanda — Criado")).toBeVisible();

    await ownerPage.reload();
    await expectCardValue(dashboardCard(ownerPage, "Clientes ativos"), "2");
    await expectCardValue(dashboardCard(ownerPage, "Demandas ativas"), "2");
    await expect(
      ownerPage.getByRole("region", { name: "Atividade recente" }).getByRole("listitem"),
    ).toHaveCount(10);
  });

  test("MEMBER recebe somente Clientes, Demandas e atividades autorizadas", async () => {
    await expectCardValue(dashboardCard(memberPage, "Clientes ativos"), "1");
    await expectCardValue(dashboardCard(memberPage, "Demandas ativas"), "1");

    const demands = memberPage.getByRole("region", { name: "Demandas" });
    await expectCardValue(
      demands.getByRole("link").filter({ hasText: "Demandas atrasadas" }),
      "1",
    );
    await expectCardValue(
      demands.getByRole("link").filter({ hasText: "Aberta" }),
      "1",
    );
    await expectCardValue(
      demands.getByRole("link").filter({ hasText: "Em andamento" }),
      "0",
    );
    await expectCardValue(
      demands.getByRole("link").filter({ hasText: "Concluída" }),
      "1",
    );

    await expect(
      memberPage.getByRole("heading", { name: "Resumo financeiro" }),
    ).toHaveCount(0);
    await expect(
      memberPage.getByRole("heading", { name: "Contratos" }),
    ).toHaveCount(0);
    await expect(memberPage.getByText(euro.format(1000))).toHaveCount(0);

    const activity = memberPage.getByRole("region", {
      name: "Atividade recente",
    });
    await expect(activity.getByRole("listitem")).toHaveCount(10);
    await expect(activity.getByText("Demanda — Criado")).toHaveCount(0);
    await expect(activity.getByText("Demanda — Atualizado")).toHaveCount(10);
  });

  test("ADMIN recebe estado seguro sem métricas operacionais", async () => {
    await expect(
      adminPage.getByRole("heading", {
        name: "Sem módulos operacionais autorizados",
      }),
    ).toBeVisible();
    await expect(adminPage.getByText("Clientes ativos")).toHaveCount(0);
    await expect(adminPage.getByText("Demandas ativas")).toHaveCount(0);
    await expect(adminPage.getByText("Saldo em caixa")).toHaveCount(0);
    await expect(adminPage.getByText("Contratos não terminais")).toHaveCount(0);
    await expect(
      adminPage.getByRole("heading", { name: "Atividade recente" }),
    ).toHaveCount(0);
  });

  test("período financeiro usa Europe/Lisbon independentemente do browser", async () => {
    const expectedPeriod = new Intl.DateTimeFormat("pt-PT", {
      timeZone: "Europe/Lisbon",
      month: "long",
      year: "numeric",
    }).format(new Date());

    await expect(
      ownerPage.getByText(`Indicadores autorizados para ${expectedPeriod}.`),
    ).toBeVisible();
    await expect(
      summaryCard(ownerPage, "Entradas realizadas").getByText(euro.format(1000), {
        exact: true,
      }),
    ).toBeVisible();
  });
});
