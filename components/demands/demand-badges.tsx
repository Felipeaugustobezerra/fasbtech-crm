import type { DemandPriority, DemandStatus } from "@/types/demand";

export const DEMAND_STATUS_LABELS: Record<DemandStatus, string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em andamento",
  WAITING_CLIENT: "Aguardando cliente",
  REVIEW: "Em revisão",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
};

const statusStyles: Record<DemandStatus, string> = {
  OPEN: "bg-blue-50 text-blue-800",
  IN_PROGRESS: "bg-amber-50 text-amber-800",
  WAITING_CLIENT: "bg-violet-50 text-violet-800",
  REVIEW: "bg-cyan-50 text-cyan-800",
  COMPLETED: "bg-emerald-50 text-emerald-800",
  CANCELED: "bg-slate-100 text-slate-700",
};

export const DEMAND_PRIORITY_LABELS: Record<DemandPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const priorityStyles: Record<DemandPriority, string> = {
  LOW: "border-slate-300 text-slate-700",
  MEDIUM: "border-blue-300 text-blue-800",
  HIGH: "border-amber-400 text-amber-800",
  URGENT: "border-red-400 text-red-800",
};

export function DemandStatusBadge({ status }: Readonly<{ status: DemandStatus }>) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>{DEMAND_STATUS_LABELS[status]}</span>;
}

export function DemandPriorityBadge({ priority }: Readonly<{ priority: DemandPriority }>) {
  return <span className={`inline-flex rounded-md border bg-white px-2 py-0.5 text-xs font-semibold ${priorityStyles[priority]}`}>{DEMAND_PRIORITY_LABELS[priority]}</span>;
}
