import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { Client } from "@/types/client";

export const DEFAULT_CLIENT_PAGE_SIZE = 20;

export const CLIENT_SORT_FIELDS = ["name", "created_at", "updated_at"] as const;

export type ClientSortField = (typeof CLIENT_SORT_FIELDS)[number];
export type ClientSortDirection = "asc" | "desc";

export type ListClientsParams = {
  page?: number;
  search?: string;
  sortBy?: ClientSortField;
  sortDirection?: ClientSortDirection;
};

export type ClientListResult = {
  clients: Client[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function resolvePage(page: number | undefined) {
  return Number.isSafeInteger(page) && page !== undefined && page > 0
    ? page
    : 1;
}

function resolveSortField(
  sortBy: ClientSortField | undefined,
): ClientSortField {
  if (sortBy && CLIENT_SORT_FIELDS.some((field) => field === sortBy)) {
    return sortBy;
  }

  return "name";
}

export async function listClients(
  params: ListClientsParams = {},
): Promise<ClientListResult> {
  const supabase = await createSupabaseClient();
  const page = resolvePage(params.page);
  const sortBy = resolveSortField(params.sortBy);
  const ascending = params.sortDirection !== "desc";
  const search = params.search?.trim();
  const from = (page - 1) * DEFAULT_CLIENT_PAGE_SIZE;
  const to = from + DEFAULT_CLIENT_PAGE_SIZE - 1;

  let query = supabase
    .from("clients")
    .select("*", { count: "exact" })
    .is("archived_at", null);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error, count } = await query
    .order(sortBy, { ascending })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error("CLIENT_LIST_QUERY_FAILED", {
      cause: error,
    });
  }

  const authorizedCount = count ?? 0;

  return {
    clients: data ?? [],
    count: authorizedCount,
    page,
    pageSize: DEFAULT_CLIENT_PAGE_SIZE,
    totalPages: Math.ceil(authorizedCount / DEFAULT_CLIENT_PAGE_SIZE),
  };
}

export async function getClientById(clientId: string): Promise<Client | null> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    throw new Error("CLIENT_QUERY_FAILED", {
      cause: error,
    });
  }

  return data;
}
