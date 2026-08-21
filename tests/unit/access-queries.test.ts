import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  listClientAccesses,
  listOrganizationMembers,
} from "@/lib/access/queries";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const clientId = "11111111-1111-4111-8111-111111111111";
const membershipId = "22222222-2222-4222-8222-222222222222";
const userId = "33333333-3333-4333-8333-333333333333";
const assignmentId = "44444444-4444-4444-8444-444444444444";

const memberRow = {
  id: membershipId,
  user_id: userId,
  role: "MEMBER",
  status: "ACTIVE",
  created_at: "2026-08-16T10:00:00.000Z",
  profiles: {
    full_name: "Maria Silva",
  },
};

function createOrderedQueryMock(response: unknown) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValueOnce(query).mockResolvedValueOnce(response);

  return query;
}

function createMembershipsByIdQueryMock(response: unknown) {
  const query = {
    select: vi.fn(),
    in: vi.fn().mockResolvedValue(response),
  };

  query.select.mockReturnValue(query);

  return query;
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

describe("access queries", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("lists visible Organization Memberships with stable ordering", async () => {
    const query = createOrderedQueryMock({ data: [memberRow], error: null });
    const supabase = {
      from: vi.fn().mockReturnValue(query),
    };
    mocks.createSupabaseClient.mockResolvedValue(supabase);

    const result = await listOrganizationMembers();

    expect(supabase.from).toHaveBeenCalledWith("organization_members");
    expect(query.order).toHaveBeenNthCalledWith(1, "created_at", {
      ascending: true,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "id", {
      ascending: true,
    });
    expect(result).toEqual([
      {
        membershipId,
        userId,
        fullName: "Maria Silva",
        role: "MEMBER",
        status: "ACTIVE",
        membershipCreatedAt: "2026-08-16T10:00:00.000Z",
      },
    ]);
  });

  it("maps visible Client Assignments and their Profile", async () => {
    const assignmentsQuery = createOrderedQueryMock({
      data: [
        {
          id: assignmentId,
          membership_id: membershipId,
          created_at: "2026-08-17T11:00:00.000Z",
        },
      ],
      error: null,
    });
    const membersQuery = createMembershipsByIdQueryMock({
      data: [memberRow],
      error: null,
    });
    const supabase = {
      from: vi.fn((table: string) =>
        table === "client_assignments" ? assignmentsQuery : membersQuery,
      ),
    };
    mocks.createSupabaseClient.mockResolvedValue(supabase);

    const result = await listClientAccesses(clientId);

    expect(supabase.from).toHaveBeenNthCalledWith(1, "client_assignments");
    expect(assignmentsQuery.eq).toHaveBeenCalledWith("client_id", clientId);
    expect(supabase.from).toHaveBeenNthCalledWith(2, "organization_members");
    expect(membersQuery.in).toHaveBeenCalledWith("id", [membershipId]);
    expect(result).toEqual([
      {
        assignmentId,
        membershipId,
        userId,
        fullName: "Maria Silva",
        role: "MEMBER",
        assignedAt: "2026-08-17T11:00:00.000Z",
      },
    ]);
  });

  it("returns an empty list without querying Memberships", async () => {
    const assignmentsQuery = createOrderedQueryMock({ data: [], error: null });
    const supabase = {
      from: vi.fn().mockReturnValue(assignmentsQuery),
    };
    mocks.createSupabaseClient.mockResolvedValue(supabase);

    await expect(listClientAccesses(clientId)).resolves.toEqual([]);
    expect(supabase.from).toHaveBeenCalledOnce();
  });

  it("does not expose administrative fields in access DTOs", async () => {
    const query = createOrderedQueryMock({ data: [memberRow], error: null });
    mocks.createSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    const [result] = await listOrganizationMembers();

    expect(result).not.toHaveProperty("organization_id");
    expect(result).not.toHaveProperty("created_by");
    expect(result).not.toHaveProperty("archived_at");
  });

  it("wraps Membership query failures and preserves the cause", async () => {
    const originalError = { message: "membership query denied" };
    const query = createOrderedQueryMock({
      data: null,
      error: originalError,
    });
    mocks.createSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    const error = await captureError(listOrganizationMembers());

    expect(error.message).toBe("ACCESS_MEMBERS_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });

  it("wraps Client Assignment query failures and preserves the cause", async () => {
    const originalError = { message: "assignment query denied" };
    const assignmentsQuery = createOrderedQueryMock({
      data: null,
      error: originalError,
    });
    mocks.createSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(assignmentsQuery),
    });

    const error = await captureError(listClientAccesses(clientId));

    expect(error.message).toBe("CLIENT_ACCESS_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });
});
