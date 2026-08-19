import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientArchive } from "@/components/clients/client-archive";

const mocks = vi.hoisted(() => ({
  archiveClientAction: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/app/(private)/clientes/actions", () => ({
  archiveClientAction: mocks.archiveClientAction,
}));

const clientId = "11111111-1111-4111-8111-111111111111";

describe("ClientArchive", () => {
  beforeEach(() => {
    mocks.archiveClientAction.mockReset();
    mocks.push.mockReset();
  });

  it("requires explicit confirmation before archiving", async () => {
    const user = userEvent.setup();
    mocks.archiveClientAction.mockResolvedValue({ success: true, clientId });
    render(<ClientArchive clientId={clientId} clientName="Empresa XPTO" />);

    await user.click(screen.getByRole("button", { name: "Arquivar Cliente" }));

    expect(mocks.archiveClientAction).not.toHaveBeenCalled();
    expect(screen.getByText("Arquivar Empresa XPTO?")).toBeInTheDocument();
    expect(
      screen.getByText(/remove-o da listagem padrão/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Confirmar arquivamento" }),
    );

    await waitFor(() => {
      expect(mocks.archiveClientAction).toHaveBeenCalledOnce();
    });
    expect(mocks.archiveClientAction).toHaveBeenCalledWith(clientId);
    expect(mocks.push).toHaveBeenCalledWith("/clientes");
  });

  it("shows an operational error without navigating", async () => {
    const user = userEvent.setup();
    mocks.archiveClientAction.mockResolvedValue({
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível arquivar o Cliente. Tente novamente.",
    });
    render(<ClientArchive clientId={clientId} clientName="Empresa XPTO" />);

    await user.click(screen.getByRole("button", { name: "Arquivar Cliente" }));
    await user.click(
      screen.getByRole("button", { name: "Confirmar arquivamento" }),
    );

    expect(
      await screen.findByText(
        "Não foi possível arquivar o Cliente. Tente novamente.",
      ),
    ).toHaveAttribute("role", "alert");
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("prevents repeated submissions while the operation is pending", async () => {
    const user = userEvent.setup();
    let resolveAction:
      | ((value: { success: true; clientId: string }) => void)
      | undefined;
    mocks.archiveClientAction.mockReturnValue(
      new Promise((resolve) => {
        resolveAction = resolve;
      }),
    );
    render(<ClientArchive clientId={clientId} clientName="Empresa XPTO" />);

    await user.click(screen.getByRole("button", { name: "Arquivar Cliente" }));
    const confirmButton = screen.getByRole("button", {
      name: "Confirmar arquivamento",
    });
    await user.click(confirmButton);

    expect(screen.getByRole("button", { name: "Arquivando..." })).toBeDisabled();
    expect(mocks.archiveClientAction).toHaveBeenCalledOnce();

    resolveAction?.({ success: true, clientId });
    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith("/clientes");
    });
  });
});
