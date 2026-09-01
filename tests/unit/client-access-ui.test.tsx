import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ClientDetailsPage from "@/app/(private)/clientes/[id]/page";
import { AssignClientAccessForm } from "@/components/access/assign-client-access-form";
import { RemoveClientAccess } from "@/components/access/remove-client-access";
import type {
  ClientAccessSummary,
  OrganizationMemberSummary,
  OrganizationRole,
} from "@/types/access";
import type { Client } from "@/types/client";

const mocks = vi.hoisted(() => ({
  assignClientAccessAction: vi.fn(),
  getClientById: vi.fn(),
  listClientAccesses: vi.fn(),
  listClientActivities: vi.fn(),
  listOrganizationMembers: vi.fn(),
  notFound: vi.fn(),
  refresh: vi.fn(),
  removeClientAccessAction: vi.fn(),
  resolveFoundationContext: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("@/app/(private)/acessos/actions", () => ({
  assignClientAccessAction: mocks.assignClientAccessAction,
  removeClientAccessAction: mocks.removeClientAccessAction,
}));

vi.mock("@/lib/access/queries", () => ({
  listClientAccesses: mocks.listClientAccesses,
  listOrganizationMembers: mocks.listOrganizationMembers,
}));

vi.mock("@/lib/activity/queries", () => ({
  listClientActivities: mocks.listClientActivities,
}));

vi.mock("@/lib/clients/queries", () => ({
  getClientById: mocks.getClientById,
}));

vi.mock("@/services/foundation/foundation.service", () => ({
  resolveFoundationContext: mocks.resolveFoundationContext,
}));

const clientId = "11111111-1111-4111-8111-111111111111";
const assignedMembershipId = "22222222-2222-4222-8222-222222222222";
const eligibleMembershipId = "33333333-3333-4333-8333-333333333333";
const assignmentId = "44444444-4444-4444-8444-444444444444";

const client: Client = {
  id: clientId,
  organization_id: "55555555-5555-4555-8555-555555555555",
  name: "Empresa XPTO",
  company_name: "XPTO, Lda.",
  email: "contato@xpto.example",
  phone: "+351 210 000 000",
  tax_id: null,
  tax_id_type: null,
  address_line_1: null,
  address_line_2: null,
  city: null,
  region: null,
  postal_code: null,
  country_code: null,
  notes: null,
  created_by: "66666666-6666-4666-8666-666666666666",
  updated_by: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  created_at: "2026-08-10T12:00:00.000Z",
  updated_at: "2026-08-17T12:00:00.000Z",
  archived_at: null,
};

const access: ClientAccessSummary = {
  assignmentId,
  membershipId: assignedMembershipId,
  userId: "77777777-7777-4777-8777-777777777777",
  fullName: "Membro Atribuído",
  role: "MEMBER",
  assignedAt: "2026-08-20T12:00:00.000Z",
};

function membership(
  membershipId: string,
  fullName: string,
  role: OrganizationRole,
  status = "ACTIVE",
): OrganizationMemberSummary {
  return {
    membershipId,
    userId: crypto.randomUUID(),
    fullName,
    role,
    status,
    membershipCreatedAt: "2026-08-10T12:00:00.000Z",
  };
}

function readyContext(role: OrganizationRole) {
  return {
    status: "READY",
    membership: { role },
  };
}

async function renderPage() {
  const page = await ClientDetailsPage({
    params: Promise.resolve({ id: clientId }),
  });

  return render(page);
}

describe("client access UI", () => {
  beforeEach(() => {
    mocks.assignClientAccessAction.mockReset();
    mocks.getClientById.mockReset();
    mocks.listClientAccesses.mockReset();
    mocks.listClientActivities.mockReset();
    mocks.listOrganizationMembers.mockReset();
    mocks.notFound.mockReset();
    mocks.refresh.mockReset();
    mocks.removeClientAccessAction.mockReset();
    mocks.resolveFoundationContext.mockReset();
    mocks.getClientById.mockResolvedValue(client);
    mocks.listClientAccesses.mockResolvedValue([access]);
    mocks.listClientActivities.mockResolvedValue([]);
    mocks.resolveFoundationContext.mockResolvedValue(readyContext("MEMBER"));
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  it("shows the exact visible access list with useful data", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { level: 2, name: "Acessos ao Cliente" }),
    ).toBeVisible();
    expect(screen.getByText(access.fullName)).toBeVisible();
    expect(screen.getByText("Membro")).toBeVisible();
    expect(screen.getByText("20/08/2026")).toBeVisible();
    expect(mocks.listClientAccesses).toHaveBeenCalledWith(clientId);
  });

  it("lets only OWNER manage access and derives only eligible candidates", async () => {
    mocks.resolveFoundationContext.mockResolvedValue(readyContext("OWNER"));
    mocks.listOrganizationMembers.mockResolvedValue([
      membership(
        "88888888-8888-4888-8888-888888888888",
        "Owner da Organization",
        "OWNER",
      ),
      membership(
        "99999999-9999-4999-8999-999999999999",
        "Admin da Organization",
        "ADMIN",
      ),
      membership(
        assignedMembershipId,
        access.fullName,
        "MEMBER",
      ),
      membership(eligibleMembershipId, "Membro Elegível", "MEMBER"),
      membership(
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "Membro Suspenso",
        "MEMBER",
        "SUSPENDED",
      ),
    ]);

    await renderPage();

    const candidateSelect = screen.getByRole("combobox", {
      name: "Utilizador",
    });
    const optionLabels = within(candidateSelect)
      .getAllByRole("option")
      .map((option) => option.textContent);

    expect(optionLabels).toEqual(["Selecione um MEMBER", "Membro Elegível"]);
    expect(
      screen.getByRole("button", {
        name: `Remover acesso de ${access.fullName}`,
      }),
    ).toBeVisible();
    expect(mocks.listOrganizationMembers).toHaveBeenCalledOnce();
  });

  it.each(["MEMBER", "ADMIN"] as const)(
    "does not fetch candidates or render management controls for %s",
    async (role) => {
      mocks.resolveFoundationContext.mockResolvedValue(readyContext(role));

      await renderPage();

      expect(screen.getByText(access.fullName)).toBeVisible();
      expect(mocks.listOrganizationMembers).not.toHaveBeenCalled();
      expect(screen.queryByRole("combobox", { name: "Utilizador" })).toBeNull();
      expect(screen.queryByRole("button", { name: /Remover acesso/ })).toBeNull();
      expect(screen.queryByText("Atribuir acesso")).toBeNull();
    },
  );

  it("does not expose administrative identifiers in rendered Client HTML", async () => {
    const { container } = await renderPage();

    expect(container.innerHTML).not.toContain(client.organization_id);
    expect(container.innerHTML).not.toContain(client.created_by);
    expect(container.innerHTML).not.toContain(access.assignmentId);
    expect(container.innerHTML).not.toContain(access.userId);
    expect(container.innerHTML).not.toContain("organization_id");
    expect(container.innerHTML).not.toContain("created_by");
  });

  it("shows a neutral empty state without an operational error", async () => {
    mocks.listClientAccesses.mockResolvedValue([]);

    await renderPage();

    expect(
      screen.getByText("Nenhum acesso visível para este Cliente."),
    ).toBeVisible();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does not query accesses when the Client is absent or hidden by RLS", async () => {
    mocks.getClientById.mockResolvedValue(null);

    await expect(
      ClientDetailsPage({ params: Promise.resolve({ id: clientId }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.notFound).toHaveBeenCalledOnce();
    expect(mocks.listClientAccesses).not.toHaveBeenCalled();
    expect(mocks.listClientActivities).not.toHaveBeenCalled();
    expect(mocks.listOrganizationMembers).not.toHaveBeenCalled();
  });

  it("assigns a selected candidate and refreshes only after success", async () => {
    const user = userEvent.setup();
    mocks.assignClientAccessAction.mockResolvedValue({
      success: true,
      assignmentId,
    });
    render(
      <AssignClientAccessForm
        clientId={clientId}
        candidates={[
          { membershipId: eligibleMembershipId, fullName: "Membro Elegível" },
        ]}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Utilizador" }),
      eligibleMembershipId,
    );
    await user.click(screen.getByRole("button", { name: "Atribuir acesso" }));

    await waitFor(() => {
      expect(mocks.assignClientAccessAction).toHaveBeenCalledWith(
        clientId,
        eligibleMembershipId,
      );
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Acesso atribuído com sucesso.",
    );
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("validates candidate selection without calling the Action", async () => {
    const user = userEvent.setup();
    render(
      <AssignClientAccessForm
        clientId={clientId}
        candidates={[
          { membershipId: eligibleMembershipId, fullName: "Membro Elegível" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Atribuir acesso" }));

    expect(await screen.findByText("Informe um Membership válido.")).toBeVisible();
    expect(mocks.assignClientAccessAction).not.toHaveBeenCalled();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("does not render a submit control when there are no candidates", () => {
    render(<AssignClientAccessForm clientId={clientId} candidates={[]} />);

    expect(
      screen.getByText(
        "Não existem MEMBERs elegíveis sem acesso neste momento.",
      ),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Atribuir acesso" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Utilizador" })).toBeNull();
  });

  it("shows safe assignment errors without refreshing", async () => {
    const user = userEvent.setup();
    mocks.assignClientAccessAction.mockResolvedValue({
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível atribuir o acesso. Tente novamente.",
    });
    render(
      <AssignClientAccessForm
        clientId={clientId}
        candidates={[
          { membershipId: eligibleMembershipId, fullName: "Membro Elegível" },
        ]}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Utilizador" }),
      eligibleMembershipId,
    );
    await user.click(screen.getByRole("button", { name: "Atribuir acesso" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível atribuir o acesso. Tente novamente.",
    );
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("disables assignment while pending and prevents a duplicate call", async () => {
    const user = userEvent.setup();
    let resolveAction:
      | ((value: { success: true; assignmentId: string }) => void)
      | undefined;
    mocks.assignClientAccessAction.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        }),
    );
    render(
      <AssignClientAccessForm
        clientId={clientId}
        candidates={[
          { membershipId: eligibleMembershipId, fullName: "Membro Elegível" },
        ]}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Utilizador" }),
      eligibleMembershipId,
    );
    await user.click(screen.getByRole("button", { name: "Atribuir acesso" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Atribuindo...",
    });
    expect(pendingButton).toBeDisabled();
    await user.click(pendingButton);
    expect(mocks.assignClientAccessAction).toHaveBeenCalledOnce();

    await act(async () => {
      resolveAction?.({ success: true, assignmentId });
    });
  });

  it("requires confirmation and removes using membershipId", async () => {
    const user = userEvent.setup();
    mocks.removeClientAccessAction.mockResolvedValue({
      success: true,
      assignmentId,
    });
    render(
      <RemoveClientAccess
        clientId={clientId}
        membershipId={assignedMembershipId}
        fullName={access.fullName}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: `Remover acesso de ${access.fullName}`,
      }),
    );
    expect(mocks.removeClientAccessAction).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", {
        name: `Confirmar remoção do acesso de ${access.fullName}`,
      }),
    );

    await waitFor(() => {
      expect(mocks.removeClientAccessAction).toHaveBeenCalledWith(
        clientId,
        assignedMembershipId,
      );
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Acesso removido com sucesso.",
    );
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("cancels removal without calling the Action", async () => {
    const user = userEvent.setup();
    render(
      <RemoveClientAccess
        clientId={clientId}
        membershipId={assignedMembershipId}
        fullName={access.fullName}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: `Remover acesso de ${access.fullName}`,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: `Cancelar remoção do acesso de ${access.fullName}`,
      }),
    );

    expect(mocks.removeClientAccessAction).not.toHaveBeenCalled();
    expect(screen.queryByText(`Remover o acesso de ${access.fullName}?`)).toBeNull();
  });

  it("shows safe removal errors without refreshing", async () => {
    const user = userEvent.setup();
    mocks.removeClientAccessAction.mockResolvedValue({
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível remover o acesso. Tente novamente.",
    });
    render(
      <RemoveClientAccess
        clientId={clientId}
        membershipId={assignedMembershipId}
        fullName={access.fullName}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: `Remover acesso de ${access.fullName}`,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: `Confirmar remoção do acesso de ${access.fullName}`,
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível remover o acesso. Tente novamente.",
    );
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("disables removal while pending and prevents a duplicate call", async () => {
    const user = userEvent.setup();
    let resolveAction:
      | ((value: { success: true; assignmentId: string }) => void)
      | undefined;
    mocks.removeClientAccessAction.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        }),
    );
    render(
      <RemoveClientAccess
        clientId={clientId}
        membershipId={assignedMembershipId}
        fullName={access.fullName}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: `Remover acesso de ${access.fullName}`,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: `Confirmar remoção do acesso de ${access.fullName}`,
      }),
    );

    const pendingButton = await screen.findByRole("button", {
      name: `Confirmar remoção do acesso de ${access.fullName}`,
    });
    expect(pendingButton).toBeDisabled();
    expect(pendingButton).toHaveTextContent("Removendo...");
    await user.click(pendingButton);
    expect(mocks.removeClientAccessAction).toHaveBeenCalledOnce();

    await act(async () => {
      resolveAction?.({ success: true, assignmentId });
    });
  });
});
