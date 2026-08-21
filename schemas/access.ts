import { z } from "zod";

import { clientIdSchema } from "@/schemas/client";
import { ORGANIZATION_ROLES } from "@/types/access";

export const organizationRoleSchema = z.enum(ORGANIZATION_ROLES, {
  error: "Informe uma role válida.",
});

export const membershipIdSchema = z.uuid("Informe um Membership válido.");

export const accessClientIdSchema = clientIdSchema;

export const addOrganizationMemberSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Informe o e-mail do utilizador.")
      .pipe(z.email("Informe um e-mail válido.")),
    role: organizationRoleSchema,
  })
  .strict();

export const updateOrganizationMemberRoleSchema = z
  .object({
    membershipId: membershipIdSchema,
    role: organizationRoleSchema,
  })
  .strict();

export const clientAccessSchema = z
  .object({
    clientId: accessClientIdSchema,
    membershipId: membershipIdSchema,
  })
  .strict();

export type AddOrganizationMemberInput = z.infer<
  typeof addOrganizationMemberSchema
>;
export type UpdateOrganizationMemberRoleInput = z.infer<
  typeof updateOrganizationMemberRoleSchema
>;
export type ClientAccessInput = z.infer<typeof clientAccessSchema>;
