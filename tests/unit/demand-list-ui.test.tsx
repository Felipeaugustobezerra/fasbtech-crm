import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DemandsError from "@/app/(private)/demandas/error";
import DemandsLoading from "@/app/(private)/demandas/loading";
import DemandsPage from "@/app/(private)/demandas/page";
import type { DemandListResult } from "@/lib/demands/queries";
import type { DemandListItem } from "@/types/demand";

const mocks = vi.hoisted(() => ({ listDemands: vi.fn(), resolveFoundationContext: vi.fn() }));
vi.mock("@/lib/demands/queries", () => ({ listDemands: mocks.listDemands }));
vi.mock("@/services/foundation/foundation.service", () => ({ resolveFoundationContext: mocks.resolveFoundationContext }));

const item: DemandListItem = {
  id: "11111111-1111-4111-8111-111111111111", client_id: "22222222-2222-4222-8222-222222222222",
  title: "Atualizar website", status: "IN_PROGRESS", priority: "HIGH", start_date: null, due_date: "2026-09-30",
  created_at: "2026-09-01T10:00:00Z", updated_at: "2026-09-02T10:00:00Z",
  client: { id: "22222222-2222-4222-8222-222222222222", name: "Cliente Alfa" },
  assignees: [{ membership_id: "33333333-3333-4333-8333-333333333333", full_name: "Ana Silva", role: "MEMBER", is_currently_eligible: true }],
  tags: [{ id: "44444444-4444-4444-8444-444444444444", name: "Website" }],
};

function result(overrides: Partial<DemandListResult> = {}): DemandListResult {
  return { items: [item], page: 1, pageSize: 20, total: 1, totalPages: 1, ...overrides };
}

async function renderPage(searchParams: Record<string, string | undefined> = {}) {
  return render(await DemandsPage({ searchParams: Promise.resolve(searchParams) }));
}

describe("Demands list UI", () => {
  beforeEach(() => {
    mocks.listDemands.mockReset().mockResolvedValue(result());
    mocks.resolveFoundationContext.mockReset().mockResolvedValue({ status: "READY", membership: { role: "OWNER" } });
  });

  it("renders the authorized shape and creation CTA", async () => {
    await renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Demandas" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Nova Demanda" })).toHaveAttribute("href", "/demandas/nova");
    expect(screen.getByRole("table", { name: "Lista de Demandas autorizadas" })).toBeVisible();
    const detailLinks = screen.getAllByRole("link", { name: item.title });
    expect(detailLinks).toHaveLength(2);
    expect(detailLinks.every((link) => link.getAttribute("href") === `/demandas/${item.id}`)).toBe(true);
    for (const text of ["Atualizar website", "Cliente Alfa", "Em andamento", "Alta", "Ana Silva", "Website", "30/09/2026"]) expect(screen.getAllByText(text).length).toBeGreaterThan(0);
    expect(screen.queryByText(/organization_id|created_by|updated_by/i)).toBeNull();
  });

  it("passes normalized URL search, filters, sort and page size to the Query", async () => {
    mocks.listDemands.mockResolvedValue(result({ page: 2, pageSize: 50, total: 120, totalPages: 3 }));
    await renderPage({ search: " site ", status: "OPEN", priority: "URGENT", dueOn: "2026-09-30", sort: "title", direction: "asc", page: "2", pageSize: "50" });
    expect(mocks.listDemands).toHaveBeenCalledWith(expect.objectContaining({ search: "site", status: "OPEN", priority: "URGENT", dueOn: "2026-09-30", sort: "title", direction: "asc", page: 2, pageSize: 50 }));
    const next = screen.getByText("Próxima");
    expect(next.closest("a")?.getAttribute("href") ?? "").toContain("status=OPEN");
  });

  it("distinguishes empty collection from filtered empty results", async () => {
    mocks.listDemands.mockResolvedValue(result({ items: [], total: 0, totalPages: 0 }));
    await renderPage();
    expect(screen.getByRole("heading", { name: "Nenhuma demanda encontrada" })).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Nova Demanda" })).toHaveLength(2);
  });

  it("offers clearing active filters", async () => {
    mocks.listDemands.mockResolvedValue(result({ items: [], total: 0, totalPages: 0 }));
    await renderPage({ status: "REVIEW" });
    expect(screen.getByRole("heading", { name: "Nenhum resultado encontrado" })).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Limpar filtros" }).some((link) => link.getAttribute("href") === "/demandas")).toBe(true);
  });

  it("hides creation from ADMIN without changing backend authorization", async () => {
    mocks.resolveFoundationContext.mockResolvedValue({ status: "READY", membership: { role: "ADMIN" } });
    await renderPage();
    expect(screen.queryByRole("link", { name: "Nova Demanda" })).toBeNull();
  });

  it("renders loading and lets the user retry an error", async () => {
    const reset = vi.fn();
    const { unmount } = render(<DemandsLoading />);
    expect(screen.getByRole("status")).toHaveTextContent("A carregar Demandas.");
    unmount();
    render(<DemandsError reset={reset} />);
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
