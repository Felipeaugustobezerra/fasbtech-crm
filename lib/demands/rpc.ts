import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type DemandFunctions = Database["public"]["Functions"];

export type CreateDemandRpcArgs = DemandFunctions["create_demand"]["Args"];
export type UpdateDemandRpcArgs = DemandFunctions["update_demand"]["Args"];
export type ChangeDemandStatusRpcArgs =
  DemandFunctions["change_demand_status"]["Args"];
export type SetDemandAssigneesRpcArgs =
  DemandFunctions["set_demand_assignees"]["Args"];
export type SetDemandTagsRpcArgs =
  DemandFunctions["set_demand_tags"]["Args"];
export type ArchiveDemandRpcArgs =
  DemandFunctions["archive_demand"]["Args"];

export async function createDemandRpc(args: CreateDemandRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("create_demand", args);
}

export async function updateDemandRpc(args: UpdateDemandRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("update_demand", args);
}

export async function changeDemandStatusRpc(
  args: ChangeDemandStatusRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("change_demand_status", args);
}

export async function setDemandAssigneesRpc(
  args: SetDemandAssigneesRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("set_demand_assignees", args);
}

export async function setDemandTagsRpc(args: SetDemandTagsRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("set_demand_tags", args);
}

export async function archiveDemandRpc(args: ArchiveDemandRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("archive_demand", args);
}
