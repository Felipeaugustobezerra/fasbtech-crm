import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  activateContractTemplateAction,
  cancelContractAction,
  createContractAction,
  createContractTemplateAction,
  deactivateContractTemplateAction,
  generateContractAction,
  markContractSentAction,
  markContractSignedAction,
  updateContractTemplateAction,
  updateDraftContractAction,
} from "@/app/(private)/contratos/actions";

const mocks = vi.hoisted(() => ({
  createContractTemplate: vi.fn(),
  updateContractTemplate: vi.fn(),
  activateContractTemplate: vi.fn(),
  deactivateContractTemplate: vi.fn(),
  createContract: vi.fn(),
  updateDraftContract: vi.fn(),
  cancelContract: vi.fn(),
}));

const workflowMocks = vi.hoisted(() => ({
  generateContractDocument: vi.fn(),
  sendContractDocument: vi.fn(),
  uploadSignedCopyAndMarkSigned: vi.fn(),
}));

vi.mock("@/services/contracts/contract.service", () => mocks);
vi.mock("@/services/contracts/contract-document.service", () => workflowMocks);

const clientId = "11111111-1111-4111-8111-111111111111";
const templateId = "22222222-2222-4222-8222-222222222222";
const contractId = "33333333-3333-4333-8333-333333333333";

const draftContent = {
  client_id: clientId,
  template_id: templateId,
  title: "  Contrato principal  ",
  draft_data: { reference: "A-001" },
};

const snapshot = {
  schema_version: 1,
  content: "  Conteúdo final  ",
  client: {
    id: clientId,
    data: { name: "Cliente" },
    tax_id: "  PT123  ",
    tax_id_type: "  NIF  ",
  },
  manual_fields: { reference: "A-001" },
  template: { id: templateId, name: "  Contrato de Serviços  " },
};

