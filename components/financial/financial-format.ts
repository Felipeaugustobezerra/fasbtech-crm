import type {
  FinancialPaymentNature,
  FinancialStatus,
  FinancialType,
} from "@/types/financial";

export const FINANCIAL_TYPE_LABELS: Record<FinancialType, string> = {
  INCOME: "Entrada",
  EXPENSE: "Saída",
};

export const FINANCIAL_STATUS_LABELS: Record<FinancialStatus, string> = {
  PENDING: "Pendente",
  REALIZED: "Realizado",
  CANCELED: "Cancelado",
};

export const FINANCIAL_PAYMENT_NATURE_LABELS: Record<FinancialPaymentNature, string> = {
  ONE_TIME: "Pontual",
  RECURRING: "Recorrente",
};

const euroFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

const percentFormatter = new Intl.NumberFormat("pt-PT", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatEuro(value: string) {
  return euroFormatter.format(Number(value));
}

export function formatProgress(value: string) {
  return percentFormatter.format(Number(value));
}

export function formatCivilDate(value: string | null) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}
