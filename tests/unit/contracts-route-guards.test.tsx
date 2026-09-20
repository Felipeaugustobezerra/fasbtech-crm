import { beforeEach, describe, expect, it, vi } from "vitest";

import EditContractPage from "@/app/(private)/contratos/[id]/editar/page";
import ContractPage from "@/app/(private)/contratos/[id]/page";
import NewContractPage from "@/app/(private)/contratos/novo/page";
import ContractsPage from "@/app/(private)/contratos/page";
import ContractTemplatesPage from "@/app/(private)/contratos/templates/page";

const mocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  resolveFoundationContext: vi.fn(),
  listContracts: vi.fn(),
  getContractById: vi.fn(),
  getContractTemplateById: vi.fn(),
  getClientById: vi.fn(),
  listAllContractClientOptions: vi.fn(),
  listAllContractTemplateOptions: vi.fn(),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/services/foundation/foundation.service", () => ({ resolveFoundationContext: mocks.resolveFoundationContext }));
vi.mock("@/lib/contracts/queries", () => ({ listContracts: mocks.listContracts, getContractById: mocks.getContractById, getContractTemplateById: mocks.getContractTemplateById }));
vi.mock("@/lib/clients/queries", () => ({ getClientById: mocks.getClientById }));
vi.mock("@/lib/contracts/options", () => ({ listAllContractClientOptions: mocks.listAllContractClientOptions, listAllContractTemplateOptions: mocks.listAllContractTemplateOptions }));

const id = "11111111-1111-4111-8111-111111111111";

describe("Contracts route guards", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.notFound.mockImplementation(() => { throw new Error("NEXT_NOT_FOUND"); });
  });

  const routes = [
    () => ContractsPage({ searchParams: Promise.resolve({}) }),
    () => NewContractPage(),
    () => ContractPage({ params: Promise.resolve({ id }) }),
    () => EditContractPage({ params: Promise.resolve({ id }) }),
    () => ContractTemplatesPage(),
  ];

  it.each(["ADMIN", "MEMBER"] as const)("denies every Contract route to %s before data access", async (role) => {
    mocks.resolveFoundationContext.mockResolvedValue({ status: "READY", membership: { role } });
    for (const render of routes) await expect(render()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalledTimes(routes.length);
    expect(mocks.listContracts).not.toHaveBeenCalled();
    expect(mocks.getContractById).not.toHaveBeenCalled();
    expect(mocks.listAllContractClientOptions).not.toHaveBeenCalled();
    expect(mocks.listAllContractTemplateOptions).not.toHaveBeenCalled();
  });
});
