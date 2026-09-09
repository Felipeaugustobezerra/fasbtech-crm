import { z } from "zod";

import { clientIdSchema } from "@/schemas/client";
import {
  demandPrioritySchema,
  demandStatusSchema,
} from "@/schemas/demand";

export const DEFAULT_DEMAND_PAGE_SIZE = 20;

export const DEMAND_PAGE_SIZES = [10, 20, 50, 100] as const;

export const DEMAND_SORT_FIELDS = [
  "created_at",
  "updated_at",
  "title",
  "start_date",
  "due_date",
  "status",
  "priority",
] as const;

export const DEMAND_SORT_DIRECTIONS = ["asc", "desc"] as const;

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
  .catch(DEFAULT_DEMAND_PAGE_SIZE)
  .default(DEFAULT_DEMAND_PAGE_SIZE);

const optionalSearchSchema = z.preprocess(
  normalizeOptionalString,
  z
    .string()
    .refine((value) => !value.includes("*"), {
      message: "A pesquisa contém um caractere não suportado.",
    })
    .optional(),
);

const optionalClientIdSchema = z.preprocess(
  normalizeOptionalString,
  clientIdSchema.optional(),
);

const optionalMembershipIdSchema = z.preprocess(
  normalizeOptionalString,
  z.uuid("Informe um responsável válido.").optional(),
);

const optionalTagIdSchema = z.preprocess(
  normalizeOptionalString,
  z.uuid("Informe uma Tag válida.").optional(),
);

const optionalStatusSchema = z.preprocess(
  normalizeOptionalString,
  demandStatusSchema.optional(),
);

const optionalPrioritySchema = z.preprocess(
  normalizeOptionalString,
  demandPrioritySchema.optional(),
);

const optionalCivilDateSchema = z.preprocess(
  normalizeOptionalString,
  z.iso.date("Informe uma data válida.").optional(),
);

export const demandListParamsSchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
  search: optionalSearchSchema,
  clientId: optionalClientIdSchema,
  status: optionalStatusSchema,
  priority: optionalPrioritySchema,
  assigneeId: optionalMembershipIdSchema,
  tagId: optionalTagIdSchema,
  sort: z.enum(DEMAND_SORT_FIELDS).catch("updated_at").default("updated_at"),
  direction: z.enum(DEMAND_SORT_DIRECTIONS).catch("desc").default("desc"),
  dueBefore: optionalCivilDateSchema,
  dueAfter: optionalCivilDateSchema,
  dueOn: optionalCivilDateSchema,
});

export type DemandListParamsInput = z.input<typeof demandListParamsSchema>;
export type DemandListParams = z.output<typeof demandListParamsSchema>;

export function parseDemandListParams(
  input: DemandListParamsInput = {},
): DemandListParams {
  const parsedInput = demandListParamsSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error("DEMAND_QUERY_VALIDATION_FAILED", {
      cause: parsedInput.error,
    });
  }

  return parsedInput.data;
}
