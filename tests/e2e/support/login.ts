import { expect, type Page } from "@playwright/test";

type LoginCredentials = Readonly<{
  email: string;
  password: string;
}>;

export async function loginAs(page: Page, credentials: LoginCredentials) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(credentials.email);
  await page.getByLabel("Senha").fill(credentials.password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL((url) => url.pathname === "/");
  await expect(
    page.getByRole("heading", { name: "Bem-vindo ao FASBtech CRM" }),
  ).toBeVisible();
}
