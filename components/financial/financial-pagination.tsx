import Link from "next/link";
import type { FinancialEntryListParams } from "@/schemas/financial-query";

export function createFinancialListHref(page: number, params: FinancialEntryListParams) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, page: Math.max(1, page) })) if (value !== undefined) search.set(key, String(value));
  return `/financeiro?${search.toString()}`;
}

function PageLink({ disabled, href, children }: Readonly<{ disabled: boolean; href: string; children: React.ReactNode }>) {
  const classes = "inline-flex min-h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium";
  return disabled ? <span aria-disabled="true" className={`${classes} cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400`}>{children}</span> : <Link href={href} className={`${classes} border-slate-300 bg-white text-slate-700`}>{children}</Link>;
}

export function FinancialPagination({ params, total, totalPages }: Readonly<{ params: FinancialEntryListParams; total: number; totalPages: number }>) {
  const page = totalPages === 0 ? 1 : Math.min(params.page, totalPages);
  const first = total === 0 ? 0 : (page - 1) * params.pageSize + 1;
  const last = Math.min(page * params.pageSize, total);
  return <nav aria-label="Paginação financeira" className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-600" aria-live="polite"><strong className="text-slate-900">{first}–{last}</strong> de {total} movimentações · Página {page} de {Math.max(totalPages, 1)}</p><div className="flex gap-2"><PageLink disabled={page <= 1} href={createFinancialListHref(page - 1, params)}>Anterior</PageLink><PageLink disabled={page >= totalPages} href={createFinancialListHref(page + 1, params)}>Próxima</PageLink></div></nav>;
}
