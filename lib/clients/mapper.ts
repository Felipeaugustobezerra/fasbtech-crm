import type { ClientInput } from "@/schemas/client";
import type { Client } from "@/types/client";

export function mapClientToInput(client: Client): ClientInput {
  return {
    name: client.name,
    company_name: client.company_name ?? undefined,
    email: client.email ?? undefined,
    phone: client.phone ?? undefined,
    tax_id: client.tax_id ?? undefined,
    tax_id_type: client.tax_id_type ?? undefined,
    address_line_1: client.address_line_1 ?? undefined,
    address_line_2: client.address_line_2 ?? undefined,
    city: client.city ?? undefined,
    region: client.region ?? undefined,
    postal_code: client.postal_code ?? undefined,
    country_code: client.country_code ?? undefined,
    notes: client.notes ?? undefined,
  };
}
