"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  cancelContractAction,
  generateContractAction,
  markContractSentAction,
  markContractSignedAction,
} from "@/app/(private)/contratos/actions";
import type { ContractSnapshot, ContractStatus } from "@/types/contracts";

export function ContractLifecycle({ contractId, status, snapshot, defaultEmail }: Readonly<{ contractId: string; status: ContractStatus; snapshot: ContractSnapshot; defaultEmail?: string | null }>) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const cancelTriggerRef = useRef<HTMLButtonElement>(null);
  const confirmCancelRef = useRef<HTMLButtonElement>(null);
  const restoreCancelFocusRef = useRef(false);

  useEffect(() => {
    if (confirmingCancel) confirmCancelRef.current?.focus();
    else if (restoreCancelFocusRef.current) {
      cancelTriggerRef.current?.focus();
      restoreCancelFocusRef.current = false;
    }
  }, [confirmingCancel]);

  async function run(name: string, operation: () => Promise<{ success: boolean; error?: { message: string } }>) {
    setPending(name); setMessage(null);
    try { const result = await operation(); if (!result.success) { setMessage(result.error?.message ?? "Não foi possível concluir a operação."); return; } router.refresh(); }
    catch { setMessage("Ocorreu um erro inesperado. Tente novamente."); }
    finally { setPending(null); }
  }

  if (status === "SIGNED" || status === "CANCELED") return <p role="status" className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">Este Contrato encontra-se num estado terminal e está disponível apenas para consulta.</p>;

  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="lifecycle-title"><h2 id="lifecycle-title" className="text-lg font-semibold text-slate-950">Operações</h2><div className="mt-4 space-y-5">
    {status === "DRAFT" ? <div><p className="text-sm text-slate-600">A geração congela conteúdo, Cliente e Template e cria o PDF original privado.</p><button disabled={pending !== null} onClick={() => run("generate", () => generateContractAction({ contract_id: contractId, snapshot }))} className="mt-3 min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-60">{pending === "generate" ? "Gerando..." : "Gerar PDF e concluir"}</button></div> : null}
    {status === "GENERATED" ? <div><label className="text-sm font-medium text-slate-700">Destinatário do e-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-slate-300 px-3.5 sm:max-w-lg" /></label><button disabled={pending !== null || !email} onClick={() => run("send", () => markContractSentAction({ contract_id: contractId, recipient_email: email }))} className="mt-3 min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-60">{pending === "send" ? "Enviando..." : "Enviar PDF por e-mail"}</button></div> : null}
    {status === "SENT" ? <div><label className="text-sm font-medium text-slate-700">Cópia assinada em PDF<input type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:min-h-11 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:font-semibold" /></label><button disabled={pending !== null || !file} onClick={() => file && run("sign", () => markContractSignedAction({ contract_id: contractId, file }))} className="mt-3 min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-60">{pending === "sign" ? "Guardando..." : "Guardar cópia e marcar Assinado"}</button></div> : null}
    {(status === "GENERATED" || status === "SENT") ? <div className="border-t border-slate-200 pt-5"><p className="text-sm text-slate-600">O cancelamento preserva snapshot, documentos e histórico.</p>{confirmingCancel ? <div id="contract-cancel-confirmation" role="group" aria-label="Confirmar cancelamento do Contrato" onKeyDown={(event) => { if (event.key === "Escape" && pending === null) { restoreCancelFocusRef.current = true; setConfirmingCancel(false); } }} className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4"><p className="font-semibold text-red-950">Cancelar este Contrato?</p><p className="mt-1 text-sm text-red-900">Esta ação encerra o Contrato e não pode ser revertida.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={pending !== null} onClick={() => { restoreCancelFocusRef.current = true; setConfirmingCancel(false); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">Voltar</button><button ref={confirmCancelRef} type="button" disabled={pending !== null} onClick={() => run("cancel", () => cancelContractAction({ contract_id: contractId }))} className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white disabled:opacity-60">{pending === "cancel" ? "Cancelando..." : "Confirmar cancelamento"}</button></div></div> : <button ref={cancelTriggerRef} type="button" aria-expanded={false} aria-controls="contract-cancel-confirmation" disabled={pending !== null} onClick={() => setConfirmingCancel(true)} className="mt-3 min-h-11 rounded-lg border border-red-300 px-4 text-sm font-semibold text-red-700 disabled:opacity-60">Cancelar Contrato</button>}</div> : null}
    {message ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p> : null}
  </div></section>;
}
