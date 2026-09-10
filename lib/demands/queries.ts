import type { SupabaseClient } from "@supabase/supabase-js";

import { clientIdSchema } from "@/schemas/client";
import {
  demandIdSchema,
  demandPrioritySchema,
  demandStatusSchema,
} from "@/schemas/demand";
import {
  parseDemandListParams,
  type DemandListParamsInput,
} from "@/schemas/demand-query";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type {
  DemandAssignee,
  DemandAssigneeReference,
  DemandDetails,
  DemandListItem,
  DemandTagSummary,
  EligibleDemandAssignee,
} from "@/types/demand";

const DEMAND_LIST_SELECT = `
  id,
  client_id,
  title,
  status,
  priority,
  start_date,
  due_date,
  created_at,
  updated_at,
  client:clients!demands_client_organization_fkey (
    id,
    name
  ),
  tag_assignments:demand_tag_assignments (
    tag:demand_tags (
      id,
      name
    )
  ),
  assignee_filter:demand_assignees (),
  tag_filter:demand_tag_assignments ()
` as const;

const DEMAND_DETAILS_SELECT = `
  id,
  client_id,
  title,
  description,
  status,
  priority,
  start_date,
  due_date,
  notes,
  created_at,
  updated_at,
  archived_at,
  client:clients!demands_client_organization_fkey (
    id,
    name
  ),
  tag_assignments:demand_tag_assignments (
    tag:demand_tags (
      id,
      name
    )
  )
` as const;

type DemandRow = Database["public"]["Tables"]["demands"]["Row"];

type DemandListRow = Pick<
  DemandRow,
  | "id"
  | "client_id"
  | "title"
  | "status"
  | "priority"
  | "start_date"
  | "due_date"
  | "created_at"
  | "updated_at"
> & {
  client: DemandListItem["client"] | null;
  tag_assignments: Array<{
    tag: DemandTagSummary | null;
  }>;
};

type DemandDetailsRow = Pick<
  DemandRow,
  | "id"
  | "client_id"
  | "title"
  | "description"
  | "status"
  | "priority"
  | "start_date"
  | "due_date"
  | "notes"
  | "created_at"
  | "updated_at"
  | "archived_at"
> & {
  client: DemandDetails["client"] | null;
  tag_assignments: Array<{
    tag: DemandTagSummary | null;
  }>;
};

