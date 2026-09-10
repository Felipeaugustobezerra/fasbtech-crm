import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getDemandById,
  listDemandAssignees,
  listDemands,
  listEligibleDemandAssignees,
} from "@/lib/demands/queries";
import {
  DEFAULT_DEMAND_PAGE_SIZE,
  parseDemandListParams,
  type DemandListParamsInput,
} from "@/schemas/demand-query";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const demandId = "11111111-1111-4111-8111-111111111111";
const secondDemandId = "11111111-1111-4111-8111-111111111112";
const clientId = "22222222-2222-4222-8222-222222222222";
const membershipId = "33333333-3333-4333-8333-333333333333";
const secondMembershipId = "33333333-3333-4333-8333-333333333334";
const tagId = "44444444-4444-4444-8444-444444444444";

type DemandListRowFixture = {
  id: string;
  client_id: string;
  title: string;
  status: string;
  priority: string;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  client: { id: string; name: string };
  tag_assignments: Array<{
    tag: { id: string; name: string };
  }>;
};

type BulkAssigneeRowFixture = {
  demand_id: string;
  membership_id: string;
  full_name: string;
  role: string;
  is_currently_eligible: boolean;
};

const demandListRow: DemandListRowFixture = {
  id: demandId,
  client_id: clientId,
  title: "Atualizar website",
  status: "OPEN",
  priority: "HIGH",
  start_date: "2026-09-01",
  due_date: "2026-09-30",
  created_at: "2026-09-01T10:00:00.000Z",
  updated_at: "2026-09-02T11:00:00.000Z",
  client: {
    id: clientId,
    name: "Cliente Exemplo",
  },
  tag_assignments: [
    {
      tag: {
        id: tagId,
        name: "Website",
      },
    },
  ],
} as const;

const demandDetailsRow = {
  id: demandListRow.id,
  client_id: demandListRow.client_id,
  title: demandListRow.title,
  description: "Atualizar o website institucional.",
  status: demandListRow.status,
  priority: demandListRow.priority,
  start_date: demandListRow.start_date,
  due_date: demandListRow.due_date,
  notes: "Publicar após aprovação.",
  created_at: demandListRow.created_at,
  updated_at: demandListRow.updated_at,
  archived_at: null,
  client: demandListRow.client,
  tag_assignments: demandListRow.tag_assignments,
};

const currentAssignee = {
  membership_id: membershipId,
  full_name: "Maria Silva",
  role: "MEMBER",
  is_currently_eligible: false,
};

const bulkAssigneeRow: BulkAssigneeRowFixture = {
  demand_id: demandId,
  ...currentAssignee,
};

const eligibleAssignee = {
  membership_id: membershipId,
  full_name: "Maria Silva",
  role: "MEMBER",
};

type QueryError = { message: string; code?: string };

function createListQueryMock(
  options: {
    response?: {
      data: DemandListRowFixture[] | null;
      error: QueryError | null;
      count: number | null;
    };
    rpcResponse?: {
      data: BulkAssigneeRowFixture[] | null;
      error: QueryError | null;
    };
  } = {},
) {
  const response = options.response ?? {
    data: [demandListRow],
    error: null,
    count: 1,
  };
  const rpcResponse = options.rpcResponse ?? {
    data: [bulkAssigneeRow],
    error: null,
  };
  const query = {
    delete: vi.fn(),
    eq: vi.fn(),
    gt: vi.fn(),
    insert: vi.fn(),
    is: vi.fn(),
    lt: vi.fn(),
    not: vi.fn(),
    or: vi.fn(),
    order: vi.fn(),
    range: vi.fn().mockResolvedValue(response),
    select: vi.fn(),
    update: vi.fn(),
  };

  query.eq.mockReturnValue(query);
  query.gt.mockReturnValue(query);
  query.is.mockReturnValue(query);
  query.lt.mockReturnValue(query);
  query.not.mockReturnValue(query);
  query.or.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.select.mockReturnValue(query);

  const supabase = {
    from: vi.fn().mockReturnValue(query),
    rpc: vi.fn().mockResolvedValue(rpcResponse),
  };

  mocks.createSupabaseClient.mockResolvedValue(supabase);

  return { query, supabase };
}

