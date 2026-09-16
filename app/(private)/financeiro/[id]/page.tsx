import Link from "next/link";
import { notFound } from "next/navigation";
import { FinancialArchive } from "@/components/financial/financial-archive";
import { FinancialEntryDetails } from "@/components/financial/financial-entry-details";
import { FinancialStatusControl } from "@/components/financial/financial-status-control";
import { getClientById } from "@/lib/clients/queries";
import { getFinancialEntryById } from "@/lib/financial/queries";
import { financialEntryIdSchema } from "@/schemas/financial";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

export default async function FinancialEntryPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role !== "OWNER") notFound();
  const parsed = financialEntryIdSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const entry = await getFinancialEntryById(parsed.data);
  if (!entry) notFound();
  const client = entry.client_id ? await getClientById(entry.client_id) : null;
  const canOperate = !entry.archived_at;
  return <section className="mx-auto w-full max-w-7xl" aria-labelledby="entry-title"><header><nav aria-label="Breadcrumb" className="mb-4 text-sm"><Link href="/financeiro" className="font-medium text-blue-700 hover:underline">Financeiro</Link><span aria-hidden="true" className="mx-2 text-slate-400">/</span><span aria-current="page" className="text-slate-600">{entry.description}</span></nav><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><h1 id="entry-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{entry.description}</h1><p className="mt-3 text-base text-slate-600">Detalhe da movimentação financeira.</p></div><div className="flex gap-3"><Link href="/financeiro" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Voltar</Link>{canOperate ? <Link href={`/financeiro/${entry.id}/editar`} className="inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">Editar</Link> : null}</div></div></header>{entry.archived_at ? <p role="status" className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Esta movimentação está arquivada e disponível apenas para consulta. O seu Status financeiro foi preservado.</p> : null}<div className="mt-8 space-y-6"><FinancialEntryDetails entry={entry} clientName={client?.name} />{canOperate ? <FinancialStatusControl entryId={entry.id} currentStatus={entry.status} currentRealizedDate={entry.realized_date} /> : null}{canOperate ? <FinancialArchive entryId={entry.id} description={entry.description} /> : null}</div></section>;
}