export type DemandListResult = {
  items: DemandListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function parseDemandId(demandId: string) {
  const parsedDemandId = demandIdSchema.safeParse(demandId);

  if (!parsedDemandId.success) {
    throw new Error("DEMAND_QUERY_VALIDATION_FAILED", {
      cause: parsedDemandId.error,
    });
  }

  return parsedDemandId.data;
}

function mapTags(
  assignments: Array<{ tag: DemandTagSummary | null }>,
): DemandTagSummary[] {
  return assignments.map(({ tag }) => {
    if (!tag) {
      throw new Error("DEMAND_TAG_RELATION_MISSING");
    }

    return tag;
  });
}

function mapDemandListItem(
  row: DemandListRow,
  assignees: DemandAssigneeReference[],
): DemandListItem {
  if (!row.client) {
    throw new Error("DEMAND_CLIENT_RELATION_MISSING");
  }

  return {
    id: row.id,
    client_id: row.client_id,
    title: row.title,
    status: demandStatusSchema.parse(row.status),
    priority: demandPrioritySchema.parse(row.priority),
    start_date: row.start_date,
    due_date: row.due_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    client: row.client,
    assignees,
    tags: mapTags(row.tag_assignments),
  };
}

function mapDemandDetails(
  row: DemandDetailsRow,
  assignees: DemandAssignee[],
): DemandDetails {
  const { tag_assignments: tagAssignments, ...demand } = row;

  if (!demand.client) {
    throw new Error("DEMAND_CLIENT_RELATION_MISSING");
  }

  return {
    ...demand,
    client: demand.client,
    status: demandStatusSchema.parse(demand.status),
    priority: demandPrioritySchema.parse(demand.priority),
    assignees,
    tags: mapTags(tagAssignments),
  };
}

function buildSearchFilter(search: string) {
  const escapedSearch = search
    .replaceAll("\\", "\\\\\\\\")
    .replaceAll("%", "\\\\%")
    .replaceAll("_", "\\\\_")
    .replaceAll('"', '\\"');
  const pattern = `%${escapedSearch}%`;

  return `title.ilike."${pattern}",description.ilike."${pattern}"`;
}

async function queryDemandAssignees(
  supabase: SupabaseClient<Database>,
  demandId: string,
): Promise<DemandAssignee[]> {
  const { data, error } = await supabase.rpc("list_demand_assignees", {
    p_demand_id: demandId,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    ({ membership_id, full_name, role, is_currently_eligible }) => ({
      membership_id,
      full_name,
      role,
      is_currently_eligible,
    }),
  );
}

async function queryDemandAssigneesBulk(
  supabase: SupabaseClient<Database>,
  demandIds: string[],
): Promise<Map<string, DemandAssigneeReference[]>> {
  const assigneesByDemand = new Map<string, DemandAssigneeReference[]>();

  if (demandIds.length === 0) {
    return assigneesByDemand;
  }

  const requestedDemandIds = new Set(demandIds);
  const { data, error } = await supabase.rpc(
    "list_demand_assignees_bulk",
    {
      p_demand_ids: demandIds,
    },
  );

  if (error) {
    throw error;
  }

  for (const {
    demand_id: demandId,
    membership_id,
    full_name,
    role,
    is_currently_eligible,
  } of data ?? []) {
    if (!requestedDemandIds.has(demandId)) {
      throw new Error("DEMAND_BULK_ASSIGNEE_RELATION_MISMATCH");
    }

    const assignee = {
      membership_id,
      full_name,
      role,
      is_currently_eligible,
    };
    const currentAssignees = assigneesByDemand.get(demandId);

    if (currentAssignees) {
      currentAssignees.push(assignee);
    } else {
      assigneesByDemand.set(demandId, [assignee]);
    }
  }

  return assigneesByDemand;
}

export async function listDemands(
  input: DemandListParamsInput = {},
): Promise<DemandListResult> {
  const params = parseDemandListParams(input);
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  try {
    const supabase = await createSupabaseClient();
    let query = supabase
      .from("demands")
      .select(DEMAND_LIST_SELECT, { count: "exact" })
      .is("archived_at", null);

    if (params.search) {
      query = query.or(buildSearchFilter(params.search));
    }

    if (params.clientId) {
      query = query.eq("client_id", params.clientId);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.priority) {
      query = query.eq("priority", params.priority);
    }

    if (params.assigneeId) {
      query = query.eq(
        "assignee_filter.membership_id",
        params.assigneeId,
      );
      query = query.not("assignee_filter", "is", null);
    }

    if (params.tagId) {
      query = query.eq("tag_filter.tag_id", params.tagId);
      query = query.not("tag_filter", "is", null);
    }

    if (params.dueBefore) {
      query = query.lt("due_date", params.dueBefore);
    }

    if (params.dueAfter) {
      query = query.gt("due_date", params.dueAfter);
    }

    if (params.dueOn) {
      query = query.eq("due_date", params.dueOn);
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

    const rows = data ?? [];
    const demandIds = rows.map(({ id }) => id);
    const assigneesByDemand = await queryDemandAssigneesBulk(
      supabase,
      demandIds,
    );
    const total = count ?? 0;

    return {
      items: rows.map((row) =>
        mapDemandListItem(row, assigneesByDemand.get(row.id) ?? []),
      ),
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
    };
  } catch (cause) {
    throw new Error("DEMAND_LIST_QUERY_FAILED", { cause });
  }
}

export async function getDemandById(
  demandId: string,
): Promise<DemandDetails | null> {
  const parsedDemandId = parseDemandId(demandId);

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("demands")
      .select(DEMAND_DETAILS_SELECT)
      .eq("id", parsedDemandId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    const assignees = await queryDemandAssignees(supabase, parsedDemandId);

    return mapDemandDetails(data, assignees);
  } catch (cause) {
    throw new Error("DEMAND_QUERY_FAILED", { cause });
  }
}

export async function listEligibleDemandAssignees(
  clientId: string,
): Promise<EligibleDemandAssignee[]> {
  const parsedClientId = clientIdSchema.safeParse(clientId);

  if (!parsedClientId.success) {
    throw new Error("DEMAND_QUERY_VALIDATION_FAILED", {
      cause: parsedClientId.error,
    });
  }

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.rpc(
      "list_eligible_demand_assignees",
      {
        p_client_id: parsedClientId.data,
      },
    );

    if (error) {
      throw error;
    }

    return (data ?? []).map(({ membership_id, full_name, role }) => ({
      membership_id,
      full_name,
      role,
    }));
  } catch (cause) {
    throw new Error("DEMAND_ELIGIBLE_ASSIGNEES_QUERY_FAILED", { cause });
  }
}

export async function listDemandAssignees(
  demandId: string,
): Promise<DemandAssignee[]> {
  const parsedDemandId = parseDemandId(demandId);

  try {
    const supabase = await createSupabaseClient();

    return await queryDemandAssignees(supabase, parsedDemandId);
  } catch (cause) {
    throw new Error("DEMAND_ASSIGNEES_QUERY_FAILED", { cause });
  }
}