describe("Contracts actions", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) {
      mock.mockReset().mockResolvedValue(contractId);
    }
    for (const mock of Object.values(workflowMocks)) {
      mock.mockReset().mockResolvedValue(contractId);
    }

    mocks.createContractTemplate.mockResolvedValue(templateId);
    mocks.updateContractTemplate.mockResolvedValue(templateId);
    mocks.activateContractTemplate.mockResolvedValue(templateId);
    mocks.deactivateContractTemplate.mockResolvedValue(templateId);
  });

  it("validates and creates a Contract Template", async () => {
    const input = { name: "  Serviços  ", content: "  Conteúdo  " };

    await expect(createContractTemplateAction(input)).resolves.toEqual({
      success: true,
      data: { contractTemplateId: templateId },
    });
    expect(mocks.createContractTemplate).toHaveBeenCalledExactlyOnceWith({
      name: "Serviços",
      content: "Conteúdo",
    });
  });

  it("validates update, activate and deactivate Template operations", async () => {
    const updateInput = {
      template_id: templateId,
      name: "  Atualizado  ",
      content: "  Novo conteúdo  ",
    };
    await updateContractTemplateAction(updateInput);
    expect(mocks.updateContractTemplate).toHaveBeenCalledExactlyOnceWith({
      template_id: templateId,
      name: "Atualizado",
      content: "Novo conteúdo",
    });

    await activateContractTemplateAction({ template_id: templateId });
    expect(mocks.activateContractTemplate).toHaveBeenCalledExactlyOnceWith({
      template_id: templateId,
    });

    await deactivateContractTemplateAction({ template_id: templateId });
    expect(mocks.deactivateContractTemplate).toHaveBeenCalledExactlyOnceWith({
      template_id: templateId,
    });
  });

  it("validates and creates a DRAFT Contract", async () => {
    await expect(createContractAction(draftContent)).resolves.toEqual({
      success: true,
      data: { contractId },
    });
    expect(mocks.createContract).toHaveBeenCalledExactlyOnceWith({
      ...draftContent,
      title: "Contrato principal",
    });
  });

  it("validates and updates only DRAFT content", async () => {
    await updateDraftContractAction({
      contract_id: contractId,
      ...draftContent,
    });

    expect(mocks.updateDraftContract).toHaveBeenCalledExactlyOnceWith({
      contract_id: contractId,
      ...draftContent,
      title: "Contrato principal",
    });
  });

  it("validates and normalizes generation data", async () => {
    await generateContractAction({
      contract_id: contractId,
      snapshot,
    });

    expect(
      workflowMocks.generateContractDocument,
    ).toHaveBeenCalledExactlyOnceWith({
      contract_id: contractId,
      snapshot: {
        ...snapshot,
        content: "Conteúdo final",
        client: {
          ...snapshot.client,
          tax_id: "PT123",
          tax_id_type: "NIF",
        },
        template: {
          ...snapshot.template,
          name: "Contrato de Serviços",
        },
      },
    });
  });

  it("does not accept document paths or metadata from the browser", async () => {
    const result = await generateContractAction({
      contract_id: contractId,
      snapshot,
      object_path: "internal/path.pdf",
    });

    expect(result).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR" },
    });
    expect(workflowMocks.generateContractDocument).not.toHaveBeenCalled();
  });

  it("validates and normalizes the sent recipient", async () => {
    await markContractSentAction({
      contract_id: contractId,
      recipient_email: "  CLIENT@EXAMPLE.COM  ",
    });

    expect(workflowMocks.sendContractDocument).toHaveBeenCalledExactlyOnceWith({
      contract_id: contractId,
      recipient_email: "client@example.com",
    });
  });

  it("requires a signed PDF before calling the workflow Service", async () => {
    const file = new File(["%PDF-1.7"], "signed.pdf", {
      type: "application/pdf",
    });
    await markContractSignedAction({
      contract_id: contractId,
      file,
    });

    expect(workflowMocks.uploadSignedCopyAndMarkSigned).toHaveBeenCalledWith({
      contract_id: contractId,
      file,
    });

    expect(
      await markContractSignedAction({ contract_id: contractId }),
    ).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR" },
    });
    expect(workflowMocks.uploadSignedCopyAndMarkSigned).toHaveBeenCalledOnce();
  });

  it("validates cancellation and calls only its Service", async () => {
    await expect(
      cancelContractAction({ contract_id: contractId }),
    ).resolves.toEqual({ success: true, data: { contractId } });
    expect(mocks.cancelContract).toHaveBeenCalledExactlyOnceWith({
      contract_id: contractId,
    });
  });

  it("returns stable fieldErrors and does not call a Service", async () => {
    const result = await createContractAction({
      ...draftContent,
      title: "   ",
    });

    expect(result).toMatchObject({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: { title: ["Informe o título do Contrato."] },
      },
    });
    expect(mocks.createContract).not.toHaveBeenCalled();
  });

  const operations = [
    {
      service: "createContractTemplate",
      run: (extra: object) =>
        createContractTemplateAction({
          name: "Template",
          content: "Content",
          ...extra,
        }),
    },
    {
      service: "createContract",
      run: (extra: object) => createContractAction({ ...draftContent, ...extra }),
    },
    {
      service: "generateContractDocument",
      run: (extra: object) =>
        generateContractAction({
          contract_id: contractId,
          snapshot,
          ...extra,
        }),
    },
    {
      service: "cancelContract",
      run: (extra: object) =>
        cancelContractAction({ contract_id: contractId, ...extra }),
    },
  ] satisfies Array<{
    service: keyof typeof mocks | keyof typeof workflowMocks;
    run: (extra: object) => Promise<unknown>;
  }>;

  it.each(operations)(
    "rejects unexpected authorization fields for $service",
    async ({ run }) => {
      expect(
        await run({ organization_id: clientId, role: "OWNER", user_id: clientId }),
      ).toMatchObject({
        success: false,
        error: { code: "VALIDATION_ERROR" },
      });

      for (const mock of Object.values(mocks)) {
        expect(mock).not.toHaveBeenCalled();
      }
      for (const mock of Object.values(workflowMocks)) {
        expect(mock).not.toHaveBeenCalled();
      }
    },
  );

  it.each([
    "VALIDATION_ERROR",
    "AUTHENTICATION_REQUIRED",
    "AUTHORIZATION_DENIED",
    "NOT_FOUND",
    "CONFLICT",
    "DATABASE_ERROR",
    "UNEXPECTED_ERROR",
  ])("preserves safe Service code %s without leaking internals", async (code) => {
    mocks.createContract.mockRejectedValue(
      new Error(code, {
        cause: { sql: "secret SQL", trigger: "private trigger" },
      }),
    );

    const result = await createContractAction(draftContent);

    expect(result).toMatchObject({
      success: false,
      error: { code, message: expect.any(String) },
    });
    expect(JSON.stringify(result)).not.toMatch(
      /secret|private|cause|stack|trigger|sql/i,
    );
  });

  it.each([new Error("internal RPC details"), "internal failure", null])(
    "sanitizes unknown Service failures",
    async (failure) => {
      mocks.createContract.mockRejectedValue(failure);

      await expect(createContractAction(draftContent)).resolves.toEqual({
        success: false,
        error: {
          code: "UNEXPECTED_ERROR",
          message: "Ocorreu um erro inesperado. Tente novamente.",
        },
      });
    },
  );
});
