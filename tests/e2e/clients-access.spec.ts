import {
  expect,
  test,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import { E2E_FIXTURES } from "./support/data";
import { loginAs } from "./support/login";

const CLIENT = {
  initialName: "Cliente E2E Alpha",
  updatedName: "Cliente E2E Alpha Atualizado",
  company: "FASBtech E2E",
  email: "cliente-e2e@example.test",
  initialCity: "Porto",
  updatedCity: "Lisboa",
} as const;

const UUID_PATTERN =
  "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";

test.describe("Clientes & Acessos — lifecycle crítico", () => {
  test.describe.configure({ mode: "serial" });

  let ownerContext: BrowserContext | undefined;
  let memberContext: BrowserContext | undefined;
  let ownerPage: Page;
  let memberPage: Page;
  let clientId: string;

  test.beforeAll(async ({ browser }) => {
    ownerContext = await browser.newContext();
    memberContext = await browser.newContext();
    ownerPage = await ownerContext.newPage();
    memberPage = await memberContext.newPage();

    await loginAs(ownerPage, E2E_FIXTURES.owner);
  });

  test.afterAll(async () => {
    await Promise.all([ownerContext?.close(), memberContext?.close()]);
  });

  test("OWNER cria, visualiza, edita e pesquisa um Cliente", async () => {
    await ownerPage.goto("/clientes");

    await expect(
      ownerPage.getByRole("heading", { name: "Clientes", level: 1 }),
    ).toBeVisible();
    const newClientLink = ownerPage
      .getByRole("link", { name: "Novo Cliente" })
      .first();

    await expect(newClientLink).toBeVisible();

    await newClientLink.click();
    await ownerPage.getByLabel("Nome").fill(CLIENT.initialName);
    await ownerPage.getByLabel("Empresa").fill(CLIENT.company);
    await ownerPage.getByLabel("E-mail").fill(CLIENT.email);
    await ownerPage.getByLabel("Cidade").fill(CLIENT.initialCity);
    await ownerPage.getByRole("button", { name: "Criar Cliente" }).click();

    await ownerPage.waitForURL(
      new RegExp(`/clientes/(${UUID_PATTERN})$`, "u"),
    );
    const clientIdMatch = new URL(ownerPage.url()).pathname.match(
      new RegExp(`^/clientes/(${UUID_PATTERN})$`, "u"),
    );

    expect(clientIdMatch).not.toBeNull();
    clientId = clientIdMatch?.[1] ?? "";
    await expect(
      ownerPage.getByRole("heading", {
        name: CLIENT.initialName,
        level: 1,
      }),
    ).toBeVisible();
    const generalDetails = ownerPage.getByRole("region", {
      name: "Informações gerais",
    });
    await expect(
      generalDetails.getByText(CLIENT.company, { exact: true }),
    ).toBeVisible();
    await expect(
      generalDetails.getByText(CLIENT.email, { exact: true }),
    ).toBeVisible();

    await ownerPage.getByRole("link", { name: "Editar Cliente" }).click();
    await expect(ownerPage).toHaveURL(`/clientes/${clientId}/editar`);
    await ownerPage.getByLabel("Nome").fill(CLIENT.updatedName);
    await ownerPage.getByLabel("Cidade").fill(CLIENT.updatedCity);
    await ownerPage.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(ownerPage).toHaveURL(`/clientes/${clientId}`);
    await expect(
      ownerPage.getByRole("heading", {
        name: CLIENT.updatedName,
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      ownerPage
        .getByRole("region", { name: "Endereço" })
        .getByText(CLIENT.updatedCity, { exact: true }),
    ).toBeVisible();

    await ownerPage.goto("/clientes");
    await ownerPage
      .getByRole("searchbox", { name: "Pesquisar", exact: true })
      .fill(CLIENT.updatedName);
    await ownerPage.getByRole("button", { name: "Aplicar" }).click();

    const resultRow = ownerPage
      .getByRole("row")
      .filter({ hasText: CLIENT.updatedName });
    await expect(resultRow).toBeVisible();
    await expect(
      resultRow.getByRole("link", { name: CLIENT.updatedName }),
    ).toHaveAttribute("href", `/clientes/${clientId}`);
  });

  test("OWNER concede acesso, MEMBER visualiza, OWNER remove e MEMBER perde acesso", async () => {
    await ownerPage.goto(`/clientes/${clientId}`);
    const accessSection = ownerPage.getByRole("region", {
      name: "Acessos ao Cliente",
    });

    await accessSection
      .getByLabel("Utilizador")
      .selectOption({ label: E2E_FIXTURES.member.fullName });
    await accessSection
      .getByRole("button", { name: "Atribuir acesso" })
      .click();
    await expect(
      accessSection
        .getByRole("list", { name: "Acessos visíveis" })
        .getByText(E2E_FIXTURES.member.fullName, { exact: true }),
    ).toBeVisible();

    await loginAs(memberPage, E2E_FIXTURES.member);
    await memberPage.goto("/clientes");
    await expect(
      memberPage.getByRole("link", { name: CLIENT.updatedName }),
    ).toHaveAttribute("href", `/clientes/${clientId}`);

    await memberPage
      .getByRole("link", { name: CLIENT.updatedName })
      .click();
    await expect(memberPage).toHaveURL(`/clientes/${clientId}`);
    await expect(
      memberPage.getByRole("heading", {
        name: CLIENT.updatedName,
        level: 1,
      }),
    ).toBeVisible();

    await ownerPage.goto(`/clientes/${clientId}`);
    const memberAccess = ownerPage
      .getByRole("listitem")
      .filter({ hasText: E2E_FIXTURES.member.fullName });
    await memberAccess
      .getByRole("button", {
        name: `Remover acesso de ${E2E_FIXTURES.member.fullName}`,
      })
      .click();
    await memberAccess
      .getByRole("button", {
        name: `Confirmar remoção do acesso de ${E2E_FIXTURES.member.fullName}`,
      })
      .click();
    await expect(
      ownerPage
        .getByRole("region", { name: "Acessos ao Cliente" })
        .getByRole("listitem")
        .filter({ hasText: E2E_FIXTURES.member.fullName }),
    ).toHaveCount(0);

    await memberPage.goto("/clientes");
    await memberPage.reload();
    await expect(
      memberPage.getByRole("link", { name: CLIENT.updatedName }),
    ).toHaveCount(0);

    await memberPage.goto(`/clientes/${clientId}`);
    await expect(
      memberPage.getByRole("heading", { name: "404", level: 1 }),
    ).toBeVisible();
    await expect(
      memberPage.getByRole("heading", {
        name: "This page could not be found.",
        level: 2,
      }),
    ).toBeVisible();
  });

  test("OWNER arquiva o Cliente e ele deixa a listagem operacional", async () => {
    await ownerPage.goto(`/clientes/${clientId}`);
    const archiveSection = ownerPage.getByRole("region", {
      name: "Arquivar Cliente",
    });

    await archiveSection
      .getByRole("button", { name: "Arquivar Cliente" })
      .click();
    await archiveSection
      .getByRole("button", { name: "Confirmar arquivamento" })
      .click();
    await expect(ownerPage).toHaveURL("/clientes");

    await ownerPage
      .getByRole("searchbox", { name: "Pesquisar", exact: true })
      .fill(CLIENT.updatedName);
    await ownerPage.getByRole("button", { name: "Aplicar" }).click();
    await expect(
      ownerPage.getByRole("link", { name: CLIENT.updatedName }),
    ).toHaveCount(0);
    await expect(
      ownerPage.getByRole("heading", { name: "Nenhum cliente encontrado" }),
    ).toBeVisible();
  });
});
