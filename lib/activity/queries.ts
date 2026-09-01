import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { ClientActivitySummary } from "@/types/activity";

export async function listClientActivities(
  clientId: string,
): Promise<ClientActivitySummary[]> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("action, created_at")
      .eq("entity_type", "CLIENT")
      .eq("entity_id", clientId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((activity) => ({
      action: activity.action,
      createdAt: activity.created_at,
    }));
  } catch (cause) {
    throw new Error("CLIENT_ACTIVITY_QUERY_FAILED", { cause });
  }
}
