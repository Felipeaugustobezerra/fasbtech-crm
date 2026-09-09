import {
  DemandPriorityBadge,
  DemandStatusBadge,
} from "@/components/demands/demand-badges";
import type { DemandDetails as DemandDetailsType } from "@/types/demand";

function formatCivilDate(value: string | null) {
  if (!value) return "Não informada";

  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Lisbon",
  }).format(new Date(value));
}

function TextValue({ value }: Readonly<{ value: string | null }>) {
  return value ? (
    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
      {value}
    </p>
  ) : (
    <p className="mt-2 text-sm text-slate-500">Não informado.</p>
  );
}

export function DemandDetails({ demand }: Readonly<{ demand: DemandDetailsType }>) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section
        aria-labelledby="demand-information-title"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2"
      >
        <h2 id="demand-information-title" className="text-lg font-semibold text-slate-950">
          Informações da Demanda
        </h2>

        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-600">Cliente</dt>
            <dd className="mt-1 text-sm text-slate-950">{demand.client.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600">Estado</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              <DemandStatusBadge status={demand.status} />
              <DemandPriorityBadge priority={demand.priority} />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600">Data de início</dt>
            <dd className="mt-1 text-sm text-slate-950">
              {formatCivilDate(demand.start_date)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600">Prazo</dt>
            <dd className="mt-1 text-sm text-slate-950">
              {formatCivilDate(demand.due_date)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-medium text-slate-600">Descrição</h3>
          <TextValue value={demand.description} />
        </div>
        <div className="mt-5 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-medium text-slate-600">Observações</h3>
          <TextValue value={demand.notes} />
        </div>
      </section>

      <aside className="space-y-6">
        <section
          aria-labelledby="current-assignees-title"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 id="current-assignees-title" className="font-semibold text-slate-950">
            Responsáveis atuais
          </h2>
          {demand.assignees.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Nenhum responsável.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {demand.assignees.map((assignee) => (
                <li key={assignee.membership_id} className="text-sm text-slate-800">
                  <span className="font-medium">{assignee.full_name}</span>
                  <span className="ml-1 text-xs text-slate-500">({assignee.role})</span>
                  {!assignee.is_currently_eligible ? (
                    <span className="mt-1 block text-xs font-medium text-amber-800">
                      Histórico — sem acesso atual ao Cliente
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="current-tags-title"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 id="current-tags-title" className="font-semibold text-slate-950">
            Tags
          </h2>
          {demand.tags.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Nenhuma Tag.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {demand.tags.map((tag) => (
                <li
                  key={tag.id}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="demand-timestamps-title"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 id="demand-timestamps-title" className="font-semibold text-slate-950">
            Datas do registro
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-slate-600">Criada em</dt>
              <dd className="mt-1 text-slate-900">{formatTimestamp(demand.created_at)}</dd>
            </div>
            <div>
              <dt className="text-slate-600">Atualizada em</dt>
              <dd className="mt-1 text-slate-900">{formatTimestamp(demand.updated_at)}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  );
}
