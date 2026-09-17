import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getContractById,
  getContractTemplateById,
  listContractDocuments,
  listContracts,
  listContractTemplates,
} from "@/lib/contracts/queries";
import {
  CONTRACT_SORT_FIELDS,
  CONTRACT_TEMPLATE_SORT_FIELDS,
  DEFAULT_CONTRACTS_PAGE_SIZE,
  parseContractListParams,
  parseContractTemplateListParams,
  type ContractListParamsInput,
} from "@/schemas/contracts-query";
import type { Database } from "@/types/database.types";

const mocks = vi.hoisted(() => ({
  createSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseClient,
}));

const organizationId = "11111111-1111-4111-8111-111111111111";
const clientId = "22222222-2222-4222-8222-222222222222";
const templateId = "33333333-3333-4333-8333-333333333333";
const contractId = "44444444-4444-4444-8444-444444444444";
const documentId = "55555555-5555-4555-8555-555555555555";
const actorId = "66666666-6666-4666-8666-666666666666";

type ContractTemplateRow =
  Database["public"]["Tables"]["contract_templates"]["Row"];
type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];

const templateRow: ContractTemplateRow = {
  id: templateId,
  organization_id: organizationId,
  name: "Contrato de Serviços",
  content: "Conteúdo do template",
  is_active: true,
  created_by: actorId,
  updated_by: actorId,
  created_at: "2026-09-17T10:00:00.000Z",
  updated_at: "2026-09-17T11:00:00.000Z",
};

const snapshot = {
  schema_version: 1,
  content: "Conteúdo final",
  client: {
    id: clientId,
    data: { name: "Cliente" },
    tax_id: "PT123",
    tax_id_type: "NIF",
  },
  manual_fields: { reference: "A-001" },
  template: { id: templateId, name: "Contrato de Serviços" },
};

const contractRow: ContractRow = {
  id: contractId,
  organization_id: organizationId,
  client_id: clientId,
  template_id: templateId,
  title: "Contrato principal",
  status: "GENERATED",
  draft_data: { reference: "A-001" },
  snapshot,
  sent_to_email: null,
  generated_at: "2026-09-17T12:00:00.000Z",
  sent_at: null,
  signed_at: null,
  canceled_at: null,
  created_by: actorId,
  updated_by: actorId,
  created_at: "2026-09-17T10:00:00.000Z",
  updated_at: "2026-09-17T12:00:00.000Z",
};

const documentMetadata = {
  id: documentId,
  entity_id: contractId,
  kind: "ORIGINAL_PDF",
  file_name: "contract.pdf",
  mime_type: "application/pdf",
  size_bytes: 1024,
  created_at: "2026-09-17T12:00:00.000Z",
};

type QueryResponse = {
  data: unknown;
  error: { message: string; code?: string } | null;
  count?: number | null;
};

function createQueryMock(response: QueryResponse, terminal: "range" | "single" | "then") {
  const query = {
    eq: vi.fn(),
    ilike: vi.fn(),
    maybeSingle: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    select: vi.fn(),
    then: vi.fn(),
  };

  query.eq.mockReturnValue(query);
  query.ilike.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.select.mockReturnValue(query);

  if (terminal === "range") {
    query.range.mockResolvedValue(response);
  } else if (terminal === "single") {
    query.maybeSingle.mockResolvedValue(response);
  } else {
    query.then.mockImplementation((resolve) =>
      Promise.resolve(response).then(resolve),
    );
  }

  return query;
}

function createSupabaseMock(...queries: ReturnType<typeof createQueryMock>[]) {
  const supabase = {
    from: vi.fn(),
  };

  for (const query of queries) {
    supabase.from.mockReturnValueOnce(query);
  }

  mocks.createSupabaseClient.mockResolvedValue(supabase);

  return supabase;
}

async function captureError(operation: Promise<unknown>) {
  try {
    await operation;
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }

    throw error;
  }

  throw new Error("EXPECTED_OPERATION_TO_FAIL");
}

