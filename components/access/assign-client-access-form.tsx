"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  assignClientAccessAction,
  type AccessActionResult,
} from "@/app/(private)/acessos/actions";
import { membershipIdSchema } from "@/schemas/access";
import type { OrganizationMemberSummary } from "@/types/access";

const assignClientAccessFormSchema = z
  .object({
    membershipId: membershipIdSchema,
  })
  .strict();

type AssignClientAccessFormValues = z.input<
  typeof assignClientAccessFormSchema
>;
type AssignClientAccessInput = z.infer<typeof assignClientAccessFormSchema>;

export type EligibleClientAccessMember = Pick<
  OrganizationMemberSummary,
  "membershipId" | "fullName"
>;

type AssignClientAccessFormProps = Readonly<{
  clientId: string;
  candidates: EligibleClientAccessMember[];
}>;

export function AssignClientAccessForm({
  clientId,
  candidates,
}: AssignClientAccessFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    clearErrors,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<
    AssignClientAccessFormValues,
    unknown,
    AssignClientAccessInput
  >({
    resolver: zodResolver(assignClientAccessFormSchema),
    defaultValues: {
      membershipId: "",
    },
  });

  if (candidates.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
        Não existem MEMBERs elegíveis sem acesso neste momento.
      </p>
    );
  }

  function applyActionErrors(
    result: Extract<AccessActionResult, { success: false }>,
  ) {
    if (result.code === "OPERATION_FAILED") {
      setFormError(result.message);
      return;
    }

    const membershipError = result.fieldErrors.membershipId?.[0];

    if (membershipError) {
      setError("membershipId", {
        type: "server",
        message: membershipError,
      });
    }

    const generalErrors = [
      ...result.formErrors,
      ...(result.fieldErrors.clientId ?? []),
      ...(result.fieldErrors.email ?? []),
      ...(result.fieldErrors.role ?? []),
    ];

    if (generalErrors.length > 0) {
      setFormError(generalErrors.join(" "));
    } else if (!membershipError) {
      setFormError(result.message);
    }
  }

  async function onSubmit(values: AssignClientAccessInput) {
    setFormError(null);
    setSuccessMessage(null);
    clearErrors();

    try {
      const result = await assignClientAccessAction(
        clientId,
        values.membershipId,
      );

      if (!result.success) {
        applyActionErrors(result);
        return;
      }

      reset({ membershipId: "" });
      setSuccessMessage("Acesso atribuído com sucesso.");
      router.refresh();
    } catch {
      setFormError("Não foi possível atribuir o acesso. Tente novamente.");
    }
  }

  const membershipError = errors.membershipId?.message;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="client-access-membership"
          className="block text-sm font-medium text-slate-700"
        >
          Utilizador
        </label>
        <select
          id="client-access-membership"
          required
          aria-required="true"
          aria-invalid={Boolean(membershipError)}
          aria-describedby={
            membershipError ? "client-access-membership-error" : undefined
          }
          className={`mt-2 min-h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-950 outline-none transition focus:ring-3 ${
            membershipError
              ? "border-red-500 focus:border-red-600 focus:ring-red-100"
              : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
          }`}
          {...register("membershipId")}
        >
          <option value="">Selecione um MEMBER</option>
          {candidates.map((candidate) => (
            <option
              key={candidate.membershipId}
              value={candidate.membershipId}
            >
              {candidate.fullName}
            </option>
          ))}
        </select>
        {membershipError ? (
          <p
            id="client-access-membership-error"
            className="mt-1.5 text-sm text-red-700"
          >
            {membershipError}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {formError}
        </p>
      ) : null}

      {successMessage ? (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Atribuindo..." : "Atribuir acesso"}
      </button>
    </form>
  );
}
