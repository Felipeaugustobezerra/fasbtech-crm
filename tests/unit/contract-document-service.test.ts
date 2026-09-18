import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  generateContractDocument,
  sendContractDocument,
  uploadSignedCopyAndMarkSigned,
} from "@/services/contracts/contract-document.service";
import type { ContractDetails } from "@/lib/contracts/queries";
import type { ContractSnapshot } from "@/types/contracts";

const mocks = vi.hoisted(() => ({
  getContractById: vi.fn(),
  generateContractPdf: vi.fn(),
  uploadContractDocument: vi.fn(),
  downloadContractDocument: vi.fn(),
  removeOrphanContractDocument: vi.fn(),
  sendContractEmail: vi.fn(),
  generateContract: vi.fn(),
  markContractSent: vi.fn(),
  markContractSigned: vi.fn(),
}));

vi.mock("@/lib/contracts/queries", () => ({
  getContractById: mocks.getContractById,
}));
vi.mock("@/lib/contracts/pdf", () => ({
  generateContractPdf: mocks.generateContractPdf,
}));
vi.mock("@/lib/contracts/storage", () => ({
  CONTRACT_PDF_MIME_TYPE: "application/pdf",
  buildContractDocumentPath: ({
    organizationId,
    contractId,
    documentId,
    kind,
  }: Record<string, string>) =>
    `${organizationId}/contracts/${contractId}/${documentId}/${kind}.pdf`,
  uploadContractDocument: mocks.uploadContractDocument,
  downloadContractDocument: mocks.downloadContractDocument,
  removeOrphanContractDocument: mocks.removeOrphanContractDocument,
}));
vi.mock("@/lib/contracts/email", () => ({
  sendContractEmail: mocks.sendContractEmail,
}));
vi.mock("@/services/contracts/contract.service", () => ({
  generateContract: mocks.generateContract,
  markContractSent: mocks.markContractSent,
  markContractSigned: mocks.markContractSigned,
}));

const organizationId = "00000000-0000-4000-8000-000000000000";
const clientId = "11111111-1111-4111-8111-111111111111";
const templateId = "22222222-2222-4222-8222-222222222222";
const contractId = "33333333-3333-4333-8333-333333333333";
const originalDocumentId = "44444444-4444-4444-8444-444444444444";

const snapshot: ContractSnapshot = {
  schema_version: 1,
  content: "Conteúdo final",
  client: { id: clientId, data: {}, tax_id: null, tax_id_type: null },
  manual_fields: {},
  template: { id: templateId, name: "Template" },
};

function contract(status: ContractDetails["status"]): ContractDetails {
  return {
    id: contractId,
    organization_id: organizationId,
    client_id: clientId,
    template_id: templateId,
    title: "Contrato principal",
    status,
    draft_data: {},
    snapshot: status === "DRAFT" ? null : snapshot,
    sent_to_email: status === "SENT" ? "client@example.test" : null,
    generated_at: status === "DRAFT" ? null : "2026-09-18T10:00:00Z",
    sent_at: status === "SENT" ? "2026-09-18T11:00:00Z" : null,
    signed_at: null,
    canceled_at: null,
    created_by: "55555555-5555-4555-8555-555555555555",
    updated_by: "55555555-5555-4555-8555-555555555555",
    created_at: "2026-09-18T09:00:00Z",
    updated_at: "2026-09-18T10:00:00Z",
    documents:
      status === "DRAFT"
        ? []
        : [
            {
              id: originalDocumentId,
              entity_id: contractId,
              kind: "ORIGINAL_PDF",
              file_name: "contract.pdf",
              mime_type: "application/pdf",
              size_bytes: 3,
              created_at: "2026-09-18T10:00:00Z",
            },
          ],
  };
}

