import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CreateContractInput,
  GenerateContractInput,
  MarkContractSignedInput,
} from "@/schemas/contracts";
import {
  activateContractTemplate,
  cancelContract,
  createContract,
  createContractTemplate,
  deactivateContractTemplate,
  generateContract,
  markContractSent,
  markContractSigned,
  updateContractTemplate,
  updateDraftContract,
} from "@/services/contracts/contract.service";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const clientId = "11111111-1111-4111-8111-111111111111";
const templateId = "22222222-2222-4222-8222-222222222222";
const contractId = "33333333-3333-4333-8333-333333333333";
const documentId = "44444444-4444-4444-8444-444444444444";

const createContractInput: CreateContractInput = {
  client_id: clientId,
  template_id: templateId,
  title: "Contrato principal",
  draft_data: { reference: "A-001" },
};

const snapshot = {
  schema_version: 1,
  content: "Conteúdo final",
  client: {
    id: clientId,
    data: { name: "Cliente" },
    tax_id: "PT123",
    tax_id_type: "NIF",
  },
  manual_fields: { reference: "A-001" },
  template: { id: templateId, name: "Contrato de Serviços" },
};

const generateInput: GenerateContractInput = {
  contract_id: contractId,
  snapshot,
  document_id: documentId,
  object_path: `org/contracts/${contractId}/${documentId}/ORIGINAL_PDF.pdf`,
  file_name: "contract.pdf",
  mime_type: "application/pdf",
  size_bytes: 1024,
};

