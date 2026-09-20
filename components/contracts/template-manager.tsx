"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  activateContractTemplateAction,
  createContractTemplateAction,
  deactivateContractTemplateAction,
  updateContractTemplateAction,
} from "@/app/(private)/contratos/actions";
import type { ContractTemplateOption } from "@/lib/contracts/options";

const inputClass = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-950";

export function TemplateManager({ templates }: Readonly<{ templates: ContractTemplateOption[] }>) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(operation: () => Promise<{ success: boolean; error?: { message: string } }>) {
    setPending(true); setMessage(null);
    const result = await operation();
    setPending(false);
    if (!result.success) { setMessage(result.error?.message ?? "Não foi possível guardar."); return; }
    router.refresh();
  }

  return <div className="space-y-6"><form onSubmit={(event) => { event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); void run(() => createContractTemplateAction({ name: form.get("name"), content: form.get("content") })).then(() => element.reset()); }} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-semibold text-slate-950">Novo Template</h2><div className="mt-4 grid gap-4"><label className="text-sm font-medium text-slate-700">Nome<input required name="name" className={inputClass} /></label><label className="text-sm font-medium text-slate-700">Conteúdo<textarea required name="content" rows={8} className={`${inputClass} py-3 font-mono`} /></label></div><button disabled={pending} className="mt-4 min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-60">Criar Template</button></form>
    {message ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p> : null}
    <section aria-labelledby="templates-list" className="space-y-4"><h2 id="templates-list" className="text-xl font-semibold text-slate-950">Templates existentes</h2>{templates.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">Nenhum Template criado.</p> : templates.map((template) => <form key={template.id} onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void run(() => updateContractTemplateAction({ template_id: template.id, name: form.get("name"), content: form.get("content") })); }} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4"><div className="flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${template.is_active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{template.is_active ? "Ativo" : "Inativo"}</span><button type="button" disabled={pending} onClick={() => void run(() => template.is_active ? deactivateContractTemplateAction({ template_id: template.id }) : activateContractTemplateAction({ template_id: template.id }))} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">{template.is_active ? "Desativar" : "Ativar"}</button></div><label className="text-sm font-medium text-slate-700">Nome<input name="name" defaultValue={template.name} className={inputClass} /></label><label className="text-sm font-medium text-slate-700">Conteúdo<textarea name="content" rows={8} defaultValue={template.content} className={`${inputClass} py-3 font-mono`} /></label><button disabled={pending} className="min-h-11 self-start rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">Guardar alterações</button></div></form>)}</section>
  </div>;
}
