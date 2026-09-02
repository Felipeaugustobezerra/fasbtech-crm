import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientForm } from "@/components/clients/client-form";
import { mapClientToInput } from "@/lib/clients/mapper";
import { getClientById } from "@/lib/clients/queries";
import { clientIdSchema } from "@/schemas/client";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

type EditClientPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const parsedClientId = clientIdSchema.safeParse(id);

  if (!parsedClientId.success) {
    notFound();
  }

  const context = await resolveFoundationContext();

  if (context.status !== "READY" || context.membership.role !== "OWNER") {
    notFound();
  }

  const client = await getClientById(parsedClientId.data);

  if (!client) {
    notFound();
  }

  return (
    <section
      className="mx-auto w-full max-w-4xl"
      aria-labelledby="edit-client-title"
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
          <Link
            href={`/clientes/${client.id}`}
            className="font-medium text-blue-700 transition hover:text-blue-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {client.name}
          </Link>
          <span aria-hidden="true" className="mx-2 text-slate-400">
            /
          </span>
          <span aria-current="page" className="text-slate-600">
            Editar
          </span>
        </nav>

        <h1
          id="edit-client-title"
          className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
        >
          Editar Cliente
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Atualize as informações de {client.name}.
        </p>
      </header>

      <div className="mt-8">
        <ClientForm
          mode="edit"
          clientId={client.id}
          initialValues={mapClientToInput(client)}
        />
      </div>
    </section>
  );
}
