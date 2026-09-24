"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { archiveDemandAction } from "@/app/(private)/demandas/actions";

type Props = Readonly<{
  demandId: string;
  demandTitle: string;
}>;

export function DemandArchive({ demandId, demandTitle }: Props) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isConfirming) confirmRef.current?.focus();
  }, [isConfirming]);

  function closeConfirmation() {
    setIsConfirming(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  async function archive() {
    setIsPending(true);
    setError(null);

    try {
      const result = await archiveDemandAction({ demand_id: demandId });

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      router.push("/demandas");
      router.refresh();
    } catch {
      setError("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section
      aria-labelledby="archive-demand-title"
      className="rounded-xl border border-red-200 bg-white p-5 shadow-sm"
    >
      <h2 id="archive-demand-title" className="font-semibold text-slate-950">
        Arquivar Demanda
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        A Demanda deixará de aparecer na listagem operacional. Os dados e o histórico
        serão preservados.
      </p>

      {isConfirming ? (
        <div role="group" aria-label={`Confirmar arquivamento de ${demandTitle}`} onKeyDown={(event) => { if (event.key === "Escape" && !isPending) closeConfirmation(); }} className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-900">
            Confirma o arquivamento de <strong>{demandTitle}</strong>?
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={closeConfirmation}
              disabled={isPending}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              ref={confirmRef}
              type="button"
              onClick={() => void archive()}
              disabled={isPending}
              className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Arquivando..." : "Confirmar arquivamento"}
            </button>
          </div>
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsConfirming(true)}
          className="mt-4 min-h-11 rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-700"
        >
          Arquivar Demanda
        </button>
      )}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
