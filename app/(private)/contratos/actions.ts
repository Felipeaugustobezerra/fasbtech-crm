"use server";

import { z } from "zod";

import {
  activateContractTemplateSchema,
  cancelContractSchema,
  createContractSchema,
  createContractTemplateSchema,
  deactivateContractTemplateSchema,
  markContractSentSchema,
  updateContractTemplateSchema,
  updateDraftContractSchema,
} from "@/schemas/contracts";
import {
  generateContractDocumentSchema,
  uploadSignedCopySchema,
} from "@/schemas/contract-documents";
import {
  activateContractTemplate,
  cancelContract,
  createContract,
  createContractTemplate,
  deactivateContractTemplate,
  updateContractTemplate,
  updateDraftContract,
} from "@/services/contracts/contract.service";
import {
  generateContractDocument,
  sendContractDocument,
  uploadSignedCopyAndMarkSigned,
} from "@/services/contracts/contract-document.service";

type ContractActionErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHORIZATION_DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "DATABASE_ERROR"
  | "UNEXPECTED_ERROR";

export type ContractActionResult<T> =
  | { success: true; data: T; message?: string }
  | {
      success: false;
      error: {
        code: ContractActionErrorCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

type ContractTemplateActionResult = ContractActionResult<{
  contractTemplateId: string;
}>;

type ContractMutationActionResult = ContractActionResult<{
  contractId: string;
}>;

const errorMessages: Record<ContractActionErrorCode, string> = {
  VALIDATION_ERROR: "Verifique os campos informados.",
  AUTHENTICATION_REQUIRED: "A sua sessão expirou. Entre novamente.",
  AUTHORIZATION_DENIED: "Não possui permissão para executar esta ação.",
  NOT_FOUND: "O registro solicitado não foi encontrado.",
  CONFLICT: "Não foi possível concluir a operação devido a um conflito.",
  RATE_LIMITED: "Foram realizadas muitas tentativas. Tente novamente mais tarde.",
  DATABASE_ERROR: "Não foi possível guardar as alterações.",
  UNEXPECTED_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
};

function validationFailure<T>(error: z.ZodError): ContractActionResult<T> {
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

function isContractActionErrorCode(
  value: string,
): value is ContractActionErrorCode {
  return value in errorMessages;
}

async function executeContractAction<T>(
  operation: () => Promise<string>,
  toData: (id: string) => T,
): Promise<ContractActionResult<T>> {
  try {
    return { success: true, data: toData(await operation()) };
  } catch (error) {
    const code =
      error instanceof Error && isContractActionErrorCode(error.message)
        ? error.message
        : "UNEXPECTED_ERROR";

    return {
      success: false,
      error: { code, message: errorMessages[code] },
    };
  }
}

const contractTemplateData = (contractTemplateId: string) => ({
  contractTemplateId,
});

const contractData = (contractId: string) => ({ contractId });

export async function createContractTemplateAction(
  input: unknown,
): Promise<ContractTemplateActionResult> {
  const parsed = createContractTemplateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeContractAction(
    () => createContractTemplate(parsed.data),
    contractTemplateData,
  );
}

export async function updateContractTemplateAction(
  input: unknown,
): Promise<ContractTemplateActionResult> {
  const parsed = updateContractTemplateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeContractAction(
    () => updateContractTemplate(parsed.data),
    contractTemplateData,
  );
}

export async function activateContractTemplateAction(
  input: unknown,
): Promise<ContractTemplateActionResult> {
  const parsed = activateContractTemplateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeContractAction(
    () => activateContractTemplate(parsed.data),
    contractTemplateData,
  );
}

export async function deactivateContractTemplateAction(
  input: unknown,
): Promise<ContractTemplateActionResult> {
  const parsed = deactivateContractTemplateSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeContractAction(
    () => deactivateContractTemplate(parsed.data),
    contractTemplateData,
  );
}

export async function createContractAction(
  input: unknown,
): Promise<ContractMutationActionResult> {
  const parsed = createContractSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeContractAction(
    () => createContract(parsed.data),
    contractData,
  );
}

export async function updateDraftContractAction(
  input: unknown,
): Promise<ContractMutationActionResult> {
  const parsed = updateDraftContractSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeContractAction(
    () => updateDraftContract(parsed.data),
    contractData,
  );
}

export async function generateContractAction(
  input: unknown,
): Promise<ContractMutationActionResult> {
  const parsed = generateContractDocumentSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeContractAction(
    () => generateContractDocument(parsed.data),
    contractData,
  );
}

export async function markContractSentAction(
  input: unknown,
): Promise<ContractMutationActionResult> {
  const parsed = markContractSentSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeContractAction(
    () => sendContractDocument(parsed.data),
    contractData,
  );
}

export async function markContractSignedAction(
  input: unknown,
): Promise<ContractMutationActionResult> {
  const parsed = uploadSignedCopySchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeContractAction(
    () => uploadSignedCopyAndMarkSigned(parsed.data),
    contractData,
  );
}

export async function cancelContractAction(
  input: unknown,
): Promise<ContractMutationActionResult> {
  const parsed = cancelContractSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return executeContractAction(
    () => cancelContract(parsed.data),
    contractData,
  );
}
