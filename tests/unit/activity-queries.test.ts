import { beforeEach, describe, expect, it, vi } from "vitest";

import { listClientActivities } from "@/lib/activity/queries";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const clientId = "11111111-1111-4111-8111-111111111111";

const activityRow = {
  action: "UPDATED",
  created_at: "2026-08-20T12:34:00.000Z",
};

function createActivityQueryMock(
  response: {
    data: typeof activityRow[] | null;
    error: { message: string } | null;
  } = { data: [activityRow], error: null },
) {
  const query = {
    delete: vi.fn(),
    eq: vi.fn(),
    insert: vi.fn(),
    order: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValueOnce(query).mockResolvedValueOnce(response);

  const supabase = {
    from: vi.fn().mockReturnValue(query),
    rpc: vi.fn(),
  };

  mocks.createSupabaseClient.mockResolvedValue(supabase);

  return { query, supabase };
}

async function captureError(operation: Promise<unknown>) {
  try {
    await operation;
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }

    throw error;
  }

  throw new Error("EXPECTED_OPERATION_TO_FAIL");
}

describe("activity queries", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("lists Client activities with database filters and stable ordering", async () => {
    const { query, supabase } = createActivityQueryMock();

    const result = await listClientActivities(clientId);

    expect(supabase.from).toHaveBeenCalledWith("activity_logs");
    expect(query.select).toHaveBeenCalledWith("action, created_at");
    expect(query.eq).toHaveBeenNthCalledWith(1, "entity_type", "CLIENT");
    expect(query.eq).toHaveBeenNthCalledWith(2, "entity_id", clientId);
    expect(query.eq).toHaveBeenCalledTimes(2);
    expect(query.order).toHaveBeenNthCalledWith(1, "created_at", {
      ascending: false,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "id", {
      ascending: false,
    });
    expect(result).toEqual([
      {
        action: "UPDATED",
        createdAt: "2026-08-20T12:34:00.000Z",
      },
    ]);
  });

  it("returns an empty DTO list when RLS exposes no activity", async () => {
    createActivityQueryMock({ data: [], error: null });

    await expect(listClientActivities(clientId)).resolves.toEqual([]);
  });

  it("wraps query failures with a stable error and preserves the cause", async () => {
    const originalError = { message: "activity query denied" };
    createActivityQueryMock({ data: null, error: originalError });

    const error = await captureError(listClientActivities(clientId));

    expect(error.message).toBe("CLIENT_ACTIVITY_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });

  it("performs no write or RPC while reading activities", async () => {
    const { query, supabase } = createActivityQueryMock();

    await listClientActivities(clientId);

    expect(query.insert).not.toHaveBeenCalled();
    expect(query.update).not.toHaveBeenCalled();
    expect(query.delete).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
