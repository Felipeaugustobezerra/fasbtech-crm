import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type {
  ContractDraftData,
  ContractSnapshot,
} from "@/types/contracts";

type ContractFunctions = Database["public"]["Functions"];

export type CreateContractTemplateRpcArgs =
  ContractFunctions["create_contract_template"]["Args"];
export type UpdateContractTemplateRpcArgs =
  ContractFunctions["update_contract_template"]["Args"];
export type ActivateContractTemplateRpcArgs =
  ContractFunctions["activate_contract_template"]["Args"];
export type DeactivateContractTemplateRpcArgs =
  ContractFunctions["deactivate_contract_template"]["Args"];

type GeneratedCreateContractRpcArgs =
  ContractFunctions["create_contract"]["Args"];
type GeneratedUpdateDraftContractRpcArgs =
  ContractFunctions["update_draft_contract"]["Args"];
type GeneratedGenerateContractRpcArgs =
  ContractFunctions["generate_contract"]["Args"];

export type CreateContractRpcArgs = Omit<
  GeneratedCreateContractRpcArgs,
  "p_draft_data"
> & {
  p_draft_data?: ContractDraftData;
};

export type UpdateDraftContractRpcArgs = Omit<
  GeneratedUpdateDraftContractRpcArgs,
  "p_draft_data"
> & {
  p_draft_data?: ContractDraftData;
};

export type GenerateContractRpcArgs = Omit<
  GeneratedGenerateContractRpcArgs,
  "p_snapshot"
> & {
  p_snapshot: ContractSnapshot;
};

export type MarkContractSentRpcArgs =
  ContractFunctions["mark_contract_sent"]["Args"];
export type MarkContractSignedRpcArgs =
  ContractFunctions["mark_contract_signed"]["Args"];
export type CancelContractRpcArgs =
  ContractFunctions["cancel_contract"]["Args"];

export async function createContractTemplateRpc(
  args: CreateContractTemplateRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("create_contract_template", args);
}

export async function updateContractTemplateRpc(
  args: UpdateContractTemplateRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("update_contract_template", args);
}

export async function activateContractTemplateRpc(
  args: ActivateContractTemplateRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("activate_contract_template", args);
}

export async function deactivateContractTemplateRpc(
  args: DeactivateContractTemplateRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("deactivate_contract_template", args);
}

export async function createContractRpc(args: CreateContractRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc(
    "create_contract",
    args as unknown as GeneratedCreateContractRpcArgs,
  );
}

export async function updateDraftContractRpc(
  args: UpdateDraftContractRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc(
    "update_draft_contract",
    args as unknown as GeneratedUpdateDraftContractRpcArgs,
  );
}

export async function generateContractRpc(args: GenerateContractRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc(
    "generate_contract",
    args as unknown as GeneratedGenerateContractRpcArgs,
  );
}

export async function markContractSentRpc(
  args: MarkContractSentRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("mark_contract_sent", args);
}

export async function markContractSignedRpc(
  args: MarkContractSignedRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("mark_contract_signed", args);
}

export async function cancelContractRpc(args: CancelContractRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("cancel_contract", args);
}
