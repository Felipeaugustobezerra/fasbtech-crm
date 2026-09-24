"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { archiveFinancialEntryAction } from "@/app/(private)/financeiro/actions";

export function FinancialArchive({ entryId, description }: Readonly<{ entryId: string; description: string }>) {
  const router = useRouter(); const [confirming, setConfirming] = useState(false); const [pending, setPending] = useState(false); const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (confirming) confirmRef.current?.focus(); }, [confirming]);
  function closeConfirmation() { setConfirming(false); requestAnimationFrame(() => triggerRef.current?.focus()); }
  async function archive() { setPending(true); setError(null); try { const result = await archiveFinancialEntryAction({ entry_id: entryId }); if (!result.success) { setError(result.error.message); return; } router.push("/financeiro"); router.refresh(); } catch { setError("Ocorreu um erro inesperado. Tente novamente."); } finally { setPending(false); } }
  return <section aria-labelledby="archive-entry-title" className="rounded-xl border border-red-200 bg-white p-5 shadow-sm"><h2 id="archive-entry-title" className="font-semibold text-slate-950">Arquivar movimentação</h2><p className="mt-2 text-sm leading-6 text-slate-600">A movimentação deixará a listagem operacional, mas será preservada. Arquivar não altera nem cancela o Status financeiro.</p>{confirming ? <div role="group" aria-label={`Confirmar arquivamento de ${description}`} onKeyDown={(event) => { if (event.key === "Escape" && !pending) closeConfirmation(); }} className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-900">Confirma o arquivamento de <strong>{description}</strong>?</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={closeConfirmation} disabled={pending} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold">Voltar</button><button ref={confirmRef} type="button" onClick={() => void archive()} disabled={pending} className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white">{pending ? "Arquivando..." : "Confirmar arquivamento"}</button></div></div> : <button ref={triggerRef} type="button" onClick={() => setConfirming(true)} className="mt-4 min-h-11 rounded-lg border border-red-300 px-4 text-sm font-semibold text-red-700">Arquivar movimentação</button>}{error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}</section>;
}
