import { notFound } from "next/navigation";

import { getContractById } from "@/lib/contracts/queries";
import { buildContractDocumentPath, downloadContractDocument } from "@/lib/contracts/storage";
import { contractIdSchema, documentIdSchema } from "@/schemas/contracts";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role !== "OWNER") notFound();
  const values = await params;
  const contractId = contractIdSchema.safeParse(values.id);
  const documentId = documentIdSchema.safeParse(values.documentId);
  if (!contractId.success || !documentId.success) notFound();
  const contract = await getContractById(contractId.data); if (!contract) notFound();
  const document = contract.documents.find((item) => item.id === documentId.data); if (!document) notFound();
  const objectPath = buildContractDocumentPath({ organizationId: contract.organization_id, contractId: contract.id, documentId: document.id, kind: document.kind });
  const bytes = await downloadContractDocument(objectPath);
  const fileName = document.file_name.replaceAll(/["\r\n]/g, "_");
  return new Response(Buffer.from(bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${fileName}"`, "Cache-Control": "private, no-store" } });
}
