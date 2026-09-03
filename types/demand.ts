import type { Database } from "@/types/database.types";

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

export type EligibleDemandAssignee =
  PublicFunctions["list_eligible_demand_assignees"]["Returns"][number];

export type DemandTag = PublicTables["demand_tags"]["Row"];