describe("contract document workflow", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.generateContractPdf.mockResolvedValue(new Uint8Array([1, 2, 3]));
    mocks.uploadContractDocument.mockResolvedValue(undefined);
    mocks.downloadContractDocument.mockResolvedValue(new Uint8Array([1, 2, 3]));
    mocks.removeOrphanContractDocument.mockResolvedValue(undefined);
    mocks.sendContractEmail.mockResolvedValue("email-id");
    mocks.generateContract.mockResolvedValue(contractId);
    mocks.markContractSent.mockResolvedValue(contractId);
    mocks.markContractSigned.mockResolvedValue(contractId);
  });

  it("generates and uploads before transitioning to GENERATED", async () => {
    mocks.getContractById.mockResolvedValue(contract("DRAFT"));

    await expect(
      generateContractDocument({ contract_id: contractId, snapshot }),
    ).resolves.toBe(contractId);

    expect(mocks.generateContractPdf).toHaveBeenCalledWith(snapshot);
    expect(mocks.uploadContractDocument).toHaveBeenCalledBefore(
      mocks.generateContract,
    );
    expect(mocks.generateContract).toHaveBeenCalledWith(
      expect.objectContaining({
        contract_id: contractId,
        snapshot,
        mime_type: "application/pdf",
        size_bytes: 3,
        object_path: expect.stringMatching(
          new RegExp(`^${organizationId}/contracts/${contractId}/.+/ORIGINAL_PDF\\.pdf$`),
        ),
      }),
    );
  });

  it("does not transition when PDF generation or upload fails", async () => {
    mocks.getContractById.mockResolvedValue(contract("DRAFT"));
    mocks.generateContractPdf.mockRejectedValueOnce(new Error("pdf failed"));
    await expect(
      generateContractDocument({ contract_id: contractId, snapshot }),
    ).rejects.toThrow("UNEXPECTED_ERROR");

    mocks.generateContractPdf.mockResolvedValue(new Uint8Array([1]));
    mocks.uploadContractDocument.mockRejectedValueOnce(new Error("upload failed"));
    await expect(
      generateContractDocument({ contract_id: contractId, snapshot }),
    ).rejects.toThrow("DATABASE_ERROR");
    expect(mocks.generateContract).not.toHaveBeenCalled();
  });

  it("removes the orphan upload when the generation RPC fails", async () => {
    mocks.getContractById.mockResolvedValue(contract("DRAFT"));
    mocks.generateContract.mockRejectedValue(new Error("CONFLICT"));

    await expect(
      generateContractDocument({ contract_id: contractId, snapshot }),
    ).rejects.toThrow("CONFLICT");
    expect(mocks.removeOrphanContractDocument).toHaveBeenCalledWith(
      expect.stringContaining("/ORIGINAL_PDF.pdf"),
    );
  });

  it("marks SENT only after download and confirmed provider send", async () => {
    mocks.getContractById.mockResolvedValue(contract("GENERATED"));

    await sendContractDocument({
      contract_id: contractId,
      recipient_email: "client@example.test",
    });

    expect(mocks.sendContractEmail).toHaveBeenCalledBefore(
      mocks.markContractSent,
    );
    expect(mocks.markContractSent).toHaveBeenCalledWith({
      contract_id: contractId,
      recipient_email: "client@example.test",
    });

    mocks.sendContractEmail.mockRejectedValueOnce(new Error("provider failed"));
    await expect(
      sendContractDocument({
        contract_id: contractId,
        recipient_email: "client@example.test",
      }),
    ).rejects.toThrow("UNEXPECTED_ERROR");
    expect(mocks.markContractSent).toHaveBeenCalledOnce();
  });

  it("uploads a separate signed copy and compensates a failed SIGNED transition", async () => {
    mocks.getContractById.mockResolvedValue(contract("SENT"));
    const file = new File(["%PDF-1.7"], "signed.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => new TextEncoder().encode("%PDF-1.7").buffer,
    });

    await uploadSignedCopyAndMarkSigned({ contract_id: contractId, file });
    expect(mocks.markContractSigned).toHaveBeenCalledWith(
      expect.objectContaining({
        contract_id: contractId,
        file_name: "signed.pdf",
        object_path: expect.stringContaining("/SIGNED_COPY.pdf"),
      }),
    );

    mocks.markContractSigned.mockRejectedValueOnce(new Error("CONFLICT"));
    await expect(
      uploadSignedCopyAndMarkSigned({ contract_id: contractId, file }),
    ).rejects.toThrow("CONFLICT");
    expect(mocks.removeOrphanContractDocument).toHaveBeenCalledWith(
      expect.stringContaining("/SIGNED_COPY.pdf"),
    );
  });

  it("rejects a signed-copy payload that is not actually a PDF", async () => {
    mocks.getContractById.mockResolvedValue(contract("SENT"));
    const file = new File(["not a pdf"], "signed.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => new TextEncoder().encode("not a pdf").buffer,
    });

    await expect(
      uploadSignedCopyAndMarkSigned({ contract_id: contractId, file }),
    ).rejects.toThrow("VALIDATION_ERROR");
    expect(mocks.uploadContractDocument).not.toHaveBeenCalled();
    expect(mocks.markContractSigned).not.toHaveBeenCalled();
  });
});
