import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientForm } from "@/components/clients/client-form";
import type { ClientInput } from "@/schemas/client";

const mocks = vi.hoisted(() => ({
  createClientAction: vi.fn(),
  updateClientAction: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/app/(private)/clientes/actions", () => ({
  createClientAction: mocks.createClientAction,
  updateClientAction: mocks.updateClientAction,
}));

const clientId = "11111111-1111-4111-8111-111111111111";

describe("ClientForm", () => {
  beforeEach(() => {
    mocks.createClientAction.mockReset();
    mocks.updateClientAction.mockReset();
    mocks.push.mockReset();
  });

  it("renders every editable client field", () => {
    render(<ClientForm mode="create" />);

    const fieldLabels = [
      "Nome",
      "Empresa",
      "E-mail",
      "Telefone",
      "Identificação fiscal",
      "Tipo de identificação fiscal",
      "Endereço",
      "Complemento",
      "Cidade",
      "Região",
      "Código postal",
      "Código do país",
      "Observações",
    ];

    for (const label of fieldLabels) {
      expect(screen.getByRole("textbox", { name: label })).toBeInTheDocument();
    }

    expect(screen.queryByLabelText(/organization_id/i)).toBeNull();
    expect(screen.queryByLabelText(/created_by/i)).toBeNull();
    expect(screen.queryByLabelText(/updated_by/i)).toBeNull();
  });

  it("submits valid create data and navigates to the new client", async () => {
    const user = userEvent.setup();
    mocks.createClientAction.mockResolvedValue({ success: true, clientId });
    render(<ClientForm mode="create" />);

    await user.type(
      screen.getByRole("textbox", { name: "Nome" }),
      "Cliente Novo",
    );
    await user.type(
      screen.getByRole("textbox", { name: "E-mail" }),
      "novo@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Criar Cliente" }));

    await waitFor(() => {
      expect(mocks.createClientAction).toHaveBeenCalledOnce();
    });

    expect(mocks.createClientAction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Cliente Novo",
        email: "novo@example.com",
        company_name: undefined,
        phone: undefined,
      }),
    );
    expect(mocks.push).toHaveBeenCalledWith(`/clientes/${clientId}`);
  });

  it("shows client-side validation without calling the action", async () => {
    const user = userEvent.setup();
    render(<ClientForm mode="create" />);

    await user.click(screen.getByRole("button", { name: "Criar Cliente" }));

    expect(
      await screen.findByText("Informe o nome do cliente."),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(mocks.createClientAction).not.toHaveBeenCalled();
  });

  it("maps server validation errors back to their fields", async () => {
    const user = userEvent.setup();
    mocks.createClientAction.mockResolvedValue({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Verifique os dados informados.",
      fieldErrors: {
        email: ["Revise o e-mail informado."],
      },
      formErrors: [],
    });
    render(<ClientForm mode="create" />);

    await user.type(
      screen.getByRole("textbox", { name: "Nome" }),
      "Cliente Novo",
    );
    await user.click(screen.getByRole("button", { name: "Criar Cliente" }));

    expect(
      await screen.findByText("Revise o e-mail informado."),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "E-mail" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("shows a safe operational error", async () => {
    const user = userEvent.setup();
    mocks.createClientAction.mockResolvedValue({
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível criar o Cliente. Tente novamente.",
    });
    render(<ClientForm mode="create" />);

    await user.type(
      screen.getByRole("textbox", { name: "Nome" }),
      "Cliente Novo",
    );
    await user.click(screen.getByRole("button", { name: "Criar Cliente" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível criar o Cliente. Tente novamente.",
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("prefills edit data, submits with the client id and navigates to details", async () => {
    const user = userEvent.setup();
    const initialValues: ClientInput = {
      name: "Cliente Atual",
      company_name: "Empresa Atual",
      email: "atual@example.com",
    };
    mocks.updateClientAction.mockResolvedValue({ success: true, clientId });
    render(
      <ClientForm
        mode="edit"
        clientId={clientId}
        initialValues={initialValues}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue(
      "Cliente Atual",
    );
    expect(screen.getByRole("textbox", { name: "Empresa" })).toHaveValue(
      "Empresa Atual",
    );
    expect(screen.getByRole("textbox", { name: "E-mail" })).toHaveValue(
      "atual@example.com",
    );

    await user.clear(screen.getByRole("textbox", { name: "Nome" }));
    await user.type(
      screen.getByRole("textbox", { name: "Nome" }),
      "Cliente Atualizado",
    );
    await user.click(
      screen.getByRole("button", { name: "Salvar alterações" }),
    );

    await waitFor(() => {
      expect(mocks.updateClientAction).toHaveBeenCalledWith(
        clientId,
        expect.objectContaining({
          name: "Cliente Atualizado",
          company_name: "Empresa Atual",
          email: "atual@example.com",
        }),
      );
    });
    expect(mocks.push).toHaveBeenCalledWith(`/clientes/${clientId}`);
  });
});
