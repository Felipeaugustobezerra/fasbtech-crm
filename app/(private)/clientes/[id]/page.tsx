import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientArchive } from "@/components/clients/client-archive";
import { ClientDetails } from "@/components/clients/client-details";
import { getClientById } from "@/lib/clients/queries";
import { clientIdSchema } from "@/schemas/client";

type ClientDetailsPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function ClientDetailsPage({
  params,
}: ClientDetailsPageProps) {
  const { id } = await params;
  const parsedClientId = clientIdSchema.safeParse(id);

  if (!parsedClientId.success) {
    notFound();
  }

  const client = await getClientById(parsedClientId.data);

  if (!client) {
    notFound();
  }

  return (
    <section
      className="mx-auto w-full max-w-6xl"
      aria-labelledby="client-details-title"
    >
      <header>
        <nav aria-label="Breadcrumb" className="mb-4 text-sm">
          <Link
            href="/clientes"
            className="font-medium text-blue-700 transition hover:text-blue-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Clientes
          </Link>
          <span aria-hidden="true" className="mx-2 text-slate-400">
            /
          </span>
          <span aria-current="page" className="text-slate-600">
            {client.name}
          </span>
        </nav>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              id="client-details-title"
              className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
            >
              {client.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {client.company_name ?? "Informações gerais do Cliente."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/clientes"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
            >
              Voltar para Clientes
            </Link>
            <Link
              href={`/clientes/${client.id}/editar`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Editar Cliente
            </Link>
          </div>
        </div>
      </header>

      {client.archived_at ? (
        <p
          role="status"
          className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Este Cliente está arquivado e não aparece na listagem operacional.
        </p>
      ) : null}

      <div className="mt-8 space-y-6">
        <ClientDetails client={client} />

        {client.archived_at ? null : (
          <ClientArchive clientId={client.id} clientName={client.name} />
        )}
      </div>
    </section>
  );
}
