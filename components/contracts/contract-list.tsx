import Link from "next/link";

import {
  CONTRACT_STATUS_LABELS,
  formatContractDate,
} from "@/components/contracts/contract-format";
import type { ContractListItem } from "@/lib/contracts/queries";

type NamedOption = { id: string; name: string };

export function ContractList({
  items,
  clients,
  templates,
  hasFilters,
}: Readonly<{
  items: ContractListItem[];
  clients: NamedOption[];
  templates: NamedOption[];
  hasFilters: boolean;
}>) {
  const clientNames = new Map(clients.map((item) => [item.id, item.name]));
  const templateNames = new Map(templates.map((item) => [item.id, item.name]));

  if (items.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <h2 className="text-lg font-semibold text-slate-950">
          {hasFilters ? "Nenhum resultado encontrado" : "Nenhum Contrato encontrado"}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {hasFilters
            ? "Ajuste os filtros para consultar outros Contratos."
            : "Crie o primeiro rascunho a partir de um Template ativo."}
        </p>
      </section>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((contract) => (
          <article key={contract.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="break-words font-semibold text-slate-950"><Link href={`/contratos/${contract.id}`} className="text-blue-700 hover:underline">{contract.title}</Link></h2>
            <p className="mt-1 break-words text-sm text-slate-600">{clientNames.get(contract.client_id) ?? "Cliente indisponível"}</p>
            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{CONTRACT_STATUS_LABELS[contract.status]}</span>
            <dl className="mt-4 grid gap-3 text-sm"><div><dt className="font-medium text-slate-600">Template</dt><dd className="mt-1 break-words text-slate-900">{templateNames.get(contract.template_id) ?? "Template indisponível"}</dd></div><div><dt className="font-medium text-slate-600">Atualizado</dt><dd className="mt-1 text-slate-900">{formatContractDate(contract.updated_at)}</dd></div></dl>
          </article>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="min-w-[48rem] w-full divide-y divide-slate-200 text-sm">
          <caption className="sr-only">Lista de Contratos autorizados</caption>
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr><th scope="col" className="px-4 py-3">Contrato</th><th scope="col" className="px-4 py-3">Cliente</th><th scope="col" className="px-4 py-3">Template</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-4 py-3">Atualizado</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((contract) => (
              <tr key={contract.id}>
                <th scope="row" className="px-4 py-4 text-left font-semibold text-slate-950"><Link className="text-blue-700 hover:underline" href={`/contratos/${contract.id}`}>{contract.title}</Link></th>
                <td className="px-4 py-4 text-slate-700">{clientNames.get(contract.client_id) ?? "Cliente indisponível"}</td>
                <td className="px-4 py-4 text-slate-700">{templateNames.get(contract.template_id) ?? "Template indisponível"}</td>
                <td className="px-4 py-4"><span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{CONTRACT_STATUS_LABELS[contract.status]}</span></td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatContractDate(contract.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}
