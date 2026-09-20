import Link from "next/link";
import { notFound } from "next/navigation";

import { TemplateManager } from "@/components/contracts/template-manager";
import { listAllContractTemplateOptions } from "@/lib/contracts/options";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

export default async function ContractTemplatesPage() {
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role !== "OWNER") notFound();
  const [active, inactive] = await Promise.all([listAllContractTemplateOptions(true), listAllContractTemplateOptions(false)]);
  return <section className="mx-auto w-full max-w-5xl" aria-labelledby="templates-title"><header><nav aria-label="Breadcrumb" className="mb-4 text-sm"><Link href="/contratos" className="font-medium text-blue-700 hover:underline">Contratos</Link><span aria-hidden className="mx-2 text-slate-400">/</span><span aria-current="page" className="text-slate-600">Templates</span></nav><h1 id="templates-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Templates de Contrato</h1><p className="mt-3 text-base text-slate-600">Administre os modelos reutilizáveis da Organization.</p></header><div className="mt-8"><TemplateManager templates={[...active, ...inactive]} /></div></section>;
}
