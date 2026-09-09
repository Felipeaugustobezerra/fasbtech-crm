import Link from "next/link";

import { DEMAND_PRIORITY_LABELS, DEMAND_STATUS_LABELS } from "@/components/demands/demand-badges";
import { DEMAND_PAGE_SIZES, type DemandListParams } from "@/schemas/demand-query";
import { DEMAND_PRIORITIES, DEMAND_STATUSES } from "@/types/demand";

export function DemandToolbar({ params }: Readonly<{ params: DemandListParams }>) {
  return (
    <form action="/demandas" method="get" aria-label="Pesquisar e filtrar Demandas" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input type="hidden" name="page" value="1" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">Pesquisar<input name="search" type="search" defaultValue={params.search} placeholder="Título ou descrição" className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 px-3.5 font-normal text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100" /></label>
        <label className="text-sm font-medium text-slate-700">Status<select name="status" defaultValue={params.status ?? ""} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 font-normal text-slate-950"><option value="">Todos</option>{DEMAND_STATUSES.map((value) => <option key={value} value={value}>{DEMAND_STATUS_LABELS[value]}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Prioridade<select name="priority" defaultValue={params.priority ?? ""} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 font-normal text-slate-950"><option value="">Todas</option>{DEMAND_PRIORITIES.map((value) => <option key={value} value={value}>{DEMAND_PRIORITY_LABELS[value]}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Prazo em<input name="dueOn" type="date" defaultValue={params.dueOn} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 px-3.5 font-normal text-slate-950" /></label>
        <label className="text-sm font-medium text-slate-700">Ordenar por<select name="sort" defaultValue={params.sort} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 font-normal text-slate-950"><option value="updated_at">Última atualização</option><option value="created_at">Data de criação</option><option value="title">Título</option><option value="due_date">Prazo</option><option value="priority">Prioridade</option><option value="status">Status</option></select></label>
        <label className="text-sm font-medium text-slate-700">Direção<select name="direction" defaultValue={params.direction} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 font-normal text-slate-950"><option value="desc">Decrescente</option><option value="asc">Crescente</option></select></label>
        <label className="text-sm font-medium text-slate-700">Por página<select name="pageSize" defaultValue={params.pageSize} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 font-normal text-slate-950">{DEMAND_PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
        <div className="flex items-end gap-2"><button type="submit" className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700">Aplicar</button><Link href="/demandas" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">Limpar</Link></div>
      </div>
    </form>
  );
}
