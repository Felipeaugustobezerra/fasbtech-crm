import Link from "next/link";

import type {
  ClientSortDirection,
  ClientSortField,
} from "@/lib/clients/queries";

export type ClientListUrlState = Readonly<{
  search?: string;
  sortBy: ClientSortField;
  sortDirection: ClientSortDirection;
}>;

type ClientPaginationProps = ClientListUrlState &
  Readonly<{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }>;

export function createClientListHref(
  page: number,
  { search, sortBy, sortDirection }: ClientListUrlState,
) {
  const params = new URLSearchParams({
    page: String(Math.max(1, page)),
    sortBy,
    sortDirection,
  });

  if (search) {
    params.set("search", search);
  }

  return `/clientes?${params.toString()}`;
}

function PaginationLink({
  children,
  disabled,
  href,
}: Readonly<{
  children: React.ReactNode;
  disabled: boolean;
  href: string;
}>) {
  const className =
    "inline-flex min-h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${className} cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${className} border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50`}
    >
      {children}
    </Link>
  );
}

export function ClientPagination({
  page,
  pageSize,
  total,
  totalPages,
  search,
  sortBy,
  sortDirection,
}: ClientPaginationProps) {
  const normalizedPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const firstRecord = total === 0 ? 0 : (normalizedPage - 1) * pageSize + 1;
  const lastRecord = Math.min(normalizedPage * pageSize, total);
  const state = { search, sortBy, sortDirection };
  const onFirstPage = normalizedPage <= 1;
  const onLastPage = totalPages === 0 || normalizedPage >= totalPages;

  return (
    <nav
      aria-label="Paginação de clientes"
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-slate-600" aria-live="polite">
        <span className="font-medium text-slate-900">
          {firstRecord}–{lastRecord}
        </span>{" "}
        de {total} clientes · {pageSize} por página · Página {normalizedPage} de{" "}
        {Math.max(totalPages, 1)}
      </p>

      <div className="flex flex-wrap gap-2">
        <PaginationLink
          disabled={onFirstPage}
          href={createClientListHref(1, state)}
        >
          Primeira
        </PaginationLink>
        <PaginationLink
          disabled={onFirstPage}
          href={createClientListHref(normalizedPage - 1, state)}
        >
          Anterior
        </PaginationLink>
        <PaginationLink
          disabled={onLastPage}
          href={createClientListHref(normalizedPage + 1, state)}
        >
          Próxima
        </PaginationLink>
        <PaginationLink
          disabled={onLastPage}
          href={createClientListHref(Math.max(totalPages, 1), state)}
        >
          Última
        </PaginationLink>
      </div>
    </nav>
  );
}
