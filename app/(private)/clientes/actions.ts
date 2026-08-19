"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  clientIdSchema,
  clientSchema,
  type ClientInput,
} from "@/schemas/client";
import {
  archiveClient,
  createClient,
  updateClient,
} from "@/services/clients/client.service";

type ClientActionFieldErrors = Partial<
  Record<keyof ClientInput | "clientId", string[]>
>;

export type ClientActionResult =
  | {
      success: true;
      clientId: string;
    }
  | {
      success: false;
      code: "VALIDATION_ERROR";
      message: string;
      fieldErrors: ClientActionFieldErrors;
      formErrors: string[];
    }
  | {
      success: false;
      code: "OPERATION_FAILED";
      message: string;
    };

function getInputValidationFailure(
  error: z.ZodError<ClientInput>,
): ClientActionResult {
  const { fieldErrors, formErrors } = z.flattenError(error);

  return {
    success: false,
    code: "VALIDATION_ERROR",
    message: "Verifique os dados informados.",
    fieldErrors,
    formErrors:
      formErrors.length > 0 ? ["Existem campos não permitidos."] : [],
  };
}

function getClientIdValidationFailure(): ClientActionResult {
  return {
    success: false,
    code: "VALIDATION_ERROR",
    message: "Verifique os dados informados.",
    fieldErrors: {
      clientId: ["Informe um Cliente válido."],
    },
    formErrors: [],
  };
}

export async function createClientAction(
  input: ClientInput,
): Promise<ClientActionResult> {
  const parsedInput = clientSchema.safeParse(input);

  if (!parsedInput.success) {
    return getInputValidationFailure(parsedInput.error);
  }

  try {
    const clientId = await createClient(parsedInput.data);

    revalidatePath("/clientes");

    return { success: true, clientId };
  } catch {
    return {
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível criar o Cliente. Tente novamente.",
    };
  }
}

export async function updateClientAction(
  clientId: string,
  input: ClientInput,
): Promise<ClientActionResult> {
  const parsedClientId = clientIdSchema.safeParse(clientId);

  if (!parsedClientId.success) {
    return getClientIdValidationFailure();
  }

  const parsedInput = clientSchema.safeParse(input);

  if (!parsedInput.success) {
    return getInputValidationFailure(parsedInput.error);
  }

  try {
    const updatedClientId = await updateClient(
      parsedClientId.data,
      parsedInput.data,
    );

    revalidatePath("/clientes");
    revalidatePath(`/clientes/${updatedClientId}`);

    return { success: true, clientId: updatedClientId };
  } catch {
    return {
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível atualizar o Cliente. Tente novamente.",
    };
  }
}

export async function archiveClientAction(
  clientId: string,
): Promise<ClientActionResult> {
  const parsedClientId = clientIdSchema.safeParse(clientId);

  if (!parsedClientId.success) {
    return getClientIdValidationFailure();
  }

  try {
    const archivedClientId = await archiveClient(parsedClientId.data);

    revalidatePath("/clientes");
    revalidatePath(`/clientes/${archivedClientId}`);

    return { success: true, clientId: archivedClientId };
  } catch {
    return {
      success: false,
      code: "OPERATION_FAILED",
      message: "Não foi possível arquivar o Cliente. Tente novamente.",
    };
  }
}
