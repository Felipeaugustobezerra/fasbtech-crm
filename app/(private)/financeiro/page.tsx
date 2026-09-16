import Link from "next/link";
import { notFound } from "next/navigation";

import { FinancialGoalForm } from "@/components/financial/financial-goal-form";
import { FinancialList } from "@/components/financial/financial-list";
import { FinancialPagination } from "@/components/financial/financial-pagination";
import { FinancialSummary } from "@/components/financial/financial-summary";
import { FinancialToolbar } from "@/components/financial/financial-toolbar";
import { getFinancialSummary, listFinancialEntries } from "@/lib/financial/queries";
import { financialEntryListParamsSchema } from "@/schemas/financial-query";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

type Param = string | string[] | undefined;
type Props = Readonly<{ searchParams: Promise<Record<string, Param>> }>;
const first = (value: Param) => Array.isArray(value) ? value[0] : value;

export default async function FinancialPage({ searchParams }: Props) {
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role !== "OWNER") notFound();

  const raw = await searchParams;
  const params = financialEntryListParamsSchema.parse({
    page: first(raw.page), pageSize: first(raw.pageSize), search: first(raw.search), type: first(raw.type), status: first(raw.status), paymentNature: first(raw.paymentNature), clientId: first(raw.clientId), category: first(raw.category), referenceDateFrom: first(raw.referenceDateFrom), referenceDateTo: first(raw.referenceDateTo), dueDateFrom: first(raw.dueDateFrom), dueDateTo: first(raw.dueDateTo), realizedDateFrom: first(raw.realizedDateFrom), realizedDateTo: first(raw.realizedDateTo), sort: first(raw.sort), direction: first(raw.direction),
  });
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const [initialResult, summary] = await Promise.all([
    listFinancialEntries(params),
    getFinancialSummary({ year, month }),
  ]);
  let result = initialResult;
  if (result.totalPages > 0 && result.page > result.totalPages) {
    params.page = result.totalPages;
    result = await listFinancialEntries(params);
  }
  const hasFilters = Boolean(params.search || params.type || params.status || params.paymentNature || params.clientId || params.category || params.referenceDateFrom || params.referenceDateTo || params.dueDateFrom || params.dueDateTo || params.realizedDateFrom || params.realizedDateTo);
  const periodLabel = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));

  return <section className="mx-auto w-full max-w-7xl" aria-labelledby="financial-title"><header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Gestão</p><h1 id="financial-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Financeiro</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Acompanhe entradas, saídas e a meta mensal da operação.</p></div><Link href="/financeiro/novo" className="inline-flex min-h-11 items-center justify-center self-start rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">Nova movimentação</Link></header><div className="mt-8 space-y-8"><FinancialSummary summary={summary} periodLabel={periodLabel} /><FinancialGoalForm year={year} month={month} currentTarget={summary.goal_target} /><section aria-labelledby="entries-title" className="space-y-5"><h2 id="entries-title" className="text-xl font-semibold text-slate-950">Movimentações</h2><FinancialToolbar params={params} /><FinancialList items={result.items} hasFilters={hasFilters} />{result.total > 0 ? <FinancialPagination params={params} total={result.total} totalPages={result.totalPages} /> : null}</section></div></section>;
}
