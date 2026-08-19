import { z } from "zod";

export const clientIdSchema = z.uuid("Informe um Cliente válido.");

const optionalTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const optionalEmailSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.email("Informe um e-mail válido.").optional())
  .optional();

export const clientSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome do cliente."),
    company_name: optionalTrimmedStringSchema,
    email: optionalEmailSchema,
    phone: optionalTrimmedStringSchema,
    tax_id: optionalTrimmedStringSchema,
    tax_id_type: optionalTrimmedStringSchema,
    address_line_1: optionalTrimmedStringSchema,
    address_line_2: optionalTrimmedStringSchema,
    city: optionalTrimmedStringSchema,
    region: optionalTrimmedStringSchema,
    postal_code: optionalTrimmedStringSchema,
    country_code: optionalTrimmedStringSchema,
    notes: optionalTrimmedStringSchema,
  })
  .strict()
  .superRefine((client, context) => {
    const hasTaxId = client.tax_id !== undefined;
    const hasTaxIdType = client.tax_id_type !== undefined;

    if (hasTaxId === hasTaxIdType) {
      return;
    }

    if (!hasTaxId) {
      context.addIssue({
        code: "custom",
        message: "Informe a identificação fiscal.",
        path: ["tax_id"],
      });
    }

    if (!hasTaxIdType) {
      context.addIssue({
        code: "custom",
        message: "Informe o tipo da identificação fiscal.",
        path: ["tax_id_type"],
      });
    }
  });

export type ClientInput = z.infer<typeof clientSchema>;