const signedInput: MarkContractSignedInput = {
  contract_id: contractId,
  document_id: documentId,
  object_path: `org/contracts/${contractId}/${documentId}/SIGNED_COPY.pdf`,
  file_name: "signed.pdf",
  mime_type: "application/pdf",
  size_bytes: 2048,
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

describe("Contracts service", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
    mocks.rpc.mockReset();
    mocks.createSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ data: contractId, error: null });
  });

  it("maps all Template operations to exactly one dedicated RPC", async () => {
    await expect(
      createContractTemplate({ name: "Template", content: "Content" }),
    ).resolves.toBe(contractId);
    expect(mocks.rpc).toHaveBeenLastCalledWith("create_contract_template", {
      p_name: "Template",
      p_content: "Content",
    });

    mocks.rpc.mockClear();
    await updateContractTemplate({
      template_id: templateId,
      name: "Updated",
      content: "Updated content",
    });
    expect(mocks.rpc).toHaveBeenLastCalledWith("update_contract_template", {
      p_template_id: templateId,
      p_name: "Updated",
      p_content: "Updated content",
    });

    mocks.rpc.mockClear();
    await activateContractTemplate({ template_id: templateId });
    expect(mocks.rpc).toHaveBeenLastCalledWith("activate_contract_template", {
      p_template_id: templateId,
    });

    mocks.rpc.mockClear();
    await deactivateContractTemplate({ template_id: templateId });
    expect(mocks.rpc).toHaveBeenLastCalledWith(
      "deactivate_contract_template",
      { p_template_id: templateId },
    );
  });

  it("creates a DRAFT through create_contract with editable content only", async () => {
    const untrustedInput = {
      ...createContractInput,
      status: "GENERATED",
      snapshot,
      organization_id: "caller-organization",
      created_by: "caller-creator",
      updated_by: "caller-updater",
    } as unknown as CreateContractInput;

    await expect(createContract(untrustedInput)).resolves.toBe(contractId);
    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("create_contract", {
      p_client_id: clientId,
      p_template_id: templateId,
      p_title: "Contrato principal",
      p_draft_data: { reference: "A-001" },
    });

    const args = mocks.rpc.mock.calls[0]?.[1];
    expect(args).not.toHaveProperty("status");
    expect(args).not.toHaveProperty("snapshot");
    expect(args).not.toHaveProperty("organization_id");
    expect(args).not.toHaveProperty("created_by");
    expect(args).not.toHaveProperty("updated_by");
  });

  it("updates a DRAFT through update_draft_contract", async () => {
    await updateDraftContract({
      contract_id: contractId,
      client_id: clientId,
      template_id: templateId,
      title: "Atualizado",
      draft_data: { revision: 2 },
    });

    expect(mocks.rpc).toHaveBeenCalledWith("update_draft_contract", {
      p_contract_id: contractId,
      p_client_id: clientId,
      p_template_id: templateId,
      p_title: "Atualizado",
      p_draft_data: { revision: 2 },
    });
  });

  it("generates through one RPC without generating PDF or accessing Storage", async () => {
    await generateContract(generateInput);

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("generate_contract", {
      p_contract_id: contractId,
      p_snapshot: snapshot,
      p_document_id: documentId,
      p_object_path: generateInput.object_path,
      p_file_name: "contract.pdf",
      p_mime_type: "application/pdf",
      p_size_bytes: 1024,
    });
  });

  it("marks SENT only through mark_contract_sent", async () => {
    await markContractSent({
      contract_id: contractId,
      recipient_email: "client@example.com",
    });

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("mark_contract_sent", {
      p_contract_id: contractId,
      p_recipient_email: "client@example.com",
    });
  });

  it("marks SIGNED with the signed-copy metadata through one RPC", async () => {
    await markContractSigned(signedInput);

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("mark_contract_signed", {
      p_contract_id: contractId,
      p_document_id: documentId,
      p_object_path: signedInput.object_path,
      p_file_name: "signed.pdf",
      p_mime_type: "application/pdf",
      p_size_bytes: 2048,
    });
  });

  it("cancels through one RPC with only the Contract ID", async () => {
    await cancelContract({ contract_id: contractId });

    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith("cancel_contract", {
      p_contract_id: contractId,
    });
  });

  it.each([
    {
      label: "authentication",
      rpcCode: "P0001",
      rpcMessage: "AUTHENTICATION_REQUIRED",
      expectedCode: "AUTHENTICATION_REQUIRED",
    },
    {
      label: "authorization",
      rpcCode: "P0001",
      rpcMessage: "AUTHORIZATION_DENIED",
      expectedCode: "AUTHORIZATION_DENIED",
    },
    {
      label: "hidden or absent Contract",
      rpcCode: "P0001",
      rpcMessage: "CONTRACT_NOT_FOUND_OR_FORBIDDEN",
      expectedCode: "NOT_FOUND",
    },
    {
      label: "validation",
      rpcCode: "P0001",
      rpcMessage: "CONTRACT_SNAPSHOT_INVALID",
      expectedCode: "VALIDATION_ERROR",
    },
    {
      label: "lifecycle conflict",
      rpcCode: "P0001",
      rpcMessage: "CONTRACT_GENERATE_STATUS_INVALID",
      expectedCode: "CONFLICT",
    },
    {
      label: "unique conflict",
      rpcCode: "23505",
      rpcMessage: "internal unique detail",
      expectedCode: "CONFLICT",
    },
    {
      label: "database",
      rpcCode: "XX000",
      rpcMessage: "internal database detail",
      expectedCode: "DATABASE_ERROR",
    },
  ])(
    "maps $label failures to a safe code and preserves the cause",
    async ({ rpcCode, rpcMessage, expectedCode }) => {
      const originalError = { code: rpcCode, message: rpcMessage };
      mocks.rpc.mockResolvedValue({ data: null, error: originalError });

      const error = await captureError(generateContract(generateInput));

      expect(error.message).toBe(expectedCode);
      expect(error.cause).toBe(originalError);

      if (rpcMessage !== expectedCode) {
        expect(error.message).not.toContain(rpcMessage);
      }
    },
  );

  it("maps Postgres permission failures to authorization denied", async () => {
    const originalError = {
      code: "42501",
      message: "internal permission detail",
    };
    mocks.rpc.mockResolvedValue({ data: null, error: originalError });

    const error = await captureError(cancelContract({ contract_id: contractId }));

    expect(error.message).toBe("AUTHORIZATION_DENIED");
    expect(error.cause).toBe(originalError);
  });

  it("treats an empty RPC result as a database failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });

    const error = await captureError(createContract(createContractInput));

    expect(error.message).toBe("DATABASE_ERROR");
    expect(error.cause).toEqual(new Error("CONTRACT_RPC_EMPTY_RESULT"));
  });

  it("maps unexpected client failures and preserves the cause", async () => {
    const originalError = new Error("server client unavailable");
    mocks.createSupabaseClient.mockRejectedValue(originalError);

    const error = await captureError(createContract(createContractInput));

    expect(error.message).toBe("UNEXPECTED_ERROR");
    expect(error.cause).toBe(originalError);
  });
});
