import type { Database } from "@/types/database.types";

type PublicTables = Database["public"]["Tables"];
type FinancialEntryRow = PublicTables["financial_entries"]["Row"];
type FinancialGoalRow = PublicTables["financial_goals"]["Row"];

export const FINANCIAL_TYPES = [
  "INCOME",
  "EXPENSE",
] as const satisfies readonly FinancialEntryRow["type"][];

export type FinancialType = (typeof FINANCIAL_TYPES)[number];

export const FINANCIAL_STATUSES = [
  "PENDING",
  "REALIZED",
  "CANCELED",
] as const satisfies readonly FinancialEntryRow["status"][];

export type FinancialStatus = (typeof FINANCIAL_STATUSES)[number];

export const FINANCIAL_PAYMENT_NATURES = [
  "ONE_TIME",
  "RECURRING",
] as const satisfies readonly FinancialEntryRow["payment_nature"][];

export type FinancialPaymentNature =
  (typeof FINANCIAL_PAYMENT_NATURES)[number];

export type FinancialEntry = Omit<
  FinancialEntryRow,
  "type" | "status" | "payment_nature"
> & {
  type: FinancialType;
  status: FinancialStatus;
  payment_nature: FinancialPaymentNature;
};

export type FinancialGoal = FinancialGoalRow;
