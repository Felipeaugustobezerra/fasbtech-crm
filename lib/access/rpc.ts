import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type AccessFunctions = Database["public"]["Functions"];

export type AddOrganizationMemberRpcArgs =
  AccessFunctions["add_organization_member"]["Args"];
export type UpdateOrganizationMemberRoleRpcArgs =
  AccessFunctions["update_organization_member_role"]["Args"];
export type AssignClientAccessRpcArgs =
  AccessFunctions["assign_client_access"]["Args"];
export type RemoveClientAccessRpcArgs =
  AccessFunctions["remove_client_access"]["Args"];

export async function addOrganizationMemberRpc(
  args: AddOrganizationMemberRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("add_organization_member", args);
}

export async function updateOrganizationMemberRoleRpc(
  args: UpdateOrganizationMemberRoleRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("update_organization_member_role", args);
}

export async function assignClientAccessRpc(args: AssignClientAccessRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("assign_client_access", args);
}

export async function removeClientAccessRpc(args: RemoveClientAccessRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("remove_client_access", args);
}
