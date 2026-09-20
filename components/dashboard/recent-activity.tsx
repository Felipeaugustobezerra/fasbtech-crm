import type { DashboardActivity } from "@/types/dashboard";

const ENTITY_LABELS: Record<string, string> = {
  CLIENT: "Cliente",
  DEMAND: "Demanda",
  FINANCIAL_ENTRY: "Movimentação financeira",
  FINANCIAL_GOAL: "Meta financeira",
  CONTRACT: "Contrato",
  CONTRACT_TEMPLATE: "Template de Contrato",
  MEMBERSHIP: "Acesso",
  ORGANIZATION: "Organization",
};

const ACTION_LABELS: Record<string, string> = {
  CREATED: "Criado",
  UPDATED: "Atualizado",
  ARCHIVED: "Arquivado",
  STATUS_CHANGED: "Status alterado",
  SENT: "Enviado",
  SIGNED: "Assinado",
  CANCELED: "Cancelado",
  ACTIVATED: "Ativado",
  DEACTIVATED: "Desativado",
  ROLE_UPDATED: "Role alterada",
};

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Lisbon",
});

export function RecentActivity({ activities }: Readonly<{ activities: DashboardActivity[] }>) {
  return (
    <section aria-labelledby="recent-activity-title">
      <h2 id="recent-activity-title" className="text-xl font-semibold text-slate-950">
        Atividade recente
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Os 10 eventos autorizados mais recentes.
      </p>
      {activities.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Nenhuma atividade recente.
        </div>
      ) : (
        <ol className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
          {activities.map((activity) => (
            <li key={activity.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-800">
                <span className="font-semibold">
                  {ENTITY_LABELS[activity.entityType] ?? "Atividade"}
                </span>{" "}
                — {ACTION_LABELS[activity.action] ?? activity.action}
              </p>
              <time dateTime={activity.createdAt} className="text-xs text-slate-500">
                {dateFormatter.format(new Date(activity.createdAt))}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
