"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { removeClientAccessAction } from "@/app/(private)/acessos/actions";

type RemoveClientAccessProps = Readonly<{
  clientId: string;
  membershipId: string;
  fullName: string;
}>;

export function RemoveClientAccess({
  clientId,
  membershipId,
  fullName,
}: RemoveClientAccessProps) {
  const router = useRouter();
  const confirmationId = useId();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleRemove() {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const result = await removeClientAccessAction(clientId, membershipId);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setIsConfirming(false);
      setSuccessMessage("Acesso removido com sucesso.");
      router.refresh();
    } catch {
      setError("Não foi possível remover o acesso. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        aria-label={`Remover acesso de ${fullName}`}
        aria-expanded={isConfirming}
        aria-controls={confirmationId}
        disabled={isSubmitting}
        onClick={() => {
          setError(null);
          setSuccessMessage(null);
          setIsConfirming(true);
        }}
        className="min-h-10 rounded-lg border border-red-300 bg-white px-3.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Remover acesso
      </button>

      {isConfirming ? (
        <div
          id={confirmationId}
          className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <p className="font-semibold text-amber-950">
            Remover o acesso de {fullName}?
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            O utilizador deixará de possuir este acesso ao Cliente.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              aria-label={`Cancelar remoção do acesso de ${fullName}`}
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
              aria-label={`Confirmar remoção do acesso de ${fullName}`}
              disabled={isSubmitting}
              onClick={handleRemove}
              className="min-h-10 rounded-lg bg-red-700 px-3.5 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Removendo..." : "Confirmar remoção"}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p
          role="status"
          className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {successMessage}
        </p>
      ) : null}
    </div>
  );
}
