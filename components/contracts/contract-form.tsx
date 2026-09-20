"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  createContractAction,
  updateDraftContractAction,
} from "@/app/(private)/contratos/actions";
import type {
  ContractClientOption,
  ContractTemplateOption,
} from "@/lib/contracts/options";
import type { ContractDraftData } from "@/types/contracts";

type Props = Readonly<{
  mode: "create" | "edit";
  clients: ContractClientOption[];
  templates: ContractTemplateOption[];
  contractId?: string;
  initial?: {
    clientId: string;
    templateId: string;
    title: string;
    draftData: ContractDraftData;
  };
}>;

const inputClass = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export function ContractForm({ mode, clients, templates, contractId, initial }: Props) {
  const router = useRouter();
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [templateId, setTemplateId] = useState(initial?.templateId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const initialContent = typeof initial?.draftData.content === "string" ? initial.draftData.content : "";
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const template = useMemo(() => templates.find((item) => item.id === templateId), [templateId, templates]);

  function chooseTemplate(nextId: string) {
    setTemplateId(nextId);
    const next = templates.find((item) => item.id === nextId);
    if (next && (mode === "create" || content.trim() === "")) setContent(next.content);
    if (next && title.trim() === "") setTitle(next.name);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const input = { client_id: clientId, template_id: templateId, title, draft_data: { ...(initial?.draftData ?? {}), content } };
    const result = mode === "create" ? await createContractAction(input) : await updateDraftContractAction({ contract_id: contractId, ...input });
    setPending(false);
    if (!result.success) { setError(result.error.message); return; }
    router.push(`/contratos/${result.data.contractId}`);
    router.refresh();
  }

  return <form onSubmit={submit} className="space-y-6"><fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><legend className="px-1 text-base font-semibold text-slate-950">Preparação do Contrato</legend><div className="mt-3 grid gap-5 sm:grid-cols-2">
    <label className="text-sm font-medium text-slate-700">Template <span className="text-red-700" aria-hidden="true">*</span><select required className={inputClass} value={templateId} onChange={(event) => chooseTemplate(event.target.value)}><option value="">Selecione um Template ativo</option>{templates.map((item) => <option key={item.id} value={item.id} disabled={!item.is_active}>{item.name}{item.is_active ? "" : " (inativo)"}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Cliente <span className="text-red-700" aria-hidden="true">*</span><select required className={inputClass} value={clientId} onChange={(event) => setClientId(event.target.value)}><option value="">Selecione um Cliente</option>{clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700 sm:col-span-2">Título <span className="text-red-700" aria-hidden="true">*</span><input required className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
    <label className="text-sm font-medium text-slate-700 sm:col-span-2">Conteúdo final em preparação <span className="text-red-700" aria-hidden="true">*</span><textarea required rows={16} className={`${inputClass} py-3 font-mono leading-6`} value={content} onChange={(event) => setContent(event.target.value)} /><span className="mt-2 block text-xs font-normal text-slate-500">O conteúdo poderá ser revisto enquanto o Contrato estiver em rascunho. {template ? `Base atual: ${template.name}.` : ""}</span></label>
  </div></fieldset>{error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={contractId ? `/contratos/${contractId}` : "/contratos"} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Cancelar</Link><button disabled={pending} className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Guardando..." : mode === "create" ? "Criar rascunho" : "Guardar rascunho"}</button></div></form>;
}
