"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { changeDemandStatusAction } from "@/app/(private)/demandas/actions";
import { DEMAND_STATUS_LABELS } from "@/components/demands/demand-badges";
import { DEMAND_STATUSES, type DemandStatus } from "@/types/demand";

type Props = Readonly<{
  demandId: string;
  currentStatus: DemandStatus;
}>;

export function DemandStatusControl({ demandId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<DemandStatus>(currentStatus);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);
    setIsError(false);

    try {
      const result = await changeDemandStatusAction({
        demand_id: demandId,
        status,
      });

      if (!result.success) {
        setIsError(true);
        setMessage(result.error.message);
        return;
      }

      setMessage("Status atualizado.");
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={isPending}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <label htmlFor="demand-status" className="font-semibold text-slate-950">
        Alterar Status
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <select
          id="demand-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as DemandStatus)}
          disabled={isPending}
          className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
        >
          {DEMAND_STATUSES.map((option) => (
            <option key={option} value={option}>
              {DEMAND_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending || status === currentStatus}
          className="min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Atualizando..." : "Atualizar Status"}
        </button>
      </div>
      {message ? (
        <p
          role={isError ? "alert" : "status"}
          aria-live="polite"
          className={`mt-3 text-sm ${isError ? "text-red-700" : "text-emerald-700"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
