import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  archiveClientAction,
  createClientAction,
  updateClientAction,
} from "@/app/(private)/clientes/actions";
import type { ClientInput } from "@/schemas/client";

const mocks = vi.hoisted(() => ({
  archiveClient: vi.fn(),
  createClient: vi.fn(),
  updateClient: vi.fn(),
}));

vi.mock("@/services/clients/client.service", () => ({
  archiveClient: mocks.archiveClient,
  createClient: mocks.createClient,
  updateClient: mocks.updateClient,
}));

const clientId = "11111111-1111-4111-8111-111111111111";

const validInput: ClientInput = {
  name: "Cliente Exemplo",
  email: "contato@example.com",
  tax_id: "PT123456789",
  tax_id_type: "VAT",
};

describe("client actions", () => {
  beforeEach(() => {
    mocks.archiveClient.mockReset();
    mocks.createClient.mockReset();
    mocks.updateClient.mockReset();
  });

  it("validates and normalizes input before creating a client", async () => {
    mocks.createClient.mockResolvedValue(clientId);

    const result = await createClientAction({
      name: "  Cliente Exemplo  ",
      email: "  contato@example.com  ",
      phone: "   ",
    });

    expect(mocks.createClient).toHaveBeenCalledWith({
      name: "Cliente Exemplo",
      email: "contato@example.com",
      phone: undefined,
    });
    expect(result).toEqual({ success: true, clientId });
  });

  it("does not call the create service when input is invalid", async () => {
    const result = await createClientAction({ name: "   " });

    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Verifique os dados informados.",
      fieldErrors: {
        name: ["Informe o nome do cliente."],
      },
      formErrors: [],
    });
  });

  it("rejects unexpected fields without forwarding them to the service", async () => {
    const untrustedInput = {
      ...validInput,
      organization_id: "caller-organization",
      created_by: "caller-user",
      role: "OWNER",
    } as unknown as ClientInput;

    const result = await createClientAction(untrustedInput);

    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Verifique os dados informados.",
      fieldErrors: {},
      formErrors: ["Existem campos não permitidos."],
    });
  });

  it("validates input before updating a client", async () => {
    mocks.updateClient.mockResolvedValue(clientId);

    const result = await updateClientAction(clientId, {
      name: "  Cliente Atualizado  ",
      company_name: "   ",
    });

    expect(mocks.updateClient).toHaveBeenCalledWith(clientId, {
      name: "Cliente Atualizado",
      company_name: undefined,
    });
    expect(result).toEqual({ success: true, clientId });
  });

  it("does not call the update service when input is invalid", async () => {
    const result = await updateClientAction(clientId, {
      name: "Cliente Exemplo",
      email: "email-invalido",
    });

    expect(mocks.updateClient).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      success: false,
      code: "VALIDATION_ERROR",
      fieldErrors: {
        email: ["Informe um e-mail válido."],
      },
    });
  });

  it("archives a client using only its validated id", async () => {
    mocks.archiveClient.mockResolvedValue(clientId);

    const result = await archiveClientAction(clientId);

    expect(mocks.archiveClient).toHaveBeenCalledWith(clientId);
    expect(result).toEqual({ success: true, clientId });
  });

  it("does not call a service when clientId is not a valid UUID", async () => {
    const result = await archiveClientAction("invalid-client-id");

    expect(mocks.archiveClient).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Verifique os dados informados.",
      fieldErrors: {
        clientId: ["Informe um Cliente válido."],
      },
      formErrors: [],
    });
  });

  it("returns a generic error without leaking service details", async () => {
    const internalError = new Error("CLIENT_CREATE_FAILED", {
      cause: {
        code: "P0001",
        message: "CLIENT_NOT_FOUND_OR_FORBIDDEN",
        details: "internal database details",
      },
    });
    mocks.createClient.mockRejectedValue(internalError);

    const result = await createClientAction(validInput);
    const serializedResult = JSON.stringify(result);

    expect(result).toEqual({
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível criar o Cliente. Tente novamente.",
    });
    expect(serializedResult).not.toContain("P0001");
    expect(serializedResult).not.toContain("CLIENT_NOT_FOUND_OR_FORBIDDEN");
    expect(serializedResult).not.toContain("internal database details");
  });
  it("does not call the update service when clientId is not a valid UUID", async () => {
    const result = await updateClientAction("invalid-client-id", validInput);

    expect(mocks.updateClient).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Verifique os dados informados.",
      fieldErrors: {
        clientId: ["Informe um Cliente válido."],
      },
      formErrors: [],
    });
  });
});
