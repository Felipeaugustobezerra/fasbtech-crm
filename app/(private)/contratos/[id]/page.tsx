import Link from "next/link";
import { notFound } from "next/navigation";

import { ContractDetailsView } from "@/components/contracts/contract-details";
import { ContractDocuments } from "@/components/contracts/contract-documents";
import { ContractLifecycle } from "@/components/contracts/contract-lifecycle";
import { getClientById } from "@/lib/clients/queries";
import { getContractById, getContractTemplateById } from "@/lib/contracts/queries";
import { contractIdSchema } from "@/schemas/contracts";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";
import type { ContractSnapshot } from "@/types/contracts";

function buildSnapshot(contract: NonNullable<Awaited<ReturnType<typeof getContractById>>>, client: NonNullable<Awaited<ReturnType<typeof getClientById>>>, template: NonNullable<Awaited<ReturnType<typeof getContractTemplateById>>>): ContractSnapshot {
  const content = typeof contract.draft_data.content === "string" && contract.draft_data.content.trim() ? contract.draft_data.content : template.content;
  const manualFields = Object.fromEntries(
    Object.entries(contract.draft_data).filter(([key]) => key !== "content"),
  );
  return { schema_version: 1, content, client: { id: client.id, data: { name: client.name, company_name: client.company_name, email: client.email, phone: client.phone, address_line_1: client.address_line_1, address_line_2: client.address_line_2, city: client.city, region: client.region, postal_code: client.postal_code, country_code: client.country_code }, tax_id: client.tax_id, tax_id_type: client.tax_id_type }, manual_fields: manualFields, template: { id: template.id, name: template.name } };
}

export default async function ContractPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role !== "OWNER") notFound();
  const parsed = contractIdSchema.safeParse((await params).id); if (!parsed.success) notFound();
  const contract = await getContractById(parsed.data); if (!contract) notFound();
  const [client, template] = await Promise.all([getClientById(contract.client_id), getContractTemplateById(contract.template_id)]);
  if (contract.status === "DRAFT" && (!client || !template)) notFound();
  const snapshot = contract.snapshot ?? buildSnapshot(contract, client!, template!);
  return <section className="mx-auto w-full max-w-7xl" aria-labelledby="contract-title"><header><nav aria-label="Breadcrumb" className="mb-4 text-sm"><Link href="/contratos" className="font-medium text-blue-700 hover:underline">Contratos</Link><span aria-hidden className="mx-2 text-slate-400">/</span><span aria-current="page" className="text-slate-600">{contract.title}</span></nav><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><h1 id="contract-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{contract.title}</h1><p className="mt-3 text-base text-slate-600">Detalhe e lifecycle do Contrato.</p></div><div className="flex gap-3"><Link href="/contratos" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Voltar</Link>{contract.status === "DRAFT" ? <Link href={`/contratos/${contract.id}/editar`} className="inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">Editar rascunho</Link> : null}</div></div></header><div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"><div className="space-y-6"><ContractDetailsView contract={contract} clientName={client?.name} templateName={template?.name} /><ContractDocuments contractId={contract.id} documents={contract.documents} /></div><aside><ContractLifecycle key={contract.status} contractId={contract.id} status={contract.status} snapshot={snapshot} defaultEmail={client?.email ?? contract.sent_to_email} /></aside></div></section>;
}
