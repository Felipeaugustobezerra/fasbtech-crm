import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ClientDetailsPage from "@/app/(private)/clientes/[id]/page";
import { ClientDetails } from "@/components/clients/client-details";
import type { Client } from "@/types/client";

const mocks = vi.hoisted(() => ({
  getClientById: vi.fn(),
  listClientAccesses: vi.fn(),
  listClientActivities: vi.fn(),
  listOrganizationMembers: vi.fn(),
  notFound: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  resolveFoundationContext: vi.fn(),
}));

vi.mock("@/lib/clients/queries", () => ({
  getClientById: mocks.getClientById,
}));

vi.mock("@/lib/access/queries", () => ({
  listClientAccesses: mocks.listClientAccesses,
  listOrganizationMembers: mocks.listOrganizationMembers,
}));

vi.mock("@/lib/activity/queries", () => ({
  listClientActivities: mocks.listClientActivities,
}));

vi.mock("@/services/foundation/foundation.service", () => ({
  resolveFoundationContext: mocks.resolveFoundationContext,
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

const client: Client = {
  id: "11111111-1111-4111-8111-111111111111",
  organization_id: "22222222-2222-4222-8222-222222222222",
  name: "Empresa XPTO",
  company_name: "XPTO, Lda.",
  email: "contato@xpto.example",
  phone: "+351 210 000 000",
  tax_id: "PT123456789",
  tax_id_type: "VAT",
  address_line_1: "Rua do Exemplo, 10",
  address_line_2: "2.º andar",
  city: "Lisboa",
  region: "Lisboa",
  postal_code: "1000-001",
  country_code: "PT",
  notes: "Cliente prioritário.",
  created_by: "33333333-3333-4333-8333-333333333333",
  updated_by: "44444444-4444-4444-8444-444444444444",
  created_at: "2026-08-10T12:00:00.000Z",
  updated_at: "2026-08-17T12:00:00.000Z",
  archived_at: null,
};

describe("client details UI", () => {
  beforeEach(() => {
    mocks.getClientById.mockReset();
    mocks.listClientAccesses.mockReset();
    mocks.listClientActivities.mockReset();
    mocks.listOrganizationMembers.mockReset();
    mocks.notFound.mockReset();
    mocks.push.mockReset();
    mocks.refresh.mockReset();
    mocks.resolveFoundationContext.mockReset();
    mocks.listClientAccesses.mockResolvedValue([]);
    mocks.listClientActivities.mockResolvedValue([]);
    mocks.listOrganizationMembers.mockResolvedValue([]);
    mocks.resolveFoundationContext.mockResolvedValue({
      status: "READY",
      membership: { role: "MEMBER" },
    });
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  it("renders useful client details without administrative data", () => {
    render(<ClientDetails client={client} />);

    expect(screen.getByText(client.name)).toBeInTheDocument();
    expect(screen.getByText(client.company_name!)).toBeInTheDocument();
    expect(screen.getByText(client.email!)).toBeInTheDocument();
    expect(screen.getByText(client.phone!)).toBeInTheDocument();
    expect(screen.getByText("VAT: PT123456789")).toBeInTheDocument();
    expect(screen.getByText(client.address_line_1!)).toBeInTheDocument();
    expect(screen.getByText(client.notes!)).toBeInTheDocument();
    expect(screen.queryByText(client.organization_id)).toBeNull();
    expect(screen.queryByText(client.created_by)).toBeNull();
    expect(screen.queryByText(client.updated_by!)).toBeNull();
  });

  it("renders the details route with edit and back navigation", async () => {
    mocks.getClientById.mockResolvedValue(client);

    const page = await ClientDetailsPage({
      params: Promise.resolve({ id: client.id }),
    });
    render(page);

    expect(
      screen.getByRole("heading", { level: 1, name: client.name }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voltar para Clientes" }),
    ).toHaveAttribute("href", "/clientes");
    expect(
      screen.getByRole("link", { name: "Editar Cliente" }),
    ).toHaveAttribute("href", `/clientes/${client.id}/editar`);
    expect(
      screen.getByRole("heading", { level: 2, name: "Acessos ao Cliente" }),
    ).toBeInTheDocument();
    expect(mocks.getClientById).toHaveBeenCalledWith(client.id);
    expect(mocks.listClientAccesses).toHaveBeenCalledWith(client.id);
    expect(mocks.listClientActivities).toHaveBeenCalledWith(client.id);
    expect(mocks.listOrganizationMembers).not.toHaveBeenCalled();
  });

  it.each(["MEMBER", "OWNER"] as const)(
    "renders the exact activity returned by RLS without a %s filter",
    async (role) => {
      mocks.getClientById.mockResolvedValue(client);
      mocks.resolveFoundationContext.mockResolvedValue({
        status: "READY",
        membership: { role },
      });
      mocks.listClientActivities.mockResolvedValue([
        {
          action: "ACCESS_GRANTED",
          createdAt: "2026-08-20T12:34:00.000Z",
        },
      ]);

      const page = await ClientDetailsPage({
        params: Promise.resolve({ id: client.id }),
      });
      render(page);

      expect(screen.getByText("Acesso concedido")).toBeVisible();
      expect(mocks.listClientActivities).toHaveBeenCalledWith(client.id);
    },
  );

  it("uses not-found when the client is absent or hidden by RLS", async () => {
    mocks.getClientById.mockResolvedValue(null);

    await expect(
      ClientDetailsPage({ params: Promise.resolve({ id: client.id }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.getClientById).toHaveBeenCalledWith(client.id);
    expect(mocks.listClientAccesses).not.toHaveBeenCalled();
    expect(mocks.listClientActivities).not.toHaveBeenCalled();
    expect(mocks.listOrganizationMembers).not.toHaveBeenCalled();
    expect(mocks.notFound).toHaveBeenCalledOnce();
  });

  it("uses not-found without querying when the route id is invalid", async () => {
    await expect(
      ClientDetailsPage({ params: Promise.resolve({ id: "invalid-id" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.getClientById).not.toHaveBeenCalled();
    expect(mocks.resolveFoundationContext).not.toHaveBeenCalled();
    expect(mocks.listClientAccesses).not.toHaveBeenCalled();
    expect(mocks.listClientActivities).not.toHaveBeenCalled();
    expect(mocks.notFound).toHaveBeenCalledOnce();
  });
});
