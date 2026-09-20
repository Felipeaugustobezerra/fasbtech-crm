import Link from "next/link";

import { CONTRACT_STATUS_LABELS } from "@/components/contracts/contract-format";
import {
  CONTRACTS_PAGE_SIZES,
  CONTRACT_SORT_FIELDS,
  type ContractListParams,
} from "@/schemas/contracts-query";
import { CONTRACT_STATUSES } from "@/types/contracts";

type Option = { id: string; name: string };
const inputClass = "mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 font-normal text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100";
const sortLabels: Record<(typeof CONTRACT_SORT_FIELDS)[number], string> = {
  title: "Título", created_at: "Criação", updated_at: "Atualização", generated_at: "Geração", sent_at: "Envio", signed_at: "Assinatura",
};

export function ContractToolbar({ params, clients, templates }: Readonly<{ params: ContractListParams; clients: Option[]; templates: Option[] }>) {
  return <form action="/contratos" method="get" aria-label="Pesquisar e filtrar Contratos" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><input type="hidden" name="page" value="1" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <label className="text-sm font-medium text-slate-700">Pesquisar<input name="search" type="search" defaultValue={params.search} placeholder="Título" className={inputClass} /></label>
    <label className="text-sm font-medium text-slate-700">Status<select name="status" defaultValue={params.status ?? ""} className={inputClass}><option value="">Todos</option>{CONTRACT_STATUSES.map((status) => <option key={status} value={status}>{CONTRACT_STATUS_LABELS[status]}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Cliente<select name="clientId" defaultValue={params.clientId ?? ""} className={inputClass}><option value="">Todos</option>{clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Template<select name="templateId" defaultValue={params.templateId ?? ""} className={inputClass}><option value="">Todos</option>{templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Ordenar por<select name="sort" defaultValue={params.sort} className={inputClass}>{CONTRACT_SORT_FIELDS.map((sort) => <option key={sort} value={sort}>{sortLabels[sort]}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Direção<select name="direction" defaultValue={params.direction} className={inputClass}><option value="desc">Mais recentes</option><option value="asc">Mais antigos</option></select></label>
    <label className="text-sm font-medium text-slate-700">Por página<select name="pageSize" defaultValue={params.pageSize} className={inputClass}>{CONTRACTS_PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
  </div><div className="mt-4 flex flex-wrap gap-3"><button className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">Aplicar filtros</button><Link href="/contratos" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Limpar</Link></div></form>;
}
