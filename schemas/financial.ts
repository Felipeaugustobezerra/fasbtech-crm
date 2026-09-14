import { z } from "zod";

import {
  FINANCIAL_PAYMENT_NATURES,
  FINANCIAL_STATUSES,
  FINANCIAL_TYPES,
} from "@/types/financial";

const DECIMAL_12_2_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;
const ZERO_DECIMAL_PATTERN = /^0(?:\.0{1,2})?$/;

export const financialEntryIdSchema = z.uuid(
  "Informe uma movimentação financeira válida.",
);

export const financialTypeSchema = z.enum(FINANCIAL_TYPES, {
  error: "Informe um tipo financeiro válido.",
});

export const financialStatusSchema = z.enum(FINANCIAL_STATUSES, {
  error: "Informe um Status financeiro válido.",
});

export const financialPaymentNatureSchema = z.enum(
  FINANCIAL_PAYMENT_NATURES,
  { error: "Informe uma natureza de pagamento válida." },
);

export const financialDecimalSchema = z
  .string({ error: "Informe um valor monetário válido." })
  .trim()
  .regex(
    DECIMAL_12_2_PATTERN,
    "Informe um valor monetário com até duas casas decimais.",
  )
  .refine(
    (value) => !ZERO_DECIMAL_PATTERN.test(value),
    "O valor monetário deve ser maior que zero.",
  );

const civilDateSchema = z
  .string({ error: "Informe uma data válida." })
  .trim()
  .pipe(z.iso.date("Informe uma data válida."));

const optionalCivilDateSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue === "" ? null : trimmedValue;
  })
  .pipe(z.union([z.iso.date("Informe uma data válida."), z.null(), z.undefined()]));

const optionalTrimmedNullableStringSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue === "" ? null : trimmedValue;
  });

const optionalNullableUuidSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue === "" ? null : trimmedValue;
  })
  .pipe(
    z.union([
      z.uuid("Informe um Cliente válido."),
      z.null(),
      z.undefined(),
    ]),
  );

const financialEntryContentShape = {
  type: financialTypeSchema,
  description: z
    .string({ error: "Informe a descrição da movimentação." })
    .trim()
    .min(1, "Informe a descrição da movimentação."),
  amount: financialDecimalSchema,
  reference_date: civilDateSchema,
  client_id: optionalNullableUuidSchema,
  payment_nature: financialPaymentNatureSchema.optional(),
  category: optionalTrimmedNullableStringSchema,
  due_date: optionalCivilDateSchema,
  notes: optionalTrimmedNullableStringSchema,
};

export const createFinancialEntrySchema = z
  .object(financialEntryContentShape)
  .strict();

export const updateFinancialEntrySchema = z
  .object(financialEntryContentShape)
  .strict();

export const changeFinancialEntryStatusSchema = z
  .object({
    entry_id: financialEntryIdSchema,
    status: financialStatusSchema,
    realized_date: optionalCivilDateSchema,
  })
  .strict()
  .superRefine((input, context) => {
    if (input.status === "REALIZED" && !input.realized_date) {
      context.addIssue({
        code: "custom",
        message: "Informe a data de realização.",
        path: ["realized_date"],
      });
    }

    if (input.status !== "REALIZED" && input.realized_date) {
      context.addIssue({
        code: "custom",
        message: "A data de realização não é permitida para este Status.",
        path: ["realized_date"],
      });
    }
  });

export const archiveFinancialEntrySchema = z
  .object({
    entry_id: financialEntryIdSchema,
  })
  .strict();

export const setFinancialGoalSchema = z
  .object({
    year: z
      .number({ error: "Informe um ano válido." })
      .int("Informe um ano válido.")
      .positive("Informe um ano válido."),
    month: z
      .number({ error: "Informe um mês válido." })
      .int("Informe um mês válido.")
      .min(1, "Informe um mês entre 1 e 12.")
      .max(12, "Informe um mês entre 1 e 12."),
    target_amount: financialDecimalSchema,
  })
  .strict();

export type CreateFinancialEntryInput = z.infer<
  typeof createFinancialEntrySchema
>;
export type UpdateFinancialEntryInput = z.infer<
  typeof updateFinancialEntrySchema
>;
export type ChangeFinancialEntryStatusInput = z.infer<
  typeof changeFinancialEntryStatusSchema
>;
export type ArchiveFinancialEntryInput = z.infer<
  typeof archiveFinancialEntrySchema
>;
export type SetFinancialGoalInput = z.infer<typeof setFinancialGoalSchema>;
