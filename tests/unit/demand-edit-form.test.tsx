import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EditDemandPage from "@/app/(private)/demandas/[id]/editar/page";
import { DemandEditForm } from "@/components/demands/demand-edit-form";
import type { DemandDetails } from "@/types/demand";

const mocks = vi.hoisted(() => ({
  getDemandById: vi.fn(),
  notFound: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  resolveFoundationContext: vi.fn(),
  updateDemandAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("@/app/(private)/demandas/actions", () => ({
  updateDemandAction: mocks.updateDemandAction,
}));
vi.mock("@/lib/demands/queries", () => ({ getDemandById: mocks.getDemandById }));
vi.mock("@/services/foundation/foundation.service", () => ({
  resolveFoundationContext: mocks.resolveFoundationContext,
}));

const demand: DemandDetails = {
  id: "11111111-1111-4111-8111-111111111111",
  client_id: "22222222-2222-4222-8222-222222222222",
  title: "Título atual",
  description: "Descrição atual",
  status: "OPEN",
  priority: "MEDIUM",
  start_date: "2026-09-01",
  due_date: "2026-09-30",
  notes: "Observação atual",
  created_at: "2026-09-01T10:00:00.000Z",
  updated_at: "2026-09-02T10:00:00.000Z",
  archived_at: null,
  client: { id: "22222222-2222-4222-8222-222222222222", name: "Cliente Alfa" },
  assignees: [],
  tags: [],
};

const initialValues = {
  title: demand.title,
  description: demand.description ?? "",
  priority: demand.priority,
  start_date: demand.start_date ?? "",
  due_date: demand.due_date ?? "",
  notes: demand.notes ?? "",
};

describe("Demand edit", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.updateDemandAction.mockResolvedValue({
      success: true,
      data: { demandId: demand.id },
    });
    mocks.getDemandById.mockResolvedValue(demand);
    mocks.resolveFoundationContext.mockResolvedValue({
      status: "READY",
      membership: { role: "OWNER" },
    });
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  it("shows current values and only the permitted editable fields", () => {
    render(<DemandEditForm demandId={demand.id} initialValues={initialValues} />);

    expect(screen.getByLabelText(/Título/)).toHaveValue(demand.title);
    expect(screen.getByRole("textbox", { name: "Descrição" })).toHaveValue(demand.description);
    expect(screen.getByRole("combobox", { name: "Prioridade" })).toHaveValue("MEDIUM");
    expect(screen.getByLabelText("Data de início")).toHaveValue("2026-09-01");
    expect(screen.getByLabelText("Prazo")).toHaveValue("2026-09-30");
    expect(screen.getByRole("textbox", { name: "Observações" })).toHaveValue(demand.notes);
    expect(screen.queryByLabelText(/cliente/i)).toBeNull();
    expect(screen.queryByLabelText(/status/i)).toBeNull();
    expect(screen.queryByLabelText(/responsáveis/i)).toBeNull();
    expect(screen.queryByLabelText(/tags/i)).toBeNull();
  });

  it("submits the allowed values and navigates to detail", async () => {
    const user = userEvent.setup();
    render(<DemandEditForm demandId={demand.id} initialValues={initialValues} />);

    const title = screen.getByLabelText(/Título/);
    await user.clear(title);
    await user.type(title, "Título revisto");
    await user.click(screen.getByRole("button", { name: "Guardar alterações" }));

    await waitFor(() => expect(mocks.updateDemandAction).toHaveBeenCalledOnce());
    expect(mocks.updateDemandAction).toHaveBeenCalledWith(
      demand.id,
      expect.objectContaining({
        title: "Título revisto",
        description: demand.description,
        priority: "MEDIUM",
        start_date: demand.start_date,
        due_date: demand.due_date,
        notes: demand.notes,
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith(`/demandas/${demand.id}`);
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("maps field and global errors without losing input", async () => {
    const user = userEvent.setup();
    mocks.updateDemandAction
      .mockResolvedValueOnce({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Verifique os campos informados.",
          fieldErrors: { title: ["Título rejeitado."] },
        },
      })
      .mockResolvedValueOnce({
        success: false,
        error: { code: "DATABASE_ERROR", message: "Não foi possível guardar as alterações." },
      });
    render(<DemandEditForm demandId={demand.id} initialValues={initialValues} />);

    await user.click(screen.getByRole("button", { name: "Guardar alterações" }));
    expect(await screen.findByText("Título rejeitado.")).toBeVisible();

    const title = screen.getByLabelText(/Título/);
    await user.clear(title);
    await user.type(title, "Preservado");
    await user.click(screen.getByRole("button", { name: "Guardar alterações" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível guardar as alterações.",
    );
    expect(title).toHaveValue("Preservado");
  });

  it.each(["OWNER", "MEMBER"] as const)("allows %s to open edit", async (role) => {
    mocks.resolveFoundationContext.mockResolvedValue({ status: "READY", membership: { role } });
    render(await EditDemandPage({ params: Promise.resolve({ id: demand.id }) }));
    expect(screen.getByRole("heading", { level: 1, name: "Editar Demanda" })).toBeVisible();
  });

  it("uses not-found for ADMIN, archived and invalid routes", async () => {
    mocks.resolveFoundationContext.mockResolvedValueOnce({
      status: "READY",
      membership: { role: "ADMIN" },
    });
    await expect(EditDemandPage({ params: Promise.resolve({ id: demand.id }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );

    mocks.resolveFoundationContext.mockResolvedValueOnce({
      status: "READY",
      membership: { role: "OWNER" },
    });
    mocks.getDemandById.mockResolvedValueOnce({ ...demand, archived_at: "2026-09-09T10:00:00Z" });
    await expect(EditDemandPage({ params: Promise.resolve({ id: demand.id }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );

    await expect(EditDemandPage({ params: Promise.resolve({ id: "invalid" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});
