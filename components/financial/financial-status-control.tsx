"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { changeFinancialEntryStatusAction } from "@/app/(private)/financeiro/actions";
import { FINANCIAL_STATUS_LABELS } from "@/components/financial/financial-format";
import { FINANCIAL_STATUSES, type FinancialStatus } from "@/types/financial";

export function FinancialStatusControl({ entryId, currentStatus, currentRealizedDate }: Readonly<{ entryId: string; currentStatus: FinancialStatus; currentRealizedDate: string | null }>) {
  const router = useRouter();
  const [status, setStatus] = useState<FinancialStatus>(currentStatus);
  const [realizedDate, setRealizedDate] = useState(currentRealizedDate ?? "");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setFeedback(null);
    try {
      const result = await changeFinancialEntryStatusAction({ entry_id: entryId, status, realized_date: status === "REALIZED" ? realizedDate : null });
      if (!result.success) { setFeedback({ error: true, text: result.error.fieldErrors?.realized_date?.[0] ?? result.error.message }); return; }
      setFeedback({ error: false, text: "Status atualizado." }); router.refresh();
    } catch { setFeedback({ error: true, text: "Ocorreu um erro inesperado. Tente novamente." }); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} aria-busy={pending} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-950">Alterar Status</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm text-slate-700">Status<select value={status} onChange={(e) => setStatus(e.target.value as FinancialStatus)} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5">{FINANCIAL_STATUSES.map((v) => <option key={v} value={v}>{FINANCIAL_STATUS_LABELS[v]}</option>)}</select></label>{status === "REALIZED" ? <label className="text-sm text-slate-700">Data de realização<input required type="date" value={realizedDate} onChange={(e) => setRealizedDate(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 px-3.5" /></label> : null}</div><button disabled={pending || (status === currentStatus && (status !== "REALIZED" || realizedDate === (currentRealizedDate ?? "")))} className="mt-4 min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Atualizando..." : "Atualizar Status"}</button>{feedback ? <p role={feedback.error ? "alert" : "status"} className={`mt-3 text-sm ${feedback.error ? "text-red-700" : "text-emerald-700"}`}>{feedback.text}</p> : null}</form>;
}
