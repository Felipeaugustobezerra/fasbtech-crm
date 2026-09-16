"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { setFinancialGoalAction } from "@/app/(private)/financeiro/actions";
import { setFinancialGoalSchema, type SetFinancialGoalInput } from "@/schemas/financial";

type Values = z.input<typeof setFinancialGoalSchema>;
export function FinancialGoalForm({ year, month, currentTarget }: Readonly<{ year: number; month: number; currentTarget: string | null }>) {
  const router = useRouter(); const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values, unknown, SetFinancialGoalInput>({ resolver: zodResolver(setFinancialGoalSchema), defaultValues: { year, month, target_amount: currentTarget ?? "" } });
  async function submit(values: SetFinancialGoalInput) { setMessage(null); try { const result = await setFinancialGoalAction(values); if (!result.success) { const field = result.error.fieldErrors?.target_amount?.[0]; if (field) setError("target_amount", { type: "server", message: field }); else setMessage({ error: true, text: result.error.message }); return; } setMessage({ error: false, text: "Meta mensal guardada." }); router.refresh(); } catch { setMessage({ error: true, text: "Ocorreu um erro inesperado. Tente novamente." }); } }
  return <form onSubmit={handleSubmit(submit)} noValidate aria-busy={isSubmitting} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-950">Meta mensal</h2><p className="mt-1 text-sm text-slate-600">Defina a meta de entradas realizadas para o mês atual.</p><input type="hidden" {...register("year", { valueAsNumber: true })} /><input type="hidden" {...register("month", { valueAsNumber: true })} /><label className="mt-4 block text-sm font-medium text-slate-700">Meta (EUR)<input inputMode="decimal" placeholder="0.00" className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 px-3.5" {...register("target_amount")} /></label>{errors.target_amount?.message ? <p className="mt-1 text-sm text-red-700">{errors.target_amount.message}</p> : null}<button disabled={isSubmitting} className="mt-4 min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? "Guardando..." : "Guardar meta"}</button>{message ? <p role={message.error ? "alert" : "status"} className={`mt-3 text-sm ${message.error ? "text-red-700" : "text-emerald-700"}`}>{message.text}</p> : null}</form>;
}
