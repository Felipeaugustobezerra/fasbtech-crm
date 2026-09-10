import {
  expect,
  test,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import { E2E_FIXTURES } from "./support/data";
import { loginAs } from "./support/login";

const DEMAND = {
  initialTitle: "Demanda Alpha Lifecycle E2E",
  updatedTitle: "Demanda Alpha Lifecycle Atualizada",
  initialDescription: "Descrição inicial da Demanda E2E.",
  updatedDescription: "Descrição atualizada e persistida pela interface.",
  initialNotes: "Observação inicial E2E.",
  updatedNotes: "Observação atualizada E2E.",
  initialStartDate: "2026-10-01",
  updatedStartDate: "2026-10-02",
  initialDueDate: "2026-10-20",
  updatedDueDate: "2026-10-25",
} as const;

const UUID_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

async function expectSafeNotFound(page: Page) {
  await expect(page.getByRole("heading", { name: "404", level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "This page could not be found.",
      level: 2,
    }),
  ).toBeVisible();
  await expect(page.getByText(/forbidden|RLS|não autorizado/iu)).toHaveCount(0);
}

test.describe("Demandas — lifecycle e autorização críticos", () => {
  test.describe.configure({ mode: "serial" });

  let ownerContext: BrowserContext;
  let memberContext: BrowserContext;
  let adminContext: BrowserContext;
  let otherOwnerContext: BrowserContext;
  let ownerPage: Page;
  let memberPage: Page;
  let adminPage: Page;
  let otherOwnerPage: Page;
  let demandId: string;

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
    await Promise.all([
      ownerContext.close(),
      memberContext.close(),
      adminContext.close(),
      otherOwnerContext.close(),
    ]);
  });

  test("OWNER cria a Demanda pelo fluxo real e abre o detalhe", async () => {
    await ownerPage.goto("/demandas");
    await ownerPage.getByRole("link", { name: "Nova Demanda" }).first().click();

    await expect(ownerPage).toHaveURL("/demandas/nova");
    await expect(ownerPage.getByLabel("Status")).toHaveCount(0);
    await ownerPage
      .getByRole("combobox", { name: /^Cliente/iu })
      .selectOption(E2E_FIXTURES.clients.clientA.id);
    await expect(
      ownerPage.getByRole("checkbox", {
        name: new RegExp(E2E_FIXTURES.member.fullName, "u"),
      }),
    ).toBeVisible();
    await expect(
      ownerPage.getByRole("checkbox", {
        name: new RegExp(E2E_FIXTURES.memberB.fullName, "u"),
      }),
    ).toHaveCount(0);
    await expect(ownerPage.getByText(E2E_FIXTURES.admin.fullName)).toHaveCount(0);

    await ownerPage.getByLabel("Título").fill(DEMAND.initialTitle);
    await ownerPage.getByLabel("Descrição").fill(DEMAND.initialDescription);
    await ownerPage.getByLabel("Prioridade").selectOption("HIGH");
    await ownerPage.getByLabel("Data de início").fill(DEMAND.initialStartDate);
    await ownerPage.getByLabel("Prazo").fill(DEMAND.initialDueDate);
    await ownerPage.getByLabel("Observações").fill(DEMAND.initialNotes);
    await ownerPage
      .getByRole("checkbox", {
        name: new RegExp(E2E_FIXTURES.member.fullName, "u"),
      })
      .check();
    await ownerPage.getByRole("button", { name: "Criar Demanda" }).click();

    await ownerPage.waitForURL(new RegExp(`/demandas/(${UUID_PATTERN})$`, "u"));
    const match = new URL(ownerPage.url()).pathname.match(
      new RegExp(`^/demandas/(${UUID_PATTERN})$`, "u"),
    );
    expect(match).not.toBeNull();
    demandId = match?.[1] ?? "";

    await expect(
      ownerPage.getByRole("heading", { name: DEMAND.initialTitle, level: 1 }),
    ).toBeVisible();
    const details = ownerPage.getByRole("region", { name: "Informações da Demanda" });
    await expect(details.getByText(E2E_FIXTURES.clients.clientA.name)).toBeVisible();
    await expect(details.getByText("Aberta", { exact: true })).toBeVisible();
    await expect(details.getByText("Alta", { exact: true })).toBeVisible();
    await expect(details.getByText(DEMAND.initialDescription)).toBeVisible();
    await expect(details.getByText("01/10/2026")).toBeVisible();
    await expect(details.getByText("20/10/2026")).toBeVisible();
    await expect(details.getByText(DEMAND.initialNotes)).toBeVisible();
    await expect(
      ownerPage
        .getByRole("region", { name: "Responsáveis atuais" })
        .getByText(E2E_FIXTURES.member.fullName, { exact: true }),
    ).toBeVisible();
  });

  test("listagem, pesquisa, filtros, ordenação e pageSize chegam ao banco", async () => {
    await ownerPage.goto("/demandas");
    const row = ownerPage.getByRole("row").filter({ hasText: DEMAND.initialTitle });
    await expect(row).toContainText(E2E_FIXTURES.clients.clientA.name);
    await expect(row).toContainText("Aberta");
    await expect(row).toContainText("Alta");
    await expect(row).toContainText(E2E_FIXTURES.member.fullName);
    await expect(row).toContainText("20/10/2026");
    await row.getByRole("link", { name: DEMAND.initialTitle }).click();
    await expect(ownerPage).toHaveURL(`/demandas/${demandId}`);

    await ownerPage.goto("/demandas?page=2");
    await ownerPage
      .getByRole("searchbox", { name: "Pesquisar", exact: true })
      .fill(DEMAND.initialTitle);
    await ownerPage.getByRole("combobox", { name: /^Status/iu }).selectOption("OPEN");
    await ownerPage.getByRole("combobox", { name: /^Prioridade/iu }).selectOption("HIGH");
    await ownerPage.getByLabel("Prazo em", { exact: true }).fill(DEMAND.initialDueDate);
    await ownerPage.getByRole("combobox", { name: /^Ordenar por/iu }).selectOption("title");
    await ownerPage.getByRole("combobox", { name: /^Direção/iu }).selectOption("asc");
    await ownerPage.getByRole("combobox", { name: /^Por página/iu }).selectOption("10");
    await ownerPage.getByRole("button", { name: "Aplicar" }).click();
    await expect.poll(() => new URL(ownerPage.url()).searchParams.get("page")).toBe("1");
    await expect(ownerPage.getByRole("row").filter({ hasText: DEMAND.initialTitle })).toBeVisible();
    await expect(
      ownerPage.getByRole("row").filter({ hasText: E2E_FIXTURES.demands.clientB.title }),
    ).toHaveCount(0);

    await ownerPage.goto("/demandas?sort=title&direction=asc&pageSize=10");
    const demandLinks = ownerPage
      .getByRole("table", { name: "Lista de Demandas autorizadas" })
      .getByRole("link");
    await expect(demandLinks).toHaveCount(2);
    const titles = await demandLinks.allTextContents();
    expect(titles).toEqual([DEMAND.initialTitle, E2E_FIXTURES.demands.clientB.title]);
    await expect(ownerPage.getByText(/10 por página/iu)).toBeVisible();
  });

  test("OWNER edita somente campos permitidos e persiste os valores", async () => {
    await ownerPage.goto(`/demandas/${demandId}/editar`);
    await expect(ownerPage.getByLabel("Cliente")).toHaveCount(0);
    await expect(ownerPage.getByLabel("Status")).toHaveCount(0);
    await expect(ownerPage.getByLabel(/organization_id/iu)).toHaveCount(0);

    await ownerPage.getByLabel("Título").fill(DEMAND.updatedTitle);
    await ownerPage.getByLabel("Descrição").fill(DEMAND.updatedDescription);
    await ownerPage.getByLabel("Prioridade").selectOption("URGENT");
    await ownerPage.getByLabel("Data de início").fill(DEMAND.updatedStartDate);
    await ownerPage.getByLabel("Prazo").fill(DEMAND.updatedDueDate);
    await ownerPage.getByLabel("Observações").fill(DEMAND.updatedNotes);
    await ownerPage.getByRole("button", { name: "Guardar alterações" }).click();

    await expect(ownerPage).toHaveURL(`/demandas/${demandId}`);
    const details = ownerPage.getByRole("region", { name: "Informações da Demanda" });
    await expect(ownerPage.getByRole("heading", { name: DEMAND.updatedTitle, level: 1 })).toBeVisible();
    await expect(details.getByText(DEMAND.updatedDescription)).toBeVisible();
    await expect(details.getByText("Urgente", { exact: true })).toBeVisible();
    await expect(details.getByText("02/10/2026")).toBeVisible();
    await expect(details.getByText("25/10/2026")).toBeVisible();
    await expect(details.getByText(DEMAND.updatedNotes)).toBeVisible();
  });

  test("OWNER altera Status, responsáveis e Tags com persistência", async () => {
    await ownerPage.goto(`/demandas/${demandId}`);
    await ownerPage.getByLabel("Alterar Status").selectOption("IN_PROGRESS");
    await ownerPage.getByRole("button", { name: "Atualizar Status" }).click();
    await expect(ownerPage.getByRole("status").filter({ hasText: "Status atualizado." })).toBeVisible();
    await ownerPage.reload();
    await expect(
      ownerPage
        .getByRole("region", { name: "Informações da Demanda" })
        .getByText("Em andamento", { exact: true }),
    ).toBeVisible();

    const assignees = ownerPage.getByRole("group", { name: "Gerir responsáveis" });
    await expect(
      assignees.getByRole("checkbox", { name: new RegExp(E2E_FIXTURES.member.fullName, "u") }),
    ).toBeChecked();
    await expect(
      assignees.getByRole("checkbox", { name: new RegExp(E2E_FIXTURES.memberB.fullName, "u") }),
    ).toHaveCount(0);
    await expect(assignees.getByText(E2E_FIXTURES.admin.fullName)).toHaveCount(0);
    await assignees
      .getByRole("checkbox", { name: new RegExp(E2E_FIXTURES.owner.fullName, "u") })
      .check();
    await ownerPage.getByRole("button", { name: "Guardar responsáveis" }).click();
    await expect(ownerPage.getByRole("status").filter({ hasText: "Responsáveis atualizados." })).toBeVisible();
    await ownerPage.reload();
    const currentAssignees = ownerPage.getByRole("region", { name: "Responsáveis atuais" });
    await expect(currentAssignees.getByText(E2E_FIXTURES.owner.fullName, { exact: true })).toBeVisible();
    await expect(currentAssignees.getByText(E2E_FIXTURES.member.fullName, { exact: true })).toBeVisible();

    const tagInput = ownerPage.getByLabel("Novo nome de Tag");
    await tagInput.fill("Backend");
    await ownerPage.getByRole("button", { name: "Adicionar Tag" }).click();
    await tagInput.fill("Urgente");
    await ownerPage.getByRole("button", { name: "Adicionar Tag" }).click();
    await ownerPage.getByRole("button", { name: "Guardar Tags" }).click();
    await expect(ownerPage.getByRole("status").filter({ hasText: "Tags atualizadas." })).toBeVisible();
    await ownerPage.reload();
    const currentTags = ownerPage.getByRole("region", { name: "Tags" });
    await expect(currentTags.getByText("Backend", { exact: true })).toBeVisible();
    await expect(currentTags.getByText("Urgente", { exact: true })).toBeVisible();

    await ownerPage
      .getByRole("group", { name: "Gerir Tags" })
      .getByRole("checkbox", { name: "Backend" })
      .uncheck();
    await ownerPage.getByRole("button", { name: "Guardar Tags" }).click();
    await expect(ownerPage.getByRole("status").filter({ hasText: "Tags atualizadas." })).toBeVisible();
    await ownerPage.reload();
    await expect(ownerPage.getByRole("region", { name: "Tags" }).getByText("Backend", { exact: true })).toHaveCount(0);
    await expect(ownerPage.getByRole("region", { name: "Tags" }).getByText("Urgente", { exact: true })).toBeVisible();
  });

  test("MEMBER autorizado lê, opera e não recebe arquivamento", async () => {
    await loginAs(memberPage, E2E_FIXTURES.member);
    await memberPage.goto("/demandas");
    await expect(memberPage.getByRole("link", { name: DEMAND.updatedTitle })).toBeVisible();
    await memberPage.getByRole("link", { name: DEMAND.updatedTitle }).click();
    await expect(memberPage).toHaveURL(`/demandas/${demandId}`);
    await expect(memberPage.getByRole("link", { name: "Editar Demanda" })).toBeVisible();
    await expect(memberPage.getByRole("button", { name: "Guardar responsáveis" })).toBeVisible();
    await expect(memberPage.getByRole("button", { name: "Guardar Tags" })).toBeVisible();
    await expect(memberPage.getByRole("button", { name: "Arquivar Demanda" })).toHaveCount(0);

    await memberPage.getByLabel("Alterar Status").selectOption("REVIEW");
    await memberPage.getByRole("button", { name: "Atualizar Status" }).click();
    await expect(memberPage.getByRole("status").filter({ hasText: "Status atualizado." })).toBeVisible();
    await memberPage.reload();
    await expect(
      memberPage
        .getByRole("region", { name: "Informações da Demanda" })
        .getByText("Em revisão", { exact: true }),
    ).toBeVisible();
  });

  test("MEMBER sem Assignment não vê Client B nem obtém acesso por URL direta", async () => {
    await memberPage.goto("/demandas");
    await expect(memberPage.getByText(E2E_FIXTURES.demands.clientB.title)).toHaveCount(0);
    await memberPage.goto(`/demandas/${E2E_FIXTURES.demands.clientB.id}`);
    await expectSafeNotFound(memberPage);
  });

  test("remover Client Assignment corta acesso sem apagar o assignee histórico", async () => {
    await ownerPage.goto(`/clientes/${E2E_FIXTURES.clients.clientA.id}`);
    const memberAccess = ownerPage
      .getByRole("listitem")
      .filter({ hasText: E2E_FIXTURES.member.fullName });
    await memberAccess
      .getByRole("button", { name: `Remover acesso de ${E2E_FIXTURES.member.fullName}` })
      .click();
    await memberAccess
      .getByRole("button", { name: `Confirmar remoção do acesso de ${E2E_FIXTURES.member.fullName}` })
      .click();
    await expect(memberAccess).toHaveCount(0);

    await memberPage.goto("/demandas");
    await expect(memberPage.getByText(DEMAND.updatedTitle)).toHaveCount(0);
    await memberPage.goto(`/demandas/${demandId}`);
    await expectSafeNotFound(memberPage);

    await ownerPage.goto(`/demandas/${demandId}`);
    const currentAssignees = ownerPage.getByRole("region", { name: "Responsáveis atuais" });
    await expect(currentAssignees.getByText(E2E_FIXTURES.member.fullName, { exact: true })).toBeVisible();
    await expect(currentAssignees.getByText(/Histórico — sem acesso atual ao Cliente/iu)).toBeVisible();
  });

  test("ADMIN não recebe navegação nem acesso direto ao módulo", async () => {
    await loginAs(adminPage, E2E_FIXTURES.admin);
    await expect(
      adminPage.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Demandas" }),
    ).toHaveCount(0);
    await adminPage.goto("/demandas");
    await expectSafeNotFound(adminPage);
    await adminPage.goto(`/demandas/${demandId}`);
    await expectSafeNotFound(adminPage);
  });

  test("OWNER de outra Organization não lê a Demanda por URL direta", async () => {
    await loginAs(otherOwnerPage, E2E_FIXTURES.otherOwner);
    await otherOwnerPage.goto(`/demandas/${demandId}`);
    await expectSafeNotFound(otherOwnerPage);
  });

  test("OWNER arquiva com confirmação e remove a Demanda da listagem operacional", async () => {
    await ownerPage.goto(`/demandas/${demandId}`);
    const archive = ownerPage.getByRole("region", { name: "Arquivar Demanda" });
    await expect(archive).toContainText(/dados e o histórico serão preservados/iu);
    await archive.getByRole("button", { name: "Arquivar Demanda" }).click();
    await expect(archive.getByRole("button", { name: /Excluir/iu })).toHaveCount(0);
    await archive.getByRole("button", { name: "Confirmar arquivamento" }).click();
    await expect(ownerPage).toHaveURL("/demandas");

    await ownerPage
      .getByRole("searchbox", { name: "Pesquisar", exact: true })
      .fill(DEMAND.updatedTitle);
    await ownerPage.getByRole("button", { name: "Aplicar" }).click();
    await expect(ownerPage.getByText(DEMAND.updatedTitle)).toHaveCount(0);
    await expect(
      ownerPage.getByRole("heading", { name: "Nenhum resultado encontrado" }),
    ).toBeVisible();
  });
});
