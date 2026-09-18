import { z } from "zod";

import {
  contractIdSchema,
  contractSnapshotSchema,
  markContractSentSchema,
} from "@/schemas/contracts";

export const generateContractDocumentSchema = z
  .object({
    contract_id: contractIdSchema,
    snapshot: contractSnapshotSchema,
  })
  .strict();

export const sendContractDocumentSchema = markContractSentSchema;

export const uploadSignedCopySchema = z
  .object({
    contract_id: contractIdSchema,
    file: z
      .file({ error: "Selecione a cópia assinada em PDF." })
      .min(1, "A cópia assinada está vazia.")
      .mime(["application/pdf"], "A cópia assinada deve ser um PDF."),
  })
  .strict();

export type GenerateContractDocumentInput = z.infer<
  typeof generateContractDocumentSchema
>;
export type SendContractDocumentInput = z.infer<
  typeof sendContractDocumentSchema
>;
export type UploadSignedCopyInput = z.infer<typeof uploadSignedCopySchema>;
