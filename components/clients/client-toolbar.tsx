import Link from "next/link";

import type {
  ClientSortDirection,
  ClientSortField,
} from "@/lib/clients/queries";

type ClientToolbarProps = Readonly<{
  search?: string;
  sortBy: ClientSortField;
  sortDirection: ClientSortDirection;
}>;

export function ClientToolbar({
  search,
  sortBy,
  sortDirection,
}: ClientToolbarProps) {
  const hasActiveParams =
    Boolean(search) || sortBy !== "name" || sortDirection !== "asc";

  return (
    <form
      action="/clientes"
      method="get"
      aria-label="Pesquisar e ordenar clientes"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="page" value="1" />

      <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_13rem_11rem_auto] lg:items-end">
        <div>
          <label
            htmlFor="client-search"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Pesquisar
          </label>
          <input
            id="client-search"
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Pesquisar por nome..."
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="client-sort-by"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Ordenar por
          </label>
          <select
            id="client-sort-by"
            name="sortBy"
            defaultValue={sortBy}
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="name">Nome</option>
            <option value="created_at">Data de criação</option>
            <option value="updated_at">Última atualização</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="client-sort-direction"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Direção
          </label>
          <select
            id="client-sort-direction"
            name="sortDirection"
            defaultValue={sortDirection}
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="asc">Crescente</option>
            <option value="desc">Decrescente</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          >
            Aplicar
          </button>

          {hasActiveParams ? (
            <Link
              href="/clientes"
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
            >
              Limpar
            </Link>
          ) : null}
        </div>
      </div>
    </form>
  );
}
