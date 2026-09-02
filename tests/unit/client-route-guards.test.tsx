import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EditClientPage from "@/app/(private)/clientes/[id]/editar/page";
import NewClientPage from "@/app/(private)/clientes/novo/page";
import type { Client } from "@/types/client";

const mocks = vi.hoisted(() => ({
  createClientAction: vi.fn(),
  getClientById: vi.fn(),
  notFound: vi.fn(),
  push: vi.fn(),
  resolveFoundationContext: vi.fn(),
  updateClientAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("@/app/(private)/clientes/actions", () => ({
  createClientAction: mocks.createClientAction,
  updateClientAction: mocks.updateClientAction,
}));

vi.mock("@/lib/clients/queries", () => ({
  getClientById: mocks.getClientById,
}));

vi.mock("@/services/foundation/foundation.service", () => ({
  resolveFoundationContext: mocks.resolveFoundationContext,
}));

const client: Client = {
  id: "11111111-1111-4111-8111-111111111111",
  organization_id: "22222222-2222-4222-8222-222222222222",
  name: "Empresa XPTO",
  company_name: "XPTO, Lda.",
  email: "contato@xpto.example",
  phone: "+351 210 000 000",
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

function readyContext(role: "OWNER" | "ADMIN" | "MEMBER") {
  return {
    status: "READY",
    membership: { role },
  };
}

describe("client administrative route guards", () => {
  beforeEach(() => {
    mocks.createClientAction.mockReset();
    mocks.getClientById.mockReset();
    mocks.notFound.mockReset();
    mocks.push.mockReset();
    mocks.resolveFoundationContext.mockReset();
    mocks.updateClientAction.mockReset();
    mocks.getClientById.mockResolvedValue(client);
    mocks.resolveFoundationContext.mockResolvedValue(readyContext("OWNER"));
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  it("renders the create form for OWNER", async () => {
    const page = await NewClientPage();

    render(page);

    expect(
      screen.getByRole("heading", { level: 1, name: "Novo Cliente" }),
    ).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Nome" })).toBeVisible();
  });

  it.each(["MEMBER", "ADMIN"] as const)(
    "returns not-found from /clientes/novo for %s",
    async (role) => {
      mocks.resolveFoundationContext.mockResolvedValue(readyContext(role));

      await expect(NewClientPage()).rejects.toThrow("NEXT_NOT_FOUND");

      expect(mocks.notFound).toHaveBeenCalledOnce();
      expect(mocks.createClientAction).not.toHaveBeenCalled();
    },
  );

  it("renders the edit form for OWNER after loading the authorized Client", async () => {
    const page = await EditClientPage({
      params: Promise.resolve({ id: client.id }),
    });

    render(page);

    expect(
      screen.getByRole("heading", { level: 1, name: "Editar Cliente" }),
    ).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue(
      client.name,
    );
    expect(mocks.getClientById).toHaveBeenCalledWith(client.id);
  });

  it.each(["MEMBER", "ADMIN"] as const)(
    "returns not-found from /clientes/[id]/editar before querying for %s",
    async (role) => {
      mocks.resolveFoundationContext.mockResolvedValue(readyContext(role));

      await expect(
        EditClientPage({ params: Promise.resolve({ id: client.id }) }),
      ).rejects.toThrow("NEXT_NOT_FOUND");

      expect(mocks.notFound).toHaveBeenCalledOnce();
      expect(mocks.getClientById).not.toHaveBeenCalled();
    },
  );

  it("rejects an invalid edit id before resolving context or querying", async () => {
    await expect(
      EditClientPage({ params: Promise.resolve({ id: "invalid-id" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.resolveFoundationContext).not.toHaveBeenCalled();
    expect(mocks.getClientById).not.toHaveBeenCalled();
  });
});
