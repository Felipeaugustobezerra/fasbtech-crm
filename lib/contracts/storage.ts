import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { DocumentType } from "@/types/contracts";

export const CONTRACT_DOCUMENT_BUCKET = "private-files";
export const CONTRACT_PDF_MIME_TYPE = "application/pdf" as const;

type ContractDocumentIdentity = {
  organizationId: string;
  contractId: string;
  documentId: string;
  kind: DocumentType;
};

export function buildContractDocumentPath({
  organizationId,
  contractId,
  documentId,
  kind,
}: ContractDocumentIdentity) {
  return `${organizationId}/contracts/${contractId}/${documentId}/${kind}.pdf`;
}

export async function uploadContractDocument(
  objectPath: string,
  content: Uint8Array,
): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.storage
    .from(CONTRACT_DOCUMENT_BUCKET)
    .upload(objectPath, Buffer.from(content), {
      contentType: CONTRACT_PDF_MIME_TYPE,
      upsert: false,
    });

  if (error) throw new Error("CONTRACT_DOCUMENT_UPLOAD_FAILED", { cause: error });
}

export async function downloadContractDocument(
  objectPath: string,
): Promise<Uint8Array> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.storage
    .from(CONTRACT_DOCUMENT_BUCKET)
    .download(objectPath);

  if (error || !data) {
    throw new Error("CONTRACT_DOCUMENT_DOWNLOAD_FAILED", { cause: error });
  }

  return new Uint8Array(await data.arrayBuffer());
}

export async function removeOrphanContractDocument(
  objectPath: string,
): Promise<void> {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.storage
    .from(CONTRACT_DOCUMENT_BUCKET)
    .remove([objectPath]);

  if (error) {
    throw new Error("CONTRACT_DOCUMENT_COMPENSATION_FAILED", { cause: error });
  }
}
