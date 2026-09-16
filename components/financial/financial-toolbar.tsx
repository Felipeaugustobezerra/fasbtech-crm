import Link from "next/link";

import { FINANCIAL_PAYMENT_NATURE_LABELS, FINANCIAL_STATUS_LABELS, FINANCIAL_TYPE_LABELS } from "@/components/financial/financial-format";
import { FINANCIAL_PAGE_SIZES, FINANCIAL_SORT_FIELDS, type FinancialEntryListParams } from "@/schemas/financial-query";
import { FINANCIAL_PAYMENT_NATURES, FINANCIAL_STATUSES, FINANCIAL_TYPES } from "@/types/financial";

const sortLabels: Record<(typeof FINANCIAL_SORT_FIELDS)[number], string> = {
  reference_date: "Data de referência", due_date: "Vencimento", realized_date: "Data de realização", amount: "Valor", created_at: "Criação", updated_at: "Atualização", description: "Descrição",
};

const inputClass = "mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 font-normal text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100";

export function FinancialToolbar({ params }: Readonly<{ params: FinancialEntryListParams }>) {
  return <form action="/financeiro" method="get" aria-label="Pesquisar e filtrar movimentações financeiras" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><input type="hidden" name="page" value="1" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <label className="text-sm font-medium text-slate-700">Pesquisar<input name="search" type="search" defaultValue={params.search} placeholder="Descrição" className={inputClass} /></label>
    <label className="text-sm font-medium text-slate-700">Tipo<select name="type" defaultValue={params.type ?? ""} className={inputClass}><option value="">Todos</option>{FINANCIAL_TYPES.map((v) => <option key={v} value={v}>{FINANCIAL_TYPE_LABELS[v]}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Status<select name="status" defaultValue={params.status ?? ""} className={inputClass}><option value="">Todos</option>{FINANCIAL_STATUSES.map((v) => <option key={v} value={v}>{FINANCIAL_STATUS_LABELS[v]}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Natureza<select name="paymentNature" defaultValue={params.paymentNature ?? ""} className={inputClass}><option value="">Todas</option>{FINANCIAL_PAYMENT_NATURES.map((v) => <option key={v} value={v}>{FINANCIAL_PAYMENT_NATURE_LABELS[v]}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Cliente (UUID)<input name="clientId" defaultValue={params.clientId} placeholder="ID do Cliente" className={inputClass} /></label>
    <label className="text-sm font-medium text-slate-700">Categoria<input name="category" defaultValue={params.category} className={inputClass} /></label>
    <label className="text-sm font-medium text-slate-700">Referência — início<input name="referenceDateFrom" type="date" defaultValue={params.referenceDateFrom} className={inputClass} /></label>
    <label className="text-sm font-medium text-slate-700">Referência — fim<input name="referenceDateTo" type="date" defaultValue={params.referenceDateTo} className={inputClass} /></label>
    <label className="text-sm font-medium text-slate-700">Vencimento — início<input name="dueDateFrom" type="date" defaultValue={params.dueDateFrom} className={inputClass} /></label>
    <label className="text-sm font-medium text-slate-700">Vencimento — fim<input name="dueDateTo" type="date" defaultValue={params.dueDateTo} className={inputClass} /></label>
    <label className="text-sm font-medium text-slate-700">Realização — início<input name="realizedDateFrom" type="date" defaultValue={params.realizedDateFrom} className={inputClass} /></label>
    <label className="text-sm font-medium text-slate-700">Realização — fim<input name="realizedDateTo" type="date" defaultValue={params.realizedDateTo} className={inputClass} /></label>
    <label className="text-sm font-medium text-slate-700">Ordenar por<select name="sort" defaultValue={params.sort} className={inputClass}>{FINANCIAL_SORT_FIELDS.map((v) => <option key={v} value={v}>{sortLabels[v]}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Direção<select name="direction" defaultValue={params.direction} className={inputClass}><option value="desc">Mais recentes/maiores</option><option value="asc">Mais antigos/menores</option></select></label>
    <label className="text-sm font-medium text-slate-700">Por página<select name="pageSize" defaultValue={params.pageSize} className={inputClass}>{FINANCIAL_PAGE_SIZES.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
  </div><div className="mt-4 flex flex-wrap gap-3"><button className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">Aplicar filtros</button><Link href="/financeiro" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Limpar</Link></div></form>;
}
