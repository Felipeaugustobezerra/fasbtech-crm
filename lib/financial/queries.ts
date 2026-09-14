import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  financialEntryIdSchema,
  financialPaymentNatureSchema,
  financialStatusSchema,
  financialTypeSchema,
} from "@/schemas/financial";
import {
  parseFinancialEntryListParams,
  parseFinancialSummaryParams,
  type FinancialEntryListParamsInput,
  type FinancialSummaryParamsInput,
} from "@/schemas/financial-query";
import type { Database } from "@/types/database.types";
import type {
  FinancialDecimal,
  FinancialEntry,
  FinancialSummary,
} from "@/types/financial";

type FinancialEntryRow =
  Database["public"]["Tables"]["financial_entries"]["Row"];
type FinancialSummaryRow =
  Database["public"]["Functions"]["get_financial_summary"]["Returns"][number];

export type FinancialEntryListResult = {
  items: FinancialEntry[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function parseFinancialEntryId(entryId: string) {
  const parsedEntryId = financialEntryIdSchema.safeParse(entryId);

  if (!parsedEntryId.success) {
    throw new Error("FINANCIAL_QUERY_VALIDATION_FAILED", {
      cause: parsedEntryId.error,
    });
  }

  return parsedEntryId.data;
}

function toFinancialDecimal(value: number): FinancialDecimal {
  if (!Number.isFinite(value)) {
    throw new Error("FINANCIAL_DECIMAL_INVALID");
  }

  return String(value);
}

function mapFinancialEntry(row: FinancialEntryRow): FinancialEntry {
  return {
    ...row,
    amount: toFinancialDecimal(row.amount),
    type: financialTypeSchema.parse(row.type),
    status: financialStatusSchema.parse(row.status),
    payment_nature: financialPaymentNatureSchema.parse(row.payment_nature),
  };
}

function mapFinancialSummary(row: FinancialSummaryRow): FinancialSummary {
  return {
    monthly_income: toFinancialDecimal(row.monthly_income),
    monthly_expense: toFinancialDecimal(row.monthly_expense),
    cash_balance: toFinancialDecimal(row.cash_balance),
    goal_target:
      row.goal_target === null
        ? null
        : toFinancialDecimal(row.goal_target),
    goal_progress:
      row.goal_progress === null
        ? null
        : toFinancialDecimal(row.goal_progress),
  };
}

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

export async function listFinancialEntries(
  input: FinancialEntryListParamsInput = {},
): Promise<FinancialEntryListResult> {
  const params = parseFinancialEntryListParams(input);
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  try {
    const supabase = await createSupabaseClient();
    let query = supabase
      .from("financial_entries")
      .select("*", { count: "exact" })
      .is("archived_at", null);

    if (params.search) {
      query = query.ilike(
        "description",
        `%${escapeLikePattern(params.search)}%`,
      );
    }
    if (params.type) {
      query = query.eq("type", params.type);
    }
    if (params.status) {
      query = query.eq("status", params.status);
    }
    if (params.paymentNature) {
      query = query.eq("payment_nature", params.paymentNature);
    }
    if (params.clientId) {
      query = query.eq("client_id", params.clientId);
    }
    if (params.category) {
      query = query.eq("category", params.category);
    }
    if (params.referenceDateFrom) {
      query = query.gte("reference_date", params.referenceDateFrom);
    }
    if (params.referenceDateTo) {
      query = query.lte("reference_date", params.referenceDateTo);
    }
    if (params.dueDateFrom) {
      query = query.gte("due_date", params.dueDateFrom);
    }
    if (params.dueDateTo) {
      query = query.lte("due_date", params.dueDateTo);
    }
    if (params.realizedDateFrom) {
      query = query.gte("realized_date", params.realizedDateFrom);
    }
    if (params.realizedDateTo) {
      query = query.lte("realized_date", params.realizedDateTo);
    }

    const ascending = params.direction === "asc";
    let { data, error, count } = await query
      .order(params.sort, { ascending })
      .order("id", { ascending })
      .range(from, to);

    if (error?.code === "PGRST103") {
      const countProbe = await query.range(0, 0);

      if (countProbe.error) {
        throw countProbe.error;
      }

      data = [];
      error = null;
      count = countProbe.count;
    }

    if (error) {
      throw error;
    }

    const total = count ?? 0;

    return {
      items: (data ?? []).map(mapFinancialEntry),
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
    };
  } catch (cause) {
    throw new Error("FINANCIAL_LIST_QUERY_FAILED", { cause });
  }
}

export async function getFinancialEntryById(
  entryId: string,
): Promise<FinancialEntry | null> {
  const parsedEntryId = parseFinancialEntryId(entryId);

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("financial_entries")
      .select("*")
      .eq("id", parsedEntryId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapFinancialEntry(data) : null;
  } catch (cause) {
    throw new Error("FINANCIAL_ENTRY_QUERY_FAILED", { cause });
  }
}

export async function getFinancialSummary(
  input: FinancialSummaryParamsInput,
): Promise<FinancialSummary> {
  const params = parseFinancialSummaryParams(input);

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.rpc("get_financial_summary", {
      p_year: params.year,
      p_month: params.month,
    });

    if (error) {
      throw error;
    }

    const summary = data?.[0];

    if (!summary) {
      throw new Error("FINANCIAL_SUMMARY_MISSING");
    }

    return mapFinancialSummary(summary);
  } catch (cause) {
    throw new Error("FINANCIAL_SUMMARY_QUERY_FAILED", { cause });
  }
}
