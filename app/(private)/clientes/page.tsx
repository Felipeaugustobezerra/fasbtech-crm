import Link from "next/link";

import {
  ClientPagination,
  createClientListHref,
} from "@/components/clients/client-pagination";
import { ClientTable } from "@/components/clients/client-table";
import { ClientToolbar } from "@/components/clients/client-toolbar";
import {
  CLIENT_SORT_FIELDS,
  listClients,
  type ClientSortDirection,
  type ClientSortField,
  type ListClientsParams,
} from "@/lib/clients/queries";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

type SearchParamValue = string | string[] | undefined;

type ClientsPageProps = Readonly<{
  searchParams: Promise<{
    search?: SearchParamValue;
    page?: SearchParamValue;
    sortBy?: SearchParamValue;
    sortDirection?: SearchParamValue;
  }>;
}>;

function firstParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function resolvePage(value: string | undefined) {
  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function isClientSortField(value: string | undefined): value is ClientSortField {
  return CLIENT_SORT_FIELDS.some((field) => field === value);
}

function resolveSortDirection(
  value: string | undefined,
): ClientSortDirection {
  return value === "desc" ? "desc" : "asc";
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;
  const normalizedSearch = firstParam(params.search)?.trim() || undefined;
  const requestedPage = resolvePage(firstParam(params.page));
  const requestedSortBy = firstParam(params.sortBy);
  const sortBy = isClientSortField(requestedSortBy) ? requestedSortBy : "name";
  const sortDirection = resolveSortDirection(
    firstParam(params.sortDirection),
  );
  const queryParams: ListClientsParams = {
    page: requestedPage,
    search: normalizedSearch,
    sortBy,
    sortDirection,
  };

  const [initialResult, context] = await Promise.all([
    listClients(queryParams),
    resolveFoundationContext(),
  ]);
  let result = initialResult;

  if (result.totalPages > 0 && result.page > result.totalPages) {
    result = await listClients({
      ...queryParams,
      page: result.totalPages,
    });
  }

  const currentPage = result.totalPages === 0 ? 1 : result.page;
  const listState = {
    search: normalizedSearch,
    sortBy,
    sortDirection,
  };
  const clearSearchHref = createClientListHref(1, {
    sortBy,
    sortDirection,
  });
  const canCreateClient =
    context.status === "READY" && context.membership.role === "OWNER";

  return (
    <section className="mx-auto w-full max-w-7xl" aria-labelledby="clients-title">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
            Clientes
          </p>
          <h1
            id="clients-title"
            className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
          >
            Clientes
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Gerencie os clientes autorizados da FASBtech.
          </p>
        </div>

        {canCreateClient ? (
          <Link
            href="/clientes/novo"
            className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Novo Cliente
          </Link>
        ) : null}
      </header>

      <div className="mt-8 space-y-5">
        <ClientToolbar
          search={normalizedSearch}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />

        <ClientTable
          clients={result.clients}
          search={normalizedSearch}
          clearSearchHref={clearSearchHref}
          canCreateClient={canCreateClient}
        />

        {result.count > 0 ? (
          <ClientPagination
            page={currentPage}
            pageSize={result.pageSize}
            total={result.count}
            totalPages={result.totalPages}
            {...listState}
          />
        ) : null}
      </div>
    </section>
  );
}
