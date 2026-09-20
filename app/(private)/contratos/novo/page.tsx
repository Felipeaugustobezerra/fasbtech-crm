import Link from "next/link";
import { notFound } from "next/navigation";

import { ContractForm } from "@/components/contracts/contract-form";
import { listAllContractClientOptions, listAllContractTemplateOptions } from "@/lib/contracts/options";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

export default async function NewContractPage() {
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role !== "OWNER") notFound();
  const [clients, templates] = await Promise.all([listAllContractClientOptions(), listAllContractTemplateOptions(true)]);
  return <section className="mx-auto w-full max-w-4xl" aria-labelledby="new-contract-title"><header><nav aria-label="Breadcrumb" className="mb-4 text-sm"><Link href="/contratos" className="font-medium text-blue-700 hover:underline">Contratos</Link><span aria-hidden className="mx-2 text-slate-400">/</span><span aria-current="page" className="text-slate-600">Novo</span></nav><h1 id="new-contract-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Novo Contrato</h1><p className="mt-3 text-base text-slate-600">Selecione um Template e um Cliente para iniciar o rascunho.</p></header><div className="mt-8">{templates.length > 0 && clients.length > 0 ? <ContractForm mode="create" clients={clients} templates={templates} /> : <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">É necessário possuir ao menos um Cliente não arquivado e um Template ativo.</p>}</div></section>;
}
