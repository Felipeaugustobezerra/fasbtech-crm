import { FinancialStatusBadge, FinancialTypeBadge } from "@/components/financial/financial-badges";
import { FINANCIAL_PAYMENT_NATURE_LABELS, formatCivilDate, formatEuro } from "@/components/financial/financial-format";
import type { FinancialEntry } from "@/types/financial";

export function FinancialEntryDetails({ entry, clientName }: Readonly<{ entry: FinancialEntry; clientName?: string }>) {
  const details = [
    ["Valor", formatEuro(entry.amount)], ["Data de referência", formatCivilDate(entry.reference_date)], ["Vencimento", formatCivilDate(entry.due_date)], ["Data de realização", formatCivilDate(entry.realized_date)], ["Natureza", FINANCIAL_PAYMENT_NATURE_LABELS[entry.payment_nature]], ["Cliente", clientName ?? (entry.client_id ? "Cliente associado" : "Sem Cliente")], ["Categoria", entry.category ?? "—"],
  ];
  return <section aria-labelledby="entry-data-title" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap gap-2"><FinancialTypeBadge type={entry.type} /><FinancialStatusBadge status={entry.status} /></div><h2 id="entry-data-title" className="mt-5 text-xl font-semibold text-slate-950">Dados financeiros</h2><dl className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{details.map(([label, value]) => <div key={label}><dt className="text-sm font-medium text-slate-600">{label}</dt><dd className="mt-1 text-sm text-slate-950">{value}</dd></div>)}</dl>{entry.notes ? <div className="mt-6 border-t border-slate-200 pt-5"><h3 className="text-sm font-medium text-slate-600">Observações</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{entry.notes}</p></div> : null}</section>;
}
