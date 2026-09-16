import Link from "next/link";
import { notFound } from "next/navigation";
import { FinancialEntryForm } from "@/components/financial/financial-entry-form";
import { listClients } from "@/lib/clients/queries";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

export default async function NewFinancialEntryPage() {
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role !== "OWNER") notFound();
  const clients = await listClients({ sortBy: "name", sortDirection: "asc" });
  return <section className="mx-auto w-full max-w-4xl" aria-labelledby="new-entry-title"><header><nav aria-label="Breadcrumb" className="mb-4 text-sm"><Link href="/financeiro" className="font-medium text-blue-700 hover:underline">Financeiro</Link><span aria-hidden="true" className="mx-2 text-slate-400">/</span><span aria-current="page" className="text-slate-600">Nova movimentação</span></nav><h1 id="new-entry-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Nova movimentação</h1><p className="mt-3 text-base leading-7 text-slate-600">Registe uma entrada ou saída financeira.</p></header><div className="mt-8"><FinancialEntryForm mode="create" clients={clients.clients.map(({ id, name }) => ({ id, name }))} /></div></section>;
}
