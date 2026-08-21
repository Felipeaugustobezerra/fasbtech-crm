"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  addOrganizationMemberAction,
  type AccessActionResult,
} from "@/app/(private)/acessos/actions";
import {
  addOrganizationMemberSchema,
  type AddOrganizationMemberInput,
} from "@/schemas/access";
import { ORGANIZATION_ROLES } from "@/types/access";

type AddMemberFormValues = z.input<typeof addOrganizationMemberSchema>;

const roleLabels = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Membro",
} as const;

export function AddMemberForm() {
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
  } = useForm<AddMemberFormValues, unknown, AddOrganizationMemberInput>({
    resolver: zodResolver(addOrganizationMemberSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  function applyActionErrors(
    result: Extract<AccessActionResult, { success: false }>,
  ) {
    if (result.code === "OPERATION_FAILED") {
      setFormError(result.message);
      return;
    }

    const emailError = result.fieldErrors.email?.[0];
    const roleError = result.fieldErrors.role?.[0];

    if (emailError) {
      setError("email", { type: "server", message: emailError });
    }

    if (roleError) {
      setError("role", { type: "server", message: roleError });
    }

    const generalErrors = [
      ...result.formErrors,
      ...(result.fieldErrors.membershipId ?? []),
      ...(result.fieldErrors.clientId ?? []),
    ];

    if (generalErrors.length > 0) {
      setFormError(generalErrors.join(" "));
    } else if (!emailError && !roleError) {
      setFormError(result.message);
    }
  }

  async function onSubmit(values: AddOrganizationMemberInput) {
    setFormError(null);
    setSuccessMessage(null);
    clearErrors();

    try {
      const result = await addOrganizationMemberAction(values);

      if (!result.success) {
        applyActionErrors(result);
        return;
      }

      reset({ email: "", role: "MEMBER" });
      setSuccessMessage("Utilizador adicionado com sucesso.");
      router.refresh();
    } catch {
      setFormError("Não foi possível adicionar o utilizador. Tente novamente.");
    }
  }

  const emailError = errors.email?.message;
  const roleError = errors.role?.message;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="access-member-email"
          className="block text-sm font-medium text-slate-700"
        >
          E-mail
          <span className="ml-1 text-red-700" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="access-member-email"
          type="email"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={Boolean(emailError)}
          aria-describedby={
            emailError
              ? "access-member-email-help access-member-email-error"
              : "access-member-email-help"
          }
          className={`mt-2 min-h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-3 ${
            emailError
              ? "border-red-500 focus:border-red-600 focus:ring-red-100"
              : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
          }`}
          placeholder="utilizador@exemplo.com"
          {...register("email")}
        />
        <p
          id="access-member-email-help"
          className="mt-1.5 text-sm leading-6 text-slate-600"
        >
          O utilizador precisa já possuir uma conta no sistema.
        </p>
        {emailError ? (
          <p
            id="access-member-email-error"
            className="mt-1.5 text-sm text-red-700"
          >
            {emailError}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="access-member-role"
          className="block text-sm font-medium text-slate-700"
        >
          Role
          <span className="ml-1 text-red-700" aria-hidden="true">
            *
          </span>
        </label>
        <select
          id="access-member-role"
          required
          aria-required="true"
          aria-invalid={Boolean(roleError)}
          aria-describedby={roleError ? "access-member-role-error" : undefined}
          className={`mt-2 min-h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-950 outline-none transition focus:ring-3 ${
            roleError
              ? "border-red-500 focus:border-red-600 focus:ring-red-100"
              : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
          }`}
          {...register("role")}
        >
          {ORGANIZATION_ROLES.map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>
        {roleError ? (
          <p
            id="access-member-role-error"
            className="mt-1.5 text-sm text-red-700"
          >
            {roleError}
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
        className="min-h-11 w-full rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Adicionando..." : "Adicionar utilizador"}
      </button>
    </form>
  );
}
