import Link from "next/link";
import type { ContractListParams } from "@/schemas/contracts-query";

export function createContractListHref(page: number, params: ContractListParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, page })) if (value !== undefined) query.set(key, String(value));
  return `/contratos?${query.toString()}`;
}

export function ContractPagination({ params, total, totalPages }: Readonly<{ params: ContractListParams; total: number; totalPages: number }>) {
  return <nav aria-label="Paginação de Contratos" className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-slate-600">{total} {total === 1 ? "Contrato" : "Contratos"} · Página {params.page} de {totalPages}</p><div className="flex gap-2">{params.page > 1 ? <Link href={createContractListHref(params.page - 1, params)} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 font-semibold text-slate-700">Anterior</Link> : null}{params.page < totalPages ? <Link href={createContractListHref(params.page + 1, params)} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 font-semibold text-slate-700">Próxima</Link> : null}</div></nav>;
}
