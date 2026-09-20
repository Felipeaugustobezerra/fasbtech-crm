import Link from "next/link";

import { formatContractDate } from "@/components/contracts/contract-format";
import type { ContractDocumentMetadata } from "@/lib/contracts/queries";

export function ContractDocuments({ contractId, documents }: Readonly<{ contractId: string; documents: ContractDocumentMetadata[] }>) {
  const kinds = [{ kind: "ORIGINAL_PDF", label: "PDF original" }, { kind: "SIGNED_COPY", label: "Cópia assinada" }] as const;
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="documents-title"><h2 id="documents-title" className="text-lg font-semibold text-slate-950">Documentos privados</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{kinds.map(({ kind, label }) => { const document = documents.find((item) => item.kind === kind); return <article key={kind} className="rounded-lg border border-slate-200 p-4"><h3 className="font-semibold text-slate-900">{label}</h3>{document ? <><p className="mt-2 truncate text-sm text-slate-600">{document.file_name}</p><p className="mt-1 text-xs text-slate-500">{formatContractDate(document.created_at)}</p><Link className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700" href={`/contratos/${contractId}/documentos/${document.id}`}>Transferir PDF</Link></> : <p className="mt-2 text-sm text-slate-500">Ainda não disponível.</p>}</article>; })}</div></section>;
}
