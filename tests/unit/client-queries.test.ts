import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_CLIENT_PAGE_SIZE,
  getClientById,
  listClients,
  type ListClientsParams,
} from "@/lib/clients/queries";
import type { Client } from "@/types/client";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const client: Client = {
  id: "11111111-1111-4111-8111-111111111111",
  organization_id: "22222222-2222-4222-8222-222222222222",
  name: "Cliente Exemplo",
  company_name: null,
  email: null,
  phone: null,
  tax_id: null,
  tax_id_type: null,
  address_line_1: null,
  address_line_2: null,
  city: null,
  region: null,
  postal_code: null,
  country_code: null,
  notes: null,
  created_by: "33333333-3333-4333-8333-333333333333",
  updated_by: "33333333-3333-4333-8333-333333333333",
  created_at: "2026-08-16T12:00:00.000Z",
  updated_at: "2026-08-16T12:00:00.000Z",
  archived_at: null,
};

function createListQueryMock(
  response: {
    data: Client[] | null;
    error: { message: string } | null;
    count: number | null;
  } = { data: [client], error: null, count: 1 },
) {
  const query = {
    select: vi.fn(),
    is: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    range: vi.fn().mockResolvedValue(response),
  };

  query.select.mockReturnValue(query);
  query.is.mockReturnValue(query);
  query.ilike.mockReturnValue(query);
  query.order.mockReturnValue(query);

  const supabase = {
    from: vi.fn().mockReturnValue(query),
  };

  mocks.createSupabaseClient.mockResolvedValue(supabase);

  return { query, supabase };
}

function createSingleQueryMock(
  response: {
    data: Client | null;
    error: { message: string } | null;
  } = { data: client, error: null },
) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(response),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);

  const supabase = {
    from: vi.fn().mockReturnValue(query),
  };

  mocks.createSupabaseClient.mockResolvedValue(supabase);

  return { query, supabase };
}

describe("client queries", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("lists the first page of non-archived clients with stable defaults", async () => {
    const { query, supabase } = createListQueryMock();

    const result = await listClients();

    expect(supabase.from).toHaveBeenCalledWith("clients");
    expect(query.select).toHaveBeenCalledWith("*", { count: "exact" });
    expect(query.is).toHaveBeenCalledWith("archived_at", null);
    expect(query.ilike).not.toHaveBeenCalled();
    expect(query.order).toHaveBeenNthCalledWith(1, "name", {
      ascending: true,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "id", {
      ascending: true,
    });
    expect(query.range).toHaveBeenCalledWith(0, 19);
    expect(result).toEqual({
      clients: [client],
      count: 1,
      page: 1,
      pageSize: DEFAULT_CLIENT_PAGE_SIZE,
      totalPages: 1,
    });
  });

  it("applies trimmed name search in the database query", async () => {
    const { query } = createListQueryMock({
      data: [],
      error: null,
      count: 0,
    });

    await listClients({ search: "  Exemplo  " });

    expect(query.ilike).toHaveBeenCalledWith("name", "%Exemplo%");
  });

  it("applies pagination in the database and reports authorized totals", async () => {
    const { query } = createListQueryMock({
      data: [client],
      error: null,
      count: 45,
    });

    const result = await listClients({ page: 3 });

    expect(query.range).toHaveBeenCalledWith(40, 59);
    expect(result).toMatchObject({
      count: 45,
      page: 3,
      pageSize: 20,
      totalPages: 3,
    });
  });

  it("falls back to the first page when page is invalid", async () => {
    const { query } = createListQueryMock();

    const result = await listClients({ page: 0 });

    expect(query.range).toHaveBeenCalledWith(0, 19);
    expect(result.page).toBe(1);
  });

  it("uses only whitelisted sorting fields and directions", async () => {
    const { query } = createListQueryMock();

    await listClients({ sortBy: "updated_at", sortDirection: "desc" });

    expect(query.order).toHaveBeenNthCalledWith(1, "updated_at", {
      ascending: false,
    });
  });

  it("falls back to name when an untrusted sort field is not whitelisted", async () => {
    const { query } = createListQueryMock();
    const untrustedParams = {
      sortBy: "organization_id",
    } as unknown as ListClientsParams;

    await listClients(untrustedParams);

    expect(query.order).toHaveBeenNthCalledWith(1, "name", {
      ascending: true,
    });
  });

  it("returns a client visible through RLS by id", async () => {
    const { query, supabase } = createSingleQueryMock();

    const result = await getClientById(client.id);

    expect(supabase.from).toHaveBeenCalledWith("clients");
    expect(query.select).toHaveBeenCalledWith("*");
    expect(query.eq).toHaveBeenCalledWith("id", client.id);
    expect(query.maybeSingle).toHaveBeenCalledOnce();
    expect(result).toEqual(client);
  });

  it("returns null when the client is absent or hidden by RLS", async () => {
    createSingleQueryMock({ data: null, error: null });

    await expect(getClientById(client.id)).resolves.toBeNull();
  });

  it("wraps database failures with a stable list error", async () => {
    createListQueryMock({
      data: null,
      error: { message: "database unavailable" },
      count: null,
    });

    await expect(listClients()).rejects.toThrow("CLIENT_LIST_QUERY_FAILED");
  });
});
