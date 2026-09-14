import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getFinancialEntryById,
  getFinancialSummary,
  listFinancialEntries,
} from "@/lib/financial/queries";
import {
  DEFAULT_FINANCIAL_PAGE_SIZE,
  FINANCIAL_SORT_FIELDS,
  parseFinancialEntryListParams,
  type FinancialEntryListParamsInput,
} from "@/schemas/financial-query";
import type { Database } from "@/types/database.types";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const entryId = "11111111-1111-4111-8111-111111111111";
const clientId = "22222222-2222-4222-8222-222222222222";

type FinancialEntryRow =
  Database["public"]["Tables"]["financial_entries"]["Row"];

const financialEntryRow: FinancialEntryRow = {
  id: entryId,
  organization_id: "33333333-3333-4333-8333-333333333333",
  client_id: clientId,
  type: "INCOME",
  status: "REALIZED",
  payment_nature: "ONE_TIME",
  description: "Consultoria",
  category: "Serviços",
  amount: 1250.5,
  reference_date: "2026-09-01",
  due_date: "2026-09-15",
  realized_date: "2026-09-10",
  notes: null,
  created_by: "44444444-4444-4444-8444-444444444444",
  updated_by: "44444444-4444-4444-8444-444444444444",
  created_at: "2026-09-01T10:00:00.000Z",
  updated_at: "2026-09-10T10:00:00.000Z",
  archived_at: null,
};

type QueryError = { message: string; code?: string };

function createListQueryMock(
  response: {
    data: (typeof financialEntryRow)[] | null;
    error: QueryError | null;
    count: number | null;
  } = { data: [financialEntryRow], error: null, count: 1 },
) {
  const query = {
    eq: vi.fn(),
    gte: vi.fn(),
    ilike: vi.fn(),
    is: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    range: vi.fn().mockResolvedValue(response),
    select: vi.fn(),
  };

  query.eq.mockReturnValue(query);
  query.gte.mockReturnValue(query);
  query.ilike.mockReturnValue(query);
  query.is.mockReturnValue(query);
  query.lte.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.select.mockReturnValue(query);

  const supabase = {
    from: vi.fn().mockReturnValue(query),
    rpc: vi.fn(),
  };

  mocks.createSupabaseClient.mockResolvedValue(supabase);

  return { query, supabase };
}

function createDetailQueryMock(response: {
  data: typeof financialEntryRow | null;
  error: QueryError | null;
}) {
  const query = {
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(response),
    select: vi.fn(),
  };

  query.eq.mockReturnValue(query);
  query.select.mockReturnValue(query);

  const supabase = {
    from: vi.fn().mockReturnValue(query),
    rpc: vi.fn(),
  };

  mocks.createSupabaseClient.mockResolvedValue(supabase);

  return { query, supabase };
}

