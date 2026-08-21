import {
  addOrganizationMemberRpc,
  assignClientAccessRpc,
  removeClientAccessRpc,
  updateOrganizationMemberRoleRpc,
  type AddOrganizationMemberRpcArgs,
  type AssignClientAccessRpcArgs,
  type RemoveClientAccessRpcArgs,
  type UpdateOrganizationMemberRoleRpcArgs,
} from "@/lib/access/rpc";
import type { AddOrganizationMemberInput } from "@/schemas/access";
import type { OrganizationRole } from "@/types/access";

type AccessServiceErrorCode =
  | "ACCESS_MEMBER_ADD_FAILED"
  | "ACCESS_MEMBER_ROLE_UPDATE_FAILED"
  | "CLIENT_ACCESS_ASSIGN_FAILED"
  | "CLIENT_ACCESS_REMOVE_FAILED";

type AccessRpcResult = Awaited<ReturnType<typeof addOrganizationMemberRpc>>;

async function executeAccessRpc(
  operation: () => Promise<AccessRpcResult>,
  errorCode: AccessServiceErrorCode,
): Promise<string> {
  try {
    const { data, error } = await operation();

    if (error) {
      throw error;
    }

    if (data === null) {
      throw new Error("ACCESS_RPC_EMPTY_RESULT");
    }

    return data;
  } catch (cause) {
    throw new Error(errorCode, { cause });
  }
}

export async function addOrganizationMember(
  input: AddOrganizationMemberInput,
): Promise<string> {
  const args: AddOrganizationMemberRpcArgs = {
    p_email: input.email,
    p_role: input.role,
  };

  return executeAccessRpc(
    () => addOrganizationMemberRpc(args),
    "ACCESS_MEMBER_ADD_FAILED",
  );
}

export async function updateOrganizationMemberRole(
  membershipId: string,
  role: OrganizationRole,
): Promise<string> {
  const args: UpdateOrganizationMemberRoleRpcArgs = {
    p_membership_id: membershipId,
    p_role: role,
  };

  return executeAccessRpc(
    () => updateOrganizationMemberRoleRpc(args),
    "ACCESS_MEMBER_ROLE_UPDATE_FAILED",
  );
}

export async function assignClientAccess(
  clientId: string,
  membershipId: string,
): Promise<string> {
  const args: AssignClientAccessRpcArgs = {
    p_client_id: clientId,
    p_membership_id: membershipId,
  };

  return executeAccessRpc(
    () => assignClientAccessRpc(args),
    "CLIENT_ACCESS_ASSIGN_FAILED",
  );
}

export async function removeClientAccess(
  clientId: string,
  membershipId: string,
): Promise<string> {
  const args: RemoveClientAccessRpcArgs = {
    p_client_id: clientId,
    p_membership_id: membershipId,
  };

  return executeAccessRpc(
    () => removeClientAccessRpc(args),
    "CLIENT_ACCESS_REMOVE_FAILED",
  );
}
