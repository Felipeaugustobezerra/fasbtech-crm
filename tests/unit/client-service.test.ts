import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ClientInput } from "@/schemas/client";
import {
  archiveClient,
  createClient,
  updateClient,
} from "@/services/clients/client.service";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const clientId = "11111111-1111-4111-8111-111111111111";

const clientInput: ClientInput = {
  name: "Cliente Exemplo",
  company_name: "Empresa Exemplo",
  email: "contato@example.com",
  phone: "+351 210 000 000",
  tax_id: "PT123456789",
  tax_id_type: "VAT",
  address_line_1: "Rua Principal, 10",
  address_line_2: "Sala 2",
  city: "Lisboa",
  region: "Lisboa",
  postal_code: "1000-001",
  country_code: "PT",
  notes: "Cliente prioritário",
};

async function captureError(operation: Promise<unknown>) {
  try {
    await operation;
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }

    throw error;
  }

  throw new Error("EXPECTED_OPERATION_TO_FAIL");
}

describe("client service", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
    mocks.rpc.mockReset();
    mocks.createSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
  });

  it("creates a client through create_client with explicitly mapped fields", async () => {
    mocks.rpc.mockResolvedValue({ data: clientId, error: null });

    const result = await createClient(clientInput);

    expect(mocks.rpc).toHaveBeenCalledWith("create_client", {
      p_name: "Cliente Exemplo",
      p_company_name: "Empresa Exemplo",
      p_email: "contato@example.com",
      p_phone: "+351 210 000 000",
      p_tax_id: "PT123456789",
      p_tax_id_type: "VAT",
      p_address_line_1: "Rua Principal, 10",
      p_address_line_2: "Sala 2",
      p_city: "Lisboa",
      p_region: "Lisboa",
      p_postal_code: "1000-001",
      p_country_code: "PT",
      p_notes: "Cliente prioritário",
    });
    expect(result).toBe(clientId);
  });

  it("keeps omitted optional client fields undefined", async () => {
    mocks.rpc.mockResolvedValue({ data: clientId, error: null });

    await createClient({ name: "Cliente Mínimo" });

    expect(mocks.rpc).toHaveBeenCalledWith("create_client", {
      p_name: "Cliente Mínimo",
      p_company_name: undefined,
      p_email: undefined,
      p_phone: undefined,
      p_tax_id: undefined,
      p_tax_id_type: undefined,
      p_address_line_1: undefined,
      p_address_line_2: undefined,
      p_city: undefined,
      p_region: undefined,
      p_postal_code: undefined,
      p_country_code: undefined,
      p_notes: undefined,
    });
  });

  it("updates a client through update_client with its id and editable fields", async () => {
    mocks.rpc.mockResolvedValue({ data: clientId, error: null });

    const result = await updateClient(clientId, clientInput);

    expect(mocks.rpc).toHaveBeenCalledWith("update_client", {
      p_client_id: clientId,
      p_name: "Cliente Exemplo",
      p_company_name: "Empresa Exemplo",
      p_email: "contato@example.com",
      p_phone: "+351 210 000 000",
      p_tax_id: "PT123456789",
      p_tax_id_type: "VAT",
      p_address_line_1: "Rua Principal, 10",
      p_address_line_2: "Sala 2",
      p_city: "Lisboa",
      p_region: "Lisboa",
      p_postal_code: "1000-001",
      p_country_code: "PT",
      p_notes: "Cliente prioritário",
    });
    expect(result).toBe(clientId);
  });

  it("archives a client through archive_client using only its id", async () => {
    mocks.rpc.mockResolvedValue({ data: clientId, error: null });

    const result = await archiveClient(clientId);

    expect(mocks.rpc).toHaveBeenCalledWith("archive_client", {
      p_client_id: clientId,
    });
    expect(result).toBe(clientId);
  });

  it("does not forward caller-controlled authorization or audit fields", async () => {
    mocks.rpc.mockResolvedValue({ data: clientId, error: null });
    const untrustedInput = {
      ...clientInput,
      organization_id: "caller-organization",
      created_by: "caller-creator",
      updated_by: "caller-updater",
      user_id: "caller-user",
      role: "OWNER",
    } as unknown as ClientInput;

    await createClient(untrustedInput);

    const args = mocks.rpc.mock.calls[0]?.[1];

    expect(args).not.toHaveProperty("organization_id");
    expect(args).not.toHaveProperty("created_by");
    expect(args).not.toHaveProperty("updated_by");
    expect(args).not.toHaveProperty("user_id");
    expect(args).not.toHaveProperty("role");
  });

  it("treats an empty RPC result as a create failure", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: null,
    });

    const error = await captureError(createClient(clientInput));

    expect(error.message).toBe("CLIENT_CREATE_FAILED");
    expect(error.cause).toBeInstanceOf(Error);
    expect((error.cause as Error).message).toBe("CLIENT_RPC_EMPTY_RESULT");
  });

  it.each([
    {
      operation: () => createClient(clientInput),
      rpcError: "create denied",
      serviceError: "CLIENT_CREATE_FAILED",
    },
    {
      operation: () => updateClient(clientId, clientInput),
      rpcError: "update denied",
      serviceError: "CLIENT_UPDATE_FAILED",
    },
    {
      operation: () => archiveClient(clientId),
      rpcError: "archive denied",
      serviceError: "CLIENT_ARCHIVE_FAILED",
    },
  ])(
    "exposes $serviceError and preserves the original RPC error as cause",
    async ({ operation, rpcError, serviceError }) => {
      const originalError = { code: "P0001", message: rpcError };
      mocks.rpc.mockResolvedValue({ data: null, error: originalError });

      const error = await captureError(operation());

      expect(error.message).toBe(serviceError);
      expect(error.cause).toBe(originalError);
    },
  );
});
