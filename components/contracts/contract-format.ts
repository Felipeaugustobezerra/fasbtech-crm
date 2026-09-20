import type { ContractStatus } from "@/types/contracts";

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: "Rascunho",
  GENERATED: "Gerado",
  SENT: "Enviado",
  SIGNED: "Assinado",
  CANCELED: "Cancelado",
};

export function formatContractDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("pt-PT", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
}
