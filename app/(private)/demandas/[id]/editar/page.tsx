import Link from "next/link";
import { notFound } from "next/navigation";

import { DemandEditForm } from "@/components/demands/demand-edit-form";
import { getDemandById } from "@/lib/demands/queries";
import { demandIdSchema } from "@/schemas/demand";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

type EditDemandPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditDemandPage({ params }: EditDemandPageProps) {
  const { id } = await params;
  const parsedDemandId = demandIdSchema.safeParse(id);

  if (!parsedDemandId.success) {
    notFound();
  }

  const [demand, context] = await Promise.all([
    getDemandById(parsedDemandId.data),
    resolveFoundationContext(),
  ]);

  if (
    !demand ||
    demand.archived_at ||
    context.status !== "READY" ||
    context.membership.role === "ADMIN"
  ) {
    notFound();
  }

  return (
    <section
      className="mx-auto w-full max-w-4xl"
      aria-labelledby="edit-demand-title"
    >
      <header>
        <nav aria-label="Breadcrumb" className="mb-4 text-sm">
          <Link
            href="/demandas"
            className="font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Demandas
          </Link>
          <span aria-hidden="true" className="mx-2 text-slate-400">/</span>
          <Link
            href={`/demandas/${demand.id}`}
            className="font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {demand.title}
          </Link>
          <span aria-hidden="true" className="mx-2 text-slate-400">/</span>
          <span aria-current="page" className="text-slate-600">Editar</span>
        </nav>

        <h1
          id="edit-demand-title"
          className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
        >
          Editar Demanda
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Atualize os campos operacionais de {demand.title}. Cliente, Status,
          responsáveis e Tags possuem fluxos próprios.
        </p>
      </header>

      <div className="mt-8">
        <DemandEditForm
          demandId={demand.id}
          initialValues={{
            title: demand.title,
            description: demand.description ?? "",
            priority: demand.priority,
            start_date: demand.start_date ?? "",
            due_date: demand.due_date ?? "",
            notes: demand.notes ?? "",
          }}
        />
      </div>
    </section>
  );
}
