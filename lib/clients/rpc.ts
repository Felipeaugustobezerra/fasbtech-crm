import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type ClientFunctions = Database["public"]["Functions"];

export type CreateClientRpcArgs = ClientFunctions["create_client"]["Args"];
export type UpdateClientRpcArgs = ClientFunctions["update_client"]["Args"];
export type ArchiveClientRpcArgs = ClientFunctions["archive_client"]["Args"];

export async function createClientRpc(args: CreateClientRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("create_client", args);
}

export async function updateClientRpc(args: UpdateClientRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("update_client", args);
}

export async function archiveClientRpc(args: ArchiveClientRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("archive_client", args);
}
