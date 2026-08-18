import Link from "next/link";

import type { Client } from "@/types/client";

type ClientTableProps = Readonly<{
  clients: Client[];
  search?: string;
  clearSearchHref?: string;
}>;

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
});

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function EmptyClients({
  search,
  clearSearchHref,
}: Pick<ClientTableProps, "search" | "clearSearchHref">) {
  const hasSearch = Boolean(search);

  return (
    <section
      aria-labelledby="clients-empty-title"
      className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="size-6"
        >
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2
        id="clients-empty-title"
        className="mt-4 text-lg font-semibold text-slate-950"
      >
        {hasSearch
          ? "Nenhum cliente encontrado"
          : "Ainda não existem clientes cadastrados"}
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        {hasSearch
          ? `Não encontrámos resultados para “${search}”. Reveja o termo pesquisado ou limpe a pesquisa.`
          : "Cadastre o primeiro cliente para começar a organizar a operação da FASBtech."}
      </p>

      <Link
        href={hasSearch ? (clearSearchHref ?? "/clientes") : "/clientes/novo"}
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        {hasSearch ? "Limpar pesquisa" : "Novo Cliente"}
      </Link>
    </section>
  );
}

export function ClientTable({
  clients,
  search,
  clearSearchHref,
}: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <EmptyClients search={search} clearSearchHref={clearSearchHref} />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[56rem] w-full border-collapse text-left">
          <caption className="sr-only">Lista de clientes autorizados</caption>
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th
                scope="col"
                className="h-13 px-6 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Nome
              </th>
              <th
                scope="col"
                className="h-13 px-6 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Empresa
              </th>
              <th
                scope="col"
                className="h-13 px-6 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                E-mail
              </th>
              <th
                scope="col"
                className="h-13 px-6 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Telefone
              </th>
              <th
                scope="col"
                className="h-13 px-6 text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Atualizado em
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((client) => (
              <tr key={client.id} className="transition hover:bg-slate-50">
                <th
                  scope="row"
                  className="h-13 px-6 text-sm font-semibold text-slate-950"
                >
                  {client.name}
                </th>
                <td className="h-13 px-6 text-sm text-slate-600">
                  {client.company_name ?? "—"}
                </td>
                <td className="h-13 px-6 text-sm text-slate-600">
                  {client.email ?? "—"}
                </td>
                <td className="h-13 px-6 text-sm text-slate-600">
                  {client.phone ?? "—"}
                </td>
                <td className="h-13 whitespace-nowrap px-6 text-sm text-slate-600">
                  {formatDate(client.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
