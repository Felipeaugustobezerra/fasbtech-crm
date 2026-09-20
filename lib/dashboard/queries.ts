import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { CONTRACT_STATUSES, type ContractStatus } from "@/types/contracts";
import { DEMAND_STATUSES, type DemandStatus } from "@/types/demand";
import type {
  ContractDashboardSummary,
  DashboardActivity,
  DemandDashboardSummary,
} from "@/types/dashboard";

const ACTIVE_DEMAND_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CLIENT",
  "REVIEW",
] as const satisfies readonly DemandStatus[];

const NON_TERMINAL_CONTRACT_STATUSES = [
  "DRAFT",
  "GENERATED",
  "SENT",
] as const satisfies readonly ContractStatus[];

type CountResponse = {
  count: number | null;
  error: { message: string } | null;
};

async function readCount(
  request: PromiseLike<CountResponse>,
  errorCode: string,
) {
  const { count, error } = await request;

  if (error) {
    throw new Error(errorCode, { cause: error });
  }

  return count ?? 0;
}

export async function getActiveClientCount(): Promise<number> {
  const supabase = await createSupabaseClient();

  return readCount(
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .is("archived_at", null),
    "DASHBOARD_CLIENT_COUNT_FAILED",
  );
}

export async function getDemandDashboardSummary(
  civilDate: string,
): Promise<DemandDashboardSummary> {
  const supabase = await createSupabaseClient();

  const statusCounts = DEMAND_STATUSES.map((status) =>
    readCount(
      supabase
        .from("demands")
        .select("id", { count: "exact", head: true })
        .is("archived_at", null)
        .eq("status", status),
      "DASHBOARD_DEMAND_COUNT_FAILED",
    ),
  );

  const overdueCount = readCount(
    supabase
      .from("demands")
      .select("id", { count: "exact", head: true })
      .is("archived_at", null)
      .in("status", [...ACTIVE_DEMAND_STATUSES])
      .lt("due_date", civilDate),
    "DASHBOARD_DEMAND_COUNT_FAILED",
  );

  const [counts, overdue] = await Promise.all([
    Promise.all(statusCounts),
    overdueCount,
  ]);
  const byStatus = Object.fromEntries(
    DEMAND_STATUSES.map((status, index) => [status, counts[index] ?? 0]),
  ) as Record<DemandStatus, number>;
  const active = ACTIVE_DEMAND_STATUSES.reduce(
    (total, status) => total + byStatus[status],
    0,
  );

  return { active, overdue, byStatus };
}

export async function getContractDashboardSummary(): Promise<ContractDashboardSummary> {
  const supabase = await createSupabaseClient();
  const counts = await Promise.all(
    CONTRACT_STATUSES.map((status) =>
      readCount(
        supabase
          .from("contracts")
          .select("id", { count: "exact", head: true })
          .eq("status", status),
        "DASHBOARD_CONTRACT_COUNT_FAILED",
      ),
    ),
  );
  const byStatus = Object.fromEntries(
    CONTRACT_STATUSES.map((status, index) => [status, counts[index] ?? 0]),
  ) as Record<ContractStatus, number>;
  const nonTerminal = NON_TERMINAL_CONTRACT_STATUSES.reduce(
    (total, status) => total + byStatus[status],
    0,
  );

  return { nonTerminal, byStatus };
}

export async function getRecentDashboardActivities(): Promise<DashboardActivity[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id,entity_type,entity_id,action,created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error("DASHBOARD_ACTIVITY_QUERY_FAILED", { cause: error });
  }

  return (data ?? []).map((activity) => ({
    id: activity.id,
    entityType: activity.entity_type,
    entityId: activity.entity_id,
    action: activity.action,
    createdAt: activity.created_at,
  }));
}
