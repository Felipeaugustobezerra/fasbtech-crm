import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DemandDetailsPage from "@/app/(private)/demandas/[id]/page";
import { DemandDetails } from "@/components/demands/demand-details";
import type { DemandDetails as DemandDetailsType } from "@/types/demand";

const mocks = vi.hoisted(() => ({
  getDemandById: vi.fn(),
  listEligibleDemandAssignees: vi.fn(),
  notFound: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
  resolveFoundationContext: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ refresh: mocks.refresh, push: mocks.push }),
}));

vi.mock("@/lib/demands/queries", () => ({
  getDemandById: mocks.getDemandById,
  listEligibleDemandAssignees: mocks.listEligibleDemandAssignees,
}));

vi.mock("@/services/foundation/foundation.service", () => ({
  resolveFoundationContext: mocks.resolveFoundationContext,
}));

const demand: DemandDetailsType = {
  id: "11111111-1111-4111-8111-111111111111",
  client_id: "22222222-2222-4222-8222-222222222222",
  title: "Atualizar website",
  description: "Rever todo o conteúdo institucional.",
  status: "IN_PROGRESS",
  priority: "HIGH",
  start_date: "2026-09-01",
  due_date: "2026-09-30",
  notes: "Validar com o Cliente.",
  created_at: "2026-09-01T10:00:00.000Z",
  updated_at: "2026-09-02T11:00:00.000Z",
  archived_at: null,
  client: { id: "22222222-2222-4222-8222-222222222222", name: "Cliente Alfa" },
  assignees: [
    {
      membership_id: "33333333-3333-4333-8333-333333333333",
      full_name: "Ana Silva",
      role: "MEMBER",
      is_currently_eligible: true,
    },
    {
      membership_id: "44444444-4444-4444-8444-444444444444",
      full_name: "Bruno Costa",
      role: "MEMBER",
      is_currently_eligible: false,
    },
  ],
  tags: [{ id: "55555555-5555-4555-8555-555555555555", name: "Website" }],
};

function context(role: "OWNER" | "ADMIN" | "MEMBER") {
  return { status: "READY", membership: { role } };
}

describe("Demand details", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.getDemandById.mockResolvedValue(demand);
    mocks.listEligibleDemandAssignees.mockResolvedValue([
      demand.assignees[0],
    ]);
    mocks.resolveFoundationContext.mockResolvedValue(context("OWNER"));
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  it("renders the operational shape without administrative fields", () => {
    render(<DemandDetails demand={demand} />);

    for (const text of [
      demand.client.name,
      "Em andamento",
      "Alta",
      demand.description!,
      "01/09/2026",
      "30/09/2026",
      "Ana Silva",
      "Bruno Costa",
      "Histórico — sem acesso atual ao Cliente",
      "Website",
      demand.notes!,
    ]) {
      expect(screen.getByText(text)).toBeVisible();
    }
    expect(screen.queryByText(/organization_id|created_by|updated_by/i)).toBeNull();
  });

  it("renders OWNER operations and loads eligible assignees through the secure Query", async () => {
    render(await DemandDetailsPage({ params: Promise.resolve({ id: demand.id }) }));

    expect(screen.getByRole("heading", { level: 1, name: demand.title })).toBeVisible();
    expect(screen.getByRole("link", { name: "Editar Demanda" })).toHaveAttribute(
      "href",
      `/demandas/${demand.id}/editar`,
    );
    expect(screen.getByRole("button", { name: "Arquivar Demanda" })).toBeVisible();
    expect(screen.getByRole("group", { name: "Gerir responsáveis" })).toBeVisible();
    expect(mocks.listEligibleDemandAssignees).toHaveBeenCalledWith(demand.client_id);
  });

  it("renders MEMBER operations without archive", async () => {
    mocks.resolveFoundationContext.mockResolvedValue(context("MEMBER"));
    render(await DemandDetailsPage({ params: Promise.resolve({ id: demand.id }) }));

    expect(screen.getByRole("link", { name: "Editar Demanda" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Arquivar Demanda" })).toBeNull();
    expect(screen.getByRole("button", { name: "Guardar responsáveis" })).toBeVisible();
  });

  it("renders archived Demand as read-only", async () => {
    mocks.getDemandById.mockResolvedValue({
      ...demand,
      archived_at: "2026-09-09T10:00:00.000Z",
    });
    render(await DemandDetailsPage({ params: Promise.resolve({ id: demand.id }) }));

    expect(screen.getByText(/permanece disponível apenas para consulta/i)).toBeVisible();
    expect(screen.queryByRole("link", { name: "Editar Demanda" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Operações" })).toBeNull();
    expect(mocks.listEligibleDemandAssignees).not.toHaveBeenCalled();
  });

  it("uses a safe not-found for absent, unauthorized and invalid resources", async () => {
    mocks.getDemandById.mockResolvedValueOnce(null);
    await expect(
      DemandDetailsPage({ params: Promise.resolve({ id: demand.id }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    mocks.getDemandById.mockResolvedValueOnce(demand);
    mocks.resolveFoundationContext.mockResolvedValueOnce(context("ADMIN"));
    await expect(
      DemandDetailsPage({ params: Promise.resolve({ id: demand.id }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    await expect(
      DemandDetailsPage({ params: Promise.resolve({ id: "invalid" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
