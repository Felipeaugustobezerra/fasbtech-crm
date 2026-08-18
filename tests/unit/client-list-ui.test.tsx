import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ClientsPage from "@/app/(private)/clientes/page";
import { ClientPagination } from "@/components/clients/client-pagination";
import type { ClientListResult } from "@/lib/clients/queries";
import type { Client } from "@/types/client";

const mocks = vi.hoisted(() => ({
  listClients: vi.fn(),
}));

vi.mock("@/lib/clients/queries", () => ({
  CLIENT_SORT_FIELDS: ["name", "created_at", "updated_at"],
  listClients: mocks.listClients,
}));

const client: Client = {
  id: "11111111-1111-4111-8111-111111111111",
  organization_id: "22222222-2222-4222-8222-222222222222",
  name: "Ana Martins",
  company_name: "FASBtech",
  email: "ana@example.com",
  phone: "+351 910 000 000",
  tax_id: null,
  tax_id_type: null,
  address_line_1: null,
  address_line_2: null,
  city: null,
  region: null,
  postal_code: null,
  country_code: null,
  notes: null,
  created_by: "33333333-3333-4333-8333-333333333333",
  updated_by: "44444444-4444-4444-8444-444444444444",
  created_at: "2026-08-10T12:00:00.000Z",
  updated_at: "2026-08-17T12:00:00.000Z",
  archived_at: null,
};

function createResult(
  overrides: Partial<ClientListResult> = {},
): ClientListResult {
  return {
    clients: [client],
    count: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    ...overrides,
  };
}

async function renderPage(
  searchParams: Record<string, string | string[] | undefined> = {},
) {
  const page = await ClientsPage({
    searchParams: Promise.resolve(searchParams),
  });

  return render(page);
}

describe("clients list UI", () => {
  beforeEach(() => {
    mocks.listClients.mockReset();
    mocks.listClients.mockResolvedValue(createResult());
  });

  it("renders the authorized clients list", async () => {
    await renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: "Clientes" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Novo Cliente" })).toHaveAttribute(
      "href",
      "/clientes/novo",
    );
    expect(
      screen.getByRole("table", { name: "Lista de clientes autorizados" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: client.name })).toBeVisible();
    expect(screen.getByText(client.company_name!)).toBeVisible();
    expect(screen.getByText(client.email!)).toBeVisible();
    expect(screen.getByText(client.phone!)).toBeVisible();
  });

  it("renders the collection empty state", async () => {
    mocks.listClients.mockResolvedValue(
      createResult({ clients: [], count: 0, totalPages: 0 }),
    );

    await renderPage();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Ainda não existem clientes cadastrados",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Novo Cliente" })).toHaveLength(
      2,
    );
  });

  it("reflects search in the URL-driven UI and query", async () => {
    mocks.listClients.mockResolvedValue(
      createResult({ clients: [], count: 0, totalPages: 0 }),
    );

    await renderPage({
      search: "  Empresa XPTO  ",
      page: "3",
      sortBy: "updated_at",
      sortDirection: "desc",
    });

    expect(screen.getByRole("searchbox", { name: "Pesquisar" })).toHaveValue(
      "Empresa XPTO",
    );
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Nenhum cliente encontrado",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Empresa XPTO/)).toBeInTheDocument();
    expect(mocks.listClients).toHaveBeenCalledWith({
      page: 3,
      search: "Empresa XPTO",
      sortBy: "updated_at",
      sortDirection: "desc",
    });
  });

  it("preserves search and sorting in pagination links", () => {
    render(
      <ClientPagination
        page={2}
        pageSize={20}
        total={65}
        totalPages={4}
        search="Acme & Co"
        sortBy="updated_at"
        sortDirection="desc"
      />,
    );

    expect(screen.getByRole("link", { name: "Primeira" })).toHaveAttribute(
      "href",
      "/clientes?page=1&sortBy=updated_at&sortDirection=desc&search=Acme+%26+Co",
    );
    expect(screen.getByRole("link", { name: "Próxima" })).toHaveAttribute(
      "href",
      "/clientes?page=3&sortBy=updated_at&sortDirection=desc&search=Acme+%26+Co",
    );
    expect(screen.getByRole("link", { name: "Última" })).toHaveAttribute(
      "href",
      "/clientes?page=4&sortBy=updated_at&sortDirection=desc&search=Acme+%26+Co",
    );
  });

  it("accepts only supported sorting fields from the URL", async () => {
    await renderPage({
      sortBy: "organization_id",
      sortDirection: "unexpected",
    });

    const sortSelect = screen.getByRole("combobox", { name: "Ordenar por" });
    const sortOptions = within(sortSelect)
      .getAllByRole("option")
      .map((option) => option.getAttribute("value"));

    expect(sortSelect).toHaveValue("name");
    expect(sortOptions).toEqual(["name", "created_at", "updated_at"]);
    expect(screen.getByRole("combobox", { name: "Direção" })).toHaveValue(
      "asc",
    );
    expect(mocks.listClients).toHaveBeenCalledWith({
      page: 1,
      search: undefined,
      sortBy: "name",
      sortDirection: "asc",
    });
  });

  it("does not render administrative or authorization fields", async () => {
    await renderPage();

    expect(screen.queryByText(client.organization_id)).not.toBeInTheDocument();
    expect(screen.queryByText(client.created_by)).not.toBeInTheDocument();
    expect(screen.queryByText(client.updated_by!)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /organização/i }),
    ).toBeNull();
    expect(
      screen.queryByRole("columnheader", { name: /criado por/i }),
    ).toBeNull();
    expect(
      screen.queryByRole("columnheader", { name: /atualizado por/i }),
    ).toBeNull();
  });

  it("requeries the last available page when the requested page is too high", async () => {
    mocks.listClients
      .mockResolvedValueOnce(
        createResult({ clients: [], count: 45, page: 9, totalPages: 3 }),
      )
      .mockResolvedValueOnce(
        createResult({ clients: [client], count: 45, page: 3, totalPages: 3 }),
      );

    await renderPage({ page: "9", search: "Ana" });

    expect(mocks.listClients).toHaveBeenNthCalledWith(2, {
      page: 3,
      search: "Ana",
      sortBy: "name",
      sortDirection: "asc",
    });
    expect(screen.getByText("41–45")).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: client.name })).toBeVisible();
  });
});
