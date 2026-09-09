import {
  archiveDemandRpc,
  changeDemandStatusRpc,
  createDemandRpc,
  setDemandAssigneesRpc,
  setDemandTagsRpc,
  updateDemandRpc,
  type ArchiveDemandRpcArgs,
  type ChangeDemandStatusRpcArgs,
  type CreateDemandRpcArgs,
  type SetDemandAssigneesRpcArgs,
  type SetDemandTagsRpcArgs,
  type UpdateDemandRpcArgs,
} from "@/lib/demands/rpc";
import type {
  ArchiveDemandInput,
  ChangeDemandStatusInput,
  CreateDemandInput,
  SetDemandAssigneesInput,
  SetDemandTagsInput,
  UpdateDemandInput,
} from "@/schemas/demand";

type DemandServiceErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "UNEXPECTED_ERROR";

type DemandRpcResult = Awaited<ReturnType<typeof createDemandRpc>>;
type DemandRpcError = NonNullable<DemandRpcResult["error"]>;

const validationErrorMessages = new Set([
  "DEMAND_TITLE_REQUIRED",
  "DEMAND_PRIORITY_INVALID",
  "DEMAND_STATUS_INVALID",
  "DEMAND_ASSIGNEE_INVALID",
  "DEMAND_ASSIGNEES_DUPLICATED",
  "DEMAND_TAG_INVALID",
  "DEMAND_TAG_IDS_DUPLICATED",
  "DEMAND_TAG_NAME_REQUIRED",
  "DEMAND_TAG_NAMES_DUPLICATED",
]);

function mapDemandRpcError(error: DemandRpcError): DemandServiceErrorCode {
  if (error.code !== "P0001") {
    return "DATABASE_ERROR";
  }

  if (error.message === "AUTHENTICATION_REQUIRED") {
    return "AUTHENTICATION_REQUIRED";
  }

  if (
    error.message === "CLIENT_NOT_FOUND_OR_FORBIDDEN" ||
    error.message === "DEMAND_NOT_FOUND_OR_FORBIDDEN"
  ) {
    return "NOT_FOUND";
  }

  if (validationErrorMessages.has(error.message)) {
    return "VALIDATION_ERROR";
  }

  return "DATABASE_ERROR";
}

async function executeDemandRpc(
  operation: () => Promise<DemandRpcResult>,
): Promise<string> {
  let result: DemandRpcResult;

  try {
    result = await operation();
  } catch (cause) {
    throw new Error("UNEXPECTED_ERROR", { cause });
  }

  if (result.error) {
    throw new Error(mapDemandRpcError(result.error), {
      cause: result.error,
    });
  }

  if (result.data === null) {
    throw new Error("DATABASE_ERROR", {
      cause: new Error("DEMAND_RPC_EMPTY_RESULT"),
    });
  }

  return result.data;
}

function mapDemandContent(input: UpdateDemandInput) {
  return {
    p_title: input.title,
    p_description: input.description,
    p_priority: input.priority,
    p_start_date: input.start_date,
    p_due_date: input.due_date,
    p_notes: input.notes,
  };
}

export async function createDemand(
  input: CreateDemandInput,
): Promise<string> {
  const args: CreateDemandRpcArgs = {
    p_client_id: input.client_id,
    ...mapDemandContent(input),
    p_assignee_membership_ids: input.assignee_membership_ids,
  };

  return executeDemandRpc(() => createDemandRpc(args));
}

export async function updateDemand(
  demandId: string,
  input: UpdateDemandInput,
): Promise<string> {
  const args: UpdateDemandRpcArgs = {
    p_demand_id: demandId,
    ...mapDemandContent(input),
  };

  return executeDemandRpc(() => updateDemandRpc(args));
}

export async function changeDemandStatus(
  input: ChangeDemandStatusInput,
): Promise<string> {
  const args: ChangeDemandStatusRpcArgs = {
    p_demand_id: input.demand_id,
    p_status: input.status,
  };

  return executeDemandRpc(() => changeDemandStatusRpc(args));
}

export async function setDemandAssignees(
  input: SetDemandAssigneesInput,
): Promise<string> {
  const args: SetDemandAssigneesRpcArgs = {
    p_demand_id: input.demand_id,
    p_membership_ids: input.membership_ids,
  };

  return executeDemandRpc(() => setDemandAssigneesRpc(args));
}

export async function setDemandTags(
  input: SetDemandTagsInput,
): Promise<string> {
  const args: SetDemandTagsRpcArgs = {
    p_demand_id: input.demand_id,
    p_tag_ids: input.existing_tag_ids,
    p_new_tag_names: input.new_tag_names,
  };

  return executeDemandRpc(() => setDemandTagsRpc(args));
}

export async function archiveDemand(
  input: ArchiveDemandInput,
): Promise<string> {
  const args: ArchiveDemandRpcArgs = {
    p_demand_id: input.demand_id,
  };

  return executeDemandRpc(() => archiveDemandRpc(args));
}
