"use server";

import { z } from "zod";

import { logServerEvent } from "@/lib/observability/server-logger";
import {
  archiveDemandSchema,
  changeDemandStatusSchema,
  createDemandSchema,
  demandIdSchema,
  setDemandAssigneesSchema,
  setDemandTagsSchema,
  updateDemandSchema,
} from "@/schemas/demand";
import {
  archiveDemand,
  changeDemandStatus,
  createDemand,
  setDemandAssignees,
  setDemandTags,
  updateDemand,
} from "@/services/demands/demand.service";
import { listEligibleDemandAssignees } from "@/lib/demands/queries";
import type { EligibleDemandAssignee } from "@/types/demand";

type DemandActionErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHORIZATION_DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DATABASE_ERROR"
  | "UNEXPECTED_ERROR";

export type DemandActionResult =
  | { success: true; data: { demandId: string } }
  | {
      success: false;
      error: {
        code: DemandActionErrorCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

export type EligibleDemandAssigneesActionResult =
  | { success: true; data: { assignees: EligibleDemandAssignee[] } }
  | {
      success: false;
      error: {
        code: DemandActionErrorCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

const errorMessages: Record<DemandActionErrorCode, string> = {
  VALIDATION_ERROR: "Verifique os campos informados.",
  AUTHENTICATION_REQUIRED: "A sua sessão expirou. Entre novamente.",
  AUTHORIZATION_DENIED: "Não possui permissão para executar esta ação.",
  NOT_FOUND: "O registro solicitado não foi encontrado.",
  CONFLICT: "Não foi possível concluir a operação devido a um conflito.",
  DATABASE_ERROR: "Não foi possível guardar as alterações.",
  UNEXPECTED_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
};

function validationFailure(error: z.ZodError): DemandActionResult {
  const { formErrors } = z.flattenError(error);
  const safeFieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string") {
      (safeFieldErrors[field] ??= []).push(issue.message);
    }
  }

  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: formErrors.length > 0
        ? "Verifique os dados informados e os campos permitidos."
        : errorMessages.VALIDATION_ERROR,
      fieldErrors: safeFieldErrors,
    },
  };
}

async function executeDemandAction(
  operationName: string,
  operation: () => Promise<string>,
): Promise<DemandActionResult> {
  try {
    const demandId = await operation();
    return { success: true, data: { demandId } };
  } catch (error) {
    let code: DemandActionErrorCode = "UNEXPECTED_ERROR";

    if (error instanceof Error) {
      switch (error.message) {
        case "VALIDATION_ERROR":
        case "AUTHENTICATION_REQUIRED":
        case "AUTHORIZATION_DENIED":
        case "NOT_FOUND":
        case "CONFLICT":
        case "DATABASE_ERROR":
        case "UNEXPECTED_ERROR":
          code = error.message;
      }
    }

    logServerEvent({
      level: "error",
      module: "demands",
      operation: operationName,
      code,
    });

    return { success: false, error: { code, message: errorMessages[code] } };
  }
}

export async function createDemandAction(input: unknown): Promise<DemandActionResult> {
  const parsed = createDemandSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeDemandAction("create", () => createDemand({
    ...parsed.data,
    assignee_membership_ids: parsed.data.assignee_membership_ids ?? [],
  }));
}

export async function updateDemandAction(
  demandId: string,
  input: unknown,
): Promise<DemandActionResult> {
  const parsedId = demandIdSchema.safeParse(demandId);
  if (!parsedId.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: errorMessages.VALIDATION_ERROR,
        fieldErrors: { demand_id: ["Informe uma Demanda válida."] },
      },
    };
  }

  const parsed = updateDemandSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeDemandAction("update", () => updateDemand(parsedId.data, parsed.data));
}

export async function changeDemandStatusAction(input: unknown): Promise<DemandActionResult> {
  const parsed = changeDemandStatusSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  return executeDemandAction("change_status", () => changeDemandStatus(parsed.data));
}

export async function setDemandAssigneesAction(input: unknown): Promise<DemandActionResult> {
  const parsed = setDemandAssigneesSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  return executeDemandAction("set_assignees", () => setDemandAssignees(parsed.data));
}

export async function setDemandTagsAction(input: unknown): Promise<DemandActionResult> {
  const parsed = setDemandTagsSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  return executeDemandAction("set_tags", () => setDemandTags(parsed.data));
}

export async function archiveDemandAction(input: unknown): Promise<DemandActionResult> {
  const parsed = archiveDemandSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);
  return executeDemandAction("archive", () => archiveDemand(parsed.data));
}

export async function getEligibleDemandAssigneesAction(
  clientId: string,
): Promise<EligibleDemandAssigneesActionResult> {
  const parsed = z.uuid("Informe um Cliente válido.").safeParse(clientId);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: errorMessages.VALIDATION_ERROR,
        fieldErrors: { client_id: ["Informe um Cliente válido."] },
      },
    };
  }

  try {
    const assignees = await listEligibleDemandAssignees(parsed.data);
    return { success: true, data: { assignees } };
  } catch {
    logServerEvent({
      level: "error",
      module: "demands",
      operation: "eligible_assignees",
      code: "DATABASE_ERROR",
    });
    return {
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Não foi possível carregar os responsáveis elegíveis.",
      },
    };
  }
}
