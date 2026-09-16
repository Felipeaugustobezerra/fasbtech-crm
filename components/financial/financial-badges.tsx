import {
  FINANCIAL_STATUS_LABELS,
  FINANCIAL_TYPE_LABELS,
} from "@/components/financial/financial-format";
import type { FinancialStatus, FinancialType } from "@/types/financial";

const statusClasses: Record<FinancialStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  REALIZED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  CANCELED: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function FinancialStatusBadge({ status }: Readonly<{ status: FinancialStatus }>) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[status]}`}>{FINANCIAL_STATUS_LABELS[status]}</span>;
}

export function FinancialTypeBadge({ type }: Readonly<{ type: FinancialType }>) {
  const classes = type === "INCOME" ? "bg-blue-50 text-blue-800 ring-blue-200" : "bg-rose-50 text-rose-800 ring-rose-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classes}`}>{FINANCIAL_TYPE_LABELS[type]}</span>;
}
