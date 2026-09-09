import Link from "next/link";

import type { DemandListParams } from "@/schemas/demand-query";

export function createDemandListHref(page: number, params: DemandListParams) {
  const url = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, page: Math.max(1, page) })) {
    if (value !== undefined) url.set(key, String(value));
  }
  return `/demandas?${url.toString()}`;
}

function PageLink({ disabled, href, children }: Readonly<{ disabled: boolean; href: string; children: React.ReactNode }>) {
  const classes = "inline-flex min-h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";
  return disabled ? <span aria-disabled="true" className={`${classes} cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400`}>{children}</span> : <Link href={href} className={`${classes} border-slate-300 bg-white text-slate-700`}>{children}</Link>;
}

export function DemandPagination({ params, total, totalPages }: Readonly<{ params: DemandListParams; total: number; totalPages: number }>) {
  const page = totalPages === 0 ? 1 : Math.min(params.page, totalPages);
  const first = total === 0 ? 0 : (page - 1) * params.pageSize + 1;
  const last = Math.min(page * params.pageSize, total);
  return <nav aria-label="Paginação de Demandas" className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-600" aria-live="polite"><strong className="text-slate-900">{first}–{last}</strong> de {total} Demandas · {params.pageSize} por página · Página {page} de {Math.max(totalPages, 1)}</p><div className="flex flex-wrap gap-2"><PageLink disabled={page <= 1} href={createDemandListHref(1, params)}>Primeira</PageLink><PageLink disabled={page <= 1} href={createDemandListHref(page - 1, params)}>Anterior</PageLink><PageLink disabled={page >= totalPages} href={createDemandListHref(page + 1, params)}>Próxima</PageLink><PageLink disabled={page >= totalPages} href={createDemandListHref(Math.max(1, totalPages), params)}>Última</PageLink></div></nav>;
}
