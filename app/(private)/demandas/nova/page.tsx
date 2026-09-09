import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateDemandForm } from "@/components/demands/create-demand-form";
import { listClients } from "@/lib/clients/queries";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

type Param = string | string[] | undefined;

export default async function NewDemandPage({ searchParams }: Readonly<{ searchParams: Promise<{ clientSearch?: Param }> }>) {
  const raw = await searchParams;
  const clientSearch = (Array.isArray(raw.clientSearch) ? raw.clientSearch[0] : raw.clientSearch)?.trim();
  const context = await resolveFoundationContext();
  if (context.status !== "READY" || context.membership.role === "ADMIN") notFound();
  const clients = await listClients({
    search: clientSearch,
    sortBy: "name",
    sortDirection: "asc",
  });
  const options = clients.clients.map(({ id, name }) => ({ id, name }));

  return <section className="mx-auto w-full max-w-4xl" aria-labelledby="new-demand-title"><header><nav aria-label="Breadcrumb" className="mb-4 text-sm"><Link href="/demandas" className="font-medium text-blue-700 hover:underline">Demandas</Link><span aria-hidden="true" className="mx-2 text-slate-400">/</span><span aria-current="page" className="text-slate-600">Nova Demanda</span></nav><h1 id="new-demand-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Nova Demanda</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Registe uma nova Demanda para um Cliente autorizado.</p></header>
    <form action="/demandas/nova" method="get" className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><label htmlFor="client-search" className="text-sm font-medium text-slate-700">Localizar Cliente</label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="client-search" name="clientSearch" type="search" defaultValue={clientSearch} placeholder="Pesquisar por nome" className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3.5 text-sm" /><button className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">Pesquisar</button>{clientSearch ? <Link href="/demandas/nova" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Limpar</Link> : null}</div><p className="mt-2 text-xs text-slate-500">São exibidos até {clients.pageSize} Clientes autorizados. Use a pesquisa para localizar outros.</p></form>
    <div className="mt-6">{options.length > 0 ? <CreateDemandForm clients={options} /> : <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><h2 className="text-lg font-semibold text-slate-950">Nenhum Cliente autorizado encontrado</h2><p className="mt-2 text-sm text-slate-600">Reveja a pesquisa ou solicite acesso ao Cliente necessário.</p></section>}</div>
  </section>;
}
