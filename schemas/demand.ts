import { z } from "zod";

import { membershipIdSchema } from "@/schemas/access";
import {
  DEMAND_PRIORITIES,
  DEMAND_STATUSES,
} from "@/types/demand";

export const demandIdSchema = z.uuid("Informe uma Demanda válida.");

export const demandStatusSchema = z.enum(DEMAND_STATUSES, {
  error: "Informe um Status válido.",
});

export const demandPrioritySchema = z.enum(DEMAND_PRIORITIES, {
  error: "Informe uma Prioridade válida.",
});

const optionalTrimmedStringSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    const trimmedValue = value?.trim();

    return trimmedValue === "" ? undefined : trimmedValue;
  });

const optionalCivilDateSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    const trimmedValue = value?.trim();

    return trimmedValue === "" ? undefined : trimmedValue;
  })
  .pipe(z.iso.date("Informe uma data válida.").optional());

const demandContentShape = {
  title: z.string().trim().min(1, "Informe o título da Demanda."),
  description: optionalTrimmedStringSchema,
  priority: demandPrioritySchema.optional(),
  start_date: optionalCivilDateSchema,
  due_date: optionalCivilDateSchema,
  notes: optionalTrimmedStringSchema,
};

const demandTagIdSchema = z.uuid("Informe uma Tag válida.");

const existingTagIdsSchema = z
  .array(demandTagIdSchema)
  .transform((tagIds) => [...new Set(tagIds)]);

const newTagNamesSchema = z.array(z.string()).transform((tagNames) => {
  const normalizedTagNames = new Set<string>();

  for (const tagName of tagNames) {
    const trimmedTagName = tagName.trim();

    if (trimmedTagName !== "") {
      normalizedTagNames.add(trimmedTagName);
    }
  }

  return [...normalizedTagNames];
});

export const createDemandSchema = z
  .object({
    client_id: z.uuid("Informe um Cliente válido."),
    ...demandContentShape,
    assignee_membership_ids: z.array(membershipIdSchema).optional(),
  })
  .strict();

export const updateDemandSchema = z.object(demandContentShape).strict();

export const changeDemandStatusSchema = z
  .object({
    demand_id: demandIdSchema,
    status: demandStatusSchema,
  })
  .strict();

export const setDemandAssigneesSchema = z
  .object({
    demand_id: demandIdSchema,
    membership_ids: z.array(membershipIdSchema),
  })
  .strict();

export const setDemandTagsSchema = z
  .object({
    demand_id: demandIdSchema,
    existing_tag_ids: existingTagIdsSchema,
    new_tag_names: newTagNamesSchema,
  })
  .strict();

export const archiveDemandSchema = z
  .object({
    demand_id: demandIdSchema,
  })
  .strict();

export type CreateDemandInput = z.infer<typeof createDemandSchema>;
export type UpdateDemandInput = z.infer<typeof updateDemandSchema>;
export type ChangeDemandStatusInput = z.infer<
  typeof changeDemandStatusSchema
>;
export type SetDemandAssigneesInput = z.infer<
  typeof setDemandAssigneesSchema
>;
export type SetDemandTagsInput = z.infer<typeof setDemandTagsSchema>;
export type ArchiveDemandInput = z.infer<typeof archiveDemandSchema>;
