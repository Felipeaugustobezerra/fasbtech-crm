import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import {
  contractDraftDataSchema,
  contractIdSchema,
  contractSnapshotSchema,
  contractStatusSchema,
  contractTemplateIdSchema,
  documentTypeSchema,
} from "@/schemas/contracts";
import {
  parseContractListParams,
  parseContractTemplateListParams,
  type ContractListParamsInput,
  type ContractTemplateListParamsInput,
} from "@/schemas/contracts-query";
import type { Database } from "@/types/database.types";
import type {
  Contract,
  ContractTemplate,
  Document,
} from "@/types/contracts";

type ContractRow = Database["public"]["Tables"]["contracts"]["Row"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

const CONTRACT_TEMPLATE_LIST_SELECT =
  "id,name,is_active,created_at,updated_at" as const;

const CONTRACT_LIST_SELECT =
  "id,client_id,template_id,title,status,generated_at,sent_at,signed_at,canceled_at,created_at,updated_at" as const;

const CONTRACT_DOCUMENT_SELECT =
  "id,entity_id,kind,file_name,mime_type,size_bytes,created_at" as const;

export type ContractTemplateListItem = Pick<
  ContractTemplate,
  "id" | "name" | "is_active" | "created_at" | "updated_at"
>;

export type ContractListItem = Pick<
  Contract,
  | "id"
  | "client_id"
  | "template_id"
  | "title"
  | "status"
  | "generated_at"
  | "sent_at"
  | "signed_at"
  | "canceled_at"
  | "created_at"
  | "updated_at"
>;

export type ContractDocumentMetadata = Pick<
  Document,
  | "id"
  | "entity_id"
  | "kind"
  | "file_name"
  | "mime_type"
  | "size_bytes"
  | "created_at"
>;

export type ContractDetails = Contract & {
  documents: ContractDocumentMetadata[];
};

export type ContractTemplateListResult = {
  items: ContractTemplateListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ContractListResult = {
  items: ContractListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function parseId(
  value: string,
  schema: typeof contractIdSchema | typeof contractTemplateIdSchema,
) {
  const parsedId = schema.safeParse(value);

  if (!parsedId.success) {
    throw new Error("CONTRACT_QUERY_VALIDATION_FAILED", {
      cause: parsedId.error,
    });
  }

  return parsedId.data;
}

function escapeLikePattern(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

function mapContract(row: ContractRow): Contract {
  return {
    ...row,
    status: contractStatusSchema.parse(row.status),
    draft_data: contractDraftDataSchema.parse(row.draft_data),
    snapshot:
      row.snapshot === null
        ? null
        : contractSnapshotSchema.parse(row.snapshot),
  };
}

function mapContractListItem(
  row: Pick<
    ContractRow,
    | "id"
    | "client_id"
    | "template_id"
    | "title"
    | "status"
    | "generated_at"
    | "sent_at"
    | "signed_at"
    | "canceled_at"
    | "created_at"
    | "updated_at"
  >,
): ContractListItem {
  return {
    ...row,
    status: contractStatusSchema.parse(row.status),
  };
}

function mapContractDocument(
  row: Pick<
    DocumentRow,
    | "id"
    | "entity_id"
    | "kind"
    | "file_name"
    | "mime_type"
    | "size_bytes"
    | "created_at"
  >,
): ContractDocumentMetadata {
  if (row.mime_type !== "application/pdf") {
    throw new Error("CONTRACT_DOCUMENT_METADATA_INVALID");
  }

  return {
    ...row,
    kind: documentTypeSchema.parse(row.kind),
    mime_type: row.mime_type,
  };
}

async function queryContractDocuments(
  supabase: SupabaseClient<Database>,
  contractId: string,
): Promise<ContractDocumentMetadata[]> {
  const { data, error } = await supabase
    .from("documents")
    .select(CONTRACT_DOCUMENT_SELECT)
    .eq("entity_type", "CONTRACT")
    .eq("entity_id", contractId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapContractDocument);
}

export async function listContractTemplates(
  input: ContractTemplateListParamsInput = {},
): Promise<ContractTemplateListResult> {
  const params = parseContractTemplateListParams(input);
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  try {
    const supabase = await createSupabaseClient();
    let query = supabase
      .from("contract_templates")
      .select(CONTRACT_TEMPLATE_LIST_SELECT, { count: "exact" })
      .eq("is_active", params.isActive);

    if (params.search) {
      query = query.ilike("name", `%${escapeLikePattern(params.search)}%`);
    }

    const ascending = params.direction === "asc";
    let { data, error, count } = await query
      .order(params.sort, { ascending })
      .order("id", { ascending })
      .range(from, to);

    if (error?.code === "PGRST103") {
      const countProbe = await query.range(0, 0);

      if (countProbe.error) {
        throw countProbe.error;
      }

      data = [];
      error = null;
      count = countProbe.count;
    }

    if (error) {
      throw error;
    }

    const total = count ?? 0;

    return {
      items: data ?? [],
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
    };
  } catch (cause) {
    throw new Error("CONTRACT_TEMPLATE_LIST_QUERY_FAILED", { cause });
  }
}

export async function getContractTemplateById(
  templateId: string,
): Promise<ContractTemplate | null> {
  const parsedTemplateId = parseId(templateId, contractTemplateIdSchema);

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("contract_templates")
      .select("*")
      .eq("id", parsedTemplateId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (cause) {
    throw new Error("CONTRACT_TEMPLATE_QUERY_FAILED", { cause });
  }
}

export async function listContracts(
  input: ContractListParamsInput = {},
): Promise<ContractListResult> {
  const params = parseContractListParams(input);
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  try {
    const supabase = await createSupabaseClient();
    let query = supabase
      .from("contracts")
      .select(CONTRACT_LIST_SELECT, { count: "exact" });

    if (params.search) {
      query = query.ilike("title", `%${escapeLikePattern(params.search)}%`);
    }
    if (params.status) {
      query = query.eq("status", params.status);
    }
    if (params.clientId) {
      query = query.eq("client_id", params.clientId);
    }
    if (params.templateId) {
      query = query.eq("template_id", params.templateId);
    }

    const ascending = params.direction === "asc";
    let { data, error, count } = await query
      .order(params.sort, { ascending })
      .order("id", { ascending })
      .range(from, to);

    if (error?.code === "PGRST103") {
      const countProbe = await query.range(0, 0);

      if (countProbe.error) {
        throw countProbe.error;
      }

      data = [];
      error = null;
      count = countProbe.count;
    }

    if (error) {
      throw error;
    }

    const total = count ?? 0;

    return {
      items: (data ?? []).map(mapContractListItem),
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize),
    };
  } catch (cause) {
    throw new Error("CONTRACT_LIST_QUERY_FAILED", { cause });
  }
}

export async function getContractById(
  contractId: string,
): Promise<ContractDetails | null> {
  const parsedContractId = parseId(contractId, contractIdSchema);

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", parsedContractId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      ...mapContract(data),
      documents: await queryContractDocuments(supabase, parsedContractId),
    };
  } catch (cause) {
    throw new Error("CONTRACT_QUERY_FAILED", { cause });
  }
}

export async function listContractDocuments(
  contractId: string,
): Promise<ContractDocumentMetadata[]> {
  const parsedContractId = parseId(contractId, contractIdSchema);

  try {
    const supabase = await createSupabaseClient();

    return await queryContractDocuments(supabase, parsedContractId);
  } catch (cause) {
    throw new Error("CONTRACT_DOCUMENTS_QUERY_FAILED", { cause });
  }
}
