import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DemandArchive } from "@/components/demands/demand-archive";
import { DemandAssigneeManager } from "@/components/demands/demand-assignee-manager";
import { DemandStatusControl } from "@/components/demands/demand-status-control";
import { DemandTagManager } from "@/components/demands/demand-tag-manager";

const mocks = vi.hoisted(() => ({
  archiveDemandAction: vi.fn(),
  changeDemandStatusAction: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  setDemandAssigneesAction: vi.fn(),
  setDemandTagsAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("@/app/(private)/demandas/actions", () => ({
  archiveDemandAction: mocks.archiveDemandAction,
  changeDemandStatusAction: mocks.changeDemandStatusAction,
  setDemandAssigneesAction: mocks.setDemandAssigneesAction,
  setDemandTagsAction: mocks.setDemandTagsAction,
}));

const demandId = "11111111-1111-4111-8111-111111111111";
const firstMemberId = "22222222-2222-4222-8222-222222222222";
const secondMemberId = "33333333-3333-4333-8333-333333333333";
const historicalMemberId = "44444444-4444-4444-8444-444444444444";
const tagId = "55555555-5555-4555-8555-555555555555";

describe("Demand operational controls", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    const success = { success: true, data: { demandId } };
    mocks.archiveDemandAction.mockResolvedValue(success);
    mocks.changeDemandStatusAction.mockResolvedValue(success);
    mocks.setDemandAssigneesAction.mockResolvedValue(success);
    mocks.setDemandTagsAction.mockResolvedValue(success);
  });

  it("offers all six statuses, submits once and refreshes", async () => {
    const user = userEvent.setup();
    render(<DemandStatusControl demandId={demandId} currentStatus="OPEN" />);

    const status = screen.getByRole("combobox", { name: "Alterar Status" });
    expect(screen.getAllByRole("option")).toHaveLength(6);
    await user.selectOptions(status, "COMPLETED");
    await user.click(screen.getByRole("button", { name: "Atualizar Status" }));

    await waitFor(() => expect(mocks.changeDemandStatusAction).toHaveBeenCalledOnce());
    expect(mocks.changeDemandStatusAction).toHaveBeenCalledWith({
      demand_id: demandId,
      status: "COMPLETED",
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Status atualizado.");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("disables the Status submit while pending and shows safe errors", async () => {
    const user = userEvent.setup();
    let resolve!: (value: object) => void;
    mocks.changeDemandStatusAction.mockReturnValue(new Promise((done) => { resolve = done; }));
    render(<DemandStatusControl demandId={demandId} currentStatus="OPEN" />);
    await user.selectOptions(screen.getByRole("combobox"), "REVIEW");
    await user.click(screen.getByRole("button", { name: "Atualizar Status" }));
    expect(screen.getByRole("button", { name: "Atualizando..." })).toBeDisabled();
    resolve({ success: false, error: { code: "DATABASE_ERROR", message: "Não foi possível guardar as alterações." } });
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível guardar as alterações.");
  });

  it("preselects eligible assignees, separates history and replaces the set once", async () => {
    const user = userEvent.setup();
    render(
      <DemandAssigneeManager
        demandId={demandId}
        currentAssignees={[
          { membership_id: firstMemberId, full_name: "Ana Silva", role: "MEMBER", is_currently_eligible: true },
          { membership_id: historicalMemberId, full_name: "Histórico", role: "MEMBER", is_currently_eligible: false },
        ]}
        eligibleAssignees={[
          { membership_id: firstMemberId, full_name: "Ana Silva", role: "MEMBER" },
          { membership_id: secondMemberId, full_name: "Bruno Costa", role: "OWNER" },
        ]}
      />,
    );

    expect(screen.getByRole("checkbox", { name: /Ana Silva/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Bruno Costa/ })).not.toBeChecked();
    expect(screen.getByText("Responsáveis históricos")).toBeVisible();
    expect(screen.getByText(/vínculos históricos serão removidos/i)).toBeVisible();
    await user.click(screen.getByRole("checkbox", { name: /Bruno Costa/ }));
    await user.click(screen.getByRole("button", { name: "Guardar responsáveis" }));

    await waitFor(() => expect(mocks.setDemandAssigneesAction).toHaveBeenCalledOnce());
    expect(mocks.setDemandAssigneesAction).toHaveBeenCalledWith({
      demand_id: demandId,
      membership_ids: [firstMemberId, secondMemberId],
    });
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("supports zero assignees and reports an assignee error", async () => {
    const user = userEvent.setup();
    mocks.setDemandAssigneesAction.mockResolvedValue({
      success: false,
      error: { code: "AUTHORIZATION_DENIED", message: "Não possui permissão para executar esta ação." },
    });
    render(<DemandAssigneeManager demandId={demandId} currentAssignees={[]} eligibleAssignees={[]} />);
    expect(screen.getByText("Nenhum responsável elegível para este Cliente.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Guardar responsáveis" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não possui permissão");
    expect(mocks.setDemandAssigneesAction).toHaveBeenCalledWith({ demand_id: demandId, membership_ids: [] });
  });

  it("removes an existing Tag, adds a free name and submits one complete set", async () => {
    const user = userEvent.setup();
    render(<DemandTagManager demandId={demandId} currentTags={[{ id: tagId, name: "Website" }]} />);

    await user.click(screen.getByRole("checkbox", { name: "Website" }));
    await user.type(screen.getByRole("textbox", { name: "Novo nome de Tag" }), " Urgente ");
    await user.click(screen.getByRole("button", { name: "Adicionar Tag" }));
    expect(screen.getByRole("list", { name: "Novas Tags" })).toHaveTextContent("Urgente");
    await user.click(screen.getByRole("button", { name: "Guardar Tags" }));

    await waitFor(() => expect(mocks.setDemandTagsAction).toHaveBeenCalledOnce());
    expect(mocks.setDemandTagsAction).toHaveBeenCalledWith({
      demand_id: demandId,
      existing_tag_ids: [],
      new_tag_names: ["Urgente"],
    });
    expect(screen.getByText(/não existe catálogo global/i)).toBeVisible();
  });

  it("keeps Tag state on failure", async () => {
    const user = userEvent.setup();
    mocks.setDemandTagsAction.mockResolvedValue({
      success: false,
      error: { code: "DATABASE_ERROR", message: "Não foi possível guardar as alterações." },
    });
    render(<DemandTagManager demandId={demandId} currentTags={[{ id: tagId, name: "Website" }]} />);
    await user.click(screen.getByRole("button", { name: "Guardar Tags" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível guardar");
    expect(screen.getByRole("checkbox", { name: "Website" })).toBeChecked();
  });

  it("requires archive confirmation, calls the Action and returns to list", async () => {
    const user = userEvent.setup();
    render(<DemandArchive demandId={demandId} demandTitle="Atualizar website" />);
    await user.click(screen.getByRole("button", { name: "Arquivar Demanda" }));
    expect(mocks.archiveDemandAction).not.toHaveBeenCalled();
    expect(screen.getByText(/dados e o histórico serão preservados/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Confirmar arquivamento" }));
    await waitFor(() => expect(mocks.archiveDemandAction).toHaveBeenCalledOnce());
    expect(mocks.archiveDemandAction).toHaveBeenCalledWith({ demand_id: demandId });
    expect(mocks.push).toHaveBeenCalledWith("/demandas");
  });

  it("keeps archive detail visible on failure", async () => {
    const user = userEvent.setup();
    mocks.archiveDemandAction.mockResolvedValue({
      success: false,
      error: { code: "DATABASE_ERROR", message: "Não foi possível guardar as alterações." },
    });
    render(<DemandArchive demandId={demandId} demandTitle="Atualizar website" />);
    await user.click(screen.getByRole("button", { name: "Arquivar Demanda" }));
    await user.click(screen.getByRole("button", { name: "Confirmar arquivamento" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível guardar");
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
