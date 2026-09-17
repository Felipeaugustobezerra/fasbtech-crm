import { z } from "zod";

import { contractStatusSchema } from "@/schemas/contracts";

export const DEFAULT_CONTRACTS_PAGE_SIZE = 20;

export const CONTRACTS_PAGE_SIZES = [10, 20, 50, 100] as const;

export const CONTRACT_TEMPLATE_SORT_FIELDS = [
  "name",
  "created_at",
  "updated_at",
] as const;

export const CONTRACT_SORT_FIELDS = [
  "title",
  "created_at",
  "updated_at",
  "generated_at",
  "sent_at",
  "signed_at",
] as const;

export const CONTRACT_SORT_DIRECTIONS = ["asc", "desc"] as const;

const normalizeOptionalString = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue === "" ? undefined : trimmedValue;
};

const normalizeNumber = (value: unknown) => {
  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }

  return value;
};

const normalizeBoolean = (value: unknown) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
};

const pageSchema = z
  .preprocess(normalizeNumber, z.number().int().min(1))
  .catch(1)
  .default(1);

const pageSizeSchema = z
  .preprocess(
    normalizeNumber,
    z.union([z.literal(10), z.literal(20), z.literal(50), z.literal(100)]),
  )
  .catch(DEFAULT_CONTRACTS_PAGE_SIZE)
  .default(DEFAULT_CONTRACTS_PAGE_SIZE);

const optionalSearchSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .refine((value) => !value.includes("*"), {
      message: "A pesquisa contém um caractere não suportado.",
    })
    .optional(),
);

const optionalUuidSchema = (message: string) =>
  z.preprocess(normalizeOptionalString, z.uuid(message).optional());

export const contractTemplateListParamsSchema = z
  .object({
    page: pageSchema,
    pageSize: pageSizeSchema,
    search: optionalSearchSchema,
    isActive: z.preprocess(normalizeBoolean, z.boolean()).default(true),
    sort: z
      .enum(CONTRACT_TEMPLATE_SORT_FIELDS)
      .catch("updated_at")
      .default("updated_at"),
    direction: z
      .enum(CONTRACT_SORT_DIRECTIONS)
      .catch("desc")
      .default("desc"),
  })
  .strict();

export const contractListParamsSchema = z
  .object({
    page: pageSchema,
    pageSize: pageSizeSchema,
    search: optionalSearchSchema,
    status: z.preprocess(
      normalizeOptionalString,
      contractStatusSchema.optional(),
    ),
    clientId: optionalUuidSchema("Informe um Cliente válido."),
    templateId: optionalUuidSchema("Informe um Template de Contrato válido."),
    sort: z
      .enum(CONTRACT_SORT_FIELDS)
      .catch("updated_at")
      .default("updated_at"),
    direction: z
      .enum(CONTRACT_SORT_DIRECTIONS)
      .catch("desc")
      .default("desc"),
  })
  .strict();

export type ContractTemplateListParamsInput = z.input<
  typeof contractTemplateListParamsSchema
>;
export type ContractTemplateListParams = z.output<
  typeof contractTemplateListParamsSchema
>;
export type ContractListParamsInput = z.input<typeof contractListParamsSchema>;
export type ContractListParams = z.output<typeof contractListParamsSchema>;

export function parseContractTemplateListParams(
  input: ContractTemplateListParamsInput = {},
): ContractTemplateListParams {
  const parsedInput = contractTemplateListParamsSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error("CONTRACT_QUERY_VALIDATION_FAILED", {
      cause: parsedInput.error,
    });
  }

  return parsedInput.data;
}

export function parseContractListParams(
  input: ContractListParamsInput = {},
): ContractListParams {
  const parsedInput = contractListParamsSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error("CONTRACT_QUERY_VALIDATION_FAILED", {
      cause: parsedInput.error,
    });
  }

  return parsedInput.data;
}