describe("Contracts query params", () => {
  it("applies active Template and pagination defaults", () => {
    expect(parseContractTemplateListParams()).toEqual({
      page: 1,
      pageSize: DEFAULT_CONTRACTS_PAGE_SIZE,
      isActive: true,
      sort: "updated_at",
      direction: "desc",
    });
    expect(parseContractListParams()).toEqual({
      page: 1,
      pageSize: DEFAULT_CONTRACTS_PAGE_SIZE,
      sort: "updated_at",
      direction: "desc",
    });
  });

  it("accepts an explicit inactive Template filter", () => {
    expect(parseContractTemplateListParams({ isActive: "false" }).isActive).toBe(
      false,
    );
  });

  it.each(["10", "20", "50", "100"])(
    "accepts the supported page size %s",
    (pageSize) => {
      expect(parseContractListParams({ pageSize }).pageSize).toBe(
        Number(pageSize),
      );
    },
  );

  it.each(CONTRACT_TEMPLATE_SORT_FIELDS)(
    "accepts the whitelisted Template sort %s",
    (sort) => {
      expect(parseContractTemplateListParams({ sort }).sort).toBe(sort);
    },
  );

  it.each(CONTRACT_SORT_FIELDS)(
    "accepts the whitelisted Contract sort %s",
    (sort) => {
      expect(parseContractListParams({ sort }).sort).toBe(sort);
    },
  );

  it("falls back safely for invalid pagination and sorting", () => {
    const params = parseContractListParams({
      page: "0",
      pageSize: "25",
      sort: "organization_id",
      direction: "sideways",
    } as unknown as ContractListParamsInput);

    expect(params).toMatchObject({
      page: 1,
      pageSize: 20,
      sort: "updated_at",
      direction: "desc",
    });
  });

  it.each([
    { status: "ARCHIVED" },
    { clientId: "invalid-client" },
    { templateId: "invalid-template" },
    { search: "contract*" },
    { organization_id: organizationId },
  ])("rejects an invalid or unauthorized list parameter %#", async (input) => {
    await expect(
      Promise.resolve().then(() =>
        parseContractListParams(input as ContractListParamsInput),
      ),
    ).rejects.toThrow("CONTRACT_QUERY_VALIDATION_FAILED");
  });
});

describe("Contract Template queries", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("lists only active authorized Templates by default", async () => {
    const listItem = {
      id: templateRow.id,
      name: templateRow.name,
      is_active: templateRow.is_active,
      created_at: templateRow.created_at,
      updated_at: templateRow.updated_at,
    };
    const query = createQueryMock(
      { data: [listItem], error: null, count: 1 },
      "range",
    );
    const supabase = createSupabaseMock(query);

    await expect(listContractTemplates()).resolves.toEqual({
      items: [listItem],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });
    expect(supabase.from).toHaveBeenCalledWith("contract_templates");
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
    expect(query.range).toHaveBeenCalledWith(0, 19);
  });

  it("searches in PostgreSQL and escapes LIKE wildcards", async () => {
    const query = createQueryMock(
      { data: [], error: null, count: 0 },
      "range",
    );
    createSupabaseMock(query);

    await listContractTemplates({ search: "  100%_serviços  " });

    expect(query.ilike).toHaveBeenCalledWith("name", "%100\\%\\_serviços%");
  });

  it("supports inactive Templates and whitelisted ordering", async () => {
    const query = createQueryMock(
      { data: [], error: null, count: 0 },
      "range",
    );
    createSupabaseMock(query);

    await listContractTemplates({
      isActive: false,
      sort: "name",
      direction: "asc",
      page: 2,
      pageSize: 10,
    });

    expect(query.eq).toHaveBeenCalledWith("is_active", false);
    expect(query.order).toHaveBeenNthCalledWith(1, "name", {
      ascending: true,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "id", {
      ascending: true,
    });
    expect(query.range).toHaveBeenCalledWith(10, 19);
  });

  it("returns an authorized Template detail, including inactive", async () => {
    const query = createQueryMock(
      { data: { ...templateRow, is_active: false }, error: null },
      "single",
    );
    createSupabaseMock(query);

    await expect(getContractTemplateById(templateId)).resolves.toEqual({
      ...templateRow,
      is_active: false,
    });
    expect(query.eq).toHaveBeenCalledWith("id", templateId);
    expect(query.eq).not.toHaveBeenCalledWith("is_active", true);
  });

  it("returns null for an absent or RLS-hidden Template", async () => {
    createSupabaseMock(
      createQueryMock({ data: null, error: null }, "single"),
    );

    await expect(getContractTemplateById(templateId)).resolves.toBeNull();
  });
});

