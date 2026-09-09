"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateDemandAction } from "@/app/(private)/demandas/actions";
import {
  updateDemandSchema,
  type UpdateDemandInput,
} from "@/schemas/demand";

type Values = z.input<typeof updateDemandSchema>;

type Props = Readonly<{
  demandId: string;
  initialValues: Values;
}>;

const fields: (keyof UpdateDemandInput)[] = [
  "title",
  "description",
  "priority",
  "start_date",
  "due_date",
  "notes",
];

export function DemandEditForm({ demandId, initialValues }: Props) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, UpdateDemandInput>({
    resolver: zodResolver(updateDemandSchema),
    defaultValues: initialValues,
  });

  function fieldError(field: keyof UpdateDemandInput) {
    const message = errors[field]?.message;
    return typeof message === "string" ? message : undefined;
  }

  async function onSubmit(values: UpdateDemandInput) {
    setFormError(null);
    clearErrors();

    try {
      const result = await updateDemandAction(demandId, values);

      if (!result.success) {
        let hasFieldError = false;
        for (const field of fields) {
          const message = result.error.fieldErrors?.[field]?.[0];
          if (message) {
            hasFieldError = true;
            setError(field, { type: "server", message });
          }
        }
        if (!hasFieldError) setFormError(result.error.message);
        return;
      }

      router.push(`/demandas/${result.data.demandId}`);
      router.refresh();
    } catch {
      setFormError("Ocorreu um erro inesperado. Tente novamente.");
    }
  }

  const inputClass =
    "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="space-y-6"
    >
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <legend className="px-1 text-base font-semibold text-slate-950">
          Dados editáveis
        </legend>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Título <span className="text-red-700" aria-hidden="true">*</span>
            <input
              className={inputClass}
              aria-invalid={Boolean(fieldError("title"))}
              aria-describedby={fieldError("title") ? "edit-title-error" : undefined}
              {...register("title")}
            />
            {fieldError("title") ? (
              <span id="edit-title-error" className="mt-1 block text-sm text-red-700">
                {fieldError("title")}
              </span>
            ) : null}
          </label>

          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Descrição
            <textarea
              rows={5}
              className={`${inputClass} py-3`}
              aria-invalid={Boolean(fieldError("description"))}
              aria-describedby={fieldError("description") ? "edit-description-error" : undefined}
              {...register("description")}
            />
            {fieldError("description") ? (
              <span id="edit-description-error" className="mt-1 block text-sm text-red-700">
                {fieldError("description")}
              </span>
            ) : null}
          </label>

          <label className="text-sm font-medium text-slate-700">
            Prioridade
            <select
              className={inputClass}
              aria-invalid={Boolean(fieldError("priority"))}
              aria-describedby={fieldError("priority") ? "edit-priority-error" : undefined}
              {...register("priority")}
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
            {fieldError("priority") ? (
              <span id="edit-priority-error" className="mt-1 block text-sm text-red-700">
                {fieldError("priority")}
              </span>
            ) : null}
          </label>

          <div aria-hidden="true" />

          <label className="text-sm font-medium text-slate-700">
            Data de início
            <input
              type="date"
              className={inputClass}
              aria-invalid={Boolean(fieldError("start_date"))}
              aria-describedby={fieldError("start_date") ? "edit-start-date-error" : undefined}
              {...register("start_date")}
            />
            {fieldError("start_date") ? (
              <span id="edit-start-date-error" className="mt-1 block text-sm text-red-700">
                {fieldError("start_date")}
              </span>
            ) : null}
          </label>

          <label className="text-sm font-medium text-slate-700">
            Prazo
            <input
              type="date"
              className={inputClass}
              aria-invalid={Boolean(fieldError("due_date"))}
              aria-describedby={fieldError("due_date") ? "edit-due-date-error" : undefined}
              {...register("due_date")}
            />
            {fieldError("due_date") ? (
              <span id="edit-due-date-error" className="mt-1 block text-sm text-red-700">
                {fieldError("due_date")}
              </span>
            ) : null}
          </label>

          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Observações
            <textarea
              rows={4}
              className={`${inputClass} py-3`}
              aria-invalid={Boolean(fieldError("notes"))}
              aria-describedby={fieldError("notes") ? "edit-notes-error" : undefined}
              {...register("notes")}
            />
            {fieldError("notes") ? (
              <span id="edit-notes-error" className="mt-1 block text-sm text-red-700">
                {fieldError("notes")}
              </span>
            ) : null}
          </label>
        </div>
      </fieldset>

      {formError ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/demandas/${demandId}`}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : "Guardar alterações"}
        </button>
      </div>
    </form>
  );
}
