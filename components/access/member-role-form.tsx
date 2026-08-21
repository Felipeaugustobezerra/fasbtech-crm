"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  updateOrganizationMemberRoleAction,
  type AccessActionResult,
} from "@/app/(private)/acessos/actions";
import { updateOrganizationMemberRoleSchema } from "@/schemas/access";
import {
  ORGANIZATION_ROLES,
  type OrganizationRole,
} from "@/types/access";

const memberRoleFormSchema = updateOrganizationMemberRoleSchema.pick({
  role: true,
});

type MemberRoleFormValues = z.input<typeof memberRoleFormSchema>;
type MemberRoleFormInput = z.infer<typeof memberRoleFormSchema>;

type MemberRoleFormProps = Readonly<{
  membershipId: string;
  fullName: string;
  initialRole: OrganizationRole;
}>;

const roleLabels = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Membro",
} as const;

export function MemberRoleForm({
  membershipId,
  fullName,
  initialRole,
}: MemberRoleFormProps) {
  const router = useRouter();
  const fieldId = useId();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MemberRoleFormValues, unknown, MemberRoleFormInput>({
    resolver: zodResolver(memberRoleFormSchema),
    defaultValues: {
      role: initialRole,
    },
  });

  function applyActionErrors(
    result: Extract<AccessActionResult, { success: false }>,
  ) {
    if (result.code === "OPERATION_FAILED") {
      setFormError(result.message);
      return;
    }

    const roleError = result.fieldErrors.role?.[0];

    if (roleError) {
      setError("role", { type: "server", message: roleError });
    }

    const generalErrors = [
      ...result.formErrors,
      ...(result.fieldErrors.membershipId ?? []),
      ...(result.fieldErrors.clientId ?? []),
      ...(result.fieldErrors.email ?? []),
    ];

    if (generalErrors.length > 0) {
      setFormError(generalErrors.join(" "));
    } else if (!roleError) {
      setFormError(result.message);
    }
  }

  async function onSubmit(values: MemberRoleFormInput) {
    setFormError(null);
    setSuccessMessage(null);
    clearErrors();

    try {
      const result = await updateOrganizationMemberRoleAction(
        membershipId,
        values.role,
      );

      if (!result.success) {
        applyActionErrors(result);
        return;
      }

      setSuccessMessage("Role atualizada com sucesso.");
      router.refresh();
    } catch {
      setFormError("Não foi possível alterar a role. Tente novamente.");
    }
  }

  const roleError = errors.role?.message;
  const errorId = `${fieldId}-error`;
  const feedbackId = `${fieldId}-feedback`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="min-w-64"
    >
      <label htmlFor={fieldId} className="sr-only">
        Role de {fullName}
      </label>
      <div className="flex items-center gap-2">
        <select
          id={fieldId}
          aria-invalid={Boolean(roleError)}
          aria-describedby={
            roleError || formError || successMessage
              ? roleError
                ? errorId
                : feedbackId
              : undefined
          }
          className={`min-h-10 min-w-32 rounded-lg border bg-white px-3 text-sm text-slate-950 outline-none transition focus:ring-3 ${
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Salvando..." : "Salvar role"}
        </button>
      </div>

      {roleError ? (
        <p id={errorId} className="mt-2 text-sm text-red-700">
          {roleError}
        </p>
      ) : null}

      {formError ? (
        <p id={feedbackId} role="alert" className="mt-2 text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      {successMessage ? (
        <p
          id={feedbackId}
          role="status"
          className="mt-2 text-sm text-emerald-700"
        >
          {successMessage}
        </p>
      ) : null}
    </form>
  );
}
