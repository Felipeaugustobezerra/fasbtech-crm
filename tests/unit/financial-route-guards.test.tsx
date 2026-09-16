import { beforeEach, describe, expect, it, vi } from "vitest";

import EditFinancialEntryPage from "@/app/(private)/financeiro/[id]/editar/page";
import FinancialEntryPage from "@/app/(private)/financeiro/[id]/page";
import NewFinancialEntryPage from "@/app/(private)/financeiro/novo/page";
import FinancialPage from "@/app/(private)/financeiro/page";

const mocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  resolveFoundationContext: vi.fn(),
  listFinancialEntries: vi.fn(),
  getFinancialSummary: vi.fn(),
  getFinancialEntryById: vi.fn(),
  listClients: vi.fn(),
  getClientById: vi.fn(),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/services/foundation/foundation.service", () => ({
  resolveFoundationContext: mocks.resolveFoundationContext,
}));
vi.mock("@/lib/financial/queries", () => ({
  listFinancialEntries: mocks.listFinancialEntries,
  getFinancialSummary: mocks.getFinancialSummary,
  getFinancialEntryById: mocks.getFinancialEntryById,
}));
vi.mock("@/lib/clients/queries", () => ({
  listClients: mocks.listClients,
  getClientById: mocks.getClientById,
}));

const id = "11111111-1111-4111-8111-111111111111";

describe("financial route guards", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  const routes = [
    {
      name: "list",
      render: () => FinancialPage({ searchParams: Promise.resolve({}) }),
    },
    {
      name: "create",
      render: () => NewFinancialEntryPage(),
    },
    {
      name: "detail",
      render: () => FinancialEntryPage({ params: Promise.resolve({ id }) }),
    },
    {
      name: "edit",
      render: () => EditFinancialEntryPage({ params: Promise.resolve({ id }) }),
    },
  ];

  it.each(["ADMIN", "MEMBER"] as const)(
    "denies every route to %s before data access",
    async (role) => {
      mocks.resolveFoundationContext.mockResolvedValue({
        status: "READY",
        membership: { role },
      });

      for (const route of routes) {
        await expect(route.render(), route.name).rejects.toThrow("NEXT_NOT_FOUND");
      }

      expect(mocks.notFound).toHaveBeenCalledTimes(routes.length);
      expect(mocks.listFinancialEntries).not.toHaveBeenCalled();
      expect(mocks.getFinancialSummary).not.toHaveBeenCalled();
      expect(mocks.getFinancialEntryById).not.toHaveBeenCalled();
      expect(mocks.listClients).not.toHaveBeenCalled();
      expect(mocks.getClientById).not.toHaveBeenCalled();
    },
  );
});
