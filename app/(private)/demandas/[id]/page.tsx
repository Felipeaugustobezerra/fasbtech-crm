import Link from "next/link";
import { notFound } from "next/navigation";

import { DemandArchive } from "@/components/demands/demand-archive";
import { DemandAssigneeManager } from "@/components/demands/demand-assignee-manager";
import {
  DemandPriorityBadge,
  DemandStatusBadge,
} from "@/components/demands/demand-badges";
import { DemandDetails } from "@/components/demands/demand-details";
import { DemandStatusControl } from "@/components/demands/demand-status-control";
import { DemandTagManager } from "@/components/demands/demand-tag-manager";
import {
  getDemandById,
  listEligibleDemandAssignees,
} from "@/lib/demands/queries";
import { demandIdSchema } from "@/schemas/demand";
import { resolveFoundationContext } from "@/services/foundation/foundation.service";

type DemandDetailsPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function DemandDetailsPage({
  params,
}: DemandDetailsPageProps) {
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
    context.status !== "READY" ||
    context.membership.role === "ADMIN"
  ) {
    notFound();
  }

  const canOperate =
    !demand.archived_at &&
    (context.membership.role === "OWNER" || context.membership.role === "MEMBER");
  const canArchive = !demand.archived_at && context.membership.role === "OWNER";
  const eligibleAssignees = canOperate
    ? await listEligibleDemandAssignees(demand.client_id)
    : [];

  return (
    <section
      className="mx-auto w-full max-w-7xl"
      aria-labelledby="demand-details-title"
    >
      <header>
        <nav aria-label="Breadcrumb" className="mb-4 text-sm">
          <Link
            href="/demandas"
            className="font-medium text-blue-700 transition hover:text-blue-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Demandas
          </Link>
          <span aria-hidden="true" className="mx-2 text-slate-400">/</span>
          <span aria-current="page" className="text-slate-600">
            {demand.title}
          </span>
        </nav>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{demand.client.name}</p>
            <h1
              id="demand-details-title"
              className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
            >
              {demand.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <DemandStatusBadge status={demand.status} />
              <DemandPriorityBadge priority={demand.priority} />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/demandas"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
            >
              Voltar para Demandas
            </Link>
            {canOperate ? (
              <Link
                href={`/demandas/${demand.id}/editar`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white"
              >
                Editar Demanda
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {demand.archived_at ? (
        <p
          role="status"
          className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Esta Demanda está arquivada. O conteúdo permanece disponível apenas para
          consulta.
        </p>
      ) : null}

      <div className="mt-8 space-y-6">
        <DemandDetails demand={demand} />

        {canOperate ? (
          <section aria-labelledby="demand-operations-title">
            <h2 id="demand-operations-title" className="text-xl font-semibold text-slate-950">
              Operações
            </h2>
            <div className="mt-4 grid gap-6 xl:grid-cols-2">
              <DemandStatusControl demandId={demand.id} currentStatus={demand.status} />
              <DemandAssigneeManager
                demandId={demand.id}
                currentAssignees={demand.assignees}
                eligibleAssignees={eligibleAssignees}
              />
              <div className="xl:col-span-2">
                <DemandTagManager demandId={demand.id} currentTags={demand.tags} />
              </div>
            </div>
          </section>
        ) : null}

        {canArchive ? (
          <DemandArchive demandId={demand.id} demandTitle={demand.title} />
        ) : null}
      </div>
    </section>
  );
}