function createDetailQueryMock(
  response: {
    data: typeof demandDetailsRow | null;
    error: QueryError | null;
  } = { data: demandDetailsRow, error: null },
  rpcResponse: {
    data: (typeof currentAssignee)[] | null;
    error: QueryError | null;
  } = { data: [currentAssignee], error: null },
) {
  const query = {
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(response),
    select: vi.fn(),
  };

  query.eq.mockReturnValue(query);
  query.select.mockReturnValue(query);

  const supabase = {
    from: vi.fn().mockReturnValue(query),
    rpc: vi.fn().mockResolvedValue(rpcResponse),
  };

  mocks.createSupabaseClient.mockResolvedValue(supabase);

  return { query, supabase };
}

function createRpcMock(response: {
  data: unknown[] | null;
  error: QueryError | null;
}) {
  const supabase = {
    from: vi.fn(),
    rpc: vi.fn().mockResolvedValue(response),
  };

  mocks.createSupabaseClient.mockResolvedValue(supabase);

  return supabase;
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

describe("demand query params", () => {
  it("applies stable defaults", () => {
    expect(parseDemandListParams()).toEqual({
      page: 1,
      pageSize: DEFAULT_DEMAND_PAGE_SIZE,
      sort: "updated_at",
      direction: "desc",
    });
  });

  it("trims search and treats an empty search as absent", () => {
    expect(parseDemandListParams({ search: "  website  " }).search).toBe(
      "website",
    );
    expect(parseDemandListParams({ search: "   " }).search).toBeUndefined();
  });

  it("rejects the PostgREST LIKE wildcard alias in search", async () => {
    await expect(
      Promise.resolve().then(() =>
        parseDemandListParams({ search: "website*" }),
      ),
    ).rejects.toThrow("DEMAND_QUERY_VALIDATION_FAILED");
  });

  it("falls back safely for invalid page and page size", () => {
    const result = parseDemandListParams({ page: "0", pageSize: "25" });

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(DEFAULT_DEMAND_PAGE_SIZE);
  });

  it("accepts supported page sizes from Search Params", () => {
    expect(parseDemandListParams({ page: "3", pageSize: "50" })).toMatchObject(
      {
        page: 3,
        pageSize: 50,
      },
    );
  });

  it.each([
    ["Status", { status: "ARCHIVED" }],
    ["Priority", { priority: "CRITICAL" }],
  ])("rejects an invalid %s filter", async (_label, input) => {
    await expect(
      Promise.resolve().then(() => parseDemandListParams(input)),
    ).rejects.toThrow("DEMAND_QUERY_VALIDATION_FAILED");
  });

  it.each([
    ["client", { clientId: "invalid-client" }],
    ["assignee", { assigneeId: "invalid-assignee" }],
    ["tag", { tagId: "invalid-tag" }],
  ])("rejects an invalid %s UUID", async (_label, input) => {
    await expect(
      Promise.resolve().then(() => parseDemandListParams(input)),
    ).rejects.toThrow("DEMAND_QUERY_VALIDATION_FAILED");
  });

  it("falls back to the official sort and direction", () => {
    const input = {
      sort: "organization_id",
      direction: "sideways",
    } as unknown as DemandListParamsInput;

    expect(parseDemandListParams(input)).toMatchObject({
      sort: "updated_at",
      direction: "desc",
    });
  });

  it("accepts valid civil date filters", () => {
    expect(
      parseDemandListParams({
        dueBefore: "2026-10-01",
        dueAfter: "2026-09-01",
        dueOn: "2026-09-15",
      }),
    ).toMatchObject({
      dueBefore: "2026-10-01",
      dueAfter: "2026-09-01",
      dueOn: "2026-09-15",
    });
  });

  it("rejects invalid civil dates", async () => {
    await expect(
      Promise.resolve().then(() =>
        parseDemandListParams({ dueOn: "2026-02-30" }),
      ),
    ).rejects.toThrow("DEMAND_QUERY_VALIDATION_FAILED");
  });
});

describe("demand list query", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("lists authorized active demands with minimal relations and defaults", async () => {
    const { query, supabase } = createListQueryMock();

    const result = await listDemands();

    expect(supabase.from).toHaveBeenCalledWith("demands");
    expect(query.select).toHaveBeenCalledWith(expect.any(String), {
      count: "exact",
    });
    expect(query.is).toHaveBeenCalledWith("archived_at", null);
    expect(query.order).toHaveBeenNthCalledWith(1, "updated_at", {
      ascending: false,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "id", {
      ascending: false,
    });
    expect(query.range).toHaveBeenCalledWith(0, 19);
    expect(query.or).not.toHaveBeenCalled();
    expect(query.eq).not.toHaveBeenCalled();
    expect(query.not).not.toHaveBeenCalled();

    const selection = query.select.mock.calls[0]?.[0] as string;

    expect(selection).toMatch(/assignee_filter:demand_assignees\s*\(\s*\)/);
    expect(selection).toMatch(
      /tag_filter:demand_tag_assignments\s*\(\s*\)/,
    );
    expect(selection).not.toMatch(/\bassignees:demand_assignees\s*\(/);
    expect(supabase.rpc).toHaveBeenCalledOnce();
    expect(supabase.rpc).toHaveBeenCalledWith(
      "list_demand_assignees_bulk",
      { p_demand_ids: [demandId] },
    );
    expect(result).toEqual({
      items: [
        {
          id: demandId,
          client_id: clientId,
          title: "Atualizar website",
          status: "OPEN",
          priority: "HIGH",
          start_date: "2026-09-01",
          due_date: "2026-09-30",
          created_at: "2026-09-01T10:00:00.000Z",
          updated_at: "2026-09-02T11:00:00.000Z",
          client: {
            id: clientId,
            name: "Cliente Exemplo",
          },
          assignees: [currentAssignee],
          tags: [{ id: tagId, name: "Website" }],
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it("loads and groups page assignees with one bulk RPC", async () => {
    const secondDemandRow = {
      ...demandListRow,
      id: secondDemandId,
      title: "Preparar campanha",
    };
    const secondAssignee = {
      demand_id: secondDemandId,
      membership_id: secondMembershipId,
      full_name: "Ana Costa",
      role: "OWNER",
      is_currently_eligible: true,
    };
    const additionalFirstDemandAssignee = {
      demand_id: demandId,
      membership_id: secondMembershipId,
      full_name: "Ana Costa",
      role: "OWNER",
      is_currently_eligible: true,
    };
    const { supabase } = createListQueryMock({
      response: {
        data: [demandListRow, secondDemandRow],
        error: null,
        count: 2,
      },
      rpcResponse: {
        data: [
          bulkAssigneeRow,
          secondAssignee,
          additionalFirstDemandAssignee,
        ],
        error: null,
      },
    });

    const result = await listDemands();

    expect(supabase.rpc).toHaveBeenCalledOnce();
    expect(supabase.rpc).toHaveBeenCalledWith(
      "list_demand_assignees_bulk",
      { p_demand_ids: [demandId, secondDemandId] },
    );
    expect(supabase.rpc).not.toHaveBeenCalledWith(
      "list_demand_assignees",
      expect.anything(),
    );
    expect(result.items[0]?.assignees).toEqual([
      currentAssignee,
      {
        membership_id: secondMembershipId,
        full_name: "Ana Costa",
        role: "OWNER",
        is_currently_eligible: true,
      },
    ]);
    expect(result.items[1]?.assignees).toEqual([
      {
        membership_id: secondMembershipId,
        full_name: "Ana Costa",
        role: "OWNER",
        is_currently_eligible: true,
      },
    ]);
  });

  it("returns an empty assignee collection when the bulk RPC has no rows", async () => {
    createListQueryMock({
      rpcResponse: { data: [], error: null },
    });

    const result = await listDemands();

    expect(result.items[0]?.assignees).toEqual([]);
  });

  it("projects only the minimum bulk assignee fields", async () => {
    const assigneeWithUnexpectedFields = {
      ...bulkAssigneeRow,
      email: "not-returned@example.com",
      organization_id: "not-returned",
    };
    createListQueryMock({
      rpcResponse: {
        data: [assigneeWithUnexpectedFields],
        error: null,
      },
    });

    const result = await listDemands();

    expect(result.items[0]?.assignees).toEqual([currentAssignee]);
    expect(result.items[0]?.assignees[0]).not.toHaveProperty("email");
    expect(result.items[0]?.assignees[0]).not.toHaveProperty(
      "organization_id",
    );
  });

  it("searches title and description in PostgreSQL with a trimmed term", async () => {
    const { query } = createListQueryMock();

    await listDemands({ search: "  website  " });

    expect(query.or).toHaveBeenCalledWith(
      'title.ilike."%website%",description.ilike."%website%"',
    );
  });

  it("quotes PostgREST control characters and LIKE wildcards in search", async () => {
    const { query } = createListQueryMock();

    await listDemands({ search: '100%_ "site",active.eq.true' });

    expect(query.or).toHaveBeenCalledWith(
      'title.ilike."%100\\\\%\\\\_ \\"site\\",active.eq.true%",description.ilike."%100\\\\%\\\\_ \\"site\\",active.eq.true%"',
    );
  });

  it("keeps a closing quote and filter syntax inside the search value", async () => {
    const { query } = createListQueryMock();

    await listDemands({ search: 'x"),status.eq.COMPLETED' });

    expect(query.or).toHaveBeenCalledWith(
      'title.ilike."%x\\"),status.eq.COMPLETED%",description.ilike."%x\\"),status.eq.COMPLETED%"',
    );
  });

  it("applies client, Status and Priority filters in the database", async () => {
    const { query } = createListQueryMock();

    await listDemands({
      clientId,
      status: "IN_PROGRESS",
      priority: "URGENT",
    });

    expect(query.eq).toHaveBeenCalledWith("client_id", clientId);
    expect(query.eq).toHaveBeenCalledWith("status", "IN_PROGRESS");
    expect(query.eq).toHaveBeenCalledWith("priority", "URGENT");
  });

  it("filters by assignee through the protected relation", async () => {
    const { query } = createListQueryMock();

    await listDemands({ assigneeId: membershipId });

    expect(query.eq).toHaveBeenCalledWith(
      "assignee_filter.membership_id",
      membershipId,
    );
    expect(query.not).toHaveBeenCalledWith("assignee_filter", "is", null);
  });

  it("filters by Tag through the protected relation", async () => {
    const { query } = createListQueryMock();

    await listDemands({ tagId });

    expect(query.eq).toHaveBeenCalledWith("tag_filter.tag_id", tagId);
    expect(query.not).toHaveBeenCalledWith("tag_filter", "is", null);
  });

  it("applies only objective due date filters", async () => {
    const { query } = createListQueryMock();

    await listDemands({
      dueBefore: "2026-10-01",
      dueAfter: "2026-09-01",
      dueOn: "2026-09-15",
    });

    expect(query.lt).toHaveBeenCalledWith("due_date", "2026-10-01");
    expect(query.gt).toHaveBeenCalledWith("due_date", "2026-09-01");
    expect(query.eq).toHaveBeenCalledWith("due_date", "2026-09-15");
  });

  it("uses only supported sorting and stable matching directions", async () => {
    const { query } = createListQueryMock();

    await listDemands({ sort: "title", direction: "asc" });

    expect(query.order).toHaveBeenNthCalledWith(1, "title", {
      ascending: true,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "id", {
      ascending: true,
    });
  });

  it("paginates in the database and reports the authorized exact count", async () => {
    const { query } = createListQueryMock({
      response: {
        data: [demandListRow],
        error: null,
        count: 81,
      },
    });

    const result = await listDemands({ page: 2, pageSize: 50 });

    expect(query.range).toHaveBeenCalledWith(50, 99);
    expect(result).toMatchObject({
      page: 2,
      pageSize: 50,
      total: 81,
      totalPages: 2,
    });
  });

  it("returns a stable empty result", async () => {
    const { supabase } = createListQueryMock({
      response: { data: [], error: null, count: 0 },
    });

    await expect(listDemands()).resolves.toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("preserves the authorized count when PostgREST reports an out-of-range page", async () => {
    const outOfRangeResponse = {
      data: null,
      error: { code: "PGRST103", message: "Requested range not satisfiable" },
      count: null,
    };
    const { query, supabase } = createListQueryMock({
      response: {
        data: [demandListRow],
        error: null,
        count: 2,
      },
    });
    query.range
      .mockResolvedValueOnce(outOfRangeResponse)
      .mockResolvedValueOnce({ data: [demandListRow], error: null, count: 2 });

    await expect(listDemands({ page: 2 })).resolves.toEqual({
      items: [],
      page: 2,
      pageSize: 20,
      total: 2,
      totalPages: 1,
    });
    expect(query.range).toHaveBeenNthCalledWith(1, 20, 39);
    expect(query.range).toHaveBeenNthCalledWith(2, 0, 0);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("ignores caller authorization fields and sends only page IDs to the bulk RPC", async () => {
    const { query, supabase } = createListQueryMock();
    const untrustedInput = {
      organization_id: "caller-organization",
      user_id: "caller-user",
      role: "OWNER",
    } as unknown as DemandListParamsInput;

    await listDemands(untrustedInput);

    expect(query.eq).not.toHaveBeenCalledWith(
      "organization_id",
      expect.anything(),
    );
    expect(query.eq).not.toHaveBeenCalledWith("user_id", expect.anything());
    expect(query.eq).not.toHaveBeenCalledWith("role", expect.anything());
    expect(query.insert).not.toHaveBeenCalled();
    expect(query.update).not.toHaveBeenCalled();
    expect(query.delete).not.toHaveBeenCalled();
    expect(supabase.rpc).toHaveBeenCalledWith(
      "list_demand_assignees_bulk",
      { p_demand_ids: [demandId] },
    );
    expect(Object.keys(supabase.rpc.mock.calls[0]?.[1] ?? {})).toEqual([
      "p_demand_ids",
    ]);
  });

  it("does not select notes or administrative fields for the list", async () => {
    const { query } = createListQueryMock();

    await listDemands();

    const selection = query.select.mock.calls[0]?.[0] as string;

    expect(selection).not.toMatch(/\bnotes\b/);
    expect(selection).not.toMatch(/\borganization_id\b/);
    expect(selection).not.toMatch(/\bcreated_by\b/);
    expect(selection).not.toMatch(/\bupdated_by\b/);
  });

  it("wraps list failures with a stable error and preserves the cause", async () => {
    const originalError = { message: "database unavailable" };
    const { supabase } = createListQueryMock({
      response: { data: null, error: originalError, count: null },
    });

    const error = await captureError(listDemands());

    expect(error.message).toBe("DEMAND_LIST_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("wraps bulk assignee failures and preserves the cause", async () => {
    const originalError = { message: "bulk assignee query denied" };
    createListQueryMock({
      rpcResponse: { data: null, error: originalError },
    });

    const error = await captureError(listDemands());

    expect(error.message).toBe("DEMAND_LIST_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });

  it("rejects an unexpected Demand ID returned by the bulk RPC", async () => {
    createListQueryMock({
      rpcResponse: {
        data: [{ ...bulkAssigneeRow, demand_id: secondDemandId }],
        error: null,
      },
    });

    const error = await captureError(listDemands());

    expect(error.message).toBe("DEMAND_LIST_QUERY_FAILED");
    expect(error.cause).toBeInstanceOf(Error);
    expect((error.cause as Error).message).toBe(
      "DEMAND_BULK_ASSIGNEE_RELATION_MISMATCH",
    );
  });

  it("rejects invalid filters before creating the Supabase client", async () => {
    await expect(listDemands({ tagId: "invalid-tag" })).rejects.toThrow(
      "DEMAND_QUERY_VALIDATION_FAILED",
    );
    expect(mocks.createSupabaseClient).not.toHaveBeenCalled();
  });
});

describe("demand detail query", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("returns an authorized detail with Tags and current assignees", async () => {
    const { query, supabase } = createDetailQueryMock();

    const result = await getDemandById(demandId);

    expect(supabase.from).toHaveBeenCalledWith("demands");
    expect(query.eq).toHaveBeenCalledWith("id", demandId);
    expect(query.maybeSingle).toHaveBeenCalledOnce();
    expect(supabase.rpc).toHaveBeenCalledWith("list_demand_assignees", {
      p_demand_id: demandId,
    });
    expect(result).toEqual({
      id: demandId,
      client_id: clientId,
      title: "Atualizar website",
      description: "Atualizar o website institucional.",
      status: "OPEN",
      priority: "HIGH",
      start_date: "2026-09-01",
      due_date: "2026-09-30",
      notes: "Publicar após aprovação.",
      created_at: "2026-09-01T10:00:00.000Z",
      updated_at: "2026-09-02T11:00:00.000Z",
      archived_at: null,
      client: {
        id: clientId,
        name: "Cliente Exemplo",
      },
      assignees: [currentAssignee],
      tags: [{ id: tagId, name: "Website" }],
    });
  });

  it("returns null for both absent and RLS-hidden demands", async () => {
    const { supabase } = createDetailQueryMock({ data: null, error: null });

    await expect(getDemandById(demandId)).resolves.toBeNull();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("wraps detail database failures and preserves the cause", async () => {
    const originalError = { message: "detail query denied" };
    createDetailQueryMock({ data: null, error: originalError });

    const error = await captureError(getDemandById(demandId));

    expect(error.message).toBe("DEMAND_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });

  it("wraps current-assignee RPC failures from detail and preserves the cause", async () => {
    const originalError = { message: "assignee lookup denied" };
    createDetailQueryMock(
      { data: demandDetailsRow, error: null },
      { data: null, error: originalError },
    );

    const error = await captureError(getDemandById(demandId));

    expect(error.message).toBe("DEMAND_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });

  it("rejects an invalid ID before creating the Supabase client", async () => {
    await expect(getDemandById("invalid-demand")).rejects.toThrow(
      "DEMAND_QUERY_VALIDATION_FAILED",
    );
    expect(mocks.createSupabaseClient).not.toHaveBeenCalled();
  });
});

describe("demand assignee queries", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("lists only the minimum eligible assignee projection", async () => {
    const supabase = createRpcMock({
      data: [{ ...eligibleAssignee, email: "not-returned@example.com" }],
      error: null,
    });

    const result = await listEligibleDemandAssignees(clientId);

    expect(supabase.rpc).toHaveBeenCalledWith(
      "list_eligible_demand_assignees",
      { p_client_id: clientId },
    );
    expect(result).toEqual([eligibleAssignee]);
    expect(result[0]).not.toHaveProperty("email");
  });

  it("returns an empty eligible-assignee list when the RPC returns no rows", async () => {
    createRpcMock({ data: null, error: null });

    await expect(listEligibleDemandAssignees(clientId)).resolves.toEqual([]);
  });

  it("rejects an invalid Client ID before creating the Supabase client", async () => {
    await expect(
      listEligibleDemandAssignees("invalid-client"),
    ).rejects.toThrow("DEMAND_QUERY_VALIDATION_FAILED");
    expect(mocks.createSupabaseClient).not.toHaveBeenCalled();
  });

  it("maps eligible-assignee failures to a safe stable error", async () => {
    const originalError = { message: "internal authorization detail" };
    createRpcMock({ data: null, error: originalError });

    const error = await captureError(listEligibleDemandAssignees(clientId));

    expect(error.message).toBe("DEMAND_ELIGIBLE_ASSIGNEES_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });

  it("passes only demand_id and preserves historical eligibility", async () => {
    const supabase = createRpcMock({
      data: [{ ...currentAssignee, email: "not-returned@example.com" }],
      error: null,
    });

    const result = await listDemandAssignees(demandId);

    expect(supabase.rpc).toHaveBeenCalledWith("list_demand_assignees", {
      p_demand_id: demandId,
    });
    expect(result).toEqual([currentAssignee]);
    expect(result[0]?.is_currently_eligible).toBe(false);
    expect(result[0]).not.toHaveProperty("email");
  });

  it("returns an empty current-assignee list when the RPC returns no rows", async () => {
    createRpcMock({ data: null, error: null });

    await expect(listDemandAssignees(demandId)).resolves.toEqual([]);
  });

  it("maps current-assignee failures to a safe stable error", async () => {
    const originalError = { message: "internal RLS detail" };
    createRpcMock({ data: null, error: originalError });

    const error = await captureError(listDemandAssignees(demandId));

    expect(error.message).toBe("DEMAND_ASSIGNEES_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });

  it("rejects an invalid Demand ID before creating the Supabase client", async () => {
    await expect(listDemandAssignees("invalid-demand")).rejects.toThrow(
      "DEMAND_QUERY_VALIDATION_FAILED",
    );
    expect(mocks.createSupabaseClient).not.toHaveBeenCalled();
  });
});
