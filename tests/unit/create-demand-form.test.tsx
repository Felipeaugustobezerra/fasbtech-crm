import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateDemandForm } from "@/components/demands/create-demand-form";

const mocks = vi.hoisted(() => ({ createDemandAction: vi.fn(), getEligibleDemandAssigneesAction: vi.fn(), push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }) }));
vi.mock("@/app/(private)/demandas/actions", () => ({ createDemandAction: mocks.createDemandAction, getEligibleDemandAssigneesAction: mocks.getEligibleDemandAssigneesAction }));

const clientId = "11111111-1111-4111-8111-111111111111";
const firstMember = "22222222-2222-4222-8222-222222222222";
const secondMember = "33333333-3333-4333-8333-333333333333";
const clients = [{ id: clientId, name: "Cliente Alfa" }];

describe("CreateDemandForm", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.getEligibleDemandAssigneesAction.mockResolvedValue({ success: true, data: { assignees: [] } });
    mocks.createDemandAction.mockResolvedValue({ success: true, data: { demandId: "44444444-4444-4444-8444-444444444444" } });
  });

  it("renders creation fields with MEDIUM selected and no Status or Organization", () => {
    render(<CreateDemandForm clients={clients} />);
    for (const name of ["Cliente *", "Título *", "Descrição", "Prioridade", "Data de início", "Prazo", "Observações"]) expect(screen.getByLabelText(name)).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Prioridade" })).toHaveValue("MEDIUM");
    expect(screen.queryByLabelText(/status/i)).toBeNull();
    expect(screen.queryByLabelText(/organization/i)).toBeNull();
  });

  it("loads eligible assignees after Client selection and submits multiple IDs", async () => {
    const user = userEvent.setup();
    mocks.getEligibleDemandAssigneesAction.mockResolvedValue({ success: true, data: { assignees: [
      { membership_id: firstMember, full_name: "Ana Silva", role: "MEMBER" },
      { membership_id: secondMember, full_name: "Bruno Costa", role: "OWNER" },
    ] } });
    render(<CreateDemandForm clients={clients} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Cliente" }), clientId);
    const ana = await screen.findByRole("checkbox", { name: /Ana Silva/ });
    const bruno = screen.getByRole("checkbox", { name: /Bruno Costa/ });
    await user.click(ana); await user.click(bruno);
    await user.type(screen.getByRole("textbox", { name: "Título" }), "Nova demanda");
    await user.click(screen.getByRole("button", { name: "Criar Demanda" }));
    await waitFor(() => expect(mocks.createDemandAction).toHaveBeenCalledOnce());
    expect(mocks.createDemandAction).toHaveBeenCalledWith(expect.objectContaining({ client_id: clientId, title: "Nova demanda", priority: "MEDIUM", assignee_membership_ids: [firstMember, secondMember] }));
    expect(mocks.push).toHaveBeenCalledWith("/demandas");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("supports creation with zero assignees", async () => {
    const user = userEvent.setup();
    render(<CreateDemandForm clients={clients} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Cliente" }), clientId);
    expect(await screen.findByText("Nenhum responsável elegível para este Cliente.")).toBeVisible();
    await user.type(screen.getByRole("textbox", { name: "Título" }), "Sem responsável");
    await user.click(screen.getByRole("button", { name: "Criar Demanda" }));
    await waitFor(() => expect(mocks.createDemandAction).toHaveBeenCalledWith(expect.objectContaining({ assignee_membership_ids: [] })));
  });

  it("shows client validation without calling the Action", async () => {
    const user = userEvent.setup();
    render(<CreateDemandForm clients={clients} />);
    await user.click(screen.getByRole("button", { name: "Criar Demanda" }));
    expect(await screen.findByText("Informe um Cliente válido.")).toBeVisible();
    expect(mocks.createDemandAction).not.toHaveBeenCalled();
  });

  it("maps server field errors and global errors", async () => {
    const user = userEvent.setup();
    mocks.createDemandAction.mockResolvedValueOnce({ success: false, error: { code: "VALIDATION_ERROR", message: "Verifique os campos informados.", fieldErrors: { title: ["Título rejeitado."] } } });
    render(<CreateDemandForm clients={clients} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Cliente" }), clientId);
    await screen.findByText("Nenhum responsável elegível para este Cliente.");
    await user.type(screen.getByRole("textbox", { name: "Título" }), "Título");
    await user.click(screen.getByRole("button", { name: "Criar Demanda" }));
    expect(await screen.findByText("Título rejeitado.")).toBeVisible();
  });

  it("shows a safe global failure and preserves the form", async () => {
    const user = userEvent.setup();
    mocks.createDemandAction.mockResolvedValue({ success: false, error: { code: "DATABASE_ERROR", message: "Não foi possível guardar as alterações." } });
    render(<CreateDemandForm clients={clients} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Cliente" }), clientId);
    await screen.findByText("Nenhum responsável elegível para este Cliente.");
    await user.type(screen.getByRole("textbox", { name: "Título" }), "Preservada");
    await user.click(screen.getByRole("button", { name: "Criar Demanda" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível guardar as alterações.");
    expect(screen.getByRole("textbox", { name: "Título" })).toHaveValue("Preservada");
  });

  it("disables submit while eligible assignees load", async () => {
    const user = userEvent.setup();
    let resolve!: (value: object) => void;
    mocks.getEligibleDemandAssigneesAction.mockReturnValue(new Promise((done) => { resolve = done; }));
    render(<CreateDemandForm clients={clients} />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Cliente" }), clientId);
    expect(screen.getByRole("button", { name: "Criar Demanda" })).toBeDisabled();
    resolve({ success: true, data: { assignees: [] } });
    await waitFor(() => expect(screen.getByRole("button", { name: "Criar Demanda" })).toBeEnabled());
  });
});
