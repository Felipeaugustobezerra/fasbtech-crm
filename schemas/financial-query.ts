import { z } from "zod";

import {
  financialPaymentNatureSchema,
  financialStatusSchema,
  financialTypeSchema,
} from "@/schemas/financial";

export const DEFAULT_FINANCIAL_PAGE_SIZE = 20;

export const FINANCIAL_PAGE_SIZES = [10, 20, 50, 100] as const;

export const FINANCIAL_SORT_FIELDS = [
  "reference_date",
  "due_date",
  "realized_date",
  "amount",
  "created_at",
  "updated_at",
  "description",
] as const;

export const FINANCIAL_SORT_DIRECTIONS = ["asc", "desc"] as const;

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

const pageSchema = z
  .preprocess(normalizeNumber, z.number().int().min(1))
  .catch(1)
  .default(1);

const pageSizeSchema = z
  .preprocess(
    normalizeNumber,
    z.union([z.literal(10), z.literal(20), z.literal(50), z.literal(100)]),
  )
  .catch(DEFAULT_FINANCIAL_PAGE_SIZE)
  .default(DEFAULT_FINANCIAL_PAGE_SIZE);

const optionalSearchSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .refine((value) => !value.includes("*"), {
      message: "A pesquisa contém um caractere não suportado.",
    })
    .optional(),
);

const optionalUuidSchema = z.preprocess(
  normalizeOptionalString,
  z.uuid("Informe um Cliente válido.").optional(),
);

const optionalCategorySchema = z.preprocess(
  normalizeOptionalString,
  z.string().optional(),
);

const optionalTypeSchema = z.preprocess(
  normalizeOptionalString,
  financialTypeSchema.optional(),
);

const optionalStatusSchema = z.preprocess(
  normalizeOptionalString,
  financialStatusSchema.optional(),
);

const optionalPaymentNatureSchema = z.preprocess(
  normalizeOptionalString,
  financialPaymentNatureSchema.optional(),
);

const optionalCivilDateSchema = z.preprocess(
  normalizeOptionalString,
  z.iso.date("Informe uma data válida.").optional(),
);

export const financialEntryListParamsSchema = z
  .object({
    page: pageSchema,
    pageSize: pageSizeSchema,
    search: optionalSearchSchema,
    type: optionalTypeSchema,
    status: optionalStatusSchema,
    paymentNature: optionalPaymentNatureSchema,
    clientId: optionalUuidSchema,
    category: optionalCategorySchema,
    referenceDateFrom: optionalCivilDateSchema,
    referenceDateTo: optionalCivilDateSchema,
    dueDateFrom: optionalCivilDateSchema,
    dueDateTo: optionalCivilDateSchema,
    realizedDateFrom: optionalCivilDateSchema,
    realizedDateTo: optionalCivilDateSchema,
    sort: z
      .enum(FINANCIAL_SORT_FIELDS)
      .catch("reference_date")
      .default("reference_date"),
    direction: z
      .enum(FINANCIAL_SORT_DIRECTIONS)
      .catch("desc")
      .default("desc"),
  })
  .strict();

export const financialSummaryParamsSchema = z
  .object({
    year: z.number().int().positive(),
    month: z.number().int().min(1).max(12),
  })
  .strict();

export type FinancialEntryListParamsInput = z.input<
  typeof financialEntryListParamsSchema
>;
export type FinancialEntryListParams = z.output<
  typeof financialEntryListParamsSchema
>;
export type FinancialSummaryParamsInput = z.input<
  typeof financialSummaryParamsSchema
>;

export function parseFinancialEntryListParams(
  input: FinancialEntryListParamsInput = {},
): FinancialEntryListParams {
  const parsedInput = financialEntryListParamsSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error("FINANCIAL_QUERY_VALIDATION_FAILED", {
      cause: parsedInput.error,
    });
  }

  return parsedInput.data;
}

export function parseFinancialSummaryParams(
  input: FinancialSummaryParamsInput,
) {
  const parsedInput = financialSummaryParamsSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error("FINANCIAL_QUERY_VALIDATION_FAILED", {
      cause: parsedInput.error,
    });
  }

  return parsedInput.data;
}

