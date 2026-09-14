import type { Database } from "@/types/database.types";

type PublicTables = Database["public"]["Tables"];
type PublicFunctions = Database["public"]["Functions"];
type FinancialEntryRow = PublicTables["financial_entries"]["Row"];
type FinancialGoalRow = PublicTables["financial_goals"]["Row"];
type FinancialSummaryRow =
  PublicFunctions["get_financial_summary"]["Returns"][number];

export type FinancialDecimal = string;

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
  "amount" | "type" | "status" | "payment_nature"
> & {
  amount: FinancialDecimal;
  type: FinancialType;
  status: FinancialStatus;
  payment_nature: FinancialPaymentNature;
};

export type FinancialGoal = Omit<FinancialGoalRow, "target_amount"> & {
  target_amount: FinancialDecimal;
};

export type FinancialSummary = Omit<
  FinancialSummaryRow,
  | "monthly_income"
  | "monthly_expense"
  | "cash_balance"
  | "goal_target"
  | "goal_progress"
> & {
  monthly_income: FinancialDecimal;
  monthly_expense: FinancialDecimal;
  cash_balance: FinancialDecimal;
  goal_target: FinancialDecimal | null;
  goal_progress: FinancialDecimal | null;
};
