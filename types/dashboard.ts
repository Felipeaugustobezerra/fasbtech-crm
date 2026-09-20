import type { FinancialSummary } from "@/types/financial";
import type { ContractStatus } from "@/types/contracts";
import type { DemandStatus } from "@/types/demand";

export type DashboardRole = "OWNER" | "ADMIN" | "MEMBER";

export type DashboardPeriod = {
  civilDate: string;
  year: number;
  month: number;
  label: string;
};

export type DemandDashboardSummary = {
  active: number;
  overdue: number;
  byStatus: Record<DemandStatus, number>;
};

export type ContractDashboardSummary = {
  nonTerminal: number;
  byStatus: Record<ContractStatus, number>;
};

export type DashboardActivity = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
};

export type DashboardSection<T> =
  | { status: "success"; data: T }
  | { status: "error" };

export type DashboardData = {
  period: DashboardPeriod;
  clients: DashboardSection<number> | null;
  demands: DashboardSection<DemandDashboardSummary> | null;
  financial: DashboardSection<FinancialSummary> | null;
  contracts: DashboardSection<ContractDashboardSummary> | null;
  activities: DashboardSection<DashboardActivity[]> | null;
};
