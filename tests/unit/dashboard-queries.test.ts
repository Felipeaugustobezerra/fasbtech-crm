import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getActiveClientCount,
  getContractDashboardSummary,
  getDemandDashboardSummary,
  getRecentDashboardActivities,
} from "@/lib/dashboard/queries";

const mocks = vi.hoisted(() => ({ createSupabaseClient: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

type CountRule = {
  table: string;
  status?: string;
  overdue?: boolean;
  count: number;
};

function createSupabaseMock(rules: CountRule[]) {
  const countBuilders: Array<{
    table: string;
    select: ReturnType<typeof vi.fn>;
    is: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    lt: ReturnType<typeof vi.fn>;
  }> = [];
  const activityQuery = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn().mockResolvedValue({
      data: [
        {
          id: "11111111-1111-4111-8111-111111111111",
          entity_type: "DEMAND",
          entity_id: "22222222-2222-4222-8222-222222222222",
          action: "UPDATED",
          created_at: "2026-09-20T10:00:00Z",
        },
      ],
      error: null,
    }),
  };
  activityQuery.select.mockReturnValue(activityQuery);
  activityQuery.order.mockReturnValue(activityQuery);

  const from = vi.fn((table: string) => {
    if (table === "activity_logs") return activityQuery;

    const state: { status?: string; overdue?: boolean } = {};
    const builder = {
      table,
      select: vi.fn(),
      is: vi.fn(),
      eq: vi.fn((_column: string, value: string) => {
        state.status = value;
        return builder;
      }),
      in: vi.fn(() => builder),
      lt: vi.fn(() => {
        state.overdue = true;
        return builder;
      }),
      then: (
        resolve: (value: { count: number; error: null }) => unknown,
      ) => {
        const rule = rules.find(
          (item) =>
            item.table === table &&
            item.status === state.status &&
            Boolean(item.overdue) === Boolean(state.overdue),
        );
        return Promise.resolve({ count: rule?.count ?? 0, error: null }).then(
          resolve,
        );
      },
    };
    builder.select.mockReturnValue(builder);
    builder.is.mockReturnValue(builder);
    countBuilders.push(builder);
    return builder;
  });

  const supabase = { from };
  mocks.createSupabaseClient.mockResolvedValue(supabase);
  return { supabase, countBuilders, activityQuery };
}

describe("dashboard queries", () => {
  beforeEach(() => mocks.createSupabaseClient.mockReset());

  it("counts only active authorized clients in the database", async () => {
    const { countBuilders } = createSupabaseMock([
      { table: "clients", count: 4 },
    ]);

    await expect(getActiveClientCount()).resolves.toBe(4);
    expect(countBuilders[0]?.select).toHaveBeenCalledWith("id", {
      count: "exact",
      head: true,
    });
    expect(countBuilders[0]?.is).toHaveBeenCalledWith("archived_at", null);
  });

  it("derives active and overdue demands from database counts", async () => {
    const rules: CountRule[] = [
      { table: "demands", status: "OPEN", count: 2 },
      { table: "demands", status: "IN_PROGRESS", count: 3 },
      { table: "demands", status: "WAITING_CLIENT", count: 1 },
      { table: "demands", status: "REVIEW", count: 1 },
      { table: "demands", status: "COMPLETED", count: 5 },
      { table: "demands", status: "CANCELED", count: 2 },
      { table: "demands", overdue: true, count: 3 },
    ];
    const { countBuilders } = createSupabaseMock(rules);

    const result = await getDemandDashboardSummary("2026-09-20");

    expect(result.active).toBe(7);
    expect(result.overdue).toBe(3);
    expect(result.byStatus.COMPLETED).toBe(5);
    const overdue = countBuilders.find((builder) =>
      builder.lt.mock.calls.some((call) => call[0] === "due_date"),
    );
    expect(overdue?.in).toHaveBeenCalledWith("status", [
      "OPEN",
      "IN_PROGRESS",
      "WAITING_CLIENT",
      "REVIEW",
    ]);
    expect(overdue?.lt).toHaveBeenCalledWith("due_date", "2026-09-20");
  });

  it("derives non-terminal contracts from status counts", async () => {
    createSupabaseMock([
      { table: "contracts", status: "DRAFT", count: 2 },
      { table: "contracts", status: "GENERATED", count: 1 },
      { table: "contracts", status: "SENT", count: 3 },
      { table: "contracts", status: "SIGNED", count: 4 },
      { table: "contracts", status: "CANCELED", count: 1 },
    ]);

    const result = await getContractDashboardSummary();

    expect(result.nonTerminal).toBe(6);
    expect(result.byStatus.SIGNED).toBe(4);
  });

  it("requests only the minimal 10 recent authorized activities", async () => {
    const { activityQuery } = createSupabaseMock([]);

    const result = await getRecentDashboardActivities();

    expect(activityQuery.select).toHaveBeenCalledWith(
      "id,entity_type,entity_id,action,created_at",
    );
    expect(activityQuery.limit).toHaveBeenCalledWith(10);
    expect(result[0]).toEqual(
      expect.objectContaining({ entityType: "DEMAND", action: "UPDATED" }),
    );
    expect(result[0]).not.toHaveProperty("metadata");
    expect(result[0]).not.toHaveProperty("organization_id");
  });
});
