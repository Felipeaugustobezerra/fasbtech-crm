"use server";

import { z } from "zod";

import { logServerEvent } from "@/lib/observability/server-logger";
import {
  archiveFinancialEntrySchema,
  changeFinancialEntryStatusSchema,
  createFinancialEntrySchema,
  financialEntryIdSchema,
  setFinancialGoalSchema,
  updateFinancialEntrySchema,
} from "@/schemas/financial";
import {
  archiveFinancialEntry,
  changeFinancialEntryStatus,
  createFinancialEntry,
  setFinancialGoal,
  updateFinancialEntry,
} from "@/services/financial/financial.service";

type FinancialActionErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHORIZATION_DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "DATABASE_ERROR"
  | "UNEXPECTED_ERROR";

export type FinancialActionResult<T> =
  | { success: true; data: T; message?: string }
  | {
      success: false;
      error: {
        code: FinancialActionErrorCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

type FinancialEntryActionResult = FinancialActionResult<{
  financialEntryId: string;
}>;

type FinancialGoalActionResult = FinancialActionResult<{
  financialGoalId: string;
}>;

const errorMessages: Record<FinancialActionErrorCode, string> = {
  VALIDATION_ERROR: "Verifique os campos informados.",
  AUTHENTICATION_REQUIRED: "A sua sessão expirou. Entre novamente.",
  AUTHORIZATION_DENIED: "Não possui permissão para executar esta ação.",
  NOT_FOUND: "O registro solicitado não foi encontrado.",
  CONFLICT: "Não foi possível concluir a operação devido a um conflito.",
  RATE_LIMITED: "Foram realizadas muitas tentativas. Tente novamente mais tarde.",
  DATABASE_ERROR: "Não foi possível guardar as alterações.",
  UNEXPECTED_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
};

function validationFailure<T>(error: z.ZodError): FinancialActionResult<T> {
  const { formErrors } = z.flattenError(error);
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string") {
      (fieldErrors[field] ??= []).push(issue.message);
    }
  }

  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message:
        formErrors.length > 0
          ? "Verifique os dados informados e os campos permitidos."
          : errorMessages.VALIDATION_ERROR,
      fieldErrors,
    },
  };
}

function isFinancialActionErrorCode(
  value: string,
): value is FinancialActionErrorCode {
  return value in errorMessages;
}

async function executeFinancialAction<T>(
  operationName: string,
  operation: () => Promise<string>,
  toData: (id: string) => T,
): Promise<FinancialActionResult<T>> {
  try {
    return { success: true, data: toData(await operation()) };
  } catch (error) {
    const code =
      error instanceof Error && isFinancialActionErrorCode(error.message)
        ? error.message
        : "UNEXPECTED_ERROR";

    logServerEvent({
      level: "error",
      module: "financial",
      operation: operationName,
      code,
    });

    return {
      success: false,
      error: { code, message: errorMessages[code] },
    };
  }
}

const financialEntryData = (financialEntryId: string) => ({ financialEntryId });
const financialGoalData = (financialGoalId: string) => ({ financialGoalId });

export async function createFinancialEntryAction(
  input: unknown,
): Promise<FinancialEntryActionResult> {
  const parsed = createFinancialEntrySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeFinancialAction(
    "create_entry",
    () => createFinancialEntry(parsed.data),
    financialEntryData,
  );
}

export async function updateFinancialEntryAction(
  entryId: string,
  input: unknown,
): Promise<FinancialEntryActionResult> {
  const parsedId = financialEntryIdSchema.safeParse(entryId);
  if (!parsedId.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: errorMessages.VALIDATION_ERROR,
        fieldErrors: {
          entry_id: ["Informe uma movimentação financeira válida."],
        },
      },
    };
  }

  const parsed = updateFinancialEntrySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeFinancialAction(
    "update_entry",
    () => updateFinancialEntry(parsedId.data, parsed.data),
    financialEntryData,
  );
}

export async function changeFinancialEntryStatusAction(
  input: unknown,
): Promise<FinancialEntryActionResult> {
  const parsed = changeFinancialEntryStatusSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeFinancialAction(
    "change_status",
    () => changeFinancialEntryStatus(parsed.data),
    financialEntryData,
  );
}

export async function archiveFinancialEntryAction(
  input: unknown,
): Promise<FinancialEntryActionResult> {
  const parsed = archiveFinancialEntrySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeFinancialAction(
    "archive_entry",
    () => archiveFinancialEntry(parsed.data),
    financialEntryData,
  );
}

export async function setFinancialGoalAction(
  input: unknown,
): Promise<FinancialGoalActionResult> {
  const parsed = setFinancialGoalSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeFinancialAction(
    "set_goal",
    () => setFinancialGoal(parsed.data),
    financialGoalData,
  );
}