function createSummaryRpcMock(response: {
  data:
    | Array<{
        monthly_income: number;
        monthly_expense: number;
        cash_balance: number;
        goal_target: number | null;
        goal_progress: number | null;
      }>
    | null;
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

describe("financial query params", () => {
  it("applies the frozen defaults", () => {
    expect(parseFinancialEntryListParams()).toEqual({
      page: 1,
      pageSize: DEFAULT_FINANCIAL_PAGE_SIZE,
      sort: "reference_date",
      direction: "desc",
    });
  });

  it("trims optional search and category", () => {
    expect(
      parseFinancialEntryListParams({
        search: "  consultoria  ",
        category: "  Serviços  ",
      }),
    ).toMatchObject({ search: "consultoria", category: "Serviços" });
  });

  it("falls back safely for invalid pagination and sorting", () => {
    const input = {
      page: "0",
      pageSize: "25",
      sort: "organization_id",
      direction: "sideways",
    } as unknown as FinancialEntryListParamsInput;

    expect(parseFinancialEntryListParams(input)).toMatchObject({
      page: 1,
      pageSize: 20,
      sort: "reference_date",
      direction: "desc",
    });
  });

  it.each(["10", "20", "50", "100"])(
    "accepts the supported page size %s",
    (pageSize) => {
      expect(parseFinancialEntryListParams({ pageSize }).pageSize).toBe(
        Number(pageSize),
      );
    },
  );

  it.each(FINANCIAL_SORT_FIELDS)(
    "accepts the whitelisted %s sort field",
    (sort) => {
      expect(parseFinancialEntryListParams({ sort }).sort).toBe(sort);
    },
  );

  it.each([
    { type: "TRANSFER" },
    { status: "ARCHIVED" },
    { paymentNature: "INSTALLMENT" },
    { clientId: "invalid-client" },
    { referenceDateFrom: "2026-02-30" },
  ])("rejects an invalid filter %#", async (input) => {
    await expect(
      Promise.resolve().then(() => parseFinancialEntryListParams(input)),
    ).rejects.toThrow("FINANCIAL_QUERY_VALIDATION_FAILED");
  });

  it("rejects unknown authorization parameters", async () => {
    await expect(
      Promise.resolve().then(() =>
        parseFinancialEntryListParams({
          organization_id: clientId,
        } as unknown as FinancialEntryListParamsInput),
      ),
    ).rejects.toThrow("FINANCIAL_QUERY_VALIDATION_FAILED");
  });

  it("rejects the PostgREST wildcard alias in search", async () => {
    await expect(
      Promise.resolve().then(() =>
        parseFinancialEntryListParams({ search: "consultoria*" }),
      ),
    ).rejects.toThrow("FINANCIAL_QUERY_VALIDATION_FAILED");
  });
});

describe("financial entry list query", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("lists authorized active entries with frozen defaults", async () => {
    const { query, supabase } = createListQueryMock();

    const result = await listFinancialEntries();

    expect(supabase.from).toHaveBeenCalledWith("financial_entries");
    expect(query.select).toHaveBeenCalledWith("*", { count: "exact" });
    expect(query.is).toHaveBeenCalledWith("archived_at", null);
    expect(query.order).toHaveBeenNthCalledWith(1, "reference_date", {
      ascending: false,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "id", {
      ascending: false,
    });
    expect(query.range).toHaveBeenCalledWith(0, 19);
    expect(result).toEqual({
      items: [{ ...financialEntryRow, amount: "1250.5" }],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it("searches only description in PostgreSQL and escapes LIKE wildcards", async () => {
    const { query } = createListQueryMock();

    await listFinancialEntries({ search: "  100%_consultoria  " });

    expect(query.ilike).toHaveBeenCalledWith(
      "description",
      "%100\\%\\_consultoria%",
    );
  });

  it("applies every frozen equality filter in PostgreSQL", async () => {
    const { query } = createListQueryMock();

    await listFinancialEntries({
      type: "EXPENSE",
      status: "PENDING",
      paymentNature: "RECURRING",
      clientId,
      category: "Operacional",
    });

    expect(query.eq).toHaveBeenCalledWith("type", "EXPENSE");
    expect(query.eq).toHaveBeenCalledWith("status", "PENDING");
    expect(query.eq).toHaveBeenCalledWith("payment_nature", "RECURRING");
    expect(query.eq).toHaveBeenCalledWith("client_id", clientId);
    expect(query.eq).toHaveBeenCalledWith("category", "Operacional");
  });

  it("applies inclusive date ranges in PostgreSQL", async () => {
    const { query } = createListQueryMock();

    await listFinancialEntries({
      referenceDateFrom: "2026-09-01",
      referenceDateTo: "2026-09-30",
      dueDateFrom: "2026-10-01",
      dueDateTo: "2026-10-31",
      realizedDateFrom: "2026-09-10",
      realizedDateTo: "2026-09-20",
    });

    expect(query.gte).toHaveBeenCalledWith("reference_date", "2026-09-01");
    expect(query.lte).toHaveBeenCalledWith("reference_date", "2026-09-30");
    expect(query.gte).toHaveBeenCalledWith("due_date", "2026-10-01");
    expect(query.lte).toHaveBeenCalledWith("due_date", "2026-10-31");
    expect(query.gte).toHaveBeenCalledWith("realized_date", "2026-09-10");
    expect(query.lte).toHaveBeenCalledWith("realized_date", "2026-09-20");
  });

  it("uses only a whitelisted sort with a stable ID tie-breaker", async () => {
    const { query } = createListQueryMock();

    await listFinancialEntries({ sort: "amount", direction: "asc" });

    expect(query.order).toHaveBeenNthCalledWith(1, "amount", {
      ascending: true,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "id", {
      ascending: true,
    });
  });

  it("paginates in PostgreSQL and reports the authorized exact count", async () => {
    const { query } = createListQueryMock({
      data: [financialEntryRow],
      error: null,
      count: 81,
    });

    const result = await listFinancialEntries({ page: 2, pageSize: 50 });

    expect(query.range).toHaveBeenCalledWith(50, 99);
    expect(result).toMatchObject({
      page: 2,
      pageSize: 50,
      total: 81,
      totalPages: 2,
    });
  });

  it("returns a stable empty result", async () => {
    createListQueryMock({ data: [], error: null, count: 0 });

    await expect(listFinancialEntries()).resolves.toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    });
  });

  it("preserves count for an out-of-range authorized page", async () => {
    const { query } = createListQueryMock({
      data: [financialEntryRow],
      error: null,
      count: 2,
    });
    query.range
      .mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST103", message: "Range not satisfiable" },
        count: null,
      })
      .mockResolvedValueOnce({
        data: [financialEntryRow],
        error: null,
        count: 2,
      });

    await expect(listFinancialEntries({ page: 2 })).resolves.toMatchObject({
      items: [],
      total: 2,
      totalPages: 1,
    });
    expect(query.range).toHaveBeenNthCalledWith(1, 20, 39);
    expect(query.range).toHaveBeenNthCalledWith(2, 0, 0);
  });

  it("rejects invalid filters before creating a Supabase client", async () => {
    await expect(
      listFinancialEntries({ clientId: "invalid-client" }),
    ).rejects.toThrow("FINANCIAL_QUERY_VALIDATION_FAILED");
    expect(mocks.createSupabaseClient).not.toHaveBeenCalled();
  });

  it("wraps database failures and preserves the cause", async () => {
    const originalError = { message: "database unavailable" };
    createListQueryMock({ data: null, error: originalError, count: null });

    const error = await captureError(listFinancialEntries());

    expect(error.message).toBe("FINANCIAL_LIST_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });
});

describe("financial entry detail query", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("returns an authorized entry, including archived detail", async () => {
    const archivedEntry = {
      ...financialEntryRow,
      archived_at: "2026-09-14T10:00:00.000Z",
    };
    const { query } = createDetailQueryMock({
      data: archivedEntry,
      error: null,
    });

    await expect(getFinancialEntryById(entryId)).resolves.toEqual({
      ...archivedEntry,
      amount: "1250.5",
    });
    expect(query.eq).toHaveBeenCalledWith("id", entryId);
    expect(query).not.toHaveProperty("is");
  });

  it("returns null for absent and RLS-hidden entries", async () => {
    createDetailQueryMock({ data: null, error: null });

    await expect(getFinancialEntryById(entryId)).resolves.toBeNull();
  });

  it("rejects an invalid ID before creating the Supabase client", async () => {
    await expect(getFinancialEntryById("invalid-entry")).rejects.toThrow(
      "FINANCIAL_QUERY_VALIDATION_FAILED",
    );
    expect(mocks.createSupabaseClient).not.toHaveBeenCalled();
  });

  it("wraps detail failures and preserves the cause", async () => {
    const originalError = { message: "detail denied" };
    createDetailQueryMock({ data: null, error: originalError });

    const error = await captureError(getFinancialEntryById(entryId));

    expect(error.message).toBe("FINANCIAL_ENTRY_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });
});

describe("financial summary query", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("calls the frozen RPC and returns decimal-safe strings", async () => {
    const supabase = createSummaryRpcMock({
      data: [
        {
          monthly_income: 1250.5,
          monthly_expense: 400.25,
          cash_balance: 850.25,
          goal_target: 2000,
          goal_progress: 0.62525,
        },
      ],
      error: null,
    });

    await expect(
      getFinancialSummary({ year: 2026, month: 9 }),
    ).resolves.toEqual({
      monthly_income: "1250.5",
      monthly_expense: "400.25",
      cash_balance: "850.25",
      goal_target: "2000",
      goal_progress: "0.62525",
    });
    expect(supabase.rpc).toHaveBeenCalledWith("get_financial_summary", {
      p_year: 2026,
      p_month: 9,
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("preserves nullable goal values", async () => {
    createSummaryRpcMock({
      data: [
        {
          monthly_income: 0,
          monthly_expense: 0,
          cash_balance: 0,
          goal_target: null,
          goal_progress: null,
        },
      ],
      error: null,
    });

    await expect(
      getFinancialSummary({ year: 2026, month: 10 }),
    ).resolves.toEqual({
      monthly_income: "0",
      monthly_expense: "0",
      cash_balance: "0",
      goal_target: null,
      goal_progress: null,
    });
  });

  it.each([
    { year: 0, month: 9 },
    { year: 2026, month: 13 },
  ])("rejects an invalid summary period %#", async (input) => {
    await expect(getFinancialSummary(input)).rejects.toThrow(
      "FINANCIAL_QUERY_VALIDATION_FAILED",
    );
    expect(mocks.createSupabaseClient).not.toHaveBeenCalled();
  });

  it("wraps RPC failures and preserves the cause", async () => {
    const originalError = { message: "summary denied" };
    createSummaryRpcMock({ data: null, error: originalError });

    const error = await captureError(
      getFinancialSummary({ year: 2026, month: 9 }),
    );

    expect(error.message).toBe("FINANCIAL_SUMMARY_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });

  it("rejects an unexpected empty RPC response", async () => {
    createSummaryRpcMock({ data: [], error: null });

    const error = await captureError(
      getFinancialSummary({ year: 2026, month: 9 }),
    );

    expect(error.message).toBe("FINANCIAL_SUMMARY_QUERY_FAILED");
    expect(error.cause).toBeInstanceOf(Error);
    expect((error.cause as Error).message).toBe("FINANCIAL_SUMMARY_MISSING");
  });
});
