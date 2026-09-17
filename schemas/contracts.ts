import { z } from "zod";

import {
  CONTRACT_STATUSES,
  DOCUMENT_TYPES,
  type ContractDraftData,
  type ContractSnapshot,
} from "@/types/contracts";
import type { Json } from "@/types/database.types";

export const contractTemplateIdSchema = z.uuid(
  "Informe um Template de Contrato válido.",
);

export const contractIdSchema = z.uuid("Informe um Contrato válido.");

export const documentIdSchema = z.uuid("Informe um Documento válido.");

export const contractStatusSchema = z.enum(CONTRACT_STATUSES, {
  error: "Informe um Status de Contrato válido.",
});

export const documentTypeSchema = z.enum(DOCUMENT_TYPES, {
  error: "Informe um tipo de Documento válido.",
});

const jsonValueSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const contractDraftDataSchema: z.ZodType<ContractDraftData> = z.record(
  z.string(),
  jsonValueSchema,
);

const nullableTrimmedStringSchema = z
  .union([z.string(), z.null()])
  .transform((value) => {
    if (value === null) {
      return null;
    }

    const trimmedValue = value.trim();

    return trimmedValue === "" ? null : trimmedValue;
  });

export const contractSnapshotSchema: z.ZodType<ContractSnapshot> = z
  .object({
    schema_version: z
      .number({ error: "Informe uma versão de snapshot válida." })
      .int("Informe uma versão de snapshot válida.")
      .positive("Informe uma versão de snapshot válida."),
    content: z
      .string({ error: "Informe o conteúdo final do Contrato." })
      .trim()
      .min(1, "Informe o conteúdo final do Contrato."),
    client: z
      .object({
        id: z.uuid("Informe um Cliente válido."),
        data: z.record(z.string(), jsonValueSchema),
        tax_id: nullableTrimmedStringSchema,
        tax_id_type: nullableTrimmedStringSchema,
      })
      .strict(),
    manual_fields: z.record(z.string(), jsonValueSchema),
    template: z
      .object({
        id: contractTemplateIdSchema,
        name: z
          .string({ error: "Informe o nome de origem do Template." })
          .trim()
          .min(1, "Informe o nome de origem do Template."),
      })
      .strict(),
  })
  .strict();

const templateContentShape = {
  name: z
    .string({ error: "Informe o nome do Template." })
    .trim()
    .min(1, "Informe o nome do Template."),
  content: z
    .string({ error: "Informe o conteúdo do Template." })
    .trim()
    .min(1, "Informe o conteúdo do Template."),
};

const draftContractContentShape = {
  client_id: z.uuid("Informe um Cliente válido."),
  template_id: contractTemplateIdSchema,
  title: z
    .string({ error: "Informe o título do Contrato." })
    .trim()
    .min(1, "Informe o título do Contrato."),
  draft_data: contractDraftDataSchema.default({}),
};

const documentReferenceShape = {
  document_id: documentIdSchema,
  object_path: z
    .string({ error: "Informe o caminho do Documento." })
    .trim()
    .min(1, "Informe o caminho do Documento."),
  file_name: z
    .string({ error: "Informe o nome do arquivo." })
    .trim()
    .min(1, "Informe o nome do arquivo."),
  mime_type: z.literal("application/pdf", {
    error: "O Documento deve ser um PDF.",
  }),
  size_bytes: z
    .number({ error: "Informe o tamanho do Documento." })
    .int("Informe o tamanho do Documento.")
    .positive("Informe o tamanho do Documento."),
};

export const createContractTemplateSchema = z
  .object(templateContentShape)
  .strict();

export const updateContractTemplateSchema = z
  .object({
    template_id: contractTemplateIdSchema,
    ...templateContentShape,
  })
  .strict();

export const activateContractTemplateSchema = z
  .object({ template_id: contractTemplateIdSchema })
  .strict();

export const deactivateContractTemplateSchema = z
  .object({ template_id: contractTemplateIdSchema })
  .strict();

export const createContractSchema = z
  .object(draftContractContentShape)
  .strict();

export const updateDraftContractSchema = z
  .object({
    contract_id: contractIdSchema,
    ...draftContractContentShape,
  })
  .strict();

export const generateContractSchema = z
  .object({
    contract_id: contractIdSchema,
    snapshot: contractSnapshotSchema,
    ...documentReferenceShape,
  })
  .strict();

export const markContractSentSchema = z
  .object({
    contract_id: contractIdSchema,
    recipient_email: z
      .string({ error: "Informe um e-mail de destinatário válido." })
      .trim()
      .pipe(z.email("Informe um e-mail de destinatário válido."))
      .transform((value) => value.toLowerCase()),
  })
  .strict();

export const markContractSignedSchema = z
  .object({
    contract_id: contractIdSchema,
    ...documentReferenceShape,
  })
  .strict();

export const cancelContractSchema = z
  .object({ contract_id: contractIdSchema })
  .strict();

export type CreateContractTemplateInput = z.infer<
  typeof createContractTemplateSchema
>;
export type UpdateContractTemplateInput = z.infer<
  typeof updateContractTemplateSchema
>;
export type ActivateContractTemplateInput = z.infer<
  typeof activateContractTemplateSchema
>;
export type DeactivateContractTemplateInput = z.infer<
  typeof deactivateContractTemplateSchema
>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateDraftContractInput = z.infer<
  typeof updateDraftContractSchema
>;
export type GenerateContractInput = z.infer<typeof generateContractSchema>;
export type MarkContractSentInput = z.infer<typeof markContractSentSchema>;
export type MarkContractSignedInput = z.infer<typeof markContractSignedSchema>;
export type CancelContractInput = z.infer<typeof cancelContractSchema>;
