import {
  activateContractTemplateRpc,
  cancelContractRpc,
  createContractRpc,
  createContractTemplateRpc,
  deactivateContractTemplateRpc,
  generateContractRpc,
  markContractSentRpc,
  markContractSignedRpc,
  updateContractTemplateRpc,
  updateDraftContractRpc,
  type ActivateContractTemplateRpcArgs,
  type CancelContractRpcArgs,
  type CreateContractRpcArgs,
  type CreateContractTemplateRpcArgs,
  type DeactivateContractTemplateRpcArgs,
  type GenerateContractRpcArgs,
  type MarkContractSentRpcArgs,
  type MarkContractSignedRpcArgs,
  type UpdateContractTemplateRpcArgs,
  type UpdateDraftContractRpcArgs,
} from "@/lib/contracts/rpc";
import type {
  ActivateContractTemplateInput,
  CancelContractInput,
  CreateContractInput,
  CreateContractTemplateInput,
  DeactivateContractTemplateInput,
  GenerateContractInput,
  MarkContractSentInput,
  MarkContractSignedInput,
  UpdateContractTemplateInput,
  UpdateDraftContractInput,
} from "@/schemas/contracts";

type ContractServiceErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "AUTHORIZATION_DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNEXPECTED_ERROR";

type ContractRpcResult = Awaited<ReturnType<typeof createContractRpc>>;
type ContractRpcError = NonNullable<ContractRpcResult["error"]>;

const validationErrorMessages = new Set([
  "CONTRACT_TEMPLATE_NAME_REQUIRED",
  "CONTRACT_TEMPLATE_CONTENT_REQUIRED",
  "CONTRACT_TITLE_REQUIRED",
  "CONTRACT_DRAFT_DATA_INVALID",
  "CONTRACT_CLIENT_INVALID",
  "CONTRACT_TEMPLATE_INVALID",
  "CONTRACT_SNAPSHOT_INVALID",
  "CONTRACT_DOCUMENT_METADATA_INVALID",
  "CONTRACT_DOCUMENT_OBJECT_INVALID",
  "CONTRACT_RECIPIENT_INVALID",
]);

const conflictErrorMessages = new Set([
  "CONTRACT_TEMPLATE_ALREADY_ACTIVE",
  "CONTRACT_TEMPLATE_ALREADY_INACTIVE",
  "CONTRACT_NOT_EDITABLE",
  "CONTRACT_GENERATE_STATUS_INVALID",
  "CONTRACT_SEND_STATUS_INVALID",
  "CONTRACT_SIGN_STATUS_INVALID",
  "CONTRACT_CANCEL_STATUS_INVALID",
  "CONTRACT_STATUS_TRANSITION_INVALID",
  "CONTRACT_ORIGINAL_PDF_REQUIRED",
  "CONTRACT_SIGNED_COPY_REQUIRED",
]);

function mapContractRpcError(
  error: ContractRpcError,
): ContractServiceErrorCode {
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

  if (
    error.message === "CONTRACT_NOT_FOUND_OR_FORBIDDEN" ||
    error.message === "CONTRACT_TEMPLATE_NOT_FOUND_OR_FORBIDDEN"
  ) {
    return "NOT_FOUND";
  }

  if (validationErrorMessages.has(error.message)) {
    return "VALIDATION_ERROR";
  }

  if (conflictErrorMessages.has(error.message)) {
    return "CONFLICT";
  }

  return "DATABASE_ERROR";
}

async function executeContractRpc(
  operation: () => Promise<ContractRpcResult>,
): Promise<string> {
  let result: ContractRpcResult;

  try {
    result = await operation();
  } catch (cause) {
    throw new Error("UNEXPECTED_ERROR", { cause });
  }

  if (result.error) {
    throw new Error(mapContractRpcError(result.error), {
      cause: result.error,
    });
  }

  if (result.data === null) {
    throw new Error("DATABASE_ERROR", {
      cause: new Error("CONTRACT_RPC_EMPTY_RESULT"),
    });
  }

  return result.data;
}

export async function createContractTemplate(
  input: CreateContractTemplateInput,
): Promise<string> {
  const args: CreateContractTemplateRpcArgs = {
    p_name: input.name,
    p_content: input.content,
  };

  return executeContractRpc(() => createContractTemplateRpc(args));
}

export async function updateContractTemplate(
  input: UpdateContractTemplateInput,
): Promise<string> {
  const args: UpdateContractTemplateRpcArgs = {
    p_template_id: input.template_id,
    p_name: input.name,
    p_content: input.content,
  };

  return executeContractRpc(() => updateContractTemplateRpc(args));
}

export async function activateContractTemplate(
  input: ActivateContractTemplateInput,
): Promise<string> {
  const args: ActivateContractTemplateRpcArgs = {
    p_template_id: input.template_id,
  };

  return executeContractRpc(() => activateContractTemplateRpc(args));
}

export async function deactivateContractTemplate(
  input: DeactivateContractTemplateInput,
): Promise<string> {
  const args: DeactivateContractTemplateRpcArgs = {
    p_template_id: input.template_id,
  };

  return executeContractRpc(() => deactivateContractTemplateRpc(args));
}

export async function createContract(
  input: CreateContractInput,
): Promise<string> {
  const args: CreateContractRpcArgs = {
    p_client_id: input.client_id,
    p_template_id: input.template_id,
    p_title: input.title,
    p_draft_data: input.draft_data,
  };

  return executeContractRpc(() => createContractRpc(args));
}

export async function updateDraftContract(
  input: UpdateDraftContractInput,
): Promise<string> {
  const args: UpdateDraftContractRpcArgs = {
    p_contract_id: input.contract_id,
    p_client_id: input.client_id,
    p_template_id: input.template_id,
    p_title: input.title,
    p_draft_data: input.draft_data,
  };

  return executeContractRpc(() => updateDraftContractRpc(args));
}

export async function generateContract(
  input: GenerateContractInput,
): Promise<string> {
  const args: GenerateContractRpcArgs = {
    p_contract_id: input.contract_id,
    p_snapshot: input.snapshot,
    p_document_id: input.document_id,
    p_object_path: input.object_path,
    p_file_name: input.file_name,
    p_mime_type: input.mime_type,
    p_size_bytes: input.size_bytes,
  };

  return executeContractRpc(() => generateContractRpc(args));
}

export async function markContractSent(
  input: MarkContractSentInput,
): Promise<string> {
  const args: MarkContractSentRpcArgs = {
    p_contract_id: input.contract_id,
    p_recipient_email: input.recipient_email,
  };

  return executeContractRpc(() => markContractSentRpc(args));
}

export async function markContractSigned(
  input: MarkContractSignedInput,
): Promise<string> {
  const args: MarkContractSignedRpcArgs = {
    p_contract_id: input.contract_id,
    p_document_id: input.document_id,
    p_object_path: input.object_path,
    p_file_name: input.file_name,
    p_mime_type: input.mime_type,
    p_size_bytes: input.size_bytes,
  };

  return executeContractRpc(() => markContractSignedRpc(args));
}

export async function cancelContract(
  input: CancelContractInput,
): Promise<string> {
  const args: CancelContractRpcArgs = {
    p_contract_id: input.contract_id,
  };

  return executeContractRpc(() => cancelContractRpc(args));
}
