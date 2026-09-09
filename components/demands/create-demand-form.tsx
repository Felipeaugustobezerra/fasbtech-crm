"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createDemandAction, getEligibleDemandAssigneesAction } from "@/app/(private)/demandas/actions";
import { createDemandSchema, type CreateDemandInput } from "@/schemas/demand";
import type { EligibleDemandAssignee } from "@/types/demand";

type Values = z.input<typeof createDemandSchema>;
type ClientOption = Readonly<{ id: string; name: string }>;

function FieldError({ id, message }: Readonly<{ id: string; message?: string }>) {
  return message ? <span id={id} className="mt-1 block text-sm text-red-700">{message}</span> : null;
}

export function CreateDemandForm({ clients }: Readonly<{ clients: ClientOption[] }>) {
  const router = useRouter();
  const [assignees, setAssignees] = useState<EligibleDemandAssignee[]>([]);
  const [assigneesError, setAssigneesError] = useState<string | null>(null);
  const [isLoadingAssignees, setIsLoadingAssignees] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [clientId, setClientId] = useState("");
  const { register, handleSubmit, setValue, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<Values, unknown, CreateDemandInput>({
    resolver: zodResolver(createDemandSchema),
    defaultValues: { client_id: "", title: "", description: "", priority: "MEDIUM", start_date: "", due_date: "", notes: "", assignee_membership_ids: [] },
  });
  async function loadAssignees(nextClientId: string) {
    setClientId(nextClientId);
    setValue("assignee_membership_ids", []);
    setAssignees([]);
    setAssigneesError(null);
    if (!nextClientId) {
      setIsLoadingAssignees(false);
      return;
    }
    setIsLoadingAssignees(true);
    const result = await getEligibleDemandAssigneesAction(nextClientId);
    if (result.success) setAssignees(result.data.assignees);
    else setAssigneesError(result.error.message);
    setIsLoadingAssignees(false);
  }

  function fieldError(name: keyof CreateDemandInput) {
    const message = errors[name]?.message;
    return typeof message === "string" ? message : undefined;
  }

  async function onSubmit(values: CreateDemandInput) {
    setFormError(null);
    clearErrors();
    try {
      const result = await createDemandAction(values);
      if (!result.success) {
        const fields: (keyof CreateDemandInput)[] = ["client_id", "title", "description", "priority", "start_date", "due_date", "notes", "assignee_membership_ids"];
        let hasFieldError = false;
        for (const field of fields) {
          const message = result.error.fieldErrors?.[field]?.[0];
          if (message) { hasFieldError = true; setError(field, { type: "server", message }); }
        }
        if (!hasFieldError) setFormError(result.error.message);
        return;
      }
      router.push("/demandas");
      router.refresh();
    } catch {
      setFormError("Ocorreu um erro inesperado. Tente novamente.");
    }
  }

  const inputClass = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
  return <form onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting} className="space-y-6">
    <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><legend className="px-1 text-base font-semibold text-slate-950">Identificação</legend><div className="mt-3 grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">Cliente <span className="text-red-700" aria-hidden="true">*</span><select disabled={isLoadingAssignees} aria-invalid={Boolean(fieldError("client_id"))} aria-describedby={fieldError("client_id") ? "client-id-error" : undefined} className={inputClass} {...register("client_id", { onChange: (event) => void loadAssignees(event.target.value) })}><option value="">Selecione um Cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select>{fieldError("client_id") ? <span id="client-id-error" className="mt-1 block text-sm text-red-700">{fieldError("client_id")}</span> : null}</label>
      <label className="text-sm font-medium text-slate-700">Título <span className="text-red-700" aria-hidden="true">*</span><input aria-invalid={Boolean(fieldError("title"))} aria-describedby={fieldError("title") ? "title-error" : undefined} className={inputClass} {...register("title")} />{fieldError("title") ? <span id="title-error" className="mt-1 block text-sm text-red-700">{fieldError("title")}</span> : null}</label>
      <label className="text-sm font-medium text-slate-700 sm:col-span-2">Descrição<textarea rows={4} aria-invalid={Boolean(fieldError("description"))} aria-describedby={fieldError("description") ? "description-error" : undefined} className={`${inputClass} py-3`} {...register("description")} /><FieldError id="description-error" message={fieldError("description")} /></label>
      <label className="text-sm font-medium text-slate-700">Prioridade<select aria-invalid={Boolean(fieldError("priority"))} aria-describedby={fieldError("priority") ? "priority-error" : undefined} className={inputClass} {...register("priority")}><option value="LOW">Baixa</option><option value="MEDIUM">Média</option><option value="HIGH">Alta</option><option value="URGENT">Urgente</option></select><FieldError id="priority-error" message={fieldError("priority")} /></label>
      <div />
      <label className="text-sm font-medium text-slate-700">Data de início<input type="date" aria-invalid={Boolean(fieldError("start_date"))} aria-describedby={fieldError("start_date") ? "start-date-error" : undefined} className={inputClass} {...register("start_date")} /><FieldError id="start-date-error" message={fieldError("start_date")} /></label>
      <label className="text-sm font-medium text-slate-700">Prazo<input type="date" aria-invalid={Boolean(fieldError("due_date"))} aria-describedby={fieldError("due_date") ? "due-date-error" : undefined} className={inputClass} {...register("due_date")} /><FieldError id="due-date-error" message={fieldError("due_date")} /></label>
      <label className="text-sm font-medium text-slate-700 sm:col-span-2">Observações<textarea rows={4} aria-invalid={Boolean(fieldError("notes"))} aria-describedby={fieldError("notes") ? "notes-error" : undefined} className={`${inputClass} py-3`} {...register("notes")} /><FieldError id="notes-error" message={fieldError("notes")} /></label>
    </div></fieldset>
    <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><legend className="px-1 text-base font-semibold text-slate-950">Responsáveis</legend><p className="mt-2 text-sm text-slate-600">Opcional. As opções dependem do Cliente selecionado.</p>
      <div className="mt-4 space-y-3" aria-describedby={fieldError("assignee_membership_ids") ? "assignees-error" : undefined}>{!clientId ? <p className="text-sm text-slate-500">Selecione um Cliente para carregar responsáveis.</p> : isLoadingAssignees ? <p role="status" className="text-sm text-slate-600">A carregar responsáveis...</p> : assigneesError ? <p role="alert" className="text-sm text-red-700">{assigneesError}</p> : assignees.length === 0 ? <p className="text-sm text-slate-500">Nenhum responsável elegível para este Cliente.</p> : assignees.map((assignee) => <label key={assignee.membership_id} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"><input type="checkbox" value={assignee.membership_id} {...register("assignee_membership_ids")} /><span>{assignee.full_name} <span className="text-xs text-slate-500">({assignee.role})</span></span></label>)}</div><FieldError id="assignees-error" message={fieldError("assignee_membership_ids")} />
    </fieldset>
    <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Tags poderão ser adicionadas no detalhe da Demanda.</p>
    {formError ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p> : null}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/demandas" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">Cancelar</Link><button type="submit" disabled={isSubmitting || isLoadingAssignees} className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Criando..." : "Criar Demanda"}</button></div>
  </form>;
}
