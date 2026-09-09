import Link from "next/link";

import { DemandPriorityBadge, DemandStatusBadge } from "@/components/demands/demand-badges";
import type { DemandListItem } from "@/types/demand";

type Props = Readonly<{
  items: DemandListItem[];
  hasFilters: boolean;
  canCreate: boolean;
}>;

function formatCivilDate(value: string | null) {
  if (!value) return "Sem prazo";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function Assignees({ item }: Readonly<{ item: DemandListItem }>) {
  if (item.assignees.length === 0) return <span className="text-slate-500">Sem responsável</span>;
  const visible = item.assignees.slice(0, 2);
  return (
    <span>
      {visible.map((assignee, index) => (
        <span key={assignee.membership_id}>
          {index > 0 ? ", " : ""}{assignee.full_name}
          {!assignee.is_currently_eligible ? <span className="ml-1 text-xs text-slate-500">(inativo)</span> : null}
        </span>
      ))}
      {item.assignees.length > 2 ? ` +${item.assignees.length - 2}` : ""}
    </span>
  );
}

function Tags({ item }: Readonly<{ item: DemandListItem }>) {
  if (item.tags.length === 0) return <span className="text-slate-500">—</span>;
  return (
    <div className="flex max-w-56 flex-wrap gap-1.5">
      {item.tags.slice(0, 2).map((tag) => <span key={tag.id} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{tag.name}</span>)}
      {item.tags.length > 2 ? <span className="text-xs text-slate-500">+{item.tags.length - 2}</span> : null}
    </div>
  );
}

function Empty({ hasFilters, canCreate }: Pick<Props, "hasFilters" | "canCreate">) {
  return (
    <section aria-labelledby="demands-empty-title" className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-700" aria-hidden="true">✓</div>
      <h2 id="demands-empty-title" className="mt-4 text-lg font-semibold text-slate-950">
        {hasFilters ? "Nenhum resultado encontrado" : "Nenhuma demanda encontrada"}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        {hasFilters ? "Não existem Demandas para os filtros atuais." : canCreate ? "Crie sua primeira demanda para começar." : "Não existem Demandas disponíveis para a sua conta."}
      </p>
      {hasFilters || canCreate ? <Link href={hasFilters ? "/demandas" : "/demandas/nova"} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">{hasFilters ? "Limpar filtros" : "Nova Demanda"}</Link> : null}
    </section>
  );
}

export function DemandList({ items, hasFilters, canCreate }: Props) {
  if (items.length === 0) return <Empty hasFilters={hasFilters} canCreate={canCreate} />;
  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((item) => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">{item.title}</h2><p className="mt-1 text-sm text-slate-600">{item.client.name}</p>
          <div className="mt-4 flex flex-wrap gap-2"><DemandStatusBadge status={item.status} /><DemandPriorityBadge priority={item.priority} /></div>
          <dl className="mt-4 grid gap-3 text-sm"><div><dt className="font-medium text-slate-600">Prazo</dt><dd className="mt-1 text-slate-900">{formatCivilDate(item.due_date)}</dd></div><div><dt className="font-medium text-slate-600">Responsáveis</dt><dd className="mt-1 text-slate-900"><Assignees item={item} /></dd></div></dl>
          <div className="mt-4"><Tags item={item} /></div>
        </article>)}
      </div>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block"><div className="overflow-x-auto"><table className="w-full min-w-[70rem] border-collapse text-left"><caption className="sr-only">Lista de Demandas autorizadas</caption><thead className="bg-slate-50"><tr>{["Título", "Cliente", "Status", "Prioridade", "Responsáveis", "Tags", "Prazo"].map((label) => <th key={label} scope="col" className="h-13 px-5 text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id} className="hover:bg-slate-50"><th scope="row" className="px-5 py-4 text-sm font-semibold text-slate-950">{item.title}</th><td className="px-5 py-4 text-sm text-slate-700">{item.client.name}</td><td className="px-5 py-4"><DemandStatusBadge status={item.status} /></td><td className="px-5 py-4"><DemandPriorityBadge priority={item.priority} /></td><td className="px-5 py-4 text-sm text-slate-700"><Assignees item={item} /></td><td className="px-5 py-4"><Tags item={item} /></td><td className="px-5 py-4 text-sm text-slate-700">{formatCivilDate(item.due_date)}</td></tr>)}</tbody></table></div></div>
    </>
  );
}
