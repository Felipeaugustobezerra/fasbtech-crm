"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { setDemandAssigneesAction } from "@/app/(private)/demandas/actions";
import type {
  DemandAssignee,
  EligibleDemandAssignee,
} from "@/types/demand";

type Props = Readonly<{
  demandId: string;
  currentAssignees: DemandAssignee[];
  eligibleAssignees: EligibleDemandAssignee[];
}>;

export function DemandAssigneeManager({
  demandId,
  currentAssignees,
  eligibleAssignees,
}: Props) {
  const router = useRouter();
  const eligibleIds = new Set(eligibleAssignees.map(({ membership_id }) => membership_id));
  const historicalAssignees = currentAssignees.filter(
    ({ membership_id, is_currently_eligible }) =>
      !is_currently_eligible || !eligibleIds.has(membership_id),
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentAssignees
      .filter(
        ({ membership_id, is_currently_eligible }) =>
          is_currently_eligible && eligibleIds.has(membership_id),
      )
      .map(({ membership_id }) => membership_id),
  );
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function toggleAssignee(membershipId: string) {
    setSelectedIds((current) =>
      current.includes(membershipId)
        ? current.filter((id) => id !== membershipId)
        : [...current, membershipId],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);
    setIsError(false);

    try {
      const result = await setDemandAssigneesAction({
        demand_id: demandId,
        membership_ids: selectedIds,
      });

      if (!result.success) {
        setIsError(true);
        setMessage(result.error.message);
        return;
      }

      setMessage("Responsáveis atualizados.");
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
      <fieldset disabled={isPending}>
        <legend className="font-semibold text-slate-950">Gerir responsáveis</legend>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Selecione o conjunto completo de responsáveis elegíveis para esta Demanda.
        </p>

        {eligibleAssignees.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Nenhum responsável elegível para este Cliente.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {eligibleAssignees.map((assignee) => (
              <label
                key={assignee.membership_id}
                className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(assignee.membership_id)}
                  onChange={() => toggleAssignee(assignee.membership_id)}
                />
                <span>
                  {assignee.full_name}{" "}
                  <span className="text-xs text-slate-500">({assignee.role})</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {historicalAssignees.length > 0 ? (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-950">Responsáveis históricos</h3>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {historicalAssignees.map((assignee) => (
              <li key={assignee.membership_id}>{assignee.full_name}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Ao guardar, estes vínculos históricos serão removidos porque já não são
            opções elegíveis.
          </p>
        </div>
      ) : null}

      {message ? (
        <p
          role={isError ? "alert" : "status"}
          aria-live="polite"
          className={`mt-4 text-sm ${isError ? "text-red-700" : "text-emerald-700"}`}
        >
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando..." : "Guardar responsáveis"}
      </button>
    </form>
  );
}
