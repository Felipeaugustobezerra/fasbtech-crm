import { randomUUID } from "node:crypto";

import { sendContractEmail } from "@/lib/contracts/email";
import { generateContractPdf } from "@/lib/contracts/pdf";
import { getContractById } from "@/lib/contracts/queries";
import {
  buildContractDocumentPath,
  CONTRACT_PDF_MIME_TYPE,
  downloadContractDocument,
  removeOrphanContractDocument,
  uploadContractDocument,
} from "@/lib/contracts/storage";
import type {
  GenerateContractDocumentInput,
  SendContractDocumentInput,
  UploadSignedCopyInput,
} from "@/schemas/contract-documents";
import {
  generateContract,
  markContractSent,
  markContractSigned,
} from "@/services/contracts/contract.service";
import type { ContractDetails } from "@/lib/contracts/queries";
import type { DocumentType } from "@/types/contracts";

function workflowError(code: string, cause?: unknown): never {
  throw new Error(code, { cause });
}

async function requireContract(contractId: string): Promise<ContractDetails> {
  try {
    const contract = await getContractById(contractId);
    if (!contract) workflowError("NOT_FOUND");
    return contract;
  } catch (cause) {
    if (cause instanceof Error && cause.message === "NOT_FOUND") throw cause;
    workflowError("DATABASE_ERROR", cause);
  }
}

function documentIdentity(
  contract: ContractDetails,
  documentId: string,
  kind: DocumentType,
) {
  return buildContractDocumentPath({
    organizationId: contract.organization_id,
    contractId: contract.id,
    documentId,
    kind,
  });
}

function isPdf(bytes: Uint8Array) {
  return (
    bytes.byteLength >= 5 &&
    new TextDecoder("ascii").decode(bytes.subarray(0, 5)) === "%PDF-"
  );
}

async function compensateOrphan(objectPath: string, originalError: unknown) {
  try {
    await removeOrphanContractDocument(objectPath);
  } catch (compensationError) {
    workflowError(
      "DATABASE_ERROR",
      new AggregateError(
        [originalError, compensationError],
        "CONTRACT_DOCUMENT_ORPHAN_COMPENSATION_FAILED",
      ),
    );
  }
}

export async function generateContractDocument(
  input: GenerateContractDocumentInput,
): Promise<string> {
  const contract = await requireContract(input.contract_id);
  if (contract.status !== "DRAFT") workflowError("CONFLICT");

  let pdf: Uint8Array;
  try {
    pdf = await generateContractPdf(input.snapshot);
  } catch (cause) {
    workflowError(
      "UNEXPECTED_ERROR",
      new Error("CONTRACT_PDF_GENERATION_FAILED", { cause }),
    );
  }

  const documentId = randomUUID();
  const objectPath = documentIdentity(contract, documentId, "ORIGINAL_PDF");
  const fileName = `contract-${contract.id}.pdf`;

  try {
    await uploadContractDocument(objectPath, pdf);
  } catch (cause) {
    workflowError("DATABASE_ERROR", cause);
  }

  try {
    return await generateContract({
      contract_id: contract.id,
      snapshot: input.snapshot,
      document_id: documentId,
      object_path: objectPath,
      file_name: fileName,
      mime_type: CONTRACT_PDF_MIME_TYPE,
      size_bytes: pdf.byteLength,
    });
  } catch (cause) {
    await compensateOrphan(objectPath, cause);
    throw cause;
  }
}

export async function sendContractDocument(
  input: SendContractDocumentInput,
): Promise<string> {
  const contract = await requireContract(input.contract_id);
  if (contract.status !== "GENERATED") workflowError("CONFLICT");

  const original = contract.documents.find(
    (document) => document.kind === "ORIGINAL_PDF",
  );
  if (!original) workflowError("CONFLICT");

  const objectPath = documentIdentity(contract, original.id, "ORIGINAL_PDF");
  let pdf: Uint8Array;

  try {
    pdf = await downloadContractDocument(objectPath);
    await sendContractEmail({
      recipient: input.recipient_email,
      contractTitle: contract.title,
      fileName: original.file_name,
      pdf,
    });
  } catch (cause) {
    workflowError("UNEXPECTED_ERROR", cause);
  }

  return markContractSent(input);
}

export async function uploadSignedCopyAndMarkSigned(
  input: UploadSignedCopyInput,
): Promise<string> {
  const contract = await requireContract(input.contract_id);
  if (contract.status !== "SENT") workflowError("CONFLICT");

  const documentId = randomUUID();
  const objectPath = documentIdentity(contract, documentId, "SIGNED_COPY");
  const bytes = new Uint8Array(await input.file.arrayBuffer());
  if (!isPdf(bytes)) workflowError("VALIDATION_ERROR");

  try {
    await uploadContractDocument(objectPath, bytes);
  } catch (cause) {
    workflowError("DATABASE_ERROR", cause);
  }

  try {
    return await markContractSigned({
      contract_id: contract.id,
      document_id: documentId,
      object_path: objectPath,
      file_name: input.file.name,
      mime_type: CONTRACT_PDF_MIME_TYPE,
      size_bytes: bytes.byteLength,
    });
  } catch (cause) {
    await compensateOrphan(objectPath, cause);
    throw cause;
  }
}
