"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const templateRef = useRef<HTMLSelectElement>(null);
  const clientRef = useRef<HTMLSelectElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const template = useMemo(() => templates.find((item) => item.id === templateId), [templateId, templates]);

  useEffect(() => {
    if (fieldErrors.template_id?.length) templateRef.current?.focus();
    else if (fieldErrors.client_id?.length) clientRef.current?.focus();
    else if (fieldErrors.title?.length) titleRef.current?.focus();
    else if (fieldErrors.draft_data?.length) contentRef.current?.focus();
  }, [fieldErrors]);

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
    setFieldErrors({});
    const input = { client_id: clientId, template_id: templateId, title, draft_data: { ...(initial?.draftData ?? {}), content } };
    const result = mode === "create" ? await createContractAction(input) : await updateDraftContractAction({ contract_id: contractId, ...input });
    setPending(false);
    if (!result.success) { setFieldErrors(result.error.fieldErrors ?? {}); setError(result.error.message); return; }
    router.push(`/contratos/${result.data.contractId}`);
    router.refresh();
  }

  return <form onSubmit={submit} noValidate aria-busy={pending} className="space-y-6"><fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><legend className="px-1 text-base font-semibold text-slate-950">Preparação do Contrato</legend><div className="mt-3 grid gap-5 sm:grid-cols-2">
    <label className="text-sm font-medium text-slate-700">Template <span className="text-red-700" aria-hidden="true">*</span><select ref={templateRef} required aria-invalid={Boolean(fieldErrors.template_id?.length)} aria-describedby={fieldErrors.template_id?.length ? "contract-template-error" : undefined} className={inputClass} value={templateId} onChange={(event) => chooseTemplate(event.target.value)}><option value="">Selecione um Template ativo</option>{templates.map((item) => <option key={item.id} value={item.id} disabled={!item.is_active}>{item.name}{item.is_active ? "" : " (inativo)"}</option>)}</select>{fieldErrors.template_id?.[0] ? <span id="contract-template-error" className="mt-1 block text-sm text-red-700">{fieldErrors.template_id[0]}</span> : null}</label>
    <label className="text-sm font-medium text-slate-700">Cliente <span className="text-red-700" aria-hidden="true">*</span><select ref={clientRef} required aria-invalid={Boolean(fieldErrors.client_id?.length)} aria-describedby={fieldErrors.client_id?.length ? "contract-client-error" : undefined} className={inputClass} value={clientId} onChange={(event) => setClientId(event.target.value)}><option value="">Selecione um Cliente</option>{clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{fieldErrors.client_id?.[0] ? <span id="contract-client-error" className="mt-1 block text-sm text-red-700">{fieldErrors.client_id[0]}</span> : null}</label>
    <label className="text-sm font-medium text-slate-700 sm:col-span-2">Título <span className="text-red-700" aria-hidden="true">*</span><input ref={titleRef} required aria-invalid={Boolean(fieldErrors.title?.length)} aria-describedby={fieldErrors.title?.length ? "contract-title-error" : undefined} className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} />{fieldErrors.title?.[0] ? <span id="contract-title-error" className="mt-1 block text-sm text-red-700">{fieldErrors.title[0]}</span> : null}</label>
    <label className="text-sm font-medium text-slate-700 sm:col-span-2">Conteúdo final em preparação <span className="text-red-700" aria-hidden="true">*</span><textarea ref={contentRef} required aria-invalid={Boolean(fieldErrors.draft_data?.length)} aria-describedby={fieldErrors.draft_data?.length ? "contract-content-error" : "contract-content-help"} rows={16} className={`${inputClass} py-3 font-mono leading-6`} value={content} onChange={(event) => setContent(event.target.value)} /><span id="contract-content-help" className="mt-2 block text-xs font-normal text-slate-500">O conteúdo poderá ser revisto enquanto o Contrato estiver em rascunho. {template ? `Base atual: ${template.name}.` : ""}</span>{fieldErrors.draft_data?.[0] ? <span id="contract-content-error" className="mt-1 block text-sm text-red-700">{fieldErrors.draft_data[0]}</span> : null}</label>
  </div></fieldset>{error && !["template_id", "client_id", "title", "draft_data"].some((field) => fieldErrors[field]?.length) ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={contractId ? `/contratos/${contractId}` : "/contratos"} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Cancelar</Link><button disabled={pending} className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Guardando..." : mode === "create" ? "Criar rascunho" : "Guardar rascunho"}</button></div></form>;
}
