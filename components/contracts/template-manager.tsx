"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const [confirmingTemplateId, setConfirmingTemplateId] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const restoreFocusIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (confirmingTemplateId) confirmRef.current?.focus();
    else if (restoreFocusIdRef.current) {
      triggerRefs.current[restoreFocusIdRef.current]?.focus();
      restoreFocusIdRef.current = null;
    }
  }, [confirmingTemplateId]);

  async function run(operation: () => Promise<{ success: boolean; error?: { message: string } }>) {
    setPending(true);
    setMessage(null);
    try {
      const result = await operation();
      if (!result.success) {
        setMessage(result.error?.message ?? "Não foi possível guardar.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setMessage("Ocorreu um erro inesperado. Tente novamente.");
      return false;
    } finally {
      setPending(false);
    }
  }

  function closeConfirmation() {
    restoreFocusIdRef.current = confirmingTemplateId;
    setConfirmingTemplateId(null);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const element = event.currentTarget;
          const form = new FormData(element);
          void run(() => createContractTemplateAction({ name: form.get("name"), content: form.get("content") }))
            .then((success) => { if (success) element.reset(); });
        }}
        aria-busy={pending}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2 className="text-lg font-semibold text-slate-950">Novo Template</h2>
        <div className="mt-4 grid gap-4">
          <label className="text-sm font-medium text-slate-700">Nome<input required name="name" className={inputClass} /></label>
          <label className="text-sm font-medium text-slate-700">Conteúdo<textarea required name="content" rows={8} className={`${inputClass} py-3 font-mono`} /></label>
        </div>
        <button disabled={pending} className="mt-4 min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-60">Criar Template</button>
      </form>

      {message ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p> : null}

      <section aria-labelledby="templates-list" className="space-y-4">
        <h2 id="templates-list" className="text-xl font-semibold text-slate-950">Templates existentes</h2>
        {templates.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">Nenhum Template criado.</p>
        ) : templates.map((template) => (
          <form
            key={template.id}
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void run(() => updateContractTemplateAction({ template_id: template.id, name: form.get("name"), content: form.get("content") }));
            }}
            aria-busy={pending}
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${template.is_active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{template.is_active ? "Ativo" : "Inativo"}</span>
                <button
                  ref={(node) => { triggerRefs.current[template.id] = node; }}
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (template.is_active) setConfirmingTemplateId(template.id);
                    else void run(() => activateContractTemplateAction({ template_id: template.id }));
                  }}
                  className={`min-h-11 rounded-lg border px-4 text-sm font-semibold ${template.is_active ? "border-red-300 text-red-700" : "border-slate-300 text-slate-700"}`}
                >{template.is_active ? "Desativar" : "Ativar"}</button>
              </div>

              {confirmingTemplateId === template.id ? (
                <div role="group" aria-label={`Confirmar desativação de ${template.name}`} onKeyDown={(event) => { if (event.key === "Escape" && !pending) closeConfirmation(); }} className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="font-semibold text-red-950">Desativar {template.name}?</p>
                  <p className="mt-1 text-sm text-red-900">O Template deixará de estar disponível para novos Contratos. Contratos existentes não mudam.</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button type="button" disabled={pending} onClick={closeConfirmation} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold">Voltar</button>
                    <button ref={confirmRef} type="button" disabled={pending} onClick={() => void run(() => deactivateContractTemplateAction({ template_id: template.id })).then((success) => { if (success) setConfirmingTemplateId(null); })} className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white">Confirmar desativação</button>
                  </div>
                </div>
              ) : null}

              <label className="text-sm font-medium text-slate-700">Nome<input name="name" defaultValue={template.name} className={inputClass} /></label>
              <label className="text-sm font-medium text-slate-700">Conteúdo<textarea name="content" rows={8} defaultValue={template.content} className={`${inputClass} py-3 font-mono`} /></label>
              <button disabled={pending} className="min-h-11 self-start rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white">Guardar alterações</button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
