import Link from "next/link";
import { notFound } from "next/navigation";

import { ContractList } from "@/components/contracts/contract-list";
import { ContractPagination } from "@/components/contracts/contract-pagination";
import { ContractToolbar } from "@/components/contracts/contract-toolbar";
import { listAllContractClientOptions, listAllContractTemplateOptions } from "@/lib/contracts/options";
import { listContracts } from "@/lib/contracts/queries";
import { contractListParamsSchema } from "@/schemas/contracts-query";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

type Param = string | string[] | undefined;
const first = (value: Param) => Array.isArray(value) ? value[0] : value;

export default async function ContractsPage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, Param>> }>) {
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role !== "OWNER") notFound();
  const raw = await searchParams;
  const params = contractListParamsSchema.parse({ page: first(raw.page), pageSize: first(raw.pageSize), search: first(raw.search), status: first(raw.status), clientId: first(raw.clientId), templateId: first(raw.templateId), sort: first(raw.sort), direction: first(raw.direction) });
  const [initial, clients, activeTemplates, inactiveTemplates] = await Promise.all([listContracts(params), listAllContractClientOptions(), listAllContractTemplateOptions(true), listAllContractTemplateOptions(false)]);
  let result = initial;
  if (result.totalPages > 0 && result.page > result.totalPages) { params.page = result.totalPages; result = await listContracts(params); }
  const templates = [...activeTemplates, ...inactiveTemplates];
  const hasFilters = Boolean(params.search || params.status || params.clientId || params.templateId);
  return <section className="mx-auto w-full max-w-7xl" aria-labelledby="contracts-title"><header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Gestão</p><h1 id="contracts-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Contratos</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Prepare, gere, envie e acompanhe Contratos preservando o histórico documental.</p></div><div className="flex flex-wrap gap-3"><Link href="/contratos/templates" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Templates</Link><Link href="/contratos/novo" className="inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">Novo Contrato</Link></div></header><div className="mt-8 space-y-5"><ContractToolbar params={params} clients={clients} templates={templates} /><ContractList items={result.items} clients={clients} templates={templates} hasFilters={hasFilters} />{result.total > 0 ? <ContractPagination params={params} total={result.total} totalPages={result.totalPages} /> : null}</div></section>;
}
