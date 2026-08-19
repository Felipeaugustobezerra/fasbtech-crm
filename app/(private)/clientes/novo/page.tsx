import Link from "next/link";

import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <section
      className="mx-auto w-full max-w-4xl"
      aria-labelledby="new-client-title"
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
            Novo Cliente
          </span>
        </nav>

        <h1
          id="new-client-title"
          className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
        >
          Novo Cliente
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Cadastre um novo Cliente no FASBtech CRM.
        </p>
      </header>

      <div className="mt-8">
        <ClientForm mode="create" />
      </div>
    </section>
  );
}
