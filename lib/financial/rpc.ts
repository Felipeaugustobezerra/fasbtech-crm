import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { FinancialDecimal } from "@/types/financial";

type FinancialFunctions = Database["public"]["Functions"];

type GeneratedCreateFinancialEntryRpcArgs =
  FinancialFunctions["create_financial_entry"]["Args"];
type GeneratedUpdateFinancialEntryRpcArgs =
  FinancialFunctions["update_financial_entry"]["Args"];
type GeneratedChangeFinancialEntryStatusRpcArgs =
  FinancialFunctions["change_financial_entry_status"]["Args"];
type GeneratedArchiveFinancialEntryRpcArgs =
  FinancialFunctions["archive_financial_entry"]["Args"];
type GeneratedSetFinancialGoalRpcArgs =
  FinancialFunctions["set_financial_goal"]["Args"];

type FinancialEntryRpcNullableArgs = {
  p_category?: string | null;
  p_client_id?: string | null;
  p_due_date?: string | null;
  p_notes?: string | null;
};

export type CreateFinancialEntryRpcArgs = Omit<
  GeneratedCreateFinancialEntryRpcArgs,
  "p_amount" | keyof FinancialEntryRpcNullableArgs
> &
  FinancialEntryRpcNullableArgs & {
    p_amount: FinancialDecimal;
  };

export type UpdateFinancialEntryRpcArgs = Omit<
  GeneratedUpdateFinancialEntryRpcArgs,
  "p_amount" | keyof FinancialEntryRpcNullableArgs
> &
  FinancialEntryRpcNullableArgs & {
    p_amount: FinancialDecimal;
  };

export type ChangeFinancialEntryStatusRpcArgs = Omit<
  GeneratedChangeFinancialEntryStatusRpcArgs,
  "p_realized_date"
> & {
  p_realized_date?: string | null;
};

export type ArchiveFinancialEntryRpcArgs =
  GeneratedArchiveFinancialEntryRpcArgs;

export type SetFinancialGoalRpcArgs = Omit<
  GeneratedSetFinancialGoalRpcArgs,
  "p_target_amount"
> & {
  p_target_amount: FinancialDecimal;
};

export async function createFinancialEntryRpc(
  args: CreateFinancialEntryRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc(
    "create_financial_entry",
    args as unknown as GeneratedCreateFinancialEntryRpcArgs,
  );
}

export async function updateFinancialEntryRpc(
  args: UpdateFinancialEntryRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc(
    "update_financial_entry",
    args as unknown as GeneratedUpdateFinancialEntryRpcArgs,
  );
}

export async function changeFinancialEntryStatusRpc(
  args: ChangeFinancialEntryStatusRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc(
    "change_financial_entry_status",
    args as unknown as GeneratedChangeFinancialEntryStatusRpcArgs,
  );
}

export async function archiveFinancialEntryRpc(
  args: ArchiveFinancialEntryRpcArgs,
) {
  const supabase = await createSupabaseClient();

  return supabase.rpc("archive_financial_entry", args);
}

export async function setFinancialGoalRpc(args: SetFinancialGoalRpcArgs) {
  const supabase = await createSupabaseClient();

  return supabase.rpc(
    "set_financial_goal",
    args as unknown as GeneratedSetFinancialGoalRpcArgs,
  );
}

