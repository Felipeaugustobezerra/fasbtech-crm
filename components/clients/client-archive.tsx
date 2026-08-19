"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { archiveClientAction } from "@/app/(private)/clientes/actions";

type ClientArchiveProps = Readonly<{
  clientId: string;
  clientName: string;
}>;

export function ClientArchive({ clientId, clientName }: ClientArchiveProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleArchive() {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await archiveClientAction(clientId);

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.push("/clientes");
    } catch {
      setError("Não foi possível arquivar o Cliente. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="archive-client-title"
      className="rounded-xl border border-red-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2
        id="archive-client-title"
        className="text-lg font-semibold text-slate-950"
      >
        Arquivar Cliente
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        O Cliente deixará de aparecer na listagem operacional, mas o seu
        histórico será preservado.
      </p>

      <button
        type="button"
        aria-expanded={isConfirming}
        aria-controls="archive-client-confirmation"
        disabled={isSubmitting}
        onClick={() => {
          setError(null);
          setIsConfirming(true);
        }}
        className="mt-5 min-h-11 rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Arquivar Cliente
      </button>

      {isConfirming ? (
        <div
          id="archive-client-confirmation"
          className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <p className="font-semibold text-amber-950">Arquivar {clientName}?</p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            Esta ação não apaga o Cliente, mas remove-o da listagem padrão.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setError(null);
                setIsConfirming(false);
              }}
              className="min-h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleArchive}
              className="min-h-10 rounded-lg bg-red-700 px-3.5 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Arquivando..." : "Confirmar arquivamento"}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
