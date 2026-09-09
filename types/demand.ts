import type { Database } from "@/types/database.types";
import type { Client } from "@/types/client";

type PublicTables = Database["public"]["Tables"];
type PublicFunctions = Database["public"]["Functions"];
type DemandRow = PublicTables["demands"]["Row"];

export const DEMAND_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CLIENT",
  "REVIEW",
  "COMPLETED",
  "CANCELED",
] as const satisfies readonly DemandRow["status"][];

export type DemandStatus = (typeof DEMAND_STATUSES)[number];

export const DEMAND_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const satisfies readonly DemandRow["priority"][];

export type DemandPriority = (typeof DEMAND_PRIORITIES)[number];

export type Demand = Omit<DemandRow, "status" | "priority"> & {
  status: DemandStatus;
  priority: DemandPriority;
};

export type DemandAssignee =
  PublicFunctions["list_demand_assignees"]["Returns"][number];

type BulkDemandAssignee =
  PublicFunctions["list_demand_assignees_bulk"]["Returns"][number];

export type EligibleDemandAssignee =
  PublicFunctions["list_eligible_demand_assignees"]["Returns"][number];

export type DemandTag = PublicTables["demand_tags"]["Row"];

export type DemandClientSummary = Pick<Client, "id" | "name">;

export type DemandTagSummary = Pick<DemandTag, "id" | "name">;

export type DemandAssigneeReference = Pick<
  BulkDemandAssignee,
  "membership_id" | "full_name" | "role" | "is_currently_eligible"
>;

export type DemandListItem = Pick<
  Demand,
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
  client: DemandClientSummary;
  assignees: DemandAssigneeReference[];
  tags: DemandTagSummary[];
};

export type DemandDetails = Pick<
  Demand,
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
  client: DemandClientSummary;
  assignees: DemandAssignee[];
  tags: DemandTagSummary[];
};