describe("Contract list query", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("applies search and every frozen filter in PostgreSQL", async () => {
    const query = createQueryMock(
      { data: [], error: null, count: 0 },
      "range",
    );
    createSupabaseMock(query);

    await listContracts({
      search: "  principal  ",
      status: "GENERATED",
      clientId,
      templateId,
    });

    expect(query.ilike).toHaveBeenCalledWith("title", "%principal%");
    expect(query.eq).toHaveBeenCalledWith("status", "GENERATED");
    expect(query.eq).toHaveBeenCalledWith("client_id", clientId);
    expect(query.eq).toHaveBeenCalledWith("template_id", templateId);
  });

  it("uses only whitelisted sorting and stable pagination", async () => {
    const listItem = {
      id: contractRow.id,
      client_id: contractRow.client_id,
      template_id: contractRow.template_id,
      title: contractRow.title,
      status: contractRow.status,
      generated_at: contractRow.generated_at,
      sent_at: contractRow.sent_at,
      signed_at: contractRow.signed_at,
      canceled_at: contractRow.canceled_at,
      created_at: contractRow.created_at,
      updated_at: contractRow.updated_at,
    };
    const query = createQueryMock(
      { data: [listItem], error: null, count: 45 },
      "range",
    );
    createSupabaseMock(query);

    const result = await listContracts({
      page: 2,
      pageSize: 20,
      sort: "generated_at",
      direction: "asc",
    });

    expect(query.order).toHaveBeenNthCalledWith(1, "generated_at", {
      ascending: true,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "id", {
      ascending: true,
    });
    expect(query.range).toHaveBeenCalledWith(20, 39);
    expect(result).toMatchObject({
      items: [listItem],
      page: 2,
      pageSize: 20,
      total: 45,
      totalPages: 3,
    });
  });

  it("does not select snapshot, draft data or administrative fields in list", async () => {
    const query = createQueryMock(
      { data: [], error: null, count: 0 },
      "range",
    );
    createSupabaseMock(query);

    await listContracts();

    const select = String(query.select.mock.calls[0]?.[0]);
    expect(select).not.toContain("snapshot");
    expect(select).not.toContain("draft_data");
    expect(select).not.toContain("organization_id");
    expect(select).not.toContain("created_by");
  });

  it("rejects invalid filters before creating the Supabase client", async () => {
    await expect(listContracts({ clientId: "invalid" })).rejects.toThrow(
      "CONTRACT_QUERY_VALIDATION_FAILED",
    );
    expect(mocks.createSupabaseClient).not.toHaveBeenCalled();
  });

  it("wraps database failures and preserves the cause", async () => {
    const originalError = { message: "database unavailable" };
    createSupabaseMock(
      createQueryMock({ data: null, error: originalError }, "range"),
    );

    const error = await captureError(listContracts());

    expect(error.message).toBe("CONTRACT_LIST_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });
});

describe("Contract detail and Document queries", () => {
  beforeEach(() => {
    mocks.createSupabaseClient.mockReset();
  });

  it("returns authorized snapshot and safe Document metadata", async () => {
    const contractQuery = createQueryMock(
      { data: contractRow, error: null },
      "single",
    );
    const documentsQuery = createQueryMock(
      { data: [documentMetadata], error: null },
      "then",
    );
    const supabase = createSupabaseMock(contractQuery, documentsQuery);

    const result = await getContractById(contractId);

    expect(supabase.from).toHaveBeenNthCalledWith(1, "contracts");
    expect(supabase.from).toHaveBeenNthCalledWith(2, "documents");
    expect(result?.snapshot).toEqual(snapshot);
    expect(result?.documents).toEqual([documentMetadata]);
    expect(result?.documents[0]).not.toHaveProperty("object_path");
    expect(result?.documents[0]).not.toHaveProperty("bucket_id");
    expect(result?.documents[0]).not.toHaveProperty("organization_id");
  });

  it("does not query Documents when the Contract is absent or RLS-hidden", async () => {
    const contractQuery = createQueryMock(
      { data: null, error: null },
      "single",
    );
    const supabase = createSupabaseMock(contractQuery);

    await expect(getContractById(contractId)).resolves.toBeNull();
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it("lists safe Document metadata through RLS", async () => {
    const query = createQueryMock(
      { data: [documentMetadata], error: null },
      "then",
    );
    const supabase = createSupabaseMock(query);

    await expect(listContractDocuments(contractId)).resolves.toEqual([
      documentMetadata,
    ]);
    expect(supabase.from).toHaveBeenCalledWith("documents");
    expect(query.eq).toHaveBeenCalledWith("entity_type", "CONTRACT");
    expect(query.eq).toHaveBeenCalledWith("entity_id", contractId);
    expect(String(query.select.mock.calls[0]?.[0])).not.toContain(
      "object_path",
    );
  });

  it("returns an empty Document list when RLS exposes no rows", async () => {
    createSupabaseMock(
      createQueryMock({ data: null, error: null }, "then"),
    );

    await expect(listContractDocuments(contractId)).resolves.toEqual([]);
  });

  it.each([
    ["detail", () => getContractById("invalid-contract")],
    ["documents", () => listContractDocuments("invalid-contract")],
  ])("rejects an invalid ID before querying %s", async (_label, query) => {
    await expect(query()).rejects.toThrow("CONTRACT_QUERY_VALIDATION_FAILED");
    expect(mocks.createSupabaseClient).not.toHaveBeenCalled();
  });

  it("wraps Document failures without exposing them as success", async () => {
    const originalError = { message: "RLS detail" };
    createSupabaseMock(
      createQueryMock({ data: null, error: originalError }, "then"),
    );

    const error = await captureError(listContractDocuments(contractId));

    expect(error.message).toBe("CONTRACT_DOCUMENTS_QUERY_FAILED");
    expect(error.cause).toBe(originalError);
  });
});
