import Link from "next/link";

import { DemandList } from "@/components/demands/demand-list";
import { DemandPagination } from "@/components/demands/demand-pagination";
import { DemandToolbar } from "@/components/demands/demand-toolbar";
import { listDemands } from "@/lib/demands/queries";
import { demandListParamsSchema } from "@/schemas/demand-query";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

type Param = string | string[] | undefined;
type Props = Readonly<{ searchParams: Promise<Record<string, Param>> }>;
const first = (value: Param) => Array.isArray(value) ? value[0] : value;

export default async function DemandsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const params = demandListParamsSchema.parse({
    page: first(raw.page), pageSize: first(raw.pageSize), search: first(raw.search),
    status: first(raw.status), priority: first(raw.priority), clientId: first(raw.clientId),
    sort: first(raw.sort), direction: first(raw.direction), dueOn: first(raw.dueOn),
    dueBefore: first(raw.dueBefore), dueAfter: first(raw.dueAfter),
  });
  const [initialResult, context] = await Promise.all([listDemands(params), resolveFoundationContext()]);
  let result = initialResult;
  if (result.totalPages > 0 && result.page > result.totalPages) {
    const validPage = result.totalPages;
    result = await listDemands({ ...params, page: validPage });
    params.page = validPage;
  }
  const canCreate = context.status === "READY" && (context.membership.role === "OWNER" || context.membership.role === "MEMBER");
  const hasFilters = Boolean(params.search || params.status || params.priority || params.clientId || params.dueOn || params.dueBefore || params.dueAfter);

  return <section className="mx-auto w-full max-w-7xl" aria-labelledby="demands-title">
    <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Operação</p><h1 id="demands-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Demandas</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Acompanhe o trabalho autorizado por Cliente, Status e prazo.</p></div>{canCreate ? <Link href="/demandas/nova" className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Nova Demanda</Link> : null}</header>
    <div className="mt-8 space-y-5"><DemandToolbar params={params} /><DemandList items={result.items} hasFilters={hasFilters} canCreate={canCreate} />{result.total > 0 ? <DemandPagination params={params} total={result.total} totalPages={result.totalPages} /> : null}</div>
  </section>;
}
