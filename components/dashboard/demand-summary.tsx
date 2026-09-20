import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DEMAND_STATUS_LABELS } from "@/components/demands/demand-badges";
import { DEMAND_STATUSES } from "@/types/demand";
import type { DemandDashboardSummary as Summary } from "@/types/dashboard";

export function DemandDashboardSummary({ summary }: Readonly<{ summary: Summary }>) {
  return (
    <section aria-labelledby="dashboard-demands-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="dashboard-demands-title" className="text-xl font-semibold text-slate-950">
            Demandas
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Operação autorizada, sem incluir registros arquivados.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Demandas ativas" value={summary.active} href="/demandas" />
        <DashboardCard
          label="Demandas atrasadas"
          value={summary.overdue}
          href="/demandas"
          detail="Prazo anterior à data civil atual em Europe/Lisbon"
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DEMAND_STATUSES.map((status) => (
          <DashboardCard
            key={status}
            label={DEMAND_STATUS_LABELS[status]}
            value={summary.byStatus[status]}
            href={`/demandas?status=${status}`}
          />
        ))}
      </div>
    </section>
  );
}
