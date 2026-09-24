import { ContractDashboardSummary } from "@/components/dashboard/contract-summary";
import {
  DashboardCard,
  DashboardSectionError,
} from "@/components/dashboard/dashboard-card";
import { DemandDashboardSummary } from "@/components/dashboard/demand-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { formatEuro } from "@/components/financial/financial-format";
import { FinancialSummary } from "@/components/financial/financial-summary";
import type { DashboardData, DashboardRole } from "@/types/dashboard";

type Props = Readonly<{ role: DashboardRole; data: DashboardData }>;

export function DashboardView({ role, data }: Props) {
  if (role === "ADMIN") {
    return (
      <section className="mx-auto w-full max-w-4xl" aria-labelledby="dashboard-title">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
          Dashboard
        </p>
        <h1 id="dashboard-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Visão geral
        </h1>
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Sem módulos operacionais autorizados</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            O seu perfil não possui acesso aos indicadores operacionais disponíveis nesta versão.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl" aria-labelledby="dashboard-title">
      <header>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
          Dashboard
        </p>
        <h1 id="dashboard-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Visão executiva
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Indicadores reais da operação, atualizados a partir dos módulos autorizados.
        </p>
      </header>

      <div className="mt-8 space-y-8 sm:space-y-10">
        <section aria-labelledby="executive-summary-title">
          <h2 id="executive-summary-title" className="text-xl font-semibold text-slate-950">
            Resumo executivo
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.clients?.status === "success" ? (
              <DashboardCard label="Clientes ativos" value={data.clients.data} href="/clientes" />
            ) : data.clients ? (
              <DashboardSectionError label="Clientes" />
            ) : null}
            {data.demands?.status === "success" ? (
              <DashboardCard label="Demandas ativas" value={data.demands.data.active} href="/demandas" />
            ) : data.demands ? (
              <DashboardSectionError label="Demandas" />
            ) : null}
            {data.financial?.status === "success" ? (
              <DashboardCard label="Saldo em caixa" value={formatEuro(data.financial.data.cash_balance)} href="/financeiro" />
            ) : data.financial ? (
              <DashboardSectionError label="Financeiro" />
            ) : null}
            {data.contracts?.status === "success" ? (
              <DashboardCard label="Contratos não terminais" value={data.contracts.data.nonTerminal} href="/contratos" />
            ) : data.contracts ? (
              <DashboardSectionError label="Contratos" />
            ) : null}
          </div>
        </section>

        {data.financial?.status === "success" ? (
          <FinancialSummary summary={data.financial.data} periodLabel={data.period.label} />
        ) : null}

        {data.demands?.status === "success" ? (
          <DemandDashboardSummary summary={data.demands.data} />
        ) : null}

        {data.contracts?.status === "success" ? (
          <ContractDashboardSummary summary={data.contracts.data} />
        ) : null}

        {data.clients?.status === "success" ? (
          <section aria-labelledby="dashboard-clients-title">
            <h2 id="dashboard-clients-title" className="text-xl font-semibold text-slate-950">
              Clientes
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardCard label="Clientes ativos autorizados" value={data.clients.data} href="/clientes" />
            </div>
          </section>
        ) : null}

        {data.demands?.status === "success" && data.demands.data.overdue > 0 ? (
          <section aria-labelledby="dashboard-alerts-title">
            <h2 id="dashboard-alerts-title" className="text-xl font-semibold text-slate-950">Alertas</h2>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-950">
                {data.demands.data.overdue} {data.demands.data.overdue === 1 ? "Demanda atrasada" : "Demandas atrasadas"}
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Consulte o módulo de Demandas para acompanhar os prazos vencidos.
              </p>
            </div>
          </section>
        ) : null}

        {data.activities?.status === "success" ? (
          <RecentActivity activities={data.activities.data} />
        ) : data.activities ? (
          <section aria-labelledby="recent-activity-title">
            <h2 id="recent-activity-title" className="text-xl font-semibold text-slate-950">Atividade recente</h2>
            <div className="mt-4"><DashboardSectionError label="Atividade recente" /></div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
