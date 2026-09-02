import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AccessError from "@/app/(private)/acessos/error";
import AccessLoading from "@/app/(private)/acessos/loading";
import AccessPage from "@/app/(private)/acessos/page";
import { AddMemberForm } from "@/components/access/add-member-form";
import { MemberRoleForm } from "@/components/access/member-role-form";
import { AppShell } from "@/components/app-shell";
import type { OrganizationMemberSummary } from "@/types/access";

const mocks = vi.hoisted(() => ({
  addOrganizationMemberAction: vi.fn(),
  listOrganizationMembers: vi.fn(),
  logout: vi.fn(),
  notFound: vi.fn(),
  refresh: vi.fn(),
  resolveFoundationContext: vi.fn(),
  updateOrganizationMemberRoleAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("@/app/(private)/acessos/actions", () => ({
  addOrganizationMemberAction: mocks.addOrganizationMemberAction,
  updateOrganizationMemberRoleAction:
    mocks.updateOrganizationMemberRoleAction,
}));

vi.mock("@/app/(private)/actions", () => ({
  logout: mocks.logout,
}));

vi.mock("@/lib/access/queries", () => ({
  listOrganizationMembers: mocks.listOrganizationMembers,
}));

vi.mock("@/services/foundation/foundation.service", () => ({
  resolveFoundationContext: mocks.resolveFoundationContext,
}));

const membershipId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";

const member: OrganizationMemberSummary = {
  membershipId,
  userId,
  fullName: "Maria Silva",
  role: "MEMBER",
  status: "ACTIVE",
  membershipCreatedAt: "2026-08-10T12:00:00.000Z",
};

function readyContext(role: "OWNER" | "ADMIN" | "MEMBER") {
  return {
    status: "READY",
    membership: { role },
  };
}

async function renderPage() {
  const page = await AccessPage();

  return render(page);
}

describe("access UI", () => {
  beforeEach(() => {
    mocks.addOrganizationMemberAction.mockReset();
    mocks.listOrganizationMembers.mockReset();
    mocks.logout.mockReset();
    mocks.notFound.mockReset();
    mocks.refresh.mockReset();
    mocks.resolveFoundationContext.mockReset();
    mocks.updateOrganizationMemberRoleAction.mockReset();
    mocks.listOrganizationMembers.mockResolvedValue([member]);
    mocks.resolveFoundationContext.mockResolvedValue(readyContext("OWNER"));
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  it("renders visible Memberships without administrative identifiers", async () => {
    const { container } = await renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Acessos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("table", {
        name: "Utilizadores internos visíveis da Organization",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: member.fullName })).toBeVisible();
    expect(
      screen.getByRole("combobox", { name: `Role de ${member.fullName}` }),
    ).toHaveValue("MEMBER");
    expect(screen.getByText("Ativo")).toBeVisible();
    expect(screen.getByText("10/08/2026")).toBeVisible();
    expect(mocks.listOrganizationMembers).toHaveBeenCalledOnce();
    expect(container.innerHTML).not.toContain(membershipId);
    expect(container.innerHTML).not.toContain(userId);
    expect(container.innerHTML).not.toContain("organization_id");
  });

  it("renders the empty state without treating it as an error", async () => {
    mocks.listOrganizationMembers.mockResolvedValue([]);

    await renderPage();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Nenhum utilizador visível",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      screen.getAllByRole("link", { name: "Adicionar utilizador" }),
    ).toHaveLength(2);
  });

  it.each(["MEMBER", "ADMIN"] as const)(
    "blocks /acessos before querying Memberships for %s",
    async (role) => {
      mocks.resolveFoundationContext.mockResolvedValue(readyContext(role));

      await expect(AccessPage()).rejects.toThrow("NEXT_NOT_FOUND");

      expect(mocks.notFound).toHaveBeenCalledOnce();
      expect(mocks.listOrganizationMembers).not.toHaveBeenCalled();
    },
  );

  it("renders the add member fields with only official roles", () => {
    render(<AddMemberForm />);

    expect(screen.getByRole("textbox", { name: "E-mail" })).toBeRequired();
    const roleSelect = screen.getByRole("combobox", { name: "Role" });
    const options = within(roleSelect)
      .getAllByRole("option")
      .map((option) => option.getAttribute("value"));

    expect(roleSelect).toHaveValue("MEMBER");
    expect(options).toEqual(["OWNER", "ADMIN", "MEMBER"]);
    expect(
      screen.getByText("O utilizador precisa já possuir uma conta no sistema."),
    ).toBeInTheDocument();
  });

  it("submits a valid member, shows success and refreshes the route", async () => {
    const user = userEvent.setup();
    mocks.addOrganizationMemberAction.mockResolvedValue({
      success: true,
      membershipId,
    });
    render(<AddMemberForm />);

    await user.type(
      screen.getByRole("textbox", { name: "E-mail" }),
      "member@example.com",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Role" }),
      "ADMIN",
    );
    await user.click(screen.getByRole("button", { name: "Adicionar utilizador" }));

    await waitFor(() => {
      expect(mocks.addOrganizationMemberAction).toHaveBeenCalledWith({
        email: "member@example.com",
        role: "ADMIN",
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Utilizador adicionado com sucesso.",
    );
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox", { name: "E-mail" })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Role" })).toHaveValue(
      "MEMBER",
    );
  });

  it("blocks an invalid member input before calling the Action", async () => {
    const user = userEvent.setup();
    render(<AddMemberForm />);

    await user.type(
      screen.getByRole("textbox", { name: "E-mail" }),
      "invalid-email",
    );
    await user.click(screen.getByRole("button", { name: "Adicionar utilizador" }));

    expect(await screen.findByText("Informe um e-mail válido.")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "E-mail" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(mocks.addOrganizationMemberAction).not.toHaveBeenCalled();
  });

  it("shows the safe operational error returned while adding", async () => {
    const user = userEvent.setup();
    mocks.addOrganizationMemberAction.mockResolvedValue({
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível adicionar o utilizador. Tente novamente.",
    });
    render(<AddMemberForm />);

    await user.type(
      screen.getByRole("textbox", { name: "E-mail" }),
      "member@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Adicionar utilizador" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível adicionar o utilizador. Tente novamente.",
    );
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("disables the add submit while the Action is pending", async () => {
    const user = userEvent.setup();
    let resolveAction: ((value: { success: true; membershipId: string }) => void) | undefined;
    mocks.addOrganizationMemberAction.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        }),
    );
    render(<AddMemberForm />);

    await user.type(
      screen.getByRole("textbox", { name: "E-mail" }),
      "member@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Adicionar utilizador" }));

    const pendingButton = await screen.findByRole("button", {
      name: "Adicionando...",
    });
    expect(pendingButton).toBeDisabled();
    await user.click(pendingButton);
    expect(mocks.addOrganizationMemberAction).toHaveBeenCalledOnce();

    await act(async () => {
      resolveAction?.({ success: true, membershipId });
    });
  });

  it("loads the current role and submits a valid role change", async () => {
    const user = userEvent.setup();
    mocks.updateOrganizationMemberRoleAction.mockResolvedValue({
      success: true,
      membershipId,
    });
    render(
      <MemberRoleForm
        membershipId={membershipId}
        fullName={member.fullName}
        initialRole="MEMBER"
      />,
    );

    const roleSelect = screen.getByRole("combobox", {
      name: `Role de ${member.fullName}`,
    });
    expect(roleSelect).toHaveValue("MEMBER");

    await user.selectOptions(roleSelect, "OWNER");
    await user.click(screen.getByRole("button", { name: "Salvar role" }));

    await waitFor(() => {
      expect(mocks.updateOrganizationMemberRoleAction).toHaveBeenCalledWith(
        membershipId,
        "OWNER",
      );
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Role atualizada com sucesso.",
    );
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("shows the safe operational error returned while changing role", async () => {
    const user = userEvent.setup();
    mocks.updateOrganizationMemberRoleAction.mockResolvedValue({
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível alterar a role. Tente novamente.",
    });
    render(
      <MemberRoleForm
        membershipId={membershipId}
        fullName={member.fullName}
        initialRole="OWNER"
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: `Role de ${member.fullName}` }),
      "MEMBER",
    );
    await user.click(screen.getByRole("button", { name: "Salvar role" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível alterar a role. Tente novamente.",
    );
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("renders real loading and recoverable query error states", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const { unmount } = render(<AccessLoading />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "A carregar utilizadores internos.",
    );

    unmount();
    render(<AccessError reset={reset} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Não foi possível carregar os acessos",
    );
    expect(document.body.textContent).not.toContain("ACCESS_MEMBERS_QUERY_FAILED");

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("enables only the Access navigation among future modules", () => {
    render(
      <AppShell
        organizationName="FASBtech"
        role="OWNER"
        userEmail="owner@example.com"
      >
        <p>Conteúdo</p>
      </AppShell>,
    );

    const accessLinks = screen.getAllByRole("link", { name: "Acessos" });
    expect(accessLinks).toHaveLength(2);

    for (const link of accessLinks) {
      expect(link).toHaveAttribute("href", "/acessos");
    }

    for (const label of ["Demandas", "Financeiro", "Contratos"]) {
      const disabledItems = screen.getAllByText(label);

      for (const item of disabledItems) {
        expect(item.closest('[aria-disabled="true"]')).not.toBeNull();
      }
      expect(screen.queryByRole("link", { name: label })).toBeNull();
    }
  });

  it.each(["MEMBER", "ADMIN"] as const)(
    "does not show Access navigation to %s",
    (role) => {
      render(
        <AppShell
          organizationName="FASBtech"
          role={role}
          userEmail={`${role.toLowerCase()}@example.com`}
        >
          <p>Conteúdo</p>
        </AppShell>,
      );

      expect(screen.queryByRole("link", { name: "Acessos" })).toBeNull();
      expect(screen.queryByText("Acessos")).toBeNull();
      expect(screen.getAllByRole("link", { name: "Clientes" })).toHaveLength(2);
    },
  );
});
