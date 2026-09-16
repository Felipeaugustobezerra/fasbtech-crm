"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createFinancialEntryAction, updateFinancialEntryAction } from "@/app/(private)/financeiro/actions";
import { FINANCIAL_PAYMENT_NATURE_LABELS, FINANCIAL_TYPE_LABELS } from "@/components/financial/financial-format";
import { createFinancialEntrySchema, updateFinancialEntrySchema, type CreateFinancialEntryInput } from "@/schemas/financial";
import { FINANCIAL_PAYMENT_NATURES, FINANCIAL_TYPES } from "@/types/financial";

type Values = z.input<typeof createFinancialEntrySchema>;
type ClientOption = { id: string; name: string };
type Props = Readonly<{
  mode: "create" | "edit";
  entryId?: string;
  clients: ClientOption[];
  initialValues?: Values;
}>;

const fields: (keyof CreateFinancialEntryInput)[] = ["type", "description", "amount", "reference_date", "client_id", "payment_nature", "category", "due_date", "notes"];
const inputClass = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export function FinancialEntryForm({ mode, entryId, clients, initialValues }: Props) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const schema = mode === "create" ? createFinancialEntrySchema : updateFinancialEntrySchema;
  const { register, handleSubmit, clearErrors, setError, formState: { errors, isSubmitting } } = useForm<Values, unknown, CreateFinancialEntryInput>({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? { type: "INCOME", description: "", amount: "", reference_date: "", client_id: "", payment_nature: "ONE_TIME", category: "", due_date: "", notes: "" },
  });

  function fieldError(field: keyof CreateFinancialEntryInput) {
    const message = errors[field]?.message;
    return typeof message === "string" ? message : undefined;
  }

  async function onSubmit(values: CreateFinancialEntryInput) {
    setFormError(null);
    clearErrors();
    try {
      const result = mode === "create"
        ? await createFinancialEntryAction(values)
        : await updateFinancialEntryAction(entryId ?? "", values);
      if (!result.success) {
        let hasFieldError = false;
        for (const field of fields) {
          const message = result.error.fieldErrors?.[field]?.[0];
          if (message) { hasFieldError = true; setError(field, { type: "server", message }); }
        }
        if (!hasFieldError) setFormError(result.error.message);
        return;
      }
      router.push(`/financeiro/${result.data.financialEntryId}`);
      router.refresh();
    } catch {
      setFormError("Ocorreu um erro inesperado. Tente novamente.");
    }
  }

  return <form onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting} className="space-y-6"><fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><legend className="px-1 text-base font-semibold text-slate-950">Dados da movimentação</legend><div className="mt-3 grid gap-5 sm:grid-cols-2">
    <label className="text-sm font-medium text-slate-700">Tipo<select className={inputClass} {...register("type")}>{FINANCIAL_TYPES.map((v) => <option key={v} value={v}>{FINANCIAL_TYPE_LABELS[v]}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Natureza<select className={inputClass} {...register("payment_nature")}>{FINANCIAL_PAYMENT_NATURES.map((v) => <option key={v} value={v}>{FINANCIAL_PAYMENT_NATURE_LABELS[v]}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700 sm:col-span-2">Descrição <span className="text-red-700" aria-hidden="true">*</span><input className={inputClass} aria-invalid={Boolean(fieldError("description"))} {...register("description")} />{fieldError("description") ? <span className="mt-1 block text-sm text-red-700">{fieldError("description")}</span> : null}</label>
    <label className="text-sm font-medium text-slate-700">Valor (EUR) <span className="text-red-700" aria-hidden="true">*</span><input inputMode="decimal" placeholder="0.00" className={inputClass} aria-invalid={Boolean(fieldError("amount"))} {...register("amount")} />{fieldError("amount") ? <span className="mt-1 block text-sm text-red-700">{fieldError("amount")}</span> : null}</label>
    <label className="text-sm font-medium text-slate-700">Data de referência <span className="text-red-700" aria-hidden="true">*</span><input type="date" className={inputClass} aria-invalid={Boolean(fieldError("reference_date"))} {...register("reference_date")} />{fieldError("reference_date") ? <span className="mt-1 block text-sm text-red-700">{fieldError("reference_date")}</span> : null}</label>
    <label className="text-sm font-medium text-slate-700">Cliente<select className={inputClass} {...register("client_id")}><option value="">Sem Cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
    <label className="text-sm font-medium text-slate-700">Categoria<input className={inputClass} {...register("category")} /></label>
    <label className="text-sm font-medium text-slate-700">Vencimento<input type="date" className={inputClass} {...register("due_date")} /></label><div aria-hidden="true" />
    <label className="text-sm font-medium text-slate-700 sm:col-span-2">Observações<textarea rows={4} className={`${inputClass} py-3`} {...register("notes")} /></label>
  </div></fieldset>{formError ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{formError}</p> : null}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href={entryId ? `/financeiro/${entryId}` : "/financeiro"} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">Cancelar</Link><button type="submit" disabled={isSubmitting} className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Guardando..." : mode === "create" ? "Criar movimentação" : "Guardar alterações"}</button></div></form>;
}
