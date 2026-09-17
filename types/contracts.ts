import type { Database, Json } from "@/types/database.types";

type PublicTables = Database["public"]["Tables"];
type ContractTemplateRow = PublicTables["contract_templates"]["Row"];
type ContractRow = PublicTables["contracts"]["Row"];
type DocumentRow = PublicTables["documents"]["Row"];

export const CONTRACT_STATUSES = [
  "DRAFT",
  "GENERATED",
  "SENT",
  "SIGNED",
  "CANCELED",
] as const satisfies readonly ContractRow["status"][];

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const DOCUMENT_TYPES = [
  "ORIGINAL_PDF",
  "SIGNED_COPY",
] as const satisfies readonly DocumentRow["kind"][];

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type ContractDraftData = Record<string, Json>;

export type ContractSnapshot = {
  schema_version: number;
  content: string;
  client: {
    id: string;
    data: Record<string, Json>;
    tax_id: string | null;
    tax_id_type: string | null;
  };
  manual_fields: Record<string, Json>;
  template: {
    id: string;
    name: string;
  };
};

export type ContractTemplate = ContractTemplateRow;

export type Contract = Omit<
  ContractRow,
  "status" | "draft_data" | "snapshot"
> & {
  status: ContractStatus;
  draft_data: ContractDraftData;
  snapshot: ContractSnapshot | null;
};

export type Document = Omit<
  DocumentRow,
  "entity_type" | "kind" | "bucket_id" | "mime_type"
> & {
  entity_type: "CONTRACT";
  kind: DocumentType;
  bucket_id: "private-files";
  mime_type: "application/pdf";
};
