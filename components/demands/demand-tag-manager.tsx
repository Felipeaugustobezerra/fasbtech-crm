"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { setDemandTagsAction } from "@/app/(private)/demandas/actions";
import type { DemandTagSummary } from "@/types/demand";

type Props = Readonly<{
  demandId: string;
  currentTags: DemandTagSummary[];
}>;

export function DemandTagManager({ demandId, currentTags }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState(currentTags.map(({ id }) => id));
  const [newTagName, setNewTagName] = useState("");
  const [newTagNames, setNewTagNames] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function toggleTag(tagId: string) {
    setSelectedIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  }

  function addTag() {
    const trimmedName = newTagName.trim();
    if (!trimmedName || newTagNames.includes(trimmedName)) return;
    setNewTagNames((current) => [...current, trimmedName]);
    setNewTagName("");
  }

  function handleNewTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);
    setIsError(false);

    try {
      const result = await setDemandTagsAction({
        demand_id: demandId,
        existing_tag_ids: selectedIds,
        new_tag_names: newTagNames,
      });

      if (!result.success) {
        setIsError(true);
        setMessage(result.error.message);
        return;
      }

      setMessage("Tags atualizadas.");
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
        <legend className="font-semibold text-slate-950">Gerir Tags</legend>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Preserve ou remova Tags desta Demanda e adicione novos nomes. Não existe
          catálogo global nesta Sprint.
        </p>

        {currentTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentTags.map((tag) => (
              <label
                key={tag.id}
                className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Nenhuma Tag associada.</p>
        )}

        <div className="mt-5">
          <label htmlFor="new-demand-tag" className="text-sm font-medium text-slate-700">
            Novo nome de Tag
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="new-demand-tag"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              onKeyDown={handleNewTagKeyDown}
              className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={addTag}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
            >
              Adicionar Tag
            </button>
          </div>
        </div>

        {newTagNames.length > 0 ? (
          <ul aria-label="Novas Tags" className="mt-3 flex flex-wrap gap-2">
            {newTagNames.map((name) => (
              <li key={name} className="flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1 text-sm text-blue-800">
                <span>{name}</span>
                <button
                  type="button"
                  onClick={() => setNewTagNames((current) => current.filter((tag) => tag !== name))}
                  className="rounded px-1 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  aria-label={`Remover nova Tag ${name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </fieldset>

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
        {isPending ? "Guardando..." : "Guardar Tags"}
      </button>
    </form>
  );
}
