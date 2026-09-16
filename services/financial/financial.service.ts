import {
  archiveFinancialEntryRpc,
  changeFinancialEntryStatusRpc,
  createFinancialEntryRpc,
  setFinancialGoalRpc,
  updateFinancialEntryRpc,
  type ArchiveFinancialEntryRpcArgs,
  type ChangeFinancialEntryStatusRpcArgs,
  type CreateFinancialEntryRpcArgs,
  type SetFinancialGoalRpcArgs,
  type UpdateFinancialEntryRpcArgs,
} from "@/lib/financial/rpc";
import type {
  ArchiveFinancialEntryInput,
  ChangeFinancialEntryStatusInput,
  CreateFinancialEntryInput,
  SetFinancialGoalInput,
  UpdateFinancialEntryInput,
} from "@/schemas/financial";

type FinancialServiceErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "AUTHORIZATION_DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNEXPECTED_ERROR";

type FinancialRpcResult = Awaited<ReturnType<typeof createFinancialEntryRpc>>;
type FinancialRpcError = NonNullable<FinancialRpcResult["error"]>;

const validationErrorMessages = new Set([
  "FINANCIAL_TYPE_INVALID",
  "FINANCIAL_STATUS_INVALID",
  "FINANCIAL_PAYMENT_NATURE_INVALID",
  "FINANCIAL_DESCRIPTION_REQUIRED",
  "FINANCIAL_AMOUNT_INVALID",
  "FINANCIAL_REFERENCE_DATE_REQUIRED",
  "FINANCIAL_REALIZED_DATE_REQUIRED",
  "FINANCIAL_REALIZED_DATE_NOT_ALLOWED",
  "FINANCIAL_CLIENT_INVALID",
  "FINANCIAL_GOAL_PERIOD_INVALID",
  "FINANCIAL_GOAL_AMOUNT_INVALID",
]);

function mapFinancialRpcError(
  error: FinancialRpcError,
): FinancialServiceErrorCode {
  if (error.code === "23505") {
    return "CONFLICT";
  }

  if (error.code === "42501") {
    return "AUTHORIZATION_DENIED";
  }

  if (error.code !== "P0001") {
    return "DATABASE_ERROR";
  }

  if (error.message === "AUTHENTICATION_REQUIRED") {
    return "AUTHENTICATION_REQUIRED";
  }

  if (
    error.message === "AUTHORIZATION_DENIED" ||
    error.message === "AMBIGUOUS_ORGANIZATION_CONTEXT"
  ) {
    return "AUTHORIZATION_DENIED";
  }

  if (error.message === "FINANCIAL_ENTRY_NOT_FOUND_OR_FORBIDDEN") {
    return "NOT_FOUND";
  }

  if (validationErrorMessages.has(error.message)) {
    return "VALIDATION_ERROR";
  }

  return "DATABASE_ERROR";
}

async function executeFinancialRpc(
  operation: () => Promise<FinancialRpcResult>,
): Promise<string> {
  let result: FinancialRpcResult;

  try {
    result = await operation();
  } catch (cause) {
    throw new Error("UNEXPECTED_ERROR", { cause });
  }

  if (result.error) {
    throw new Error(mapFinancialRpcError(result.error), {
      cause: result.error,
    });
  }

  if (result.data === null) {
    throw new Error("DATABASE_ERROR", {
      cause: new Error("FINANCIAL_RPC_EMPTY_RESULT"),
    });
  }

  return result.data;
}

function mapFinancialEntryContent(
  input: UpdateFinancialEntryInput,
): Omit<UpdateFinancialEntryRpcArgs, "p_entry_id"> {
  return {
    p_type: input.type,
    p_description: input.description,
    p_amount: input.amount,
    p_reference_date: input.reference_date,
    p_client_id: input.client_id,
    p_payment_nature: input.payment_nature,
    p_category: input.category,
    p_due_date: input.due_date,
    p_notes: input.notes,
  };
}

export async function createFinancialEntry(
  input: CreateFinancialEntryInput,
): Promise<string> {
  const args: CreateFinancialEntryRpcArgs = mapFinancialEntryContent(input);

  return executeFinancialRpc(() => createFinancialEntryRpc(args));
}

export async function updateFinancialEntry(
  entryId: string,
  input: UpdateFinancialEntryInput,
): Promise<string> {
  const args: UpdateFinancialEntryRpcArgs = {
    p_entry_id: entryId,
    ...mapFinancialEntryContent(input),
  };

  return executeFinancialRpc(() => updateFinancialEntryRpc(args));
}

export async function changeFinancialEntryStatus(
  input: ChangeFinancialEntryStatusInput,
): Promise<string> {
  const args: ChangeFinancialEntryStatusRpcArgs = {
    p_entry_id: input.entry_id,
    p_status: input.status,
    p_realized_date: input.realized_date,
  };

  return executeFinancialRpc(() => changeFinancialEntryStatusRpc(args));
}

export async function archiveFinancialEntry(
  input: ArchiveFinancialEntryInput,
): Promise<string> {
  const args: ArchiveFinancialEntryRpcArgs = {
    p_entry_id: input.entry_id,
  };

  return executeFinancialRpc(() => archiveFinancialEntryRpc(args));
}

export async function setFinancialGoal(
  input: SetFinancialGoalInput,
): Promise<string> {
  const args: SetFinancialGoalRpcArgs = {
    p_year: input.year,
    p_month: input.month,
    p_target_amount: input.target_amount,
  };

  return executeFinancialRpc(() => setFinancialGoalRpc(args));
}

