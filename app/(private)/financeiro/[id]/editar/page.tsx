import Link from "next/link";
import { notFound } from "next/navigation";
import { FinancialEntryForm } from "@/components/financial/financial-entry-form";
import { getClientById, listClients } from "@/lib/clients/queries";
import { getFinancialEntryById } from "@/lib/financial/queries";
import { financialEntryIdSchema } from "@/schemas/financial";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

export default async function EditFinancialEntryPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role !== "OWNER") notFound();
  const parsed = financialEntryIdSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const entry = await getFinancialEntryById(parsed.data);
  if (!entry || entry.archived_at) notFound();
  const [clientResult, currentClient] = await Promise.all([listClients({ sortBy: "name", sortDirection: "asc" }), entry.client_id ? getClientById(entry.client_id) : Promise.resolve(null)]);
  const clientOptions = clientResult.clients.map(({ id, name }) => ({ id, name }));
  if (currentClient && !clientOptions.some(({ id }) => id === currentClient.id)) clientOptions.push({ id: currentClient.id, name: currentClient.name });
  clientOptions.sort((a, b) => a.name.localeCompare(b.name, "pt-PT"));
  return <section className="mx-auto w-full max-w-4xl" aria-labelledby="edit-entry-title"><header><nav aria-label="Breadcrumb" className="mb-4 text-sm"><Link href="/financeiro" className="font-medium text-blue-700 hover:underline">Financeiro</Link><span aria-hidden="true" className="mx-2 text-slate-400">/</span><Link href={`/financeiro/${entry.id}`} className="font-medium text-blue-700 hover:underline">{entry.description}</Link><span aria-hidden="true" className="mx-2 text-slate-400">/</span><span aria-current="page" className="text-slate-600">Editar</span></nav><h1 id="edit-entry-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Editar movimentação</h1><p className="mt-3 text-base leading-7 text-slate-600">Atualize os dados operacionais. O Status possui fluxo próprio.</p></header><div className="mt-8"><FinancialEntryForm mode="edit" entryId={entry.id} clients={clientOptions} initialValues={{ type: entry.type, description: entry.description, amount: entry.amount, reference_date: entry.reference_date, client_id: entry.client_id ?? "", payment_nature: entry.payment_nature, category: entry.category ?? "", due_date: entry.due_date ?? "", notes: entry.notes ?? "" }} /></div></section>;
}
