import { CONTRACT_STATUS_LABELS } from "@/components/contracts/contract-format";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { CONTRACT_STATUSES } from "@/types/contracts";
import type { ContractDashboardSummary as Summary } from "@/types/dashboard";

export function ContractDashboardSummary({ summary }: Readonly<{ summary: Summary }>) {
  return (
    <section aria-labelledby="dashboard-contracts-title">
      <h2 id="dashboard-contracts-title" className="text-xl font-semibold text-slate-950">
        Contratos
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Distribuição pelos estados oficiais do lifecycle.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          label="Não terminais"
          value={summary.nonTerminal}
          href="/contratos"
          detail="Rascunho, gerado ou enviado"
        />
        {CONTRACT_STATUSES.map((status) => (
          <DashboardCard
            key={status}
            label={CONTRACT_STATUS_LABELS[status]}
            value={summary.byStatus[status]}
            href={`/contratos?status=${status}`}
          />
        ))}
      </div>
    </section>
  );
}
