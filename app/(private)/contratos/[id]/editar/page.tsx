import Link from "next/link";
import { notFound } from "next/navigation";

import { ContractForm } from "@/components/contracts/contract-form";
import { listAllContractClientOptions, listAllContractTemplateOptions } from "@/lib/contracts/options";
import { getContractById, getContractTemplateById } from "@/lib/contracts/queries";
import { contractIdSchema } from "@/schemas/contracts";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

export default async function EditContractPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role !== "OWNER") notFound();
  const parsed = contractIdSchema.safeParse((await params).id); if (!parsed.success) notFound();
  const contract = await getContractById(parsed.data); if (!contract || contract.status !== "DRAFT") notFound();
  const [clients, activeTemplates, currentTemplate] = await Promise.all([listAllContractClientOptions(), listAllContractTemplateOptions(true), getContractTemplateById(contract.template_id)]);
  const templates = currentTemplate && !activeTemplates.some((item) => item.id === currentTemplate.id) ? [...activeTemplates, currentTemplate] : activeTemplates;
  return <section className="mx-auto w-full max-w-4xl" aria-labelledby="edit-contract-title"><header><nav aria-label="Breadcrumb" className="mb-4 text-sm"><Link href={`/contratos/${contract.id}`} className="font-medium text-blue-700 hover:underline">{contract.title}</Link><span aria-hidden className="mx-2 text-slate-400">/</span><span aria-current="page" className="text-slate-600">Editar</span></nav><h1 id="edit-contract-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Editar rascunho</h1></header><div className="mt-8"><ContractForm mode="edit" contractId={contract.id} clients={clients} templates={templates} initial={{ clientId: contract.client_id, templateId: contract.template_id, title: contract.title, draftData: contract.draft_data }} /></div></section>;
}
