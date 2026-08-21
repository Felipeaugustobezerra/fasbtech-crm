"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  addOrganizationMemberSchema,
  clientAccessSchema,
  updateOrganizationMemberRoleSchema,
  type AddOrganizationMemberInput,
} from "@/schemas/access";
import {
  addOrganizationMember,
  assignClientAccess,
  removeClientAccess,
  updateOrganizationMemberRole,
} from "@/services/access/access.service";
import type { OrganizationRole } from "@/types/access";

type AccessActionFieldErrors = Partial<
  Record<"email" | "role" | "membershipId" | "clientId", string[]>
>;

export type AccessActionResult =
  | {
      success: true;
      membershipId: string;
    }
  | {
      success: true;
      assignmentId: string;
    }
  | {
      success: false;
      code: "VALIDATION_ERROR";
      message: string;
      fieldErrors: AccessActionFieldErrors;
      formErrors: string[];
    }
  | {
      success: false;
      code: "OPERATION_FAILED";
      message: string;
    };

function getValidationFailure(error: z.ZodError): AccessActionResult {
  const { fieldErrors, formErrors } = z.flattenError(error);

  return {
    success: false,
    code: "VALIDATION_ERROR",
    message: "Verifique os dados informados.",
    fieldErrors: fieldErrors as AccessActionFieldErrors,
    formErrors: formErrors.length > 0 ? ["Existem campos não permitidos."] : [],
  };
}

export async function addOrganizationMemberAction(
  input: AddOrganizationMemberInput,
): Promise<AccessActionResult> {
  const parsedInput = addOrganizationMemberSchema.safeParse(input);

  if (!parsedInput.success) {
    return getValidationFailure(parsedInput.error);
  }

  try {
    const membershipId = await addOrganizationMember(parsedInput.data);

    revalidatePath("/acessos");

    return { success: true, membershipId };
  } catch {
    return {
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível adicionar o utilizador. Tente novamente.",
    };
  }
}

export async function updateOrganizationMemberRoleAction(
  membershipId: string,
  role: OrganizationRole,
): Promise<AccessActionResult> {
  const parsedInput = updateOrganizationMemberRoleSchema.safeParse({
    membershipId,
    role,
  });

  if (!parsedInput.success) {
    return getValidationFailure(parsedInput.error);
  }

  try {
    const updatedMembershipId = await updateOrganizationMemberRole(
      parsedInput.data.membershipId,
      parsedInput.data.role,
    );

    revalidatePath("/acessos");

    return { success: true, membershipId: updatedMembershipId };
  } catch {
    return {
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível alterar a role. Tente novamente.",
    };
  }
}

export async function assignClientAccessAction(
  clientId: string,
  membershipId: string,
): Promise<AccessActionResult> {
  const parsedInput = clientAccessSchema.safeParse({ clientId, membershipId });

  if (!parsedInput.success) {
    return getValidationFailure(parsedInput.error);
  }

  try {
    const assignmentId = await assignClientAccess(
      parsedInput.data.clientId,
      parsedInput.data.membershipId,
    );

    revalidatePath("/acessos");
    revalidatePath(`/clientes/${parsedInput.data.clientId}`);

    return { success: true, assignmentId };
  } catch {
    return {
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível atribuir o acesso. Tente novamente.",
    };
  }
}

export async function removeClientAccessAction(
  clientId: string,
  membershipId: string,
): Promise<AccessActionResult> {
  const parsedInput = clientAccessSchema.safeParse({ clientId, membershipId });

  if (!parsedInput.success) {
    return getValidationFailure(parsedInput.error);
  }

  try {
    const assignmentId = await removeClientAccess(
      parsedInput.data.clientId,
      parsedInput.data.membershipId,
    );

    revalidatePath("/acessos");
    revalidatePath(`/clientes/${parsedInput.data.clientId}`);

    return { success: true, assignmentId };
  } catch {
    return {
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível remover o acesso. Tente novamente.",
    };
  }
}
