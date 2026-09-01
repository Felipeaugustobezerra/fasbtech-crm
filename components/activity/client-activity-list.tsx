import type { ClientActivitySummary } from "@/types/activity";

type ClientActivityListProps = Readonly<{
  activities: ClientActivitySummary[];
}>;

const actionLabels: Record<string, string> = {
  CREATED: "Cliente criado",
  UPDATED: "Cliente atualizado",
  ARCHIVED: "Cliente arquivado",
  ACCESS_GRANTED: "Acesso concedido",
  ACCESS_REVOKED: "Acesso removido",
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}

export function ClientActivityList({ activities }: ClientActivityListProps) {
  return (
    <section
      aria-labelledby="client-activity-title"
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2
          id="client-activity-title"
          className="text-lg font-semibold text-slate-950"
        >
          Atividade
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Histórico de alterações visíveis deste Cliente.
        </p>
      </header>

      <div className="px-5 py-5 sm:px-6">
        {activities.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            Nenhuma atividade visível para este Cliente.
          </p>
        ) : (
          <ol className="space-y-5" aria-label="Atividades visíveis">
            {activities.map((activity, index) => (
              <li
                key={`${activity.createdAt}-${activity.action}-${index}`}
                className="relative border-l-2 border-slate-200 pl-5"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[0.4375rem] top-1.5 size-3 rounded-full border-2 border-white bg-blue-700 ring-1 ring-blue-700"
                />
                <p className="font-semibold text-slate-950">
                  {actionLabels[activity.action] ?? activity.action}
                </p>
                <time
                  dateTime={activity.createdAt}
                  className="mt-1 block text-sm text-slate-600"
                >
                  {formatDateTime(activity.createdAt)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
