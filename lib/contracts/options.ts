import { listClients } from "@/lib/clients/queries";
import {
  getContractTemplateById,
  listContractTemplates,
} from "@/lib/contracts/queries";

export type ContractClientOption = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  tax_id: string | null;
  tax_id_type: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country_code: string | null;
};

export type ContractTemplateOption = {
  id: string;
  name: string;
  content: string;
  is_active: boolean;
};

export async function listAllContractClientOptions() {
  const first = await listClients({ page: 1, sortBy: "name" });
  const pages = await Promise.all(
    Array.from({ length: Math.max(first.totalPages - 1, 0) }, (_, index) =>
      listClients({ page: index + 2, sortBy: "name" }),
    ),
  );

  return [first, ...pages].flatMap(({ clients }) =>
    clients.map(
      ({
        id,
        name,
        company_name,
        email,
        phone,
        tax_id,
        tax_id_type,
        address_line_1,
        address_line_2,
        city,
        region,
        postal_code,
        country_code,
      }): ContractClientOption => ({
        id,
        name,
        company_name,
        email,
        phone,
        tax_id,
        tax_id_type,
        address_line_1,
        address_line_2,
        city,
        region,
        postal_code,
        country_code,
      }),
    ),
  );
}

export async function listAllContractTemplateOptions(isActive: boolean) {
  const first = await listContractTemplates({
    page: 1,
    pageSize: 100,
    isActive,
    sort: "name",
    direction: "asc",
  });
  const pages = await Promise.all(
    Array.from({ length: Math.max(first.totalPages - 1, 0) }, (_, index) =>
      listContractTemplates({
        page: index + 2,
        pageSize: 100,
        isActive,
        sort: "name",
        direction: "asc",
      }),
    ),
  );

  const summaries = [first, ...pages].flatMap(({ items }) => items);
  const details = await Promise.all(
    summaries.map((item) => getContractTemplateById(item.id)),
  );

  return details.flatMap((template): ContractTemplateOption[] =>
    template
      ? [
          {
            id: template.id,
            name: template.name,
            content: template.content,
            is_active: template.is_active,
          },
        ]
      : [],
  );
}
