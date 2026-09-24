import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app-shell";

const mocks = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));
vi.mock("@/app/(private)/actions", () => ({ logout: vi.fn() }));

function shell() {
  return <AppShell organizationName="FASBtech" role="OWNER" userEmail="owner@example.test"><p>Conteúdo</p></AppShell>;
}

describe("AppShell mobile navigation", () => {
  it("closes the mobile menu on navigation and route change without changing desktop links", async () => {
    mocks.pathname = "/";
    const user = userEvent.setup();
    const { container, rerender } = render(shell());
    const menu = container.querySelector("details");
    const desktop = container.querySelector("aside");
    expect(menu).not.toBeNull();
    expect(desktop).not.toBeNull();

    await user.click(screen.getByText("Menu"));
    expect(menu).toHaveProperty("open", true);
    const mobileLink = within(menu!).getByRole("link", { name: "Clientes" });
    mobileLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(mobileLink);
    expect(menu).toHaveProperty("open", false);

    await user.click(screen.getByText("Menu"));
    expect(menu).toHaveProperty("open", true);
    act(() => { mocks.pathname = "/clientes"; rerender(shell()); });
    expect(menu).toHaveProperty("open", false);
    expect(within(desktop!).getByRole("link", { name: "Clientes" })).toHaveAttribute("href", "/clientes");
    expect(within(desktop!).getAllByRole("link")).toHaveLength(6);
  });
});
